import { qualificationSignals } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@flyt-breif/ui/components/card";
import { BarChart3, ClipboardList, Sparkles } from "lucide-react";

export function AnalysisPanel() {
  return (
    <section className="flex min-h-0 flex-1 flex-col border-l bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div>
          <h2 className="text-sm font-semibold">Analysis Results</h2>
          <p className="text-xs text-muted-foreground">Awaiting lead intake</p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Sparkles />
          Generate
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 overflow-auto p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {qualificationSignals.map((signal) => (
            <Card key={signal.id} size="sm">
              <CardHeader>
                <CardTitle>{signal.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{signal.placeholder}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid min-h-[420px] gap-4 xl:grid-cols-[1fr_320px]">
          <div className="flex min-h-0 flex-col border bg-card">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <ClipboardList className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Copilot Brief</h3>
            </div>
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div className="max-w-sm">
                <div className="mx-auto mb-4 flex size-10 items-center justify-center border bg-muted">
                  <Sparkles className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Analysis will appear here</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Future versions will summarize fit, urgency, buying signals, pain points, and a
                  recommended first-touch angle for the inbound BDR.
                </p>
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col border bg-card">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <BarChart3 className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Signal Timeline</h3>
            </div>
            <div className="space-y-3 p-4">
              {["Company context", "Persona fit", "Trigger event", "Outreach angle"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="size-2 shrink-0 border bg-muted" />
                    <div className="h-7 flex-1 border bg-muted/40" />
                    <span className="w-28 text-xs text-muted-foreground">{item}</span>
                  </div>
                ),
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
