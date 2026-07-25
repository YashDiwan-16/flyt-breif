import "server-only";
import "@flyt-breif/env/server";

import { createGoogle } from "@ai-sdk/google";
import { z } from "zod";

export const DEFAULT_AI_MODEL_ID = "gemini-2.5-flash";

const optionalEnvString = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  },
  z.string().trim().min(1).optional(),
);

const modelIdEnvString = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  },
  z.string().trim().min(1).default(DEFAULT_AI_MODEL_ID),
);

const aiEnvSchema = z
  .object({
    GOOGLE_GENERATIVE_AI_API_KEY: optionalEnvString,
    GOOGLE_API_KEY: optionalEnvString,
    AI_MODEL_ID: modelIdEnvString,
  })
  .refine(
    (env) => env.GOOGLE_GENERATIVE_AI_API_KEY ?? env.GOOGLE_API_KEY,
    {
      message: "Set GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY.",
      path: ["GOOGLE_GENERATIVE_AI_API_KEY"],
    },
  );

export type AiRuntimeConfig = {
  apiKey: string;
  modelId: string;
};

export function getAiRuntimeConfig(): AiRuntimeConfig {
  const parsed = aiEnvSchema.safeParse({
    GOOGLE_GENERATIVE_AI_API_KEY:
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    AI_MODEL_ID: process.env.AI_MODEL_ID,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(" ");

    throw new Error(`AI configuration is invalid. ${message}`);
  }

  const apiKey =
    parsed.data.GOOGLE_GENERATIVE_AI_API_KEY ?? parsed.data.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "AI configuration is invalid. Set GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY.",
    );
  }

  return {
    apiKey,
    modelId: parsed.data.AI_MODEL_ID,
  };
}

export function getGoogleLanguageModel() {
  const config = getAiRuntimeConfig();
  const google = createGoogle({ apiKey: config.apiKey });

  return {
    model: google(config.modelId),
    modelId: config.modelId,
  };
}
