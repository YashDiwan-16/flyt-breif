import { generateText } from "ai";
import { NextResponse } from "next/server";

import { getGoogleLanguageModel } from "@/lib/ai/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEALTH_PROMPT =
  "Return exactly this plain text and nothing else: FlytBDR AI health check ok";

export async function GET() {
  try {
    const { model, modelId } = getGoogleLanguageModel();
    const { text } = await generateText({
      maxOutputTokens: 32,
      model,
      prompt: HEALTH_PROMPT,
      temperature: 0,
    });
    const response = text.trim();

    if (!response) {
      throw new Error("AI health check returned an empty response.");
    }

    return NextResponse.json(
      {
        ok: true,
        modelId,
        response,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AI health check error.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 500,
      },
    );
  }
}
