import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { Button } from "@flyt-breif/ui/components/button";
import {
  Bell,
  Database,
  FileText,
  Gauge,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";

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
              Intake inbound requests, generate account research, qualify the lead,
              match FlytBase proof, and hand the AE a clean action brief.
            </p>
          </div>
          <div className="hidden flex-wrap items-center justify-end gap-2 md:flex">
            <div className="inline-flex items-center gap-2 border bg-background px-3 py-2 text-xs font-medium shadow-[0_8px_24px_rgba(12,35,29,0.05)]">
              <FileText className="size-3.5 text-muted-foreground" />
              Lead report workflow
            </div>
            <div className="inline-flex items-center gap-2 border bg-background px-3 py-2 text-xs font-medium shadow-[0_8px_24px_rgba(12,35,29,0.05)]">
              <Database className="size-3.5 text-muted-foreground" />
              flytbreif workspace
            </div>
          </div>
        </header>

        <DashboardWorkspace />
      </div>
    </main>
  );
}
