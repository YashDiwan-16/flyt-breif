"use client";

import { leadInputFields, type LeadAnalysis, type LeadInput } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { Textarea } from "@flyt-breif/ui/components/textarea";
import {
  AlertCircle,
  ArrowRight,
  FileText,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { useState, type FormEvent } from "react";

type LeadInputPanelProps = {
  isAnalyzing: boolean;
  onAnalyzeError: (error: string, details?: readonly string[]) => void;
  onAnalyzeStart: () => void;
  onAnalyzeSuccess: (analysis: LeadAnalysis, modelId: string) => void;
  onSampleLoaded: () => void;
};

type AnalyzeLeadSuccessResponse = {
  ok: true;
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
        "Hi FlytBase team, I lead operations for HelioGrid Solar. We are trying to inspect several utility-scale PV sites more consistently without sending crews across the full field every week. We are evaluating autonomous drone docks for thermal and visual inspection, and we would like to understand what a pilot could look like this quarter.",
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
}: LeadInputPanelProps) {
  const [formState, setFormState] = useState<LeadInput>(emptyLeadInput);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LeadInput, string>>
  >({});
  const [apiError, setApiError] = useState<ApiFailure | null>(null);
  const isSubmitting = isAnalyzing;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

      onAnalyzeSuccess(payload.analysis, payload.modelId);
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
    <section className="flex min-h-0 flex-col bg-card">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div>
          <h2 className="text-sm font-semibold">Inbound Lead</h2>
          <p className="text-xs text-muted-foreground">Paste the lead, then run analysis</p>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Samples</Label>
              <span className="text-[10px] uppercase tracking-normal text-muted-foreground">
                Populate only
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sampleLeads.map((sample) => (
                <Button
                  key={sample.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => loadSample(sample.leadInput)}
                  disabled={isSubmitting}
                >
                  <FileText />
                  <span className="truncate">{sample.label}</span>
                </Button>
              ))}
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

        <div className="shrink-0 border-t p-5">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
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
            Calls the server route at /api/analyze-lead. Samples do not bypass analysis.
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
