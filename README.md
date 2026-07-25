# FlytBDR Copilot

Public contact intake and internal sales intelligence cockpit for the FlytBase Inbound BDR challenge.

This repository is set up as a TypeScript monorepo. The product surface is split into a public contact form and an admin-only dashboard for BDR/AE workflows, with shared domain types, case-study retrieval context, and server-side AI routes.

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

- Public `/contact-us` form with a submitter thank-you state
- Admin `/admin` login gate and sales cockpit
- Admin queue for submitted contact leads and full sales intelligence output
- Shared lead and analysis schemas in `packages/core`
- FlytBase case-study retrieval context in `packages/data`
- Server-side AI analysis routes in `apps/web`
- Server-side public website research from the submitted company URL, with an adapter path for deeper web-search providers later
- Prototype admin login is client-side only; submitted analyses are stored in an in-memory server queue during the local session

## Getting Started

```bash
pnpm install
pnpm run dev:web
```

Open [http://localhost:3001/contact-us](http://localhost:3001/contact-us) for the public form or [http://localhost:3001/admin](http://localhost:3001/admin) for the admin cockpit.

## AI Configuration

Copy `apps/web/.env.example` to `apps/web/.env.local` and set either `GOOGLE_GENERATIVE_AI_API_KEY` or `GOOGLE_API_KEY`. The web app defaults `AI_MODEL_ID` to `gemini-2.5-flash`.

AI calls are kept server-side. The initial health check lives at `GET /api/health-ai` and uses the Vercel AI SDK Google provider from a Next.js route handler. Lead analysis never calls Gemini from the browser.

For workflow safety, `POST /api/analyze-lead` returns a deterministic, schema-validated fallback analysis if Gemini is unavailable, misconfigured, or returns invalid structured output. The UI marks that run as `Fallback` and keeps the same copy/export workflow available.

Lead analysis uses research adapters from `packages/ai`. The default `RESEARCH_ADAPTER=web` fetches public website context from the submitted company URL on the server, then labels broader account facts as unknown or inferred when no search provider is connected. Set `RESEARCH_ADAPTER=demo` only when you want inference-only research. The web adapter is ready for Tavily, Exa, Serper, Firecrawl, or Google Custom Search integration later.

Local admin login defaults to `admin@flytbase.com` / `flytbdr-admin`. Override `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_TOKEN` before sharing the app outside a local demo.

## Lead Email Notifications

New contact form submissions can send a server-side Nodemailer alert after the lead is analyzed and stored. Set these in `apps/web/.env.local`:

```bash
LEAD_NOTIFICATION_TO=you@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM="FlytBDR Copilot <no-reply@example.com>"
```

If SMTP is not configured, submissions still work and the notification status is marked as skipped. If SMTP fails, the public user still sees the thank-you state and the admin queue still receives the lead.

## Workflow Script

1. Start the app with `pnpm run dev:web` and open [http://localhost:3001](http://localhost:3001).
2. Open `/contact-us` and fill the public contact form with the raw request, sender name, sender email, company website, and region.
3. Click `Submit request`. The public user only sees a thank-you confirmation.
4. Open `/admin`, sign in through the admin gate, and select the submitted lead from the admin queue.
5. Review the internal dashboard: lead snapshot, sales framework qualification, public account research, FlytBase case-study match, GTM motion, adaptive response sequence, AE handoff, report generation, and analysis signals.
6. Use `Copy AE Summary`, `Copy Email Sequence`, and `Export Markdown` to close the sales workflow.
7. If a validation or network error appears, use `Retry`. Gemini/provider failures should normally return a fallback analysis instead of an error state.

## Wireframe Prompt

```text
Create a high-fidelity wireframe for FlytBDR Copilot, a FlytBase hackathon product with two separate experiences.

Experience 1: Public contact form at /contact-us. This is for prospects only. It should not look like an admin dashboard or marketing landing page. Show a focused contact form with fields for raw request/use case, sender name, sender email, company website, and region. After submit, show only a thank-you confirmation saying the FlytBase team will review and follow up. Do not reveal AI analysis to the public user.

Experience 2: Admin cockpit at /admin. Admins log in first. After login, show an enterprise BDR/AE dashboard with a left-side queue of contact form submissions and a right-side lead intelligence report. For the selected lead, show: sales framework qualification using BANT or MEDDPICC, deep public account research using real public data, adaptive response sequence based on that research, most relevant FlytBase case study from https://flytbase.com/, recommended GTM motion such as Direct AE or Partner-led, and clean AE handoff summary.

Design direction: premium internal sales cockpit, dense but readable, enterprise-grade, no landing page, no fake sample buttons, no dummy data. Use clear sections, confidence badges, evidence chips, score cards, source/warning indicators, and report export actions. The public form should feel simple and trustworthy; the admin dashboard should feel powerful, operational, and AE-ready.
```

## Data Model

MongoDB data is scoped to the `flytbreif` database. Shared collection names live in `packages/core/src/database.ts`, AI analysis responses should validate against `leadAnalysisSchema` before persistence, and case-study retrieval context lives in `packages/data`.

## Scripts

- `pnpm run dev` - start all dev tasks through Turborepo
- `pnpm run dev:web` - start only the Next.js web app
- `pnpm run build` - build the workspace
- `pnpm run check-types` - run TypeScript checks

## Frontend Notes

The public contact form and admin dashboard are separate routes. Neither route is a marketing landing page.

The admin shell is built for repeated internal BDR use: compact navigation, submitted lead queue, fast scanning, public-account context, qualification, proof matching, suggested outreach, AE handoff, and report export.
