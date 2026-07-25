import {
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

import { getGoogleLanguageModel } from "@/lib/ai/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const ANALYZE_LEAD_SYSTEM_PROMPT = `
You are FlytBDR Copilot, an internal sales intelligence analyst for FlytBase inbound BDR work.

Return an AE-ready LeadAnalysis object only. Use the schema exactly.

Rules:
- Do not invent public facts.
- If real company research is unavailable, label the field as inferred or unknown.
- Use evidence from the inbound email as the primary source.
- Show missing information clearly in qualification, accountResearch.researchGaps, aeHandoffSummary.openQuestions, and warnings.
- Match case studies using the provided FlytBase knowledge base only.
- Prefer concrete operational insight over generic sales language.
- Keep every array populated with useful, concise items.
- Use lowercase BANT keys in the final qualification object: budget, authority, need, timeline.
- For each BANT item, include score, evidence, missingInfo, and one discoveryQuestion.
- For sources, use only sourceType values allowed by the schema.
- Since you cannot browse, do not claim headquarters, company size, funding, customer names, or market facts unless they appear in the inbound email. Mark them as "Unknown - not provided in inbound email" or "Inferred: ..." when needed.
- If adapter-provided research context is present, treat it as inferred context unless the source explicitly says otherwise.
- If a case study returned by tools does not include a region, set matchedCaseStudy.region to "Not provided in knowledge base" and include that caveat in warnings.

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

  try {
    const leadInput = leadInputResult.data;
    const researchAdapter = getResearchAdapter(getResearchAdapterName());
    const parsedLeadSignals = extractLeadSignals({
      rawEmail: leadInput.rawEmail,
      metadata: {
        senderName: leadInput.senderName,
        senderEmail: leadInput.senderEmail,
        companyWebsite: leadInput.companyWebsite,
        region: leadInput.region,
      },
    });
    const researchContext = await researchAdapter.research({
      companyDomain: getCompanyDomain(leadInput.companyWebsite),
      companyName: parsedLeadSignals.companyName,
      companyWebsite: leadInput.companyWebsite,
      industry: parsedLeadSignals.industry,
      keywords: parsedLeadSignals.keywords,
      rawEmail: leadInput.rawEmail,
      region: parsedLeadSignals.region,
      useCase: parsedLeadSignals.useCase,
    });
    const { model, modelId } = getGoogleLanguageModel();
    const result = await generateText({
      maxOutputTokens: 6000,
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
      return createErrorResponse(
        "AI response did not match the LeadAnalysis schema.",
        502,
        formatZodIssues(analysisResult.error.issues),
      );
    }

    return NextResponse.json(
      {
        ok: true,
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
    const message =
      error instanceof Error ? error.message : "Unknown AI analysis error.";

    return createErrorResponse(message, 500);
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
- leadSnapshot should summarize the account, persona, use case, urgency, score, and qualification label.
- parsedSignals should preserve extracted email evidence and clearly list missingInfo.
- accountResearch should use ResearchAdapterContext as inferred account context. Do not present demo adapter output as verified public research.
- accountResearch should not use external facts unless supplied by the email or adapter context. Use inferred or unknown labels where appropriate.
- Convert adapter sources into LeadAnalysis sources using allowed sourceType values: lead-email, company-website, account-research, manual-note, or case-study.
- matchedCaseStudy must come from the FlytBase case-study knowledge base returned by tools.
- gtmRecommendation should be actionable for a BDR or AE.
- emailSequence should include practical outbound copy grounded in the inbound email and matched case study.
- aeHandoffSummary should be useful for an AE preparing for discovery.
`;
}

function getCompanyDomain(companyWebsite: string) {
  try {
    return new URL(companyWebsite).hostname.replace(/^www\./, "");
  } catch {
    return companyWebsite;
  }
}

function getResearchAdapterName(): ResearchAdapterName {
  const configuredAdapter = process.env.RESEARCH_ADAPTER;

  return configuredAdapter === "web" ? "web" : "demo";
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
