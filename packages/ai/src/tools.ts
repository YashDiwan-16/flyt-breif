import { searchCaseStudies } from "@flyt-breif/data";
import { tool, type Tool } from "ai";

import {
  bantScoringOutputSchema,
  caseStudyToolResultSchema,
  extractLeadSignalsInputSchema,
  gtmMotionInputSchema,
  gtmMotionOutputSchema,
  parsedLeadSignalsSchema,
  type BANTScoringOutput,
  type CaseStudyToolResult,
  type ExtractLeadSignalsInput,
  type GTMMotionInput,
  type GTMMotionOutput,
  type LeadScale,
  type LeadUrgency,
  type ParsedLeadSignals,
} from "./schemas";

const UNKNOWN_VALUE = "Unknown";

const DOMAIN_KEYWORDS = [
  "agriculture",
  "asset monitoring",
  "autonomous",
  "budget",
  "compliance",
  "corridor monitoring",
  "dock",
  "drone",
  "energy infrastructure",
  "environmental monitoring",
  "erp",
  "fire detection",
  "forest",
  "hazardous",
  "inspection",
  "intrusion",
  "mine",
  "mining",
  "oil and gas",
  "perimeter",
  "pilot",
  "pipeline",
  "plantation",
  "poc",
  "pricing",
  "procurement",
  "rail",
  "remote monitoring",
  "renewable",
  "response time",
  "security",
  "tender",
  "solar",
  "surveillance",
  "thermal",
  "waste",
  "wildfire",
] as const;

const INDUSTRY_SIGNALS = [
  {
    industry: "Renewable Energy",
    terms: ["solar", "pv", "photovoltaic", "renewable", "solar farm"],
  },
  {
    industry: "Mining",
    terms: ["mine", "mining", "ore", "quarry", "industrial site"],
  },
  {
    industry: "Agriculture",
    terms: ["agriculture", "plantation", "farm", "crop", "estate"],
  },
  {
    industry: "Waste Management",
    terms: ["waste", "landfill", "environmental", "hazardous", "compliance"],
  },
  {
    industry: "Forestry and Defense Land Management",
    terms: ["forest", "forestry", "wildfire", "fire detection", "thermal"],
  },
  {
    industry: "Oil and Gas",
    terms: ["oil", "gas", "petroleum", "pipeline", "refinery"],
  },
  {
    industry: "Transportation and Rail",
    terms: ["rail", "railway", "track", "yard", "right of way", "corridor"],
  },
  {
    industry: "Security and Energy Infrastructure",
    terms: ["security", "perimeter", "surveillance", "intrusion", "patrol"],
  },
] as const;

const USE_CASE_SIGNALS = [
  {
    useCase: "Solar PV inspection",
    terms: ["solar", "pv", "photovoltaic", "panel"],
  },
  {
    useCase: "Mining inspection",
    terms: ["mine", "mining", "inspection zone", "quarry"],
  },
  {
    useCase: "Plantation security",
    terms: ["plantation", "agriculture", "farm", "crop", "erp"],
  },
  {
    useCase: "Environmental and hazardous detection",
    terms: ["waste", "hazardous", "environmental", "compliance", "landfill"],
  },
  {
    useCase: "Wildfire detection",
    terms: ["wildfire", "fire detection", "forest", "thermal"],
  },
  {
    useCase: "Oil and gas infrastructure inspection",
    terms: ["oil", "gas", "pipeline", "refinery", "petroleum"],
  },
  {
    useCase: "Rail infrastructure monitoring",
    terms: ["rail", "railway", "track", "yard", "right of way"],
  },
  {
    useCase: "Perimeter surveillance",
    terms: ["security", "perimeter", "surveillance", "intrusion", "patrol"],
  },
] as const;

const ROLE_PATTERNS = [
  /\b(chief [a-z ]+ officer|c[a-z]o)\b/i,
  /\b(vp|vice president)\s+(?:of\s+)?[a-z &-]+/i,
  /\b(head|director|manager|lead)\s+(?:of\s+)?[a-z &-]+/i,
  /\b(security|operations|maintenance|inspection|asset)\s+(?:head|director|manager|lead)\b/i,
] as const;

