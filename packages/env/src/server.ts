import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
const localDefaults = isProduction
  ? {}
  : {
      BETTER_AUTH_SECRET: "flytbase-local-development-auth-secret",
      BETTER_AUTH_URL: "http://localhost:3001",
      CORS_ORIGIN: "http://localhost:3001",
      DATABASE_URL: "mongodb://127.0.0.1:27017/flytbase",
    };

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: {
    ...localDefaults,
    ...process.env,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
