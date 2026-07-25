import { createAuth } from "@flyt-breif/auth";
import { User } from "@flyt-breif/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bootstrapSchema = z.strictObject({
  email: z.email(),
  name: z.string().trim().min(1),
  password: z.string().min(8).max(128),
});

export async function GET() {
  const userCount = await User.countDocuments();

  return NextResponse.json(
    {
      ok: true,
      bootstrapRequired: userCount === 0,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const userCount = await User.countDocuments();

  if (userCount > 0) {
    return createBootstrapError("Admin account already exists.", 409);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return createBootstrapError("Request body must be valid JSON.", 400);
  }

  const parsed = bootstrapSchema.safeParse(body);

  if (!parsed.success) {
    return createBootstrapError("Admin account details are invalid.", 400);
  }

  const bootstrapAuth = createAuth({ allowEmailSignUp: true });
  const authResponse = await bootstrapAuth.handler(
    new Request(new URL("/api/auth/sign-up/email", request.url), {
      body: JSON.stringify({
        email: parsed.data.email,
        name: parsed.data.name,
        password: parsed.data.password,
        rememberMe: true,
      }),
      headers: new Headers({
        "Content-Type": "application/json",
        Origin: new URL(request.url).origin,
      }),
      method: "POST",
    }),
  );
  const payload: unknown = await authResponse.json().catch(() => null);

  if (!authResponse.ok) {
    return createBootstrapError(getAuthError(payload), authResponse.status);
  }

  return NextResponse.json(
    {
      ok: true,
      user: isRecord(payload) ? payload.user : undefined,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        ...(authResponse.headers.get("set-cookie")
          ? { "Set-Cookie": authResponse.headers.get("set-cookie") ?? "" }
          : {}),
      },
    },
  );
}

function createBootstrapError(error: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      error,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status,
    },
  );
}

function getAuthError(value: unknown) {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : "Could not create the first admin account.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
