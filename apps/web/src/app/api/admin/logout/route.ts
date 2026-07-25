import { clearAdminSessionCookie } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function POST() {
  return NextResponse.json(
    {
      ok: true,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": clearAdminSessionCookie(),
      },
    },
  );
}
