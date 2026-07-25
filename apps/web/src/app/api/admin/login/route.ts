import {
  createAdminSessionCookie,
  isAdminLoginValid,
} from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return createLoginError("Request body must be valid JSON.", 400);
  }

  if (!isLoginBody(body)) {
    return createLoginError("Admin email and password are required.", 400);
  }

  if (!isAdminLoginValid(body)) {
    return createLoginError("Invalid admin credentials.", 401);
  }

  return NextResponse.json(
    {
      ok: true,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": createAdminSessionCookie(),
      },
    },
  );
}

function createLoginError(error: string, status: number) {
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

function isLoginBody(
  value: unknown,
): value is { email: string; password: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    "password" in value &&
    typeof value.email === "string" &&
    typeof value.password === "string"
  );
}