export const extractLeadSignalsTool: Tool<
  ExtractLeadSignalsInput,
  ParsedLeadSignals
> = tool({
  description:
    "Extract normalized FlytBase inbound lead signals from a raw email and optional metadata.",
  inputSchema: extractLeadSignalsInputSchema,
  outputSchema: parsedLeadSignalsSchema,
  strict: true,
  execute: async (input): Promise<ParsedLeadSignals> =>
    extractLeadSignals(input),
});

export const searchCaseStudiesTool: Tool<
  ParsedLeadSignals,
  CaseStudyToolResult[]
> = tool({
  description:
    "Search the FlytBase case-study knowledge base for the top 3 closest matches to parsed lead signals.",
  inputSchema: parsedLeadSignalsSchema,
  outputSchema: caseStudyToolResultSchema.array(),
  strict: true,
  execute: async (parsedLead): Promise<CaseStudyToolResult[]> => {
    const query = [
      parsedLead.companyName,
      parsedLead.role,
      parsedLead.region,
      parsedLead.industry,
      parsedLead.useCase,
      parsedLead.scale,
      parsedLead.urgency,
      ...parsedLead.painPoints,
      ...parsedLead.keywords,
    ].join(" ");

    return searchCaseStudies(query, { limit: 3 }).map(
      ({ caseStudy, matchedTerms, score }) => ({
        id: caseStudy.id,
        title: caseStudy.title,
        industry: caseStudy.industry,
        useCases: [...caseStudy.useCases],
        painPoints: [...caseStudy.painPoints],
        keywords: [...caseStudy.keywords],
        proofPoints: [...caseStudy.proofPoints],
        recommendedEmailLine: caseStudy.recommendedEmailLine,
        url: caseStudy.url,
        searchText: caseStudy.searchText,
        matchedTerms: [...matchedTerms],
        score,
      }),
    );
  },
});

export const bantScoringTool: Tool<
  ParsedLeadSignals,
  BANTScoringOutput
> = tool({
  description:
    "Score a parsed inbound lead using BANT: Budget, Authority, Need, and Timeline.",
  inputSchema: parsedLeadSignalsSchema,
  outputSchema: bantScoringOutputSchema,
  strict: true,
  execute: async (parsedLead): Promise<BANTScoringOutput> =>
    scoreBANT(parsedLead),
});

export const gtmMotionTool: Tool<GTMMotionInput, GTMMotionOutput> = tool({
  description:
    "Recommend the GTM motion for a parsed lead using qualification and matched FlytBase proof.",
  inputSchema: gtmMotionInputSchema,
  outputSchema: gtmMotionOutputSchema,
  strict: true,
  execute: async (input): Promise<GTMMotionOutput> => recommendGTMMotion(input),
});

export type FlytBdrTools = {
  extractLeadSignals: typeof extractLeadSignalsTool;
  searchCaseStudies: typeof searchCaseStudiesTool;
  bantScoring: typeof bantScoringTool;
  gtmMotion: typeof gtmMotionTool;
};

export const flytBdrTools: FlytBdrTools = {
  extractLeadSignals: extractLeadSignalsTool,
  searchCaseStudies: searchCaseStudiesTool,
  bantScoring: bantScoringTool,
  gtmMotion: gtmMotionTool,
};

