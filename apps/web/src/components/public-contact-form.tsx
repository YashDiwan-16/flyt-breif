"use client";

import {
  leadInputFields,
  type LeadInput,
  type LeadInputField,
} from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Input } from "@flyt-breif/ui/components/input";
import { Label } from "@flyt-breif/ui/components/label";
import { Textarea } from "@flyt-breif/ui/components/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Drone,
  LoaderCircle,
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

const publicFieldOrder = [
  "senderName",
  "senderEmail",
  "companyWebsite",
  "region",
  "rawEmail",
] as const satisfies readonly (keyof LeadInput)[];

const publicFieldCopy: Record<
  keyof LeadInput,
  {
    label: string;
    placeholder: string;
  }
> = {
  rawEmail: {
    label: "What are you looking to solve?",
    placeholder:
      "e.g. remote inspection of pipeline assets across 3 sites",
  },
  senderName: {
    label: "Full name",
    placeholder: "Jordan Lee",
  },
  senderEmail: {
    label: "Work email",
    placeholder: "jordan@company.co",
  },
  companyWebsite: {
    label: "Company website",
    placeholder: "https://company.co",
  },
  region: {
    label: "Region",
    placeholder: "Select region",
  },
};

const formControlClassName =
  "h-[72px] rounded-[14px] border-[#45443f] bg-[#292927] px-6 text-2xl font-semibold text-[#f7f6f2] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] placeholder:text-[#777672] focus-visible:border-[#6ca8ff] focus-visible:ring-2 focus-visible:ring-[#0b4f9c]/45 disabled:bg-[#242421] disabled:opacity-60 sm:h-[86px] sm:px-7 sm:text-[34px] md:text-[38px]";

