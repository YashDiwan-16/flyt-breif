"use client";

import { leadInputFields, type LeadAnalysis, type LeadInput } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { Textarea } from "@flyt-breif/ui/components/textarea";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  FileText,
  LoaderCircle,
  RotateCcw,
  SunMedium,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type LeadInputPanelProps = {
  isAnalyzing: boolean;
  onAnalyzeError: (error: string, details?: readonly string[]) => void;
  onAnalyzeStart: () => void;
  onAnalyzeSuccess: (
    analysis: LeadAnalysis,
    modelId: string,
    analysisStatus: AnalysisGenerationStatus,
    statusMessage?: string,
  ) => void;
  onSampleLoaded: () => void;
  retryRequestId: number;
};

type AnalysisGenerationStatus = "ai" | "fallback";

type AnalyzeLeadSuccessResponse = {
  ok: true;
  analysisStatus?: AnalysisGenerationStatus;
  statusMessage?: string;
  modelId: string;
  analysis: LeadAnalysis;
};

type ApiFailure = {
  message: string;
  details?: readonly string[];
};

const emptyLeadInput: LeadInput = {
  rawEmail: "",
  senderName: "",
  senderEmail: "",
  companyWebsite: "",
  region: "",
};

const sampleLeads = [
  {
    label: "Solar operator",
    leadInput: {
      rawEmail:
        "Hi FlytBase team, I lead operations for HelioGrid Solar. We manage a utility-scale PV portfolio that is expanding from roughly 150 MW toward 1 GW, and we have budget approved for an autonomous inspection pilot this quarter. We need repeatable thermal and visual inspections without sending crews across every field each week. We are evaluating autonomous drone docks and want to understand pilot scope, deployment requirements, and a path to scale if the first sites work.",
      senderName: "Maya Reddy",
      senderEmail: "maya.reddy@heliogrid.example",
      companyWebsite: "https://heliogrid.example",
      region: "Europe",
    },
  },
  {
    label: "Mining company",
    leadInput: {
      rawEmail:
        "Hello, I manage site technology for Andes Quarry Group. Our mine inspection zones are large and some areas are difficult to access safely during shifts. We are looking for autonomous inspection coverage, alerts, and reporting that can support operations and safety reviews.",
      senderName: "Carlos Mendez",
      senderEmail: "carlos.mendez@andesquarry.example",
      companyWebsite: "https://andesquarry.example",
      region: "Latin America",
    },
  },
  {
    label: "Waste management",
    leadInput: {
      rawEmail:
        "We operate regional waste facilities and need better recurring visibility for environmental monitoring, hazardous-condition checks, and faster escalation when a site team spots a risk. Can FlytBase support autonomous dock-based monitoring across multiple facilities?",
      senderName: "Noor Al Mansoori",
      senderEmail: "noor@uaewasteops.example",
      companyWebsite: "https://uaewasteops.example",
      region: "Middle East",
    },
  },
  {
    label: "Agriculture security",
    leadInput: {
      rawEmail:
        "Hi, our plantation security team is exploring drone patrols for perimeter monitoring and faster response. We also need a way to connect incident logs with our ERP workflows so field teams can act without manually re-entering every event.",
      senderName: "Anika Tan",
      senderEmail: "anika.tan@plantationops.example",
      companyWebsite: "https://plantationops.example",
      region: "Asia Pacific",
    },
  },
  {
    label: "Wildfire agency",
    leadInput: {
      rawEmail:
        "I am evaluating autonomous drone monitoring for wildfire detection across remote forest land. Thermal imaging and early alerts are important because our response teams need better situational awareness before dispatching crews.",
      senderName: "Marek Novak",
      senderEmail: "marek.novak@forestwatch.example",
      companyWebsite: "https://forestwatch.example",
      region: "Europe",
    },
  },
] as const satisfies readonly {
  label: string;
  leadInput: LeadInput;
}[];

