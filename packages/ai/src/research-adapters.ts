export type ResearchAdapterName = "demo" | "web";

export type ResearchAdapterSource = {
  title: string;
  kind: "demo-inference" | "company-domain" | "public-web-placeholder";
  url?: string;
  note: string;
};

export type ResearchAdapterRequest = {
  companyDomain: string;
  companyWebsite?: string;
  companyName?: string;
  industry: string;
  region: string;
  useCase: string;
  rawEmail?: string;
  keywords?: readonly string[];
};

export type ResearchAdapterResult = {
  adapterName: ResearchAdapterName;
  companyDomain: string;
  companyName: string;
  industry: string;
  region: string;
  useCase: string;
  companyOverview: string;
  operatingContext: string;
  keySignals: readonly string[];
  likelyBuyingCommittee: readonly string[];
  researchGaps: readonly string[];
  sources: readonly ResearchAdapterSource[];
  warnings: readonly string[];
  confidence: number;
};

export interface ResearchAdapter {
  name: ResearchAdapterName;
  research(input: ResearchAdapterRequest): Promise<ResearchAdapterResult>;
}

export const demoResearchAdapter: ResearchAdapter = {
  name: "demo",
  research: async (input) => buildDemoResearch(input),
};

export const webResearchAdapter: ResearchAdapter = {
  name: "web",
  research: async (input) => {
    const demoResult = buildDemoResearch(input);

    return {
      ...demoResult,
      adapterName: "web",
      sources: [
        ...demoResult.sources,
        {
          title: "Public web research placeholder",
          kind: "public-web-placeholder",
          note:
            "TODO: Replace with real public account research from Tavily, Exa, Serper, Firecrawl, or Google Custom Search.",
        },
      ],
      warnings: [
        ...demoResult.warnings,
        "webResearchAdapter is a placeholder and did not perform public web search.",
        "TODO: Add search provider selection, result deduplication, source trust scoring, extraction, and citation capture.",
        "TODO: Keep network research server-side and validate outputs before passing them to the model.",
      ],
      confidence: 0.2,
    };
  },
};

export function getResearchAdapter(name: ResearchAdapterName = "demo") {
  return name === "web" ? webResearchAdapter : demoResearchAdapter;
}

function buildDemoResearch(input: ResearchAdapterRequest): ResearchAdapterResult {
  const companyName =
    input.companyName?.trim() ||
    inferCompanyNameFromDomain(input.companyDomain) ||
    "Unknown company";
  const industry =
    normalizeUnknown(input.industry) ?? "Unknown - inferred industry unavailable";
  const useCase =
    normalizeUnknown(input.useCase) ?? "Unknown - inferred use case unavailable";
  const region = normalizeUnknown(input.region) ?? "Unknown region";
  const industryProfile = getIndustryProfile(industry, useCase);
  const domainSignal = input.companyDomain
    ? `Company domain provided: ${input.companyDomain}.`
    : "No company domain was provided.";
  const keywordSignal =
    input.keywords && input.keywords.length > 0
      ? `Inbound keywords: ${input.keywords.slice(0, 8).join(", ")}.`
      : "No reliable inbound keywords were extracted.";
  const confidence =
    input.companyDomain && normalizeUnknown(input.industry) && normalizeUnknown(input.useCase)
      ? 0.55
      : 0.35;

  return {
    adapterName: "demo",
    companyDomain: input.companyDomain || "unknown-domain",
    companyName,
    industry,
    region,
    useCase,
    companyOverview: `Inferred: ${companyName} appears to be a ${industry.toLowerCase()} account based on the inbound domain and lead signals. This is demo research only, not verified public research.`,
    operatingContext: `Inferred: The account likely needs ${useCase.toLowerCase()} in ${region}, with FlytBase relevance around autonomous drone operations, repeatable monitoring, and operational visibility.`,
    keySignals: [
      domainSignal,
      `Industry signal: ${industry}.`,
      `Use-case signal: ${useCase}.`,
      `Region signal: ${region}.`,
      keywordSignal,
      ...industryProfile.keySignals,
    ],
    likelyBuyingCommittee: industryProfile.buyingCommittee,
    researchGaps: [
      "Verified company size",
      "Verified headquarters and operating locations",
      "Current drone program maturity",
      "Existing inspection, security, or monitoring vendors",
      "Budget owner and procurement process",
      "Implementation timeline and success criteria",
    ],
    sources: [
      {
        title: "Inbound lead email",
        kind: "demo-inference",
        note:
          "Demo adapter inferred context from the inbound email and normalized lead signals.",
      },
      {
        title: "Company domain",
        kind: "company-domain",
        url: input.companyWebsite,
        note:
          "Domain was used only as an account identity signal; no public website fetch was performed.",
      },
    ],
    warnings: [
      "Demo research adapter did not perform public web search.",
      "All account research fields should be labeled as inferred unless supported by the inbound email.",
    ],
    confidence,
  };
}

