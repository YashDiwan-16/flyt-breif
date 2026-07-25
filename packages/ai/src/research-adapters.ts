export type ResearchAdapterName = "demo" | "web";

export type ResearchAdapterSource = {
  title: string;
  kind:
    | "demo-inference"
    | "company-domain"
    | "public-web-source"
    | "public-web-placeholder";
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
    const websiteContext = await fetchPublicWebsiteContext(input.companyWebsite);
    const sourcePageContexts = await discoverPublicResearchPages(input);
    const inferredSources = demoResult.sources.filter(
      (source) => source.kind !== "company-domain",
    );
    const sourcePageSignals = sourcePageContexts.map((context) =>
      context.title ? `${context.title} (${context.url})` : context.url,
    );
    const sourcePageCoverage =
      sourcePageContexts.length > 0
        ? ` Additional public research pages were fetched for source coverage: ${sourcePageSignals.join("; ")}.`
        : " No additional investor/news/strategy pages were discovered from the public sitemap.";
    const sourcePageSourceCitations = sourcePageContexts.map((context) => ({
      title: context.title || "Public research page",
      kind: "public-web-source" as const,
      url: context.url,
      note:
        "Discovered from the submitted company's public sitemap or high-signal public paths and fetched server-side.",
    }));

    if (!websiteContext) {
      const publicSignals = collectUnique([
        ...sourcePageContexts.flatMap((context) =>
          contextToSignals(context, "Public research page"),
        ),
      ]);

      if (sourcePageContexts.length > 0) {
        return {
          ...demoResult,
          adapterName: "web",
          companyOverview: `Public source signal: ${demoResult.companyName} returned readable public research pages even though the submitted homepage did not return usable context. Additional account fit is inferred from the inbound email and submitted domain.`,
          operatingContext: `${demoResult.operatingContext} The submitted homepage fetch did not return readable context.${sourcePageCoverage}`,
          keySignals: collectUnique([...publicSignals, ...demoResult.keySignals]),
          sources: [
            ...inferredSources,
            {
              title: "Submitted company website",
              kind: "company-domain",
              url: input.companyWebsite,
              note:
                "A public homepage fetch was attempted server-side, but no readable page context was returned.",
            },
            ...sourcePageSourceCitations,
            {
              title: "Public search provider integration backlog",
              kind: "public-web-placeholder",
              note:
                "TODO: Add Tavily, Exa, Serper, Firecrawl, or Google Custom Search for broader public account research.",
            },
          ],
          warnings: [
            "Submitted homepage fetch did not return readable account context, but discovered public pages were fetched server-side.",
            "If annual reports, filings, budget disclosures, org charts, or press releases are not present in fetched public pages, those fields must remain unknown rather than fabricated.",
          ],
          confidence: Math.min(
            0.72,
            demoResult.confidence + sourcePageContexts.length * 0.04,
          ),
        };
      }

      return {
        ...demoResult,
        adapterName: "web",
        sources: [
          ...inferredSources,
          {
            title: "Submitted company website",
            kind: "company-domain",
            url: input.companyWebsite,
            note:
              "A public website fetch was attempted server-side, but no readable page context was returned.",
          },
          {
            title: "Public search provider integration backlog",
            kind: "public-web-placeholder",
            note:
              "TODO: Add Tavily, Exa, Serper, Firecrawl, or Google Custom Search for broader public account research.",
          },
        ],
        warnings: [
          "Public website fetch did not return readable account context; research fell back to inferred lead and domain signals.",
          "Broader public account search is not connected yet, so company size, HQ, customers, funding, and market facts remain unverified unless present in the inbound email.",
        ],
        confidence: Math.min(demoResult.confidence, 0.35),
      };
    }

    const publicSignals = collectUnique([
      ...contextToSignals(websiteContext, "Company website"),
      ...sourcePageContexts.flatMap((context) =>
        contextToSignals(context, "Public research page"),
      ),
    ]);
    const websiteSummary =
      websiteContext.description ||
      websiteContext.title ||
      websiteContext.headings[0] ||
      "the submitted website returned readable public page text";

    return {
      ...demoResult,
      adapterName: "web",
      companyOverview: `Public website signal: ${demoResult.companyName} has public website context indicating "${websiteSummary}". Additional account fit is inferred from the inbound email and submitted domain.`,
      operatingContext: `${demoResult.operatingContext} Public website context was fetched from the submitted domain.${sourcePageCoverage}`,
      keySignals: collectUnique([...publicSignals, ...demoResult.keySignals]),
      sources: [
        ...inferredSources,
        {
          title: websiteContext.title || "Submitted company website",
          kind: "company-domain",
          url: websiteContext.url,
          note:
            "Fetched public website title, metadata, headings, and visible text server-side.",
        },
        ...sourcePageSourceCitations,
        {
          title: "Public search provider integration backlog",
          kind: "public-web-placeholder",
          note:
            "TODO: Add Tavily, Exa, Serper, Firecrawl, or Google Custom Search for broader public account research.",
        },
      ],
      warnings: [
        sourcePageContexts.length > 0
          ? "Public research includes the submitted company website and discovered public source pages, but it is still not a full web-search replacement."
          : "Public research is currently limited to the submitted company website plus inbound email evidence.",
        "If annual reports, filings, budget disclosures, org charts, or press releases are not present in fetched public pages, those fields must remain unknown rather than fabricated.",
      ],
      confidence: Math.min(
        0.82,
        demoResult.confidence + 0.17 + sourcePageContexts.length * 0.03,
      ),
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
    companyOverview: `Inferred: ${companyName} appears to be a ${industry.toLowerCase()} account based on the inbound domain and lead signals. This is inference-only research, not verified public research.`,
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
          "Inference adapter inferred context from the inbound email and normalized lead signals.",
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
      "Inference adapter did not perform public web search.",
      "All account research fields should be labeled as inferred unless supported by the inbound email.",
    ],
    confidence,
  };
}

