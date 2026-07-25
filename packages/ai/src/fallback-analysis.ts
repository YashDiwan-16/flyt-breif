import {
  leadAnalysisSchema,
  type LeadAnalysis,
  type LeadInput,
  type SourceCitation,
} from "@flyt-breif/core";
import {
  flytBaseCaseStudyKnowledgeBase,
  searchCaseStudies,
  type CaseStudySearchResult,
} from "@flyt-breif/data";

import type { ResearchAdapterResult } from "./research-adapters";
import {
  extractLeadSignals,
  recommendGTMMotion,
  scoreBANT,
} from "./tools";
import type {
  BANTScoringOutput,
  CaseStudyToolResult,
  ParsedLeadSignals,
} from "./schemas";

type BuildDeterministicLeadAnalysisInput = {
  failureReason?: string;
  leadInput: LeadInput;
  parsedLeadSignals?: ParsedLeadSignals;
  researchContext: ResearchAdapterResult;
};

type BantScore = LeadAnalysis["qualification"]["budget"]["score"];

const fallbackDiscoveryQuestions = {
  Budget:
    "What budget range or pilot funding has already been allocated for the drone dock program?",
  Authority:
    "Who besides you needs to approve the autonomous drone deployment and pilot success criteria?",
  Need:
    "Which inspection or monitoring findings need to trigger an immediate operational response?",
  Timeline:
    "When does the first site need to be live for this project to count as successful?",
} as const;

const caseStudyRegions: Record<string, string> = {
  "csx-rail-infrastructure-monitoring": "North America",
  "dole-asia-agriculture-security": "Asia Pacific",
  "enbw-solar-pv-inspections": "Europe",
  "premier-security-energy-infrastructure": "North America",
  "shell-oil-gas-inspections": "Global",
  "slovakia-military-forest-wildfire-detection": "Europe",
  "sqm-mining-inspections": "Latin America",
  "uae-waste-management-authority": "Middle East",
};

