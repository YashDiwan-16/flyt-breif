import {
  buildDeterministicLeadAnalysis,
  extractLeadSignals,
  flytBdrTools,
  getResearchAdapter,
} from "@flyt-breif/ai";
import type {
  ResearchAdapterName,
  ResearchAdapterResult,
} from "@flyt-breif/ai";
import { leadAnalysisSchema, leadInputSchema } from "@flyt-breif/core";
import type { LeadInput } from "@flyt-breif/core";
import { generateText, Output, stepCountIs } from "ai";
import { NextResponse } from "next/server";
import type { ZodIssue } from "zod";

import { DEFAULT_AI_MODEL_ID, getGoogleLanguageModel } from "@/lib/ai/google";
import { ensureSalesIntelligenceDatabase } from "@/lib/server/database-setup";
import { sendLeadNotificationEmail } from "@/lib/server/lead-notifications";
import { storeLeadSubmission } from "@/lib/server/lead-submissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const ANALYZE_LEAD_SYSTEM_PROMPT = `
You are FlytBDR Copilot, an internal sales intelligence analyst for FlytBase inbound BDR work.

Return an AE-ready LeadAnalysis object only. Use the schema exactly.

Assignment context:
- This is an inspectable AI workflow for the FlytBase inbound BDR challenge.
- The system starts from one raw contact-form email and must produce the artifacts a human inbound BDR would produce.
- Organize your reasoning into these stages even though the final schema is LeadAnalysis:
  Stage 1 Qualification, Stage 2 Deep Account Research, Stage 3 Response Generation, Stage 4 Case Study and Material Matching, Stage 5 GTM Routing, Stage 6 AE Handoff and Report Generation.

Rules:
- Do not invent public facts.
- If real company research is unavailable, label the field as inferred or unknown.
- Use evidence from the inbound email as the primary source.
- Show missing information clearly in qualification, accountResearch.researchGaps, aeHandoffSummary.missingInfo, and warnings.
- Be conservative with qualification. If Budget, Authority, Timeline, decision process, paper process, procurement, competition, or approval path are not supported by the inbound email or adapter context, mark them as unknown and add them to missingInfo. Do not create plausible filler.
- Match case studies using the provided FlytBase knowledge base only.
- Prefer concrete drone-automation operational insight over generic sales language.
- Keep every recommendation specific to FlytBase autonomous drone operations, drone docks, inspections, monitoring, security, response workflows, and operational integrations where relevant.
- Avoid generic SaaS phrasing such as "streamline workflows", "unlock value", "drive efficiency", or "digital transformation" unless it is tied to a specific drone operation or FlytBase use case.
- Keep every array populated with useful, concise items.
- Use lowercase BANT keys in the final qualification object: budget, authority, need, timeline.
- For each BANT item, include score, evidence, missingInfo, and one discoveryQuestion.
- BANT scoring must reflect evidence quality. Need can score high from a concrete operations problem. Budget, Authority, and Timeline should stay low or medium unless the inbound email actually mentions funding, decision ownership, urgency, deadline, pilot date, or procurement context.
- For sources, use only sourceType values allowed by the schema.
- The model cannot browse on its own. Use only the inbound email, tool results, and ResearchAdapterContext.
- Do not claim headquarters, company size, org structure, reporting lines, capex, opex, funding, technology investments, recent news, investor priorities, customer names, or market facts unless they appear in the inbound email or adapter-provided public source context. Mark them as "Unknown - not verified" or "Inferred: ..." when needed.
- If adapter-provided research context is inferred or limited, preserve that caveat in accountResearch and warnings.
- If public source context includes investor, annual-report, news, sustainability, strategy, operations, or technology pages, synthesize only the specific facts present in those sources and include them in keySignals with source caveats.
- If public source context is thin, say what needs a real search/enrichment adapter next. Never compensate with filler.
- If a case study returned by tools does not include a region, set matchedCaseStudy.region to "Not provided in knowledge base" and include that caveat in warnings.
- Case-study matching must use FlytBase public case-study material returned by the tool/retrieval context. If the inbound email references Anglo American, evaluate the Anglo American mining case-study connection without hard-coding it as the winner.

