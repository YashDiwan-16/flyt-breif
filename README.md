# FlytBDR Copilot

Internal sales intelligence dashboard for the FlytBase Inbound BDR challenge.

This repository is set up as a TypeScript monorepo. The product surface starts as a Next.js dashboard shell for internal BDR workflows, with shared domain types, case-study retrieval context, and server-side AI routes.

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

- Form-first lead intake workflow with a submitter thank-you state
- Internal dashboard view after submission with full sales intelligence output
- Shared lead and analysis schemas in `packages/core`
- FlytBase case-study retrieval context in `packages/data`
- Server-side AI analysis routes in `apps/web`
- Server-side public website research from the submitted company URL, with an adapter path for deeper web-search providers later
- No auth flow or persistence yet

## Getting Started

```bash
pnpm install
pnpm run dev:web
```

Open [http://localhost:3001](http://localhost:3001).

## AI Configuration

Copy `apps/web/.env.example` to `apps/web/.env.local` and set either `GOOGLE_GENERATIVE_AI_API_KEY` or `GOOGLE_API_KEY`. The web app defaults `AI_MODEL_ID` to `gemini-2.5-flash`.

AI calls are kept server-side. The initial health check lives at `GET /api/health-ai` and uses the Vercel AI SDK Google provider from a Next.js route handler. Lead analysis never calls Gemini from the browser.

For workflow safety, `POST /api/analyze-lead` returns a deterministic, schema-validated fallback analysis if Gemini is unavailable, misconfigured, or returns invalid structured output. The UI marks that run as `Fallback` and keeps the same copy/export workflow available.

Lead analysis uses research adapters from `packages/ai`. The default `RESEARCH_ADAPTER=web` fetches public website context from the submitted company URL on the server, then labels broader account facts as unknown or inferred when no search provider is connected. Set `RESEARCH_ADAPTER=demo` only when you want inference-only research. The web adapter is ready for Tavily, Exa, Serper, Firecrawl, or Google Custom Search integration later.

## Workflow Script

1. Start the app with `pnpm run dev:web` and open [http://localhost:3001](http://localhost:3001).
2. Fill the inbound lead form with the raw email, sender name, sender email, company website, and region.
3. Click `Submit Lead`. The intake panel becomes a thank-you state for the submitter.
4. Review the internal dashboard: lead snapshot, sales framework qualification, public account research, FlytBase case-study match, GTM motion, adaptive response sequence, AE handoff, report generation, and analysis signals.
5. Use `Copy AE Summary`, `Copy Email Sequence`, and `Export Markdown` to close the sales workflow.
6. If a validation or network error appears, use `Retry`. Gemini/provider failures should normally return a fallback analysis instead of an error state.

## Data Model

MongoDB data is scoped to the `flytbreif` database. Shared collection names live in `packages/core/src/database.ts`, AI analysis responses should validate against `leadAnalysisSchema` before persistence, and case-study retrieval context lives in `packages/data`.

## Scripts

- `pnpm run dev` - start all dev tasks through Turborepo
- `pnpm run dev:web` - start only the Next.js web app
- `pnpm run build` - build the workspace
- `pnpm run check-types` - run TypeScript checks

## Frontend Notes

The dashboard intentionally starts as the first screen. It is not a marketing site or landing page.

The shell is built for repeated internal BDR use: compact navigation, structured lead intake, fast scanning, public-account context, qualification, proof matching, suggested outreach, AE handoff, and report export.