export function buildDeterministicLeadAnalysis({
  failureReason,
  leadInput,
  parsedLeadSignals,
  researchContext,
}: BuildDeterministicLeadAnalysisInput): LeadAnalysis {
  const parsedLead =
    parsedLeadSignals ??
    extractLeadSignals({
      rawEmail: leadInput.rawEmail,
      metadata: {
        senderEmail: leadInput.senderEmail,
        senderName: leadInput.senderName,
        companyWebsite: leadInput.companyWebsite,
        region: leadInput.region,
      },
    });
  const caseStudyResult = getBestCaseStudyResult(leadInput, parsedLead);
  const caseStudyToolResult = toCaseStudyToolResult(caseStudyResult);
  const bantScoring = scoreBANT(parsedLead);
  const gtmMotion = recommendGTMMotion({
    caseStudyMatch: caseStudyToolResult,
    parsedLead,
    qualification: bantScoring,
  });
  const qualification = buildQualification(bantScoring);
  const totalBantScore = getTotalBantScore(bantScoring);
  const leadScore = getLeadScore(
    totalBantScore,
    caseStudyResult.score,
    parsedLead.urgency,
  );
  const matchedCaseStudyConfidence = getCaseStudyConfidence(caseStudyResult.score);
  const missingInfo = getMissingInfo(bantScoring, researchContext);
  const contactFirstName = getFirstName(leadInput.senderName);
  const droneOperation = getDroneOperation(parsedLead);
  const warnings = [
    "Gemini analysis was unavailable, so FlytBDR returned a deterministic fallback analysis to keep the intake workflow available.",
    "Fallback account research is inferred from inbound lead fields and adapter context, not verified broader public web research.",
    ...researchContext.warnings,
    ...(failureReason ? [`AI failure captured by server: ${failureReason}`] : []),
  ];

  const analysis: LeadAnalysis = {
    leadSnapshot: {
      companyName: parsedLead.companyName,
      contactName: leadInput.senderName,
      contactRole: parsedLead.role,
      industry: parsedLead.industry,
      region: parsedLead.region === "Unknown" ? leadInput.region : parsedLead.region,
      useCase: parsedLead.useCase,
      urgency: parsedLead.urgency,
      leadScore,
      qualificationLabel: getQualificationLabel(totalBantScore, leadScore),
    },
    parsedSignals: {
      companyName: parsedLead.companyName,
      contactName: leadInput.senderName,
      contactRole: parsedLead.role,
      contactEmail: leadInput.senderEmail,
      companyWebsite: leadInput.companyWebsite,
      region: parsedLead.region === "Unknown" ? leadInput.region : parsedLead.region,
      industry: parsedLead.industry,
      useCase: parsedLead.useCase,
      painPoints: parsedLead.painPoints,
      businessTriggers: getBusinessTriggers(parsedLead),
      budgetSignals: bantScoring.Budget.evidence,
      authoritySignals: bantScoring.Authority.evidence,
      needSignals: bantScoring.Need.evidence,
      timelineSignals: bantScoring.Timeline.evidence,
      missingInfo,
    },
    qualification,
    accountResearch: {
      companyOverview: researchContext.companyOverview,
      companySize: "Unknown - not provided by inbound email or adapter research.",
      headquarters: "Unknown - not provided by inbound email or adapter research.",
      industry: researchContext.industry,
      keySignals: [...researchContext.keySignals],
      likelyBuyingCommittee: [...researchContext.likelyBuyingCommittee],
      operatingContext: researchContext.operatingContext,
      region: researchContext.region,
      researchGaps: [...researchContext.researchGaps],
      sources: researchContext.sources.map(toSourceCitation),
    },
    matchedCaseStudy: {
      caseStudyId: caseStudyResult.caseStudy.id,
      confidence: matchedCaseStudyConfidence,
      industry: caseStudyResult.caseStudy.industry,
      matchedPainPoints: getMatchedItems(
        caseStudyResult.caseStudy.painPoints,
        parsedLead.painPoints,
      ),
      matchedUseCases: getMatchedItems(
        caseStudyResult.caseStudy.useCases,
        [parsedLead.useCase, ...parsedLead.keywords],
      ),
      proofPoints: [...caseStudyResult.caseStudy.proofPoints],
      recommendedEmailLine: caseStudyResult.caseStudy.recommendedEmailLine,
      region:
        caseStudyRegions[caseStudyResult.caseStudy.id] ??
        "Not provided in knowledge base",
      relevanceRationale:
        `${caseStudyResult.caseStudy.title} is the strongest deterministic match because the lead signals include ${inlineList([
          parsedLead.industry,
          parsedLead.useCase,
          ...caseStudyResult.matchedTerms.slice(0, 4),
        ])}.`,
      title: caseStudyResult.caseStudy.title,
      url: caseStudyResult.caseStudy.url,
    },
    gtmRecommendation: {
      discoveryFocus: getDiscoveryFocus(parsedLead, missingInfo),
      nextBestAction: gtmMotion.recommendedNextStep,
      positioning:
        `Position FlytBase as the autonomous drone operations layer for ${droneOperation}, using ${caseStudyResult.caseStudy.title} as the proof path.`,
      primaryPersona:
        researchContext.likelyBuyingCommittee[0] ?? "Operations leader",
      priority: leadScore >= 75 ? "high" : leadScore >= 50 ? "medium" : "low",
      recommendedMotion: gtmMotion.motion,
      recommendedOffer:
        `30-minute ${droneOperation} pilot design session with site scope, dock placement, cadence, payload, alert workflow, and buying-process validation.`,
      riskNotes:
        gtmMotion.risks.length > 0
          ? gtmMotion.risks
          : ["Confirm budget owner and deployment approval path before quoting."],
    },
    emailSequence: {
      strategy:
        `Open with the inbound ${droneOperation} problem, then use ${caseStudyResult.caseStudy.title} as the operational proof point before moving into technical dock and workflow discovery.`,
      steps: [
        {
          body:
            `Hi ${contactFirstName},\n\nThanks for reaching out about ${droneOperation}. FlytBase is built for teams that need repeatable autonomous drone operations from dock deployment through flight execution, review, alerts, and operational handoff.\n\nBased on your note, a useful first call would map site scope, inspection cadence, payload needs, alert workflow, and how quickly you want to pilot.\n\nWould you be open to a 30-minute pilot design call this week?`,
          callToAction: "Book a 30-minute pilot design call.",
          delayDays: 0,
          personalizationNotes: [
            `Acknowledges ${parsedLead.companyName}'s stated ${parsedLead.useCase.toLowerCase()} need.`,
            `Uses the inbound urgency signal: ${parsedLead.urgency}.`,
          ],
          purpose:
            "Respond to the inbound request and move the prospect into focused FlytBase discovery.",
          step: 1,
          subject: `${parsedLead.useCase} pilot for ${parsedLead.companyName}`,
          type: "first-reply",
        },
        {
          body:
            `Hi ${contactFirstName},\n\nOne relevant FlytBase proof point is ${caseStudyResult.caseStudy.title}. ${caseStudyResult.caseStudy.recommendedEmailLine}\n\nThe parallel for ${parsedLead.companyName} is not just flying drones; it is making the operation repeatable from dock readiness to ${droneOperation}, evidence review, and escalation.\n\nShould we compare that pattern against your current operating cadence and pilot goals?`,
          callToAction: "Compare the matched case-study pattern against the prospect's pilot scope.",
          delayDays: 2,
          personalizationNotes: [
            `Matched case study: ${caseStudyResult.caseStudy.title}.`,
            `Matched terms: ${inlineList(caseStudyResult.matchedTerms.slice(0, 6))}.`,
          ],
          purpose:
            "Follow up with the strongest FlytBase case-study proof point and connect it to the lead's pain.",
          step: 2,
          subject: `Relevant FlytBase proof for ${parsedLead.useCase.toLowerCase()}`,
          type: "case-study-follow-up",
        },
        {
          body:
            `Hi ${contactFirstName},\n\nTo make the pilot concrete, the technical discovery should focus on where docks could sit, what payloads are needed, how often flights should run, what conditions block autonomous operations, and where alerts or reports need to land after each mission.\n\nCan we use those points as the agenda for a short technical discovery with your operations and technical stakeholders?`,
          callToAction: "Confirm the technical discovery agenda and stakeholders.",
          delayDays: 5,
          personalizationNotes: [
            "Keeps the ask specific to autonomous drone dock deployment.",
            "Surfaces integrations, alerts, and operating constraints before handoff.",
          ],
          purpose:
            "Collect technical deployment details needed by the AE and solutions team.",
          step: 3,
          subject: `Technical discovery for autonomous ${parsedLead.useCase.toLowerCase()}`,
          type: "technical-discovery-follow-up",
        },
      ],
    },
    aeHandoffSummary: {
      evidence: [
        `Inbound use case: ${parsedLead.useCase}.`,
        `BANT score: ${totalBantScore}/20 with Need ${bantScoring.Need.score}/5 and Timeline ${bantScoring.Timeline.score}/5.`,
        `Matched proof: ${caseStudyResult.caseStudy.title} - ${caseStudyResult.caseStudy.proofPoints[0]}.`,
        ...parsedLead.painPoints.slice(0, 2),
      ],
      gtmOwner:
        gtmMotion.motion === "Direct AE"
          ? "AE - direct discovery is justified by strong BANT and relevant FlytBase proof."
          : "AE + Partner - run BDR discovery while validating local deployment or partner needs.",
      missingInfo,
      painHypothesis:
        `${parsedLead.companyName} is likely trying to make ${droneOperation} repeatable across operational sites without scaling manual field effort at the same rate.`,
      recommendedNextSteps: [
        "Route to AE with matched case-study context and fallback warnings visible.",
        "Use the first-reply email to book a focused pilot design call.",
        "Validate budget owner, approval path, site scale, dock placement, and technical constraints.",
      ],
      riskNotes: [
        "Fallback analysis is deterministic and should be replaced by Gemini output when available.",
        ...warnings.slice(1, 3),
      ],
      suggestedCallAgenda: [
        "Confirm operating footprint, site count, and deployment region.",
        "Map current inspection or monitoring workflow and escalation path.",
        "Define pilot success criteria, cadence, payload, dock placement, and reporting needs.",
        "Identify economic buyer, technical owner, budget range, and timeline.",
      ],
      summary:
        `${parsedLead.companyName} is a ${parsedLead.industry.toLowerCase()} inbound lead for ${droneOperation}, matched to ${caseStudyResult.caseStudy.title} with a ${gtmMotion.motion} recommendation.`,
      topDiscoveryQuestions: [
        "How many sites, assets, or zones should the first pilot cover?",
        "Where could drone docks be installed, and what site constraints affect autonomous operations?",
        "Which sensor payloads, inspection findings, alerts, or reports matter most?",
        "Who owns budget, technical approval, and final deployment sign-off?",
        "What date would the pilot need to hit to support the current initiative?",
      ],
      whyThisLeadMatters:
        `The inbound email contains a clear FlytBase-fit use case, a near-term operational trigger, and enough BANT coverage to justify ${gtmMotion.motion} follow-up.`,
    },
    confidence: Math.min(0.86, Math.max(0.62, matchedCaseStudyConfidence - 0.04)),
    sources: [
      {
        title: "Inbound lead email",
        sourceType: "lead-email",
        usedFor: ["Lead snapshot", "BANT evidence", "Email personalization"],
      },
      {
        title: caseStudyResult.caseStudy.title,
        sourceType: "case-study",
        url: caseStudyResult.caseStudy.url,
        usedFor: ["Case study match", "GTM recommendation", "Email follow-up"],
      },
      ...researchContext.sources.map(toSourceCitation),
    ],
    warnings,
  };

  return leadAnalysisSchema.parse(analysis);
}