Workflow:
1. Use extractLeadSignals for the inbound email.
2. Use searchCaseStudies to retrieve the best FlytBase case-study matches.
3. Use bantScoring to support the BANT assessment.
4. Use gtmMotion to support the GTM recommendation.
5. Produce the final structured LeadAnalysis using the tool results plus direct evidence from the inbound email.
`;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return createErrorResponse("Request body must be valid JSON.", 400);
  }

  const leadInputResult = leadInputSchema.safeParse(body);

  if (!leadInputResult.success) {
    return createErrorResponse(
      "Lead input is invalid.",
      400,
      formatZodIssues(leadInputResult.error.issues),
    );
  }

  const leadInput = leadInputResult.data;
  await ensureSalesIntelligenceDatabase();

  const { parsedLeadSignals, researchContext } = await getLeadContext(leadInput);

  try {
    const { model, modelId } = getGoogleLanguageModel();
    const result = await generateText({
      maxOutputTokens: 8000,
      model,
      output: Output.object({
        schema: leadAnalysisSchema,
      }),
      prompt: buildAnalyzeLeadPrompt(leadInput, researchContext),
      stopWhen: stepCountIs(6),
      system: ANALYZE_LEAD_SYSTEM_PROMPT,
      temperature: 0.2,
      tools: flytBdrTools,
    });
    const analysisResult = leadAnalysisSchema.safeParse(result.output);

    if (!analysisResult.success) {
      throw new Error(
        `AI response did not match the LeadAnalysis schema. ${formatZodIssues(
          analysisResult.error.issues,
        ).join(" ")}`,
      );
    }
    const storedSubmission = await storeLeadSubmission({
      leadInput,
      analysisStatus: "ai",
      statusMessage: "Generated by Gemini and validated against LeadAnalysis.",
      modelId,
      analysis: analysisResult.data,
    });
    const notificationStatus =
      await sendLeadNotificationEmail(storedSubmission);

    return NextResponse.json(
      {
        ok: true,
        submissionId: storedSubmission.id,
        analysisStatus: "ai",
        statusMessage: "Generated by Gemini and validated against LeadAnalysis.",
        notificationStatus,
        modelId,
        analysis: analysisResult.data,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const failureReason = sanitizeFailureReason(
      error instanceof Error ? error.message : "Unknown AI analysis error.",
    );
    const fallbackAnalysis = buildDeterministicLeadAnalysis({
      failureReason,
      leadInput,
      parsedLeadSignals,
      researchContext,
    });
    const modelId = getConfiguredModelId();
    const fallbackStatusMessage = `Deterministic fallback returned: ${failureReason}`;
    const storedSubmission = await storeLeadSubmission({
      leadInput,
      analysisStatus: "fallback",
      statusMessage: fallbackStatusMessage,
      modelId,
      analysis: fallbackAnalysis,
    });
    const notificationStatus =
      await sendLeadNotificationEmail(storedSubmission);

    return NextResponse.json(
      {
        ok: true,
        submissionId: storedSubmission.id,
        analysisStatus: "fallback",
        statusMessage: fallbackStatusMessage,
        notificationStatus,
        modelId,
        analysis: fallbackAnalysis,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

function buildAnalyzeLeadPrompt(
  leadInput: LeadInput,
  researchContext: ResearchAdapterResult,
) {
  return `
Analyze this FlytBase inbound lead.

LeadInput:
${JSON.stringify(leadInput, null, 2)}

ResearchAdapterContext:
${JSON.stringify(researchContext, null, 2)}

Final response requirements:
- Return a complete LeadAnalysis object.
- Stage 1 / Qualification: use BANT because contact-form inputs are sparse and BANT separates known operational need from missing budget, authority, and timeline. Mention missing info clearly in qualification and AE handoff.
- Stage 2 / Deep Account Research: synthesize ResearchAdapterContext. Distinguish public-source facts from inferred operating hypotheses. Do not fabricate organizational structure, capex, opex, technology investments, recent news, or investor priorities.
- Stage 3 / Response Generation: make each email respond to Stage 2 research and discover Stage 1 unknowns.
- Stage 4 / Case Study Matching: explain why the matched FlytBase case study is strongest for the lead's industry, use case, and operational context.
- Stage 5 / GTM Routing: recommend Direct AE, Partner-led, or Hybrid with operational reasoning.
- Stage 6 / AE Handoff: produce a concise handoff that an AE can trust, including evidence, missing info, questions, agenda, GTM owner, and risk notes.
- leadSnapshot should summarize the account, persona, use case, urgency, score, and qualification label.
- parsedSignals should preserve extracted email evidence and clearly list missingInfo.
- parsedSignals and qualification should be honest about unknowns. If the contact form does not provide a budget, decision owner, buying process, legal/procurement process, competitor, or deadline, list that gap explicitly and avoid confident-sounding placeholders.
- accountResearch should use ResearchAdapterContext. Preserve source caveats, and do not present inferred adapter output as verified public research.
- accountResearch should not use external facts unless supplied by the email or adapter context. Use inferred or unknown labels where appropriate.
- Convert adapter sources into LeadAnalysis sources using allowed sourceType values: lead-email, company-website, account-research, manual-note, or case-study.
- matchedCaseStudy must come from the FlytBase case-study knowledge base returned by tools.
- gtmRecommendation should be actionable for a BDR or AE and name the FlytBase drone-automation motion: Direct AE, Partner-led, or Hybrid.
- emailSequence must have exactly 3 steps:
  1. step=1, type="first-reply", delayDays=0. Purpose: respond to the inbound lead, acknowledge their drone-automation problem, and ask for a focused discovery call.
  2. step=2, type="case-study-follow-up". Purpose: follow up with the matched FlytBase case-study proof point and connect it to the lead's industry, use case, and pain.
  3. step=3, type="technical-discovery-follow-up". Purpose: ask technical discovery questions about drone docks, inspection/monitoring cadence, airspace/site constraints, integrations, alerts, reporting, and deployment scope.
