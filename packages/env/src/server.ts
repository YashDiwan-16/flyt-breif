import { createEnv } from "@t3-oss/env-core";
import { config as loadDotenv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

loadServerEnvFiles();

const isProduction = process.env.NODE_ENV === "production";
const localDefaults = isProduction
  ? {}
  : {
      BETTER_AUTH_SECRET: "flytbase-local-development-auth-secret",
      BETTER_AUTH_URL: "http://localhost:3001",
      CORS_ORIGIN: "http://localhost:3001",
      DATABASE_NAME: "flytbase",
      DATABASE_URL: "mongodb://127.0.0.1:27017/flytbase",
    };

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    DATABASE_NAME: z.string().trim().min(1).default("flytbase"),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: {
    ...localDefaults,
    ...process.env,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

function loadServerEnvFiles() {
  const cwd = process.cwd();
  const candidateFiles = [
    resolve(cwd, "../../.env.local"),
    resolve(cwd, "../../.env"),
    resolve(cwd, "../server/.env.local"),
    resolve(cwd, "../server/.env"),
    resolve(cwd, "apps/server/.env.local"),
    resolve(cwd, "apps/server/.env"),
    resolve(cwd, ".env.local"),
    resolve(cwd, ".env"),
    resolve(cwd, "apps/web/.env.local"),
    resolve(cwd, "apps/web/.env"),
  ];

  for (const file of collectUnique(candidateFiles)) {
    if (existsSync(file)) {
      loadDotenv({ path: file, override: false, quiet: true });
    }
  }
}

function collectUnique(items: readonly string[]) {
  return [...new Set(items)];
}