export function LeadInputPanel({
  isAnalyzing,
  onAnalyzeError,
  onAnalyzeStart,
  onAnalyzeSuccess,
  onSampleLoaded,
  retryRequestId,
}: LeadInputPanelProps) {
  const [formState, setFormState] = useState<LeadInput>(emptyLeadInput);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LeadInput, string>>
  >({});
  const [apiError, setApiError] = useState<ApiFailure | null>(null);
  const isSubmitting = isAnalyzing;

  useEffect(() => {
    if (retryRequestId > 0) {
      void analyzeCurrentLead();
    }
  }, [retryRequestId]);

  async function analyzeCurrentLead() {
    if (isSubmitting) {
      return;
    }

    setApiError(null);

    if (!formState.rawEmail.trim()) {
      const error = "Paste the raw inbound email before analyzing this lead.";
      setFieldErrors({ rawEmail: error });
      onAnalyzeError(error);
      return;
    }

    setFieldErrors({});
    onAnalyzeStart();

    try {
      const response = await fetch("/api/analyze-lead", {
        body: JSON.stringify(formState),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isAnalyzeLeadSuccessResponse(payload)) {
        const failure = getApiFailure(payload, "Lead analysis failed.");
        setApiError(failure);
        onAnalyzeError(failure.message, failure.details);
        return;
      }

      onAnalyzeSuccess(
        payload.analysis,
        payload.modelId,
        payload.analysisStatus ?? "ai",
        payload.statusMessage,
      );
    } catch (error) {
      const failure = {
        message:
          error instanceof Error
            ? error.message
            : "Lead analysis failed before the server returned a response.",
      };
      setApiError(failure);
      onAnalyzeError(failure.message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await analyzeCurrentLead();
  }

  function updateField(fieldId: keyof LeadInput, value: string) {
    setFormState((current) => ({
      ...current,
      [fieldId]: value,
    }));

    if (fieldId === "rawEmail" && value.trim()) {
      setFieldErrors((current) => ({
        ...current,
        rawEmail: undefined,
      }));
    }
  }

  function loadSample(sample: LeadInput) {
    setFormState(sample);
    setFieldErrors({});
    setApiError(null);
    onSampleLoaded();
  }

  function resetForm() {
    setFormState(emptyLeadInput);
    setFieldErrors({});
    setApiError(null);
    onSampleLoaded();
  }

  return (
    <section className="flex min-h-[640px] flex-col overflow-hidden border bg-card shadow-[0_16px_40px_rgba(12,35,29,0.08)] lg:min-h-0">
      <div className="flex min-h-16 shrink-0 items-center justify-between border-b bg-[#fbfdf9] px-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-emerald-700">
            <SunMedium className="size-3.5" />
            Live lead intake
          </div>
          <h2 className="mt-1 text-sm font-semibold">Inbound Lead</h2>
          <p className="text-xs text-muted-foreground">Raw signal in, AE-ready brief out</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Reset lead form"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          <RotateCcw />
        </Button>
      </div>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
        <div className="space-y-4 p-5 lg:min-h-0 lg:flex-1 lg:overflow-auto">
          <div className="border border-emerald-600/20 bg-emerald-500/10 p-3">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center border border-emerald-700/20 bg-emerald-600 text-white">
                <BadgeCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold">Recommended hackathon run</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Solar operator lead with PV scale, budget, pilot timing, and drone dock
                  signals for the EnBW proof path.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Samples</Label>
              <span className="text-[10px] uppercase tracking-normal text-muted-foreground">
                Populate only
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sampleLeads.map((sample, index) => {
                const isPrimary = index === 0;

                return (
                  <Button
                    key={sample.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={[
                      "h-auto min-h-9 justify-start py-2",
                      isPrimary
                        ? "col-span-2 border-emerald-700/30 bg-emerald-500/10 text-emerald-950 hover:bg-emerald-500/15"
                        : "",
                    ].join(" ")}
                    onClick={() => loadSample(sample.leadInput)}
                    disabled={isSubmitting}
                  >
                    {isPrimary ? <SunMedium /> : <FileText />}
                    <span className="min-w-0 flex-1 truncate text-left">{sample.label}</span>
                    {isPrimary ? (
                      <span className="border border-emerald-700/20 bg-white/70 px-1.5 py-0.5 text-[10px] uppercase tracking-normal text-emerald-800">
                        Best demo
                      </span>
                    ) : null}
                  </Button>
                );
              })}
            </div>
          </div>

          {leadInputFields.map((field) => {
            const helper = "helper" in field ? field.helper : undefined;
            const error = fieldErrors[field.id];
            const describedBy = [
              helper ? `${field.id}-helper` : undefined,
              error ? `${field.id}-error` : undefined,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.kind === "textarea" ? (
                  <Textarea
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    rows={10}
                    value={formState[field.id]}
                    onChange={(event) => updateField(field.id, event.target.value)}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={Boolean(error)}
                    className="min-h-48 resize-y"
                    disabled={isSubmitting}
                  />
                ) : field.kind === "select" ? (
                  <select
                    id={field.id}
                    name={field.id}
                    value={formState[field.id]}
                    onChange={(event) => updateField(field.id, event.target.value)}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={Boolean(error)}
                    className="h-8 w-full border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                    disabled={isSubmitting}
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
                    value={formState[field.id]}
                    onChange={(event) => updateField(field.id, event.target.value)}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={Boolean(error)}
                    disabled={isSubmitting}
                  />
                )}
                {helper ? (
                  <p id={`${field.id}-helper`} className="text-xs text-muted-foreground">
                    {helper}
                  </p>
                ) : null}
                {error ? (
                  <p id={`${field.id}-error`} className="text-xs text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>
            );
          })}

          {apiError ? (
            <div role="alert" className="border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                <AlertCircle className="size-3.5" />
                <span>{apiError.message}</span>
              </div>
              {apiError.details && apiError.details.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {apiError.details.slice(0, 4).map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t bg-[#fbfdf9] p-5">
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                Analyze Lead
                <ArrowRight />
              </>
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Server-side AI with deterministic fallback for stage-safe demos.
          </p>
        </div>
      </form>
    </section>
  );
}

function isAnalyzeLeadSuccessResponse(
  value: unknown,
): value is AnalyzeLeadSuccessResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    typeof value.modelId === "string" &&
    (value.analysisStatus === undefined ||
      value.analysisStatus === "ai" ||
      value.analysisStatus === "fallback") &&
    (value.statusMessage === undefined ||
      typeof value.statusMessage === "string") &&
    isRecord(value.analysis)
  );
}

function getApiFailure(value: unknown, fallback: string): ApiFailure {
  if (!isRecord(value)) {
    return { message: fallback };
  }

  return {
    message: typeof value.error === "string" ? value.error : fallback,
    details: toStringArray(value.details),
  };
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
