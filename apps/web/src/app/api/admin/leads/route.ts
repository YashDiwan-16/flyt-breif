import { auth } from "@flyt-breif/auth";
import { NextResponse } from "next/server";

import { listLeadSubmissions } from "@/lib/server/lead-submissions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
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
      leads: await listLeadSubmissions(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
