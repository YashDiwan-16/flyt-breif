import { isAdminRequestAuthenticated } from "@/lib/server/admin-auth";
import { listLeadSubmissions } from "@/lib/server/lead-submissions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin login is required.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 401,
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      leads: listLeadSubmissions(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
