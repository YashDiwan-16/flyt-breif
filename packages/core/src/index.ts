export * from "./case-studies";
export * from "./models";

export type LeadFieldKind = "text" | "email" | "url" | "textarea" | "select";

export type LeadInputField = {
  id: string;
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
    id: "leadSource",
    label: "Lead source",
    kind: "select",
    placeholder: "Select inbound source",
    options: ["Website form", "Demo request", "Partner referral", "Event scan", "Manual import"],
  },
  {
    id: "companyName",
    label: "Company",
    kind: "text",
    placeholder: "e.g. Apex Facilities Group",
  },
  {
    id: "contactName",
    label: "Contact",
    kind: "text",
    placeholder: "e.g. Priya Shah",
  },
  {
    id: "contactEmail",
    label: "Email",
    kind: "email",
    placeholder: "priya@example.com",
  },
  {
    id: "role",
    label: "Role / title",
    kind: "text",
    placeholder: "e.g. Head of Security Operations",
    helper: "Used later to infer persona fit and buying committee influence.",
  },
  {
    id: "website",
    label: "Website",
    kind: "url",
    placeholder: "https://company.com",
  },
  {
    id: "notes",
    label: "Inbound notes",
    kind: "textarea",
    placeholder:
      "Paste the form submission, routing notes, company context, or BDR research snippets.",
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
