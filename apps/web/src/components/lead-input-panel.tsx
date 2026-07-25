import { leadInputFields } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { Textarea } from "@flyt-breif/ui/components/textarea";
import { ArrowRight, RotateCcw } from "lucide-react";

export function LeadInputPanel() {
  return (
    <section className="flex min-h-0 flex-col bg-card">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div>
          <h2 className="text-sm font-semibold">Inbound Lead</h2>
          <p className="text-xs text-muted-foreground">Paste or structure lead details</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Reset lead form">
          <RotateCcw />
        </Button>
      </div>

      <form className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5">
          {leadInputFields.map((field) => {
            const helper = "helper" in field ? field.helper : undefined;

            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.kind === "textarea" ? (
                  <Textarea id={field.id} name={field.id} placeholder={field.placeholder} rows={6} />
                ) : field.kind === "select" ? (
                  <select
                    id={field.id}
                    name={field.id}
                    defaultValue=""
                    className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.kind}
                    placeholder={field.placeholder}
                  />
                )}
                {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
              </div>
            );
          })}
        </div>

        <div className="shrink-0 border-t p-5">
          <Button type="button" className="w-full" disabled>
            Analyze Lead
            <ArrowRight />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Backend scoring and enrichment will be connected after the shell is approved.
          </p>
        </div>
      </form>
    </section>
  );
}
