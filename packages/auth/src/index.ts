import { flytbaseCollections } from "@flyt-breif/core";
import { client } from "@flyt-breif/db";
import { env } from "@flyt-breif/env/server";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

export function createAuth({
  allowEmailSignUp = false,
}: {
  allowEmailSignUp?: boolean;
} = {}) {
  const isProduction = env.NODE_ENV === "production";

  return betterAuth({
    database: mongodbAdapter(client),
    trustedOrigins: Array.from(
      new Set([env.CORS_ORIGIN, env.BETTER_AUTH_URL].filter(Boolean)),
    ),
    emailAndPassword: {
      disableSignUp: !allowEmailSignUp,
      enabled: true,
    },
    user: {
      modelName: flytbaseCollections.users,
    },
    session: {
      modelName: flytbaseCollections.sessions,
    },
    account: {
      modelName: flytbaseCollections.accounts,
    },
    verification: {
      modelName: flytbaseCollections.verifications,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    plugins: [nextCookies()],
    advanced: {
      defaultCookieAttributes: {
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        httpOnly: true,
      },
    },
  });
}

export const auth = createAuth();
