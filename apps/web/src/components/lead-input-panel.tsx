"use client";

import { leadInputFields, type LeadAnalysis, type LeadInput } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { Textarea } from "@flyt-breif/ui/components/textarea";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  RotateCcw,
  Send,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type LeadInputPanelProps = {
  isAnalyzing: boolean;
  mode?: "form" | "submitted";
  onAnalyzeError: (error: string, details?: readonly string[]) => void;
  onAnalyzeStart: () => void;
  onAnalyzeSuccess: (
    analysis: LeadAnalysis,
    modelId: string,
    analysisStatus: AnalysisGenerationStatus,
    statusMessage?: string,
  ) => void;
  onReset?: () => void;
  retryRequestId?: number;
  submittedAnalysis?: LeadAnalysis;
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

export function LeadInputPanel({
  isAnalyzing,
  mode = "form",
  onAnalyzeError,
  onAnalyzeStart,
  onAnalyzeSuccess,
  onReset,
  retryRequestId,
  submittedAnalysis,
}: LeadInputPanelProps) {
  const [formState, setFormState] = useState<LeadInput>(emptyLeadInput);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LeadInput, string>>
  >({});
  const [apiError, setApiError] = useState<ApiFailure | null>(null);
  const isSubmitting = isAnalyzing;

  useEffect(() => {
    if ((retryRequestId ?? 0) > 0) {
      void analyzeCurrentLead();
    }
  }, [retryRequestId]);

  async function analyzeCurrentLead() {
    if (isSubmitting) {
      return;
    }

    setApiError(null);

    if (!formState.rawEmail.trim()) {
      const error = "Paste the raw inbound email before submitting this lead.";
      setFieldErrors({ rawEmail: error });
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

  function resetForm() {
    setFormState(emptyLeadInput);
    setFieldErrors({});
    setApiError(null);
    onReset?.();
  }

  if (mode === "submitted" && submittedAnalysis) {
    return (
      <section className="flex min-h-[640px] flex-col overflow-hidden border bg-card shadow-[0_16px_40px_rgba(12,35,29,0.08)] lg:min-h-0">
        <div className="flex min-h-16 shrink-0 items-center justify-between border-b bg-[#fbfdf9] px-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              Submission received
            </div>
            <h2 className="mt-1 text-sm font-semibold">Thank You</h2>
            <p className="text-xs text-muted-foreground">
              The internal dashboard now has the lead brief.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Submit another lead"
            onClick={resetForm}
          >
            <RotateCcw />
          </Button>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="space-y-4">
            <div className="border border-emerald-700/25 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center border border-emerald-700/20 bg-emerald-600 text-white">
                  <ClipboardCheck className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Thank you for submitting.</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Your lead has been analyzed. The BDR and AE view now shows the
                    qualification, public account research, FlytBase case-study match,
                    GTM motion, adaptive emails, AE handoff, and markdown report export.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <SubmittedMetric
                label="Company"
                value={submittedAnalysis.leadSnapshot.companyName}
              />
              <SubmittedMetric
                label="Contact"
                value={`${submittedAnalysis.leadSnapshot.contactName} - ${submittedAnalysis.leadSnapshot.contactRole}`}
              />
              <SubmittedMetric
                label="Qualification"
                value={formatHumanLabel(submittedAnalysis.leadSnapshot.qualificationLabel)}
              />
              <SubmittedMetric
                label="Recommended motion"
                value={submittedAnalysis.gtmRecommendation.recommendedMotion}
              />
            </div>
          </div>

          <Button type="button" size="lg" className="mt-6 w-full" onClick={resetForm}>
            <Send />
            Submit another lead
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[640px] flex-col overflow-hidden border bg-card shadow-[0_16px_40px_rgba(12,35,29,0.08)] lg:min-h-0">
      <div className="flex min-h-16 shrink-0 items-center justify-between border-b bg-[#fbfdf9] px-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-emerald-700">
            <Send className="size-3.5" />
            Live lead intake
          </div>
          <h2 className="mt-1 text-sm font-semibold">Inbound Lead</h2>
          <p className="text-xs text-muted-foreground">
            Submit the inbound request for internal qualification
          </p>
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
                Generating report
              </>
            ) : (
              <>
                Submit Lead
                <ArrowRight />
              </>
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Analysis runs server-side, validates structured output, and falls back
            deterministically if the model is unavailable.
          </p>
        </div>
      </form>
    </section>
  );
}

function SubmittedMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border bg-background p-3 shadow-[0_6px_18px_rgba(12,35,29,0.035)]">
      <p className="text-[10px] uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function formatHumanLabel(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
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