export function extractLeadSignals({
  metadata,
  rawEmail,
}: ExtractLeadSignalsInput): ParsedLeadSignals {
  const searchText = normalizeText(
    [
      rawEmail,
      metadata?.companyName,
      metadata?.companyWebsite,
      metadata?.role,
      metadata?.region,
      metadata?.source,
      metadata?.senderEmail,
      metadata?.senderName,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const industry = inferBestLabel(searchText, INDUSTRY_SIGNALS, "industry");
  const useCase = inferBestLabel(searchText, USE_CASE_SIGNALS, "useCase");
  const keywords = extractKeywords(searchText, industry, useCase);

  return {
    companyName:
      metadata?.companyName ??
      inferCompanyName(rawEmail, metadata?.companyWebsite, metadata?.senderEmail),
    role: metadata?.role ?? inferRole(rawEmail),
    region: metadata?.region ?? inferRegion(searchText),
    industry,
    useCase,
    painPoints: inferPainPoints(searchText),
    urgency: inferUrgency(searchText),
    scale: inferScale(searchText),
    keywords,
  };
}

export function scoreBANT(parsedLead: ParsedLeadSignals): BANTScoringOutput {
  const signalText = normalizeText(
    [
      parsedLead.companyName,
      parsedLead.role,
      parsedLead.region,
      parsedLead.industry,
      parsedLead.useCase,
      parsedLead.scale,
      parsedLead.urgency,
      ...parsedLead.painPoints,
      ...parsedLead.keywords,
    ].join(" "),
  );

  return {
    Budget: scoreBudget(parsedLead, signalText),
    Authority: scoreAuthority(parsedLead, signalText),
    Need: scoreNeed(parsedLead, signalText),
    Timeline: scoreTimeline(parsedLead, signalText),
  };
}

export function recommendGTMMotion({
  caseStudyMatch,
  parsedLead,
  qualification,
}: GTMMotionInput): GTMMotionOutput {
  const totalScore =
    qualification.Budget.score +
    qualification.Authority.score +
    qualification.Need.score +
    qualification.Timeline.score;
  const partnerFriendlyRegion = includesAny(parsedLead.region, [
    "asia",
    "latin",
    "middle east",
    "uae",
    "africa",
  ]);
  const strongAeFit =
    totalScore >= 16 &&
    qualification.Authority.score >= 3 &&
    qualification.Need.score >= 4 &&
    caseStudyMatch.score >= 10;
  const uncertainAuthorityOrBudget =
    qualification.Authority.score < 3 || qualification.Budget.score < 3;

  if (strongAeFit && !partnerFriendlyRegion) {
    return {
      motion: "Direct AE",
      reasoning:
        "The lead has strong BANT coverage, clear need, and a relevant FlytBase proof point, so it should move directly to an AE-led discovery path.",
      recommendedNextStep:
        "Route to the appropriate AE with the matched case study and book a discovery call focused on operational scope, success criteria, and buying process.",
      supportingSignals: [
        `BANT total score is ${totalScore}/20.`,
        `Matched case study: ${caseStudyMatch.title}.`,
        `Primary use case: ${parsedLead.useCase}.`,
      ],
      risks: qualification.Budget.missingInfo,
    };
  }

  if (partnerFriendlyRegion && uncertainAuthorityOrBudget) {
    return {
      motion: "Partner-led",
      reasoning:
        "The region is likely to benefit from local partner coverage, while budget or buying authority still needs validation.",
      recommendedNextStep:
        "Qualify partner fit and ask discovery questions around procurement owner, implementation location, and budget range before AE escalation.",
      supportingSignals: [
        `Region signal: ${parsedLead.region}.`,
        `Authority score is ${qualification.Authority.score}/5.`,
        `Budget score is ${qualification.Budget.score}/5.`,
      ],
      risks: [
        ...qualification.Authority.missingInfo,
        ...qualification.Budget.missingInfo,
      ],
    };
  }

  return {
    motion: "Hybrid",
    reasoning:
      "The lead has enough need and proof-point relevance for sales engagement, but some qualification gaps remain before a clean direct handoff.",
    recommendedNextStep:
      "Have the BDR run a focused discovery pass, use the matched case study in outreach, and loop in an AE once authority, timeline, and budget are clearer.",
    supportingSignals: [
      `BANT total score is ${totalScore}/20.`,
      `Urgency is ${parsedLead.urgency}.`,
      `Matched case study score is ${caseStudyMatch.score}.`,
    ],
    risks: [
      ...qualification.Budget.missingInfo,
      ...qualification.Authority.missingInfo,
      ...qualification.Timeline.missingInfo,
    ],
  };
}

function scoreBudget(parsedLead: ParsedLeadSignals, signalText: string) {
  const evidence: string[] = [];
  const missingInfo: string[] = [];
  let score = parsedLead.scale === "enterprise" ? 1 : 0;

  if (parsedLead.scale === "multi-site") {
    score += 1;
    evidence.push("Scale suggests possible budget need, but no budget is confirmed.");
  }

  if (parsedLead.scale === "enterprise") {
    score += 1;
    evidence.push("Enterprise-scale operations suggest budget relevance, but funding is unverified.");
  }

  if (
    includesAny(signalText, [
      "pricing",
      "cost",
      "commercial",
      "procurement",
      "rfp",
      "tender",
    ])
  ) {
    score += 1;
    evidence.push("Email asks about commercial or procurement context, but no budget amount is confirmed.");
  }

  if (
    includesAny(signalText, [
      "budget approved",
      "budget allocated",
      "approved budget",
      "funding approved",
      "funded",
      "purchase order",
    ]) ||
    /\$|\b(?:usd|eur|inr)\b|budget\s+(?:of|is|range)/i.test(signalText)
  ) {
    score += 2;
    evidence.push("Email includes a stronger funding or budget signal.");
  }

  if (evidence.length === 0) {
    evidence.push("No explicit budget signal found.");
  }

  if (score < 5) {
    missingInfo.push("Confirmed budget range");
    missingInfo.push("Procurement process or funding owner");
  }

  return {
    score: clampBantScore(score),
    evidence,
    missingInfo,
  };
}

function scoreAuthority(parsedLead: ParsedLeadSignals, signalText: string) {
  const evidence: string[] = [];
  const missingInfo: string[] = [];
  let score = 1;
  const role = parsedLead.role.toLowerCase();

  if (includesAny(role, ["chief", "ceo", "coo", "cto", "cio", "vp", "vice president"])) {
    score = 5;
    evidence.push(`Role suggests executive authority: ${parsedLead.role}.`);
  } else if (includesAny(role, ["head", "director"])) {
    score = 4;
    evidence.push(`Role suggests senior functional authority: ${parsedLead.role}.`);
  } else if (includesAny(role, ["manager", "lead"])) {
    score = 3;
    evidence.push(`Role suggests operational influence: ${parsedLead.role}.`);
  }

  if (
    includesAny(signalText, ["my team", "evaluate", "implementation", "rollout"])
  ) {
    score += 1;
    evidence.push("Email language suggests the sender may be involved in evaluation, but final authority is unverified.");
  }

  if (evidence.length === 0) {
    evidence.push("No clear buying authority signal found.");
  }

  if (score < 5) {
    missingInfo.push("Economic buyer");
    missingInfo.push("Decision-making committee");
    missingInfo.push("Decision process and approval path");
  }

  return {
    score: clampBantScore(score),
    evidence,
    missingInfo,
  };
}

function scoreNeed(parsedLead: ParsedLeadSignals, signalText: string) {
  const evidence: string[] = [];
  const missingInfo: string[] = [];
  let score = parsedLead.painPoints.length >= 2 ? 3 : 2;

  if (parsedLead.useCase !== UNKNOWN_VALUE) {
    score += 1;
    evidence.push(`Use case is clear: ${parsedLead.useCase}.`);
  }

  if (parsedLead.painPoints.length > 0) {
    evidence.push(...parsedLead.painPoints.slice(0, 3));
  }

  if (
    includesAny(signalText, [
      "manual",
      "risk",
      "slow",
      "visibility",
      "coverage",
      "response",
      "monitoring",
      "inspection",
    ])
  ) {
    score += 1;
    evidence.push("Lead has operational pain related to visibility, inspection, or response.");
  }

  if (score < 4) {
    missingInfo.push("Specific operational KPI or pain severity");
  }

  return {
    score: clampBantScore(score),
    evidence,
    missingInfo,
  };
}

function scoreTimeline(parsedLead: ParsedLeadSignals, signalText: string) {
  const evidence: string[] = [];
  const missingInfo: string[] = [];
  let score = 1;

  if (parsedLead.urgency === "critical") {
    score = 5;
    evidence.push("Email has critical urgency language.");
  } else if (parsedLead.urgency === "high") {
    score = 3;
    evidence.push("Email has near-term timing language.");
  } else if (parsedLead.urgency === "medium") {
    score = 2;
    evidence.push("Email indicates active evaluation.");
  }

  const hasSoftPilotSignal =
    includesAny(signalText, [
      "pilot",
      "poc",
      "evaluate",
      "evaluation",
    ]);
  const hasExplicitTimingSignal =
    includesAny(signalText, [
      "this quarter",
      "this month",
      "asap",
      "urgent",
      "deadline",
      "rfp",
      "go live",
      "go-live",
      "by q1",
      "by q2",
      "by q3",
      "by q4",
    ]) || /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(signalText);

  if (hasSoftPilotSignal) {
    score = Math.max(score, 2);
    evidence.push("Email includes pilot or evaluation language, but no target date is confirmed.");
  }

  if (hasExplicitTimingSignal) {
    score += 2;
    evidence.push("Email includes explicit timeline, urgency, or deadline language.");
  }

  if (evidence.length === 0) {
    evidence.push("No explicit timeline signal found.");
  }

  if (score < 5) {
    missingInfo.push("Target go-live date");
    missingInfo.push("Evaluation or procurement timeline");
  }

  return {
    score: clampBantScore(score),
    evidence,
    missingInfo,
  };
}

function inferBestLabel<
  TField extends "industry" | "useCase",
  TSignal extends Record<TField, string> & { terms: readonly string[] },
>(
  searchText: string,
  signals: readonly TSignal[],
  field: TField,
): string {
  const ranked = signals
    .map((signal) => ({
      label: signal[field],
      score: signal.terms.filter((term) => includesAny(searchText, [term]))
        .length,
    }))
    .sort((left, right) => right.score - left.score);
  const best = ranked[0];

  return best && best.score > 0 ? best.label : UNKNOWN_VALUE;
}

function inferCompanyName(
  rawEmail: string,
  companyWebsite?: string,
  senderEmail?: string,
): string {
  const explicitCompanyMatch = rawEmail.match(
    /\b(?:company|organization|organisation|from)\s*[:\-]\s*([a-z0-9 .&'-]{2,80})/i,
  );

  if (explicitCompanyMatch?.[1]) {
    return titleCase(cleanCompanyCandidate(explicitCompanyMatch[1]));
  }

  const roleCompanyMatch = rawEmail.match(
    /\b(?:at|for)\s+([A-Z][a-zA-Z0-9&'.-]+(?:\s+[A-Z][a-zA-Z0-9&'.-]+){0,5})(?:[.,\n]|$)/,
  );

  if (roleCompanyMatch?.[1]) {
    return titleCase(cleanCompanyCandidate(roleCompanyMatch[1]));
  }

  const host = companyWebsite
    ? getHostname(companyWebsite)
    : senderEmail?.split("@")[1];

  if (!host) {
    return UNKNOWN_VALUE;
  }

  return titleCase(host.split(".")[0] ?? UNKNOWN_VALUE);
}

function inferRole(rawEmail: string): string {
  for (const pattern of ROLE_PATTERNS) {
    const match = rawEmail.match(pattern);

    if (match?.[0]) {
      return titleCase(cleanRoleCandidate(match[0]));
    }
  }

  return UNKNOWN_VALUE;
}

function inferRegion(searchText: string): string {
  if (includesAny(searchText, ["uae", "dubai", "abu dhabi", "middle east"])) {
    return "Middle East";
  }

  if (includesAny(searchText, ["slovakia", "germany", "europe", "enbw"])) {
    return "Europe";
  }

  if (includesAny(searchText, ["chile", "brazil", "latin america", "sqm"])) {
    return "Latin America";
  }

  if (includesAny(searchText, ["asia", "philippines", "dole"])) {
    return "Asia Pacific";
  }

  if (includesAny(searchText, ["us", "usa", "canada", "north america", "csx"])) {
    return "North America";
  }

  return UNKNOWN_VALUE;
}

function inferPainPoints(searchText: string): string[] {
  const painPoints: string[] = [];

  addPainPoint(
    painPoints,
    searchText,
    ["manual", "field team", "patrol", "walkdown"],
    "Manual inspection or patrol workflows are creating operational drag.",
  );
  addPainPoint(
    painPoints,
    searchText,
    ["visibility", "blind spot", "coverage"],
    "The account needs better visibility across distributed operating areas.",
  );
  addPainPoint(
    painPoints,
    searchText,
    ["risk", "hazard", "hazardous", "safety", "incident"],
    "The account is trying to reduce safety, risk, or incident exposure.",
  );
  addPainPoint(
    painPoints,
    searchText,
    ["response", "alert", "intrusion", "security"],
    "The account needs faster response to alerts or security events.",
  );
  addPainPoint(
    painPoints,
    searchText,
    ["scale", "multi site", "multiple sites", "portfolio", "1 gw"],
    "The account needs inspection workflows that scale across many assets.",
  );

  return painPoints.length > 0
    ? painPoints
    : ["No explicit pain point found in the available lead text."];
}

function inferUrgency(searchText: string): LeadUrgency {
  if (includesAny(searchText, ["urgent", "asap", "immediately", "critical"])) {
    return "critical";
  }

  if (
    includesAny(searchText, [
      "this quarter",
      "this month",
      "deadline",
      "rfp",
      "tender",
      "pilot this",
      "poc this",
      "go live",
      "go-live",
    ])
  ) {
    return "high";
  }

  if (
    includesAny(searchText, [
      "demo",
      "evaluate",
      "evaluating",
      "looking for",
      "pilot",
      "poc",
    ])
  ) {
    return "medium";
  }

  return "low";
}

function inferScale(searchText: string): LeadScale {
  if (includesAny(searchText, ["global", "enterprise", "1 gw", "fleetwide"])) {
    return "enterprise";
  }

  if (
    includesAny(searchText, [
      "multi site",
      "multiple sites",
      "multiple",
      "facilities",
      "plants",
      "portfolio",
      "corridor",
    ])
  ) {
    return "multi-site";
  }

  if (includesAny(searchText, ["pilot", "poc", "proof of concept"])) {
    return "pilot";
  }

  if (includesAny(searchText, ["single site", "one site", "one facility"])) {
    return "single-site";
  }

  return "unknown";
}

function extractKeywords(
  searchText: string,
  industry: string,
  useCase: string,
): string[] {
  const matchedKeywords = DOMAIN_KEYWORDS.filter((keyword) =>
    includesAny(searchText, [keyword]),
  );
  const fallbackTerms = [
    ...normalizeText(industry).split(" "),
    ...normalizeText(useCase).split(" "),
  ].filter((term) => term.length > 3 && term !== "unknown");

  return [...new Set([...matchedKeywords, ...fallbackTerms])].slice(0, 12);
}

function addPainPoint(
  painPoints: string[],
  searchText: string,
  terms: readonly string[],
  painPoint: string,
): void {
  if (includesAny(searchText, terms)) {
    painPoints.push(painPoint);
  }
}

function includesAny(text: string, terms: readonly string[]): boolean {
  const normalizedText = normalizeText(text);

  return terms.some((term) => normalizedText.includes(normalizeText(term)));
}

function clampBantScore(score: number): 0 | 1 | 2 | 3 | 4 | 5 {
  return Math.max(0, Math.min(5, Math.round(score))) as 0 | 1 | 2 | 3 | 4 | 5;
}

function cleanCompanyCandidate(candidate: string): string {
  return candidate
    .replace(/\b(?:and|but|we|i|our|looking|interested)\b.*$/i, "")
    .trim();
}

function cleanRoleCandidate(candidate: string): string {
  return candidate
    .replace(/\s+\b(?:at|from|with|for)\b.*$/i, "")
    .replace(/\s+\b(?:we|i|our)\b.*$/i, "")
    .trim();
}

function getHostname(value: string): string | undefined {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function titleCase(value: string): string {
  return value
    .split(/[\s.-]+/)
    .filter(Boolean)
    .map((part) =>
      /[a-z][A-Z]/.test(part)
        ? part
        : `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`,
    )
    .join(" ");
}