const labelClassName =
  "text-[21px] font-semibold leading-none text-[#c9c7c1] sm:text-[28px]";

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

    const normalizedFormState = normalizeLeadInput(formState);
    const nextErrors = validateLeadInput(normalizedFormState);

    if (Object.keys(nextErrors).length > 0) {
      setFormState(normalizedFormState);
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/analyze-lead", {
        body: JSON.stringify(normalizedFormState),
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

    if (value.trim()) {
      setFieldErrors((current) => ({
        ...current,
        [fieldId]: undefined,
      }));
    }
  }

  return (
    <main className="min-h-svh bg-[#292927] text-[#f7f6f2]">
      <div className="mx-auto flex min-h-svh w-full max-w-[1024px] flex-col px-5 py-6 sm:px-8 md:py-10">
        <div className="flex justify-end">
          <Link
            href="/admin"
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#45443f] bg-[#242421] px-4 text-xs font-semibold text-[#b8b6b0] transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[#5a5851] hover:text-white active:scale-[0.98]"
          >
            Admin
          </Link>
        </div>

        <section className="mx-auto flex w-full max-w-[876px] flex-1 flex-col justify-center py-8">
          {isSubmitted ? (
            <ThankYouState />
          ) : (
            <>
              <header className="text-center">
                <div className="mx-auto flex size-24 items-center justify-center rounded-[18px] bg-[#062d5f] text-[#7db7ff] shadow-[0_18px_46px_rgba(0,0,0,0.24)]">
                  <Drone className="size-12" strokeWidth={2.5} />
                </div>
                <h1 className="mt-9 text-4xl font-bold leading-none tracking-normal text-[#faf9f6] sm:text-[44px]">
                  Talk to our team
                </h1>
                <p className="mt-5 text-2xl font-semibold leading-snug text-[#c9c7c1] sm:text-[31px]">
                  Tell us about your drone ops - we&apos;ll follow up shortly.
                </p>
              </header>

              <form className="mt-16" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-x-7 gap-y-9 md:grid-cols-2">
                  {publicFieldOrder.map((fieldId) => {
                    const field = getLeadInputField(fieldId);
                    const copy = publicFieldCopy[fieldId];
                    const helper = getPublicHelper(fieldId);
                    const error = fieldErrors[fieldId];
                    const describedBy = [
                      helper ? `${fieldId}-helper` : undefined,
                      error ? `${fieldId}-error` : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    if (!field) {
                      return null;
                    }

                    return (
                      <div
                        key={fieldId}
                        className={[
                          "space-y-3",
                          fieldId === "rawEmail" ? "md:col-span-2" : "",
                        ].join(" ")}
                      >
                        <Label htmlFor={fieldId} className={labelClassName}>
                          {copy.label}
                        </Label>
                        {field.kind === "textarea" ? (
                          <Textarea
                            id={fieldId}
                            name={fieldId}
                            placeholder={copy.placeholder}
                            rows={5}
                            value={formState[fieldId]}
                            onChange={(event) =>
                              updateField(fieldId, event.target.value)
                            }
                            aria-describedby={describedBy || undefined}
                            aria-invalid={Boolean(error)}
                            className={`${formControlClassName} min-h-[168px] resize-y py-6 leading-tight`}
                            disabled={isSubmitting}
                            required
                          />
                        ) : field.kind === "select" ? (
                          <div className="relative">
                            <select
                              id={fieldId}
                              name={fieldId}
                              value={formState[fieldId]}
                              onChange={(event) =>
                                updateField(fieldId, event.target.value)
                              }
                              aria-describedby={describedBy || undefined}
                              aria-invalid={Boolean(error)}
                              className={`${formControlClassName} appearance-none pr-14 outline-none`}
                              disabled={isSubmitting}
                              required
                            >
                              <option value="" disabled>
                                {copy.placeholder}
                              </option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-5 top-1/2 size-7 -translate-y-1/2 text-[#f7f6f2]" />
                          </div>
                        ) : (
                          <Input
                            id={fieldId}
                            name={fieldId}
                            type={field.kind}
                            placeholder={copy.placeholder}
                            value={formState[fieldId]}
                            onChange={(event) =>
                              updateField(fieldId, event.target.value)
                            }
                            aria-describedby={describedBy || undefined}
                            aria-invalid={Boolean(error)}
                            className={formControlClassName}
                            disabled={isSubmitting}
                            required
                          />
                        )}
                        {helper ? (
                          <p
                            id={`${fieldId}-helper`}
                            className="text-sm font-medium leading-5 text-[#918f89]"
                          >
                            {helper}
                          </p>
                        ) : null}
                        {error ? (
                          <p
                            id={`${fieldId}-error`}
                            className="text-sm font-semibold text-red-300"
                          >
                            {error}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {apiError ? (
                  <div
                    role="alert"
                    className="mt-8 rounded-[14px] border border-red-300/25 bg-red-500/10 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-200">
                      <AlertCircle className="size-4" />
                      <span>{apiError.message}</span>
                    </div>
                    {apiError.details && apiError.details.length > 0 ? (
                      <div className="mt-2 space-y-1 text-sm text-[#c9c7c1]">
                        {apiError.details.slice(0, 5).map((detail) => (
                          <p key={detail}>{detail}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-12 h-20 w-full rounded-[16px] bg-[#fafafa] text-[30px] font-semibold text-[#060606] shadow-[0_18px_38px_rgba(0,0,0,0.22)] hover:bg-white sm:text-[34px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Submitting
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
                <p className="mt-8 text-center text-xl font-semibold leading-snug text-[#928f89]">
                  No account needed. We&apos;ll reach out at the email you provide.
                </p>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ThankYouState() {
  return (
    <div className="flex min-h-[620px] flex-col items-center justify-center text-center">
      <div className="flex size-24 items-center justify-center rounded-[18px] bg-[#062d5f] text-[#7db7ff] shadow-[0_18px_46px_rgba(0,0,0,0.24)]">
        <CheckCircle2 className="size-12" strokeWidth={2.5} />
      </div>
      <h2 className="mt-9 text-4xl font-bold leading-none text-[#faf9f6] sm:text-[44px]">
        Thank you for submitting.
      </h2>
      <p className="mt-5 max-w-2xl text-2xl font-semibold leading-snug text-[#c9c7c1] sm:text-[31px]">
        Your request has been sent to the FlytBase team. We&apos;ll review the
        drone operations context and follow up shortly.
      </p>
      <Button
        type="button"
        className="mt-12 h-16 rounded-[16px] bg-[#fafafa] px-10 text-2xl font-semibold text-[#060606] hover:bg-white"
        onClick={() => window.location.reload()}
      >
        Submit another request
      </Button>
    </div>
  );
}

function getLeadInputField(fieldId: keyof LeadInput): LeadInputField | undefined {
  return leadInputFields.find((field) => field.id === fieldId);
}

function normalizeLeadInput(value: LeadInput): LeadInput {
  const companyWebsite = value.companyWebsite.trim();

  return {
    rawEmail: value.rawEmail.trim(),
    senderName: value.senderName.trim(),
    senderEmail: value.senderEmail.trim(),
    companyWebsite:
      companyWebsite && !/^https?:\/\//i.test(companyWebsite)
        ? `https://${companyWebsite}`
        : companyWebsite,
    region: value.region.trim(),
  };
}

function validateLeadInput(value: LeadInput) {
  const errors: Partial<Record<keyof LeadInput, string>> = {};

  if (!value.senderName) {
    errors.senderName = "Enter your full name.";
  }

  if (!value.senderEmail || !value.senderEmail.includes("@")) {
    errors.senderEmail = "Enter a valid work email.";
  }

  if (!isValidUrl(value.companyWebsite)) {
    errors.companyWebsite = "Enter a valid company website.";
  }

  if (!value.region) {
    errors.region = "Select your region.";
  }

  if (!value.rawEmail) {
    errors.rawEmail = "Tell us what you need help with.";
  }

  return errors;
}

function isValidUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function getPublicHelper(_fieldId: keyof LeadInput) {
  return undefined;
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
