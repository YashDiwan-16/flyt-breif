export * from "./case-studies";
export * from "./database";
export * from "./models";

import type { LeadInput } from "./models";

export type LeadFieldKind = "text" | "email" | "url" | "textarea" | "select";

export type LeadInputField = {
  id: keyof LeadInput;
  label: string;
  kind: LeadFieldKind;
  placeholder: string;
  helper?: string;
  options?: readonly string[];
};

export type QualificationSignal = {
  id: string;
  label: string;
  placeholder: string;
};

export type DashboardStat = {
  label: string;
  value: string;
};

export const leadInputFields = [
  {
    id: "rawEmail",
    label: "Raw inbound email",
    kind: "textarea",
    placeholder:
      "Paste the inbound email or web-form note, including the problem, context, and any timeline or scale hints.",
    helper: "Required. Samples only fill this form and never determine the analysis output directly.",
  },
  {
    id: "senderName",
    label: "Sender name",
    kind: "text",
    placeholder: "e.g. Priya Shah",
  },
  {
    id: "senderEmail",
    label: "Sender email",
    kind: "email",
    placeholder: "priya@example.com",
  },
  {
    id: "companyWebsite",
    label: "Company website",
    kind: "url",
    placeholder: "https://company.com",
  },
  {
    id: "region",
    label: "Region",
    kind: "select",
    placeholder: "Select region",
    options: [
      "North America",
      "Europe",
      "Middle East",
      "Latin America",
      "Asia Pacific",
      "Africa",
      "Global",
    ],
  },
] as const satisfies readonly LeadInputField[];

export const qualificationSignals = [
  {
    id: "fit",
    label: "ICP fit",
    placeholder: "Pending company and use-case context",
  },
  {
    id: "urgency",
    label: "Urgency",
    placeholder: "Pending trigger and timeline signals",
  },
  {
    id: "nextStep",
    label: "Next step",
    placeholder: "Pending recommended outreach angle",
  },
] as const satisfies readonly QualificationSignal[];

export const dashboardStats = [
  {
    label: "Queue",
    value: "0",
  },
  {
    label: "SLA",
    value: "--",
  },
  {
    label: "Scored",
    value: "0%",
  },
] as const satisfies readonly DashboardStat[];
