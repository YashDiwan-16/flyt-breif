import { AnalysisPanel } from "@/components/analysis-panel";
import { LeadInputPanel } from "@/components/lead-input-panel";
import { dashboardStats } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Bell, Gauge, Search, Settings } from "lucide-react";

export function DashboardShell() {
  return (
    <main className="flex h-svh min-h-[720px] bg-muted/30 text-foreground">
      <nav className="hidden w-16 shrink-0 flex-col items-center border-r bg-card py-3 lg:flex">
        <div className="mb-6 flex size-9 items-center justify-center border bg-primary text-xs font-bold text-primary-foreground">
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
                Internal
              </span>
              <span className="text-xs text-muted-foreground">Inbound BDR Challenge</span>
            </div>
            <h1 className="truncate text-base font-semibold md:text-lg">FlytBDR Copilot</h1>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="border bg-background px-3 py-1.5">
                <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-sm font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[390px_1fr]">
          <LeadInputPanel />
          <AnalysisPanel />
        </div>
      </div>
    </main>
  );
}
