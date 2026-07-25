import { auth } from "@flyt-breif/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const { DELETE, GET, PATCH, POST, PUT } = toNextJsHandler(auth.handler);