type PublicWebsiteContext = {
  description: string;
  headings: readonly string[];
  textSample: string;
  title: string;
  url: string;
};

const PUBLIC_WEBSITE_TIMEOUT_MS = 4500;
const PUBLIC_RESEARCH_PAGE_LIMIT = 6;
const SITEMAP_URL_LIMIT = 80;
const RESEARCH_PATH_HINTS = [
  "annual",
  "capex",
  "corporate-governance",
  "financial",
  "investor",
  "management",
  "news",
  "operations",
  "press",
  "report",
  "results",
  "strategy",
  "sustainability",
  "technology",
] as const;

async function discoverPublicResearchPages(
  input: ResearchAdapterRequest,
): Promise<readonly PublicWebsiteContext[]> {
  const baseUrl = normalizeWebsiteUrl(input.companyWebsite);

  if (!baseUrl) {
    return [];
  }

  const sitemapUrls = await fetchSitemapUrls(baseUrl);
  const directUrls = getLikelyResearchUrls(baseUrl);
  const candidateUrls = collectUnique([...sitemapUrls, ...directUrls])
    .filter((url) => isResearchUrl(url, input))
    .slice(0, PUBLIC_RESEARCH_PAGE_LIMIT);
  const contexts: PublicWebsiteContext[] = [];

  for (const url of candidateUrls) {
    const context = await fetchPublicWebsiteContext(url);

    if (context) {
      contexts.push(context);
    }
  }

  return contexts;
}

async function fetchSitemapUrls(baseUrl: string): Promise<readonly string[]> {
  const origin = new URL(baseUrl).origin;
  const sitemapCandidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

  for (const sitemapUrl of sitemapCandidates) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      PUBLIC_WEBSITE_TIMEOUT_MS,
    );

    try {
      const response = await fetch(sitemapUrl, {
        headers: {
          Accept: "application/xml,text/xml,text/plain",
          "User-Agent": "FlytBDR-Copilot/0.1 (+server-side-account-research)",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const xml = await response.text();
      const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
        .map((match) => cleanHtmlText(match[1] ?? ""))
        .filter((url) => url.startsWith("http"))
        .slice(0, SITEMAP_URL_LIMIT);

      if (urls.length > 0) {
        return urls;
      }
    } catch {
      // Try the next sitemap candidate.
    } finally {
      clearTimeout(timeout);
    }
  }

  return [];
}

function getLikelyResearchUrls(baseUrl: string): readonly string[] {
  const origin = new URL(baseUrl).origin;

  return [
    "/investors",
    "/investor-relations",
    "/en/investor-relations",
    "/news",
    "/press",
    "/sustainability",
    "/annual-reports",
    "/corporate-governance",
  ].map((path) => `${origin}${path}`);
}

function isResearchUrl(url: string, input: ResearchAdapterRequest) {
  const normalizedUrl = normalize(url);
  const normalizedNeedle = normalize(
    [
      input.companyName,
      input.companyDomain,
      input.industry,
      input.useCase,
      ...(input.keywords ?? []),
      ...RESEARCH_PATH_HINTS,
    ].join(" "),
  );

  return RESEARCH_PATH_HINTS.some((hint) => normalizedUrl.includes(hint)) ||
    normalizedNeedle
      .split(" ")
      .filter((term) => term.length > 4)
      .some((term) => normalizedUrl.includes(term));
}

function contextToSignals(context: PublicWebsiteContext, label: string) {
  return collectUnique([
    context.title ? `${label} title: ${context.title}.` : "",
    context.description ? `${label} description: ${context.description}.` : "",
    ...context.headings
      .slice(0, 4)
      .map((heading) => `${label} heading: ${heading}.`),
    context.textSample ? `${label} text sample: ${context.textSample}.` : "",
  ]);
}

async function fetchPublicWebsiteContext(
  companyWebsite?: string,
): Promise<PublicWebsiteContext | null> {
  const url = normalizeWebsiteUrl(companyWebsite);

  if (!url) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PUBLIC_WEBSITE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "FlytBDR-Copilot/0.1 (+server-side-account-research)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType && !contentType.toLowerCase().includes("html")) {
      return null;
    }

    const html = await response.text();
    const title = extractTagContent(html, "title");
    const description = extractMetaDescription(html);
    const headings = extractHeadings(html).slice(0, 8);
    const textSample = extractReadableText(html).slice(0, 700);

    if (!title && !description && headings.length === 0 && !textSample) {
      return null;
    }

    return {
      description,
      headings,
      textSample,
      title,
      url: response.url || url,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeWebsiteUrl(value?: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function extractTagContent(html: string, tagName: string) {
  const match = html.match(
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
  );

  return match?.[1] ? cleanHtmlText(match[1]) : "";
}

function extractMetaDescription(html: string) {
  const directMatch =
    html.match(
      /<meta\s+[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    ) ??
    html.match(
      /<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*>/i,
    );

  return directMatch?.[1] ? cleanHtmlText(directMatch[1]) : "";
}

function extractHeadings(html: string) {
  return [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((match) => cleanHtmlText(match[1] ?? ""))
    .filter(Boolean);
}

function extractReadableText(html: string) {
  return cleanHtmlText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function cleanHtmlText(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function collectUnique(items: readonly string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
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
      "The inbound lead appears operationally relevant, but public account context is unavailable in inference-only mode.",
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