function getIndustryProfile(industry: string, useCase: string) {
  const normalized = normalize(`${industry} ${useCase}`);

  if (includesAny(normalized, ["solar", "renewable", "pv"])) {
    return {
      keySignals: [
        "Renewable asset operators often care about inspection coverage, repeatability, and reducing manual site visits.",
        "Solar PV inspection conversations should clarify MW/GW scale, site count, defect detection workflow, and reporting cadence.",
      ],
      buyingCommittee: [
        "Head of Operations",
        "Solar O&M leader",
        "Asset performance manager",
        "Innovation or digital transformation owner",
        "Procurement stakeholder",
      ],
    };
  }

  if (includesAny(normalized, ["mine", "mining", "industrial"])) {
    return {
      keySignals: [
        "Mining operators often value safer inspection coverage across large, remote, or hazardous zones.",
        "Discovery should clarify inspection zones, safety constraints, shift cadence, and integration with operations teams.",
      ],
      buyingCommittee: [
        "Mine operations leader",
        "Safety manager",
        "Maintenance or reliability leader",
        "Site technology owner",
        "Procurement stakeholder",
      ],
    };
  }

  if (includesAny(normalized, ["agriculture", "plantation", "farm"])) {
    return {
      keySignals: [
        "Agriculture accounts often need wide-area monitoring, perimeter visibility, and escalation workflows.",
        "Discovery should clarify acreage, patrol model, security triggers, and ERP or operations-system integration needs.",
      ],
      buyingCommittee: [
        "Plantation operations leader",
        "Security manager",
        "IT or ERP owner",
        "Regional site manager",
        "Procurement stakeholder",
      ],
    };
  }

  if (includesAny(normalized, ["waste", "environmental", "hazard"])) {
    return {
      keySignals: [
        "Waste and environmental teams often need frequent monitoring for safety, compliance, and hazardous-condition detection.",
        "Discovery should clarify facility count, compliance reporting needs, hazardous detection workflows, and escalation paths.",
      ],
      buyingCommittee: [
        "Facility operations leader",
        "Environmental compliance owner",
        "Health and safety manager",
        "Technology or innovation owner",
        "Procurement stakeholder",
      ],
    };
  }

  if (includesAny(normalized, ["wildfire", "forest", "thermal"])) {
    return {
      keySignals: [
        "Wildfire and forest-monitoring teams often need early detection, thermal visibility, and coverage across remote land.",
        "Discovery should clarify monitored area, alert threshold, command-center workflow, and emergency-response integration.",
      ],
      buyingCommittee: [
        "Land management leader",
        "Emergency response coordinator",
        "Security or defense operations owner",
        "Remote sensing or GIS owner",
        "Procurement stakeholder",
      ],
    };
  }

  if (includesAny(normalized, ["oil", "gas", "pipeline", "refinery"])) {
    return {
      keySignals: [
        "Oil and gas accounts often need inspection coverage for safety-critical and distributed infrastructure.",
        "Discovery should clarify asset types, inspection frequency, safety constraints, and maintenance handoff workflows.",
      ],
      buyingCommittee: [
        "Asset integrity leader",
        "Operations manager",
        "HSE stakeholder",
        "Maintenance or reliability leader",
        "Procurement stakeholder",
      ],
    };
  }

  if (includesAny(normalized, ["rail", "railway", "corridor", "track"])) {
    return {
      keySignals: [
        "Rail operators often need corridor visibility, faster incident assessment, and infrastructure risk monitoring.",
        "Discovery should clarify corridor length, inspection triggers, yard coverage, and incident-response workflow.",
      ],
      buyingCommittee: [
        "Rail operations leader",
        "Infrastructure maintenance owner",
        "Risk or safety manager",
        "Network operations stakeholder",
        "Procurement stakeholder",
      ],
    };
  }

  if (includesAny(normalized, ["security", "perimeter", "surveillance"])) {
    return {
      keySignals: [
        "Security-led accounts often need persistent perimeter visibility and faster response to alerts.",
        "Discovery should clarify site layout, current camera gaps, alert sources, and response-time targets.",
      ],
      buyingCommittee: [
        "Security operations leader",
        "Site operations manager",
        "Critical infrastructure owner",
        "IT or systems integration stakeholder",
        "Procurement stakeholder",
      ],
    };
  }

  return {
    keySignals: [
      "The inbound lead appears operationally relevant, but public account context is unavailable in demo mode.",
      "Discovery should clarify operational pain, site scale, buying authority, budget range, and timeline.",
    ],
    buyingCommittee: [
      "Operations leader",
      "Functional owner for the stated use case",
      "IT or systems integration stakeholder",
      "Procurement stakeholder",
    ],
  };
}

function inferCompanyNameFromDomain(domain: string) {
  const [firstSegment] = domain.replace(/^www\./, "").split(".");

  if (!firstSegment) {
    return undefined;
  }

  return firstSegment
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function normalizeUnknown(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.toLowerCase().startsWith("unknown")
    ? undefined
    : normalizedValue;
}

function includesAny(text: string, terms: readonly string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
