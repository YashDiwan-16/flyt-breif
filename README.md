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

- Dashboard layout for an internal sales tool
- Left-side inbound lead input panel
- Right-side analysis result placeholder
- Shared lead and analysis schemas in `packages/core`
- FlytBase case-study retrieval context in `packages/data`
- Server-side AI analysis routes in `apps/web`
- No auth flow, persistence, or production web research yet

## Getting Started

```bash
pnpm install
pnpm run dev:web
```

Open [http://localhost:3001](http://localhost:3001).

## AI Configuration

Copy `apps/web/.env.example` to `apps/web/.env.local` and set either `GOOGLE_GENERATIVE_AI_API_KEY` or `GOOGLE_API_KEY`. The web app defaults `AI_MODEL_ID` to `gemini-2.5-flash`.

AI calls are kept server-side. The initial health check lives at `GET /api/health-ai` and uses the Vercel AI SDK Google provider from a Next.js route handler. Lead analysis never calls Gemini from the browser.

For demo safety, `POST /api/analyze-lead` returns a deterministic, schema-validated fallback analysis if Gemini is unavailable, misconfigured, or returns invalid structured output. The UI marks that run as `Fallback` and keeps the same copy/export workflow available.

Lead analysis uses research adapters from `packages/ai`. `RESEARCH_ADAPTER=demo` is the default and infers account context from the inbound email, company domain, industry, region, and use case without making web requests. `webResearchAdapter` is a placeholder for future Tavily, Exa, Serper, Firecrawl, or Google Custom Search integration.

## Demo Script

Best path for the hackathon demo:

1. Start the app with `pnpm run dev:web` and open [http://localhost:3001](http://localhost:3001).
2. Click the `Solar operator` sample. It populates a HelioGrid Solar inbound lead with PV scale, budget, timeline, and autonomous drone dock signals.
3. Click `Analyze Lead`.
4. In the right panel, call out the model/status indicator. `Gemini` means the AI produced validated structured output; `Fallback` means the deterministic safety net kept the demo running.
5. Show the lead snapshot and BANT cards. The expected demo path is a strong solar PV qualification score.
6. Show the EnBW case-study match for solar PV inspections scaling from 150 MW toward 1 GW with autonomous drone docks.
7. Show the GTM recommendation. The expected motion is `Direct AE` or `Hybrid`, depending on the generated qualification details.
8. Show the AE handoff summary, especially why the lead matters, pain hypothesis, evidence, missing info, discovery questions, suggested agenda, and GTM owner.
9. Use `Copy AE Summary`, `Copy Email Sequence`, and `Export Markdown` to close the sales workflow.
10. If a validation or network error appears, use `Retry`. Gemini/provider failures should normally return a fallback analysis instead of an error state.

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
