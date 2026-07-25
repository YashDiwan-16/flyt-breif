# FlytBDR Copilot

Internal sales intelligence dashboard for the FlytBase Inbound BDR challenge.

This repository is set up as a TypeScript monorepo. The initial product surface is a Next.js dashboard shell with no backend logic wired in yet.

## Apps and Packages

```text
flyt-breif/
├── apps/
│   ├── web/          # Next.js frontend for FlytBDR Copilot
│   └── server/       # Existing backend scaffold, not used by the shell yet
├── packages/
│   ├── core/         # Shared FlytBDR domain types and constants
│   ├── ai/           # AI SDK tools for lead extraction, matching, scoring, and GTM motion
│   ├── data/         # Case-study retrieval context and matching helpers
│   ├── ui/           # Shared UI primitives and Tailwind theme
│   ├── api/          # Existing API scaffold
│   ├── auth/         # Existing auth scaffold
│   ├── db/           # Existing database scaffold
│   └── env/          # Existing environment validation helpers
```

## Current Scope

- Dashboard layout for an internal sales tool
- Left-side inbound lead input panel
- Right-side analysis result placeholder
- Shared lead and analysis metadata in `packages/core`
- No backend calls, auth flow, persistence, or scoring logic yet

## Getting Started

```bash
pnpm install
pnpm run dev:web
```

Open [http://localhost:3001](http://localhost:3001).

## AI Configuration

Copy `apps/web/.env.example` to `apps/web/.env.local` and set either `GOOGLE_GENERATIVE_AI_API_KEY` or `GOOGLE_API_KEY`. The web app defaults `AI_MODEL_ID` to `gemini-2.5-flash`.

AI calls are kept server-side. The initial health check lives at `GET /api/health-ai` and uses the Vercel AI SDK Google provider from a Next.js route handler.

## Data Model

MongoDB data is scoped to the `flytbreif` database. Shared collection names live in `packages/core/src/database.ts`, AI analysis responses should validate against `leadAnalysisSchema` before persistence, and case-study retrieval context lives in `packages/data`.

## Scripts

- `pnpm run dev` - start all dev tasks through Turborepo
- `pnpm run dev:web` - start only the Next.js web app
- `pnpm run build` - build the workspace
- `pnpm run check-types` - run TypeScript checks

## Frontend Notes

The dashboard intentionally starts as the first screen. It is not a marketing site or landing page.

The shell is built for repeated internal BDR use: compact navigation, structured lead intake, fast scanning, and a reserved analysis area for future scoring, persona fit, pain points, and suggested outreach.