function getBestCaseStudyResult(
  leadInput: LeadInput,
  parsedLead: ParsedLeadSignals,
): CaseStudySearchResult {
  const query = [
    leadInput.rawEmail,
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
  const [bestResult] = searchCaseStudies(query, { limit: 1 });

  if (bestResult) {
    return bestResult;
  }

  const [fallbackCaseStudy] = flytBaseCaseStudyKnowledgeBase;

  if (!fallbackCaseStudy) {
    throw new Error("No FlytBase case studies are available for fallback analysis.");
  }

  return {
    caseStudy: fallbackCaseStudy,
    matchedTerms: [],
    score: 0,
  };
}

function toCaseStudyToolResult({
  caseStudy,
  matchedTerms,
  score,
}: CaseStudySearchResult): CaseStudyToolResult {
  return {
    id: caseStudy.id,
    industry: caseStudy.industry,
    keywords: [...caseStudy.keywords],
    matchedTerms: [...matchedTerms],
    painPoints: [...caseStudy.painPoints],
    proofPoints: [...caseStudy.proofPoints],
    recommendedEmailLine: caseStudy.recommendedEmailLine,
    score,
    searchText: caseStudy.searchText,
    title: caseStudy.title,
    url: caseStudy.url,
    useCases: [...caseStudy.useCases],
  };
}

function buildQualification(scoring: BANTScoringOutput): LeadAnalysis["qualification"] {
  return {
    authority: {
      discoveryQuestion: fallbackDiscoveryQuestions.Authority,
      evidence: scoring.Authority.evidence,
      missingInfo: scoring.Authority.missingInfo,
      score: toBantScore(scoring.Authority.score),
    },
    budget: {
      discoveryQuestion: fallbackDiscoveryQuestions.Budget,
      evidence: scoring.Budget.evidence,
      missingInfo: scoring.Budget.missingInfo,
      score: toBantScore(scoring.Budget.score),
    },
    need: {
      discoveryQuestion: fallbackDiscoveryQuestions.Need,
      evidence: scoring.Need.evidence,
      missingInfo: scoring.Need.missingInfo,
      score: toBantScore(scoring.Need.score),
    },
    timeline: {
      discoveryQuestion: fallbackDiscoveryQuestions.Timeline,
      evidence: scoring.Timeline.evidence,
      missingInfo: scoring.Timeline.missingInfo,
      score: toBantScore(scoring.Timeline.score),
    },
  };
}

function getTotalBantScore(scoring: BANTScoringOutput) {
  return (
    scoring.Budget.score +
    scoring.Authority.score +
    scoring.Need.score +
    scoring.Timeline.score
  );
}

function getLeadScore(
  totalBantScore: number,
  caseStudyScore: number,
  urgency: ParsedLeadSignals["urgency"],
) {
  const urgencyBoost =
    urgency === "critical" ? 8 : urgency === "high" ? 6 : urgency === "medium" ? 3 : 0;

  return Math.max(
    0,
    Math.min(
      96,
      Math.round(
        totalBantScore * 4 +
          getCaseStudyConfidence(caseStudyScore) * 20 +
          urgencyBoost,
      ),
    ),
  );
}

function getCaseStudyConfidence(score: number) {
  return Math.min(0.94, Math.max(0.55, score / 55));
}

function getQualificationLabel(
  totalBantScore: number,
  leadScore: number,
): LeadAnalysis["leadSnapshot"]["qualificationLabel"] {
  if (totalBantScore >= 17 || leadScore >= 85) {
    return "sales-ready";
  }

  if (totalBantScore >= 13 || leadScore >= 65) {
    return "qualified";
  }

  if (totalBantScore >= 8 || leadScore >= 45) {
    return "nurture";
  }

  return "unqualified";
}

function getBusinessTriggers(parsedLead: ParsedLeadSignals) {
  return [
    `Urgency signal: ${parsedLead.urgency}.`,
    `Scale signal: ${parsedLead.scale}.`,
    `Primary use case: ${parsedLead.useCase}.`,
  ];
}

function getMissingInfo(
  scoring: BANTScoringOutput,
  researchContext: ResearchAdapterResult,
) {
  return unique([
    ...scoring.Budget.missingInfo,
    ...scoring.Authority.missingInfo,
    ...scoring.Need.missingInfo,
    ...scoring.Timeline.missingInfo,
    ...researchContext.researchGaps.slice(0, 4),
  ]);
}

function getMatchedItems(
  caseStudyItems: readonly string[],
  leadTerms: readonly string[],
) {
  const normalizedLeadTerms = leadTerms.map(normalize);
  const matchedItems = caseStudyItems.filter((item) => {
    const normalizedItem = normalize(item);

    return normalizedLeadTerms.some((term) => term && normalizedItem.includes(term));
  });

  return matchedItems.length > 0 ? matchedItems : caseStudyItems.slice(0, 3);
}

function getDiscoveryFocus(
  parsedLead: ParsedLeadSignals,
  missingInfo: readonly string[],
) {
  return unique([
    `${parsedLead.useCase} scope and success criteria`,
    "Drone dock placement and site readiness",
    "Flight cadence, payload, alerts, reporting, and review workflow",
    "Airspace, safety, and operating constraints",
    ...missingInfo.slice(0, 3),
  ]);
}

function getDroneOperation(parsedLead: ParsedLeadSignals) {
  const useCase = parsedLead.useCase.toLowerCase();

  if (useCase.includes("solar")) {
    return "solar PV inspections";
  }

  if (useCase.includes("mining")) {
    return "mining inspections";
  }

  if (useCase.includes("plantation")) {
    return "plantation security patrols";
  }

  if (useCase.includes("environmental") || useCase.includes("hazard")) {
    return "waste-facility monitoring and hazardous detection";
  }

  if (useCase.includes("wildfire")) {
    return "wildfire detection and thermal monitoring";
  }

  if (useCase.includes("oil") || useCase.includes("gas")) {
    return "oil and gas infrastructure inspections";
  }

  if (useCase.includes("rail")) {
    return "rail infrastructure monitoring";
  }

  if (useCase.includes("perimeter")) {
    return "perimeter surveillance and faster response";
  }

  return "autonomous drone operations";
}

function toSourceCitation(source: ResearchAdapterResult["sources"][number]): SourceCitation {
  return {
    ...(source.url ? { url: source.url } : {}),
    sourceType:
      source.kind === "company-domain"
        ? "company-website"
        : source.kind === "public-web-placeholder"
          ? "manual-note"
          : "account-research",
    title: source.title,
    usedFor: [source.note],
  };
}

function toBantScore(score: number): BantScore {
  return Math.max(0, Math.min(5, Math.round(score))) as BantScore;
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function inlineList(items: readonly string[]) {
  const values = unique(items);

  return values.length > 0 ? values.join(", ") : "available lead signals";
}

function unique(items: readonly string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
