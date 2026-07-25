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

## Scripts

- `pnpm run dev` - start all dev tasks through Turborepo
- `pnpm run dev:web` - start only the Next.js web app
- `pnpm run build` - build the workspace
- `pnpm run check-types` - run TypeScript checks

## Frontend Notes

The dashboard intentionally starts as the first screen. It is not a marketing site or landing page.

The shell is built for repeated internal BDR use: compact navigation, structured lead intake, fast scanning, and a reserved analysis area for future scoring, persona fit, pain points, and suggested outreach.
