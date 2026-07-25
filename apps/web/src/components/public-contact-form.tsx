"use client";

import { leadInputFields, type LeadInput } from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { Textarea } from "@flyt-breif/ui/components/textarea";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  MessageSquareText,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

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

export function PublicContactForm() {
  const [formState, setFormState] = useState<LeadInput>(emptyLeadInput);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LeadInput, string>>
  >({});
  const [apiError, setApiError] = useState<ApiFailure | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formState.rawEmail.trim()) {
      setFieldErrors({ rawEmail: "Tell us what you need help with." });
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/analyze-lead", {
        body: JSON.stringify(formState),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isSuccessPayload(payload)) {
        const failure = getApiFailure(payload, "We could not submit your request.");
        setApiError(failure);
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      setApiError({
        message:
          error instanceof Error
            ? error.message
            : "We could not submit your request.",
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-5 md:px-6">
        <header className="flex items-center justify-between gap-3 border-b pb-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-emerald-600/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-normal text-emerald-800">
              <MessageSquareText className="size-3.5" />
              Contact FlytBase
            </div>
            <h1 className="mt-2 text-xl font-semibold md:text-3xl">
              Tell us about your drone automation need
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Share your request and a FlytBase sales specialist will review the account,
              operational use case, deployment fit, and next best step.
            </p>
          </div>
          <Link
            href="/admin"
            className="hidden h-7 shrink-0 items-center justify-center border bg-background px-2.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted active:scale-[0.98] sm:inline-flex"
          >
            Admin
          </Link>
        </header>

        <div className="grid flex-1 items-start gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="border bg-card shadow-[0_16px_40px_rgba(12,35,29,0.08)]">
            {isSubmitted ? (
              <ThankYouState />
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4 p-5">
                  {leadInputFields.map((field) => {
                    const helper = getPublicHelper(field.id);
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
                            placeholder="Tell us about your sites, inspection or monitoring need, urgency, scale, and what you want to automate."
                            rows={10}
                            value={formState[field.id]}
                            onChange={(event) => updateField(field.id, event.target.value)}
                            aria-describedby={describedBy || undefined}
                            aria-invalid={Boolean(error)}
                            className="min-h-52 resize-y"
                            disabled={isSubmitting}
                            required
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
                            required
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
                            required
                          />
                        )}
                        {helper ? (
                          <p
                            id={`${field.id}-helper`}
                            className="text-xs text-muted-foreground"
                          >
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
                    <div
                      role="alert"
                      className="border border-destructive/30 bg-destructive/5 p-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                        <AlertCircle className="size-3.5" />
                        <span>{apiError.message}</span>
                      </div>
                      {apiError.details && apiError.details.length > 0 ? (
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {apiError.details.slice(0, 5).map((detail) => (
                            <p key={detail}>{detail}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="border-t bg-[#fbfdf9] p-5">
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Submitting
                      </>
                    ) : (
                      <>
                        Submit request
                        <Send />
                      </>
                    )}
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    You will see a confirmation after submitting. The FlytBase team
                    receives the internal qualification brief separately.
                  </p>
                </div>
              </form>
            )}
          </section>

          <aside className="border bg-card p-4 shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
            <p className="text-sm font-semibold">What happens next</p>
            <div className="mt-4 space-y-3">
              {[
                "Your request is routed to the FlytBase sales team.",
                "The admin cockpit qualifies the lead and prepares account context.",
                "An AE receives a handoff summary and suggested response sequence.",
              ].map((item) => (
                <div key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 bg-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ThankYouState() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center p-6 text-center">
      <div className="flex size-12 items-center justify-center border border-emerald-700/20 bg-emerald-600 text-white">
        <CheckCircle2 className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Thank you for submitting.</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Your request has been sent to the FlytBase team. A sales specialist will
        review your use case and follow up with the right next step.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-5"
        onClick={() => window.location.reload()}
      >
        Submit another request
      </Button>
    </div>
  );
}

function getPublicHelper(fieldId: keyof LeadInput) {
  switch (fieldId) {
    case "rawEmail":
      return "Required. Include your site type, use case, scale, urgency, and any drone automation requirements.";
    case "companyWebsite":
      return "Used for server-side public account context in the internal admin cockpit.";
    default:
      return undefined;
  }
}

function isSuccessPayload(value: unknown) {
  return isRecord(value) && value.ok === true;
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
