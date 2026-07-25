import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { dashboardStats } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import {
  Bell,
  Gauge,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const demoRunway = [
  { label: "Lead", value: "Solar operator" },
  { label: "Proof", value: "EnBW PV scale" },
  { label: "BANT", value: "Strong score" },
  { label: "Motion", value: "Direct AE / Hybrid" },
  { label: "Output", value: "AE-ready handoff" },
] as const;

export function DashboardShell() {
  return (
    <main className="flex min-h-svh bg-background text-foreground lg:h-svh lg:min-h-[760px]">
      <nav className="hidden w-[72px] shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar py-3 text-sidebar-foreground lg:flex">
        <div className="mb-6 flex size-10 items-center justify-center border border-sidebar-border bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          FB
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Button variant="secondary" size="icon-sm" aria-label="Dashboard">
            <Gauge />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Search leads">
            <Search />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notifications">
            <Bell />
          </Button>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Settings">
          <Settings />
        </Button>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[84px] shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 shadow-[0_1px_0_rgba(11,37,31,0.04)] md:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 border border-emerald-600/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-normal text-emerald-800">
                <ShieldCheck className="size-3" />
                Internal cockpit
              </span>
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <RadioTower className="size-3.5" />
                Inbound BDR challenge
              </span>
            </div>
            <h1 className="mt-1 truncate text-lg font-semibold md:text-2xl">
              FlytBDR Copilot
            </h1>
            <p className="mt-1 max-w-2xl truncate text-xs text-muted-foreground">
              Turn raw inbound interest into proof-backed qualification, GTM motion,
              outreach, and AE handoff.
            </p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="min-w-24 border bg-background px-3 py-2 shadow-[0_8px_24px_rgba(12,35,29,0.05)]">
                <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-sm font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="shrink-0 border-b bg-[#172b24] px-4 py-2 text-[#f4fbf4] md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 pr-2 text-[10px] font-medium uppercase tracking-normal text-emerald-100/80">
              <Sparkles className="size-3.5 text-emerald-300" />
              Primary demo path
            </div>
            {demoRunway.map((step, index) => (
              <div key={step.label} className="flex min-w-0 items-center gap-2">
                {index > 0 ? (
                  <span className="hidden h-px w-4 bg-emerald-200/35 sm:block" />
                ) : null}
                <div className="flex min-w-0 items-center gap-2 border border-white/15 bg-white/10 px-2 py-1">
                  <span className="text-[10px] uppercase tracking-normal text-emerald-100/70">
                    {step.label}
                  </span>
                  <span className="truncate text-xs font-semibold">{step.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DashboardWorkspace />
      </div>
    </main>
  );
}
