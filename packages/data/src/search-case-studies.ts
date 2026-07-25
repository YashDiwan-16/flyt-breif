import {
  flytBaseCaseStudyKnowledgeBase,
  type FlytBaseCaseStudyKnowledgeBaseEntry,
} from "./case-studies";

export type CaseStudySearchResult = {
  caseStudy: FlytBaseCaseStudyKnowledgeBaseEntry;
  score: number;
  matchedTerms: readonly string[];
};

export type SearchCaseStudiesOptions = {
  limit?: number;
  minScore?: number;
};

type SearchField = {
  weight: number;
  values: readonly string[];
};

type QueryConcept = {
  label: string;
  variants: ReadonlySet<string>;
};

const DEFAULT_RESULT_LIMIT = 3;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "our",
  "the",
  "their",
  "to",
  "with",
]);

const SEMANTIC_TERM_GROUPS = [
  ["autonomous", "automation", "automated", "remote", "robotic"],
  ["drone", "drones", "dock", "docks", "uav"],
  ["inspection", "inspections", "monitoring", "surveillance", "visibility"],
  ["solar", "pv", "photovoltaic", "renewable", "renewables"],
  ["mining", "mine", "industrial", "hazardous"],
  ["agriculture", "plantation", "farm", "crop"],
  ["waste", "landfill", "environmental", "compliance", "hazard"],
  ["wildfire", "fire", "forest", "forestry", "thermal"],
  ["oil", "gas", "petroleum", "pipeline", "refinery"],
  ["rail", "railway", "track", "yard", "corridor", "transportation"],
  ["security", "perimeter", "intrusion", "patrol", "response"],
  ["asset", "infrastructure", "facility", "site", "operations"],
] as const satisfies readonly (readonly string[])[];

const SEMANTIC_TERM_INDEX = new Map<string, ReadonlySet<string>>(
  SEMANTIC_TERM_GROUPS.flatMap((group) => {
    const variants = new Set(group.flatMap((term) => termVariants(term)));

    return [...variants].map((variant) => [variant, variants] as const);
  }),
);

const FIELD_WEIGHTS = {
  title: 8,
  industry: 7,
  useCases: 6,
  keywords: 10,
  painPoints: 4,
  proofPoints: 3,
  searchText: 2,
} as const;

const totalFieldWeight = Object.values(FIELD_WEIGHTS).reduce(
  (total, weight) => total + weight,
  0,
);

export function searchCaseStudies(
  query: string,
  options: SearchCaseStudiesOptions = {},
): CaseStudySearchResult[] {
  const concepts = buildQueryConcepts(query);

  if (concepts.length === 0) {
    return [];
  }

  const limit = options.limit ?? DEFAULT_RESULT_LIMIT;
  const minScore = options.minScore ?? 0;

  return flytBaseCaseStudyKnowledgeBase
    .map((caseStudy) => scoreCaseStudy(caseStudy, concepts))
    .filter((result) => result.score > minScore)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.caseStudy.title.localeCompare(right.caseStudy.title);
    })
    .slice(0, limit);
}

function scoreCaseStudy(
  caseStudy: FlytBaseCaseStudyKnowledgeBaseEntry,
  concepts: readonly QueryConcept[],
): CaseStudySearchResult {
  const fields = getSearchFields(caseStudy);
  const matchedTerms = new Set<string>();
  let rawScore = 0;

  for (const concept of concepts) {
    let conceptMatched = false;

    for (const field of fields) {
      const matchedVariant = findMatchedVariant(field.values, concept.variants);

      if (!matchedVariant) {
        continue;
      }

      conceptMatched = true;
      rawScore += field.weight;
      matchedTerms.add(matchedVariant);
    }

    if (conceptMatched) {
      rawScore += 3;
      matchedTerms.add(concept.label);
    }
  }

  const maxScore = concepts.length * (totalFieldWeight + 3);
  const score = Math.round((rawScore / maxScore) * 1000) / 10;

  return {
    caseStudy,
    score,
    matchedTerms: [...matchedTerms].sort(),
  };
}

function getSearchFields(
  caseStudy: FlytBaseCaseStudyKnowledgeBaseEntry,
): readonly SearchField[] {
  return [
    {
      weight: FIELD_WEIGHTS.title,
      values: [caseStudy.title],
    },
    {
      weight: FIELD_WEIGHTS.industry,
      values: [caseStudy.industry],
    },
    {
      weight: FIELD_WEIGHTS.useCases,
      values: caseStudy.useCases,
    },
    {
      weight: FIELD_WEIGHTS.keywords,
      values: caseStudy.keywords,
    },
    {
      weight: FIELD_WEIGHTS.painPoints,
      values: caseStudy.painPoints,
    },
    {
      weight: FIELD_WEIGHTS.proofPoints,
      values: caseStudy.proofPoints,
    },
    {
      weight: FIELD_WEIGHTS.searchText,
      values: [caseStudy.searchText],
    },
  ];
}

function buildQueryConcepts(query: string): readonly QueryConcept[] {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  const rawTerms = new Set([
    ...tokenize(normalizedQuery),
    ...getAdjacentPhrases(normalizedQuery),
  ]);

  return [...rawTerms].map((term) => ({
    label: term,
    variants: expandTerm(term),
  }));
}

function expandTerm(term: string): ReadonlySet<string> {
  const variants = new Set(termVariants(term));
  const semanticVariants = SEMANTIC_TERM_INDEX.get(normalizeText(term));

  if (semanticVariants) {
    for (const variant of semanticVariants) {
      variants.add(variant);
    }
  }

  return variants;
}

function findMatchedVariant(
  values: readonly string[],
  variants: ReadonlySet<string>,
): string | undefined {
  for (const value of values) {
    const normalizedValue = normalizeText(value);
    const valueTerms = new Set(tokenize(normalizedValue));

    for (const variant of variants) {
      if (variant.includes(" ")) {
        if (normalizedValue.includes(variant)) {
          return variant;
        }

        continue;
      }

      if (valueTerms.has(variant)) {
        return variant;
      }
    }
  }

  return undefined;
}

function getAdjacentPhrases(text: string): readonly string[] {
  const terms = getBaseTokens(text);
  const phrases: string[] = [];

  for (let index = 0; index < terms.length - 1; index += 1) {
    const currentTerm = terms[index];
    const nextTerm = terms[index + 1];

    if (currentTerm && nextTerm) {
      phrases.push(`${currentTerm} ${nextTerm}`);
    }
  }

  return phrases;
}

function tokenize(text: string): readonly string[] {
  return [
    ...new Set(getBaseTokens(text).flatMap((term) => [term, stemTerm(term)])),
  ];
}

function getBaseTokens(text: string): readonly string[] {
  return normalizeText(text)
    .split(" ")
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

function termVariants(term: string): readonly string[] {
  const normalizedTerm = normalizeText(term);

  if (!normalizedTerm) {
    return [];
  }

  const terms = normalizedTerm.includes(" ")
    ? [normalizedTerm]
    : [normalizedTerm, stemTerm(normalizedTerm)];

  return [...new Set(terms)];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function stemTerm(term: string): string {
  if (term.endsWith("ies") && term.length > 4) {
    return `${term.slice(0, -3)}y`;
  }

  if (
    term.endsWith("s") &&
    term.length > 3 &&
    !term.endsWith("ss") &&
    !term.endsWith("us") &&
    !term.endsWith("ous")
  ) {
    return term.slice(0, -1);
  }

  return term;
}