- Every email step must include a specific subject, purpose, body, callToAction, and personalizationNotes. Keep bodies concise, usable by a BDR, and grounded in the inbound email plus matched case study.
- Email copy must sound like FlytBase selling autonomous drone operations, not generic SaaS. Mention the relevant drone operation directly: inspections, monitoring, security patrols, hazardous detection, wildfire detection, rail/oil/gas infrastructure monitoring, or plantation/site surveillance.
- aeHandoffSummary must include: whyThisLeadMatters, painHypothesis, evidence, missingInfo, topDiscoveryQuestions, suggestedCallAgenda, gtmOwner, riskNotes, summary, and recommendedNextSteps.
- aeHandoffSummary.evidence must quote or paraphrase concrete inbound-email signals and matched case-study proof. Do not use vague claims.
- aeHandoffSummary.topDiscoveryQuestions should prioritize drone deployment and buying-process questions: site scale, dock placement, inspection cadence, sensor needs, alert workflow, integrations, regulatory/airspace constraints, budget, authority, and timeline.
- aeHandoffSummary.gtmOwner should be one of: "BDR", "AE", "Partner", or "AE + Partner", with a short reason if needed.
`;
}

function getCompanyDomain(companyWebsite: string) {
  try {
    return new URL(companyWebsite).hostname.replace(/^www\./, "");
  } catch {
    return companyWebsite;
  }
}

async function getLeadContext(leadInput: LeadInput) {
  const parsedLeadSignals = extractLeadSignals({
    rawEmail: leadInput.rawEmail,
    metadata: {
      senderName: leadInput.senderName,
      senderEmail: leadInput.senderEmail,
      companyWebsite: leadInput.companyWebsite,
      region: leadInput.region,
    },
  });
  const researchInput = {
    companyDomain: getCompanyDomain(leadInput.companyWebsite),
    companyName: parsedLeadSignals.companyName,
    companyWebsite: leadInput.companyWebsite,
    industry: parsedLeadSignals.industry,
    keywords: parsedLeadSignals.keywords,
    rawEmail: leadInput.rawEmail,
    region:
      parsedLeadSignals.region === "Unknown" ? leadInput.region : parsedLeadSignals.region,
    useCase: parsedLeadSignals.useCase,
  };

  try {
    const researchAdapter = getResearchAdapter(getResearchAdapterName());

    return {
      parsedLeadSignals,
      researchContext: await researchAdapter.research(researchInput),
    };
  } catch {
    const demoResearchAdapter = getResearchAdapter("demo");
    const researchContext = await demoResearchAdapter.research(researchInput);

    return {
      parsedLeadSignals,
      researchContext: {
        ...researchContext,
        warnings: [
          ...researchContext.warnings,
          "Configured research adapter failed; inferred account context was used.",
        ],
      },
    };
  }
}

function getResearchAdapterName(): ResearchAdapterName {
  const configuredAdapter = process.env.RESEARCH_ADAPTER;

  return configuredAdapter === "demo" ? "demo" : "web";
}

function getConfiguredModelId() {
  const configuredModelId = process.env.AI_MODEL_ID?.trim();

  return configuredModelId || DEFAULT_AI_MODEL_ID;
}

function sanitizeFailureReason(reason: string) {
  return reason.replace(/\s+/g, " ").trim().slice(0, 240);
}

function createErrorResponse(
  error: string,
  status: number,
  details?: readonly string[],
) {
  return NextResponse.json(
    {
      ok: false,
      error,
      ...(details ? { details } : {}),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status,
    },
  );
}

function formatZodIssues(issues: readonly ZodIssue[]) {
  return issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "root";

    return `${path}: ${issue.message}`;
  });
}
