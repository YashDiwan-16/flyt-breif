import type { LeadAnalysis, LeadInput } from "@flyt-breif/core";

export type StoredLeadSubmission = {
  id: string;
  submittedAt: string;
  leadInput: LeadInput;
  analysis: LeadAnalysis;
  analysisStatus: "ai" | "fallback";
  modelId: string;
  statusMessage?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var flytBdrLeadSubmissions: StoredLeadSubmission[] | undefined;
}

const MAX_STORED_SUBMISSIONS = 50;

export function storeLeadSubmission(
  submission: Omit<StoredLeadSubmission, "id" | "submittedAt">,
) {
  const storedSubmission: StoredLeadSubmission = {
    ...submission,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  const submissions = getMutableLeadSubmissions();

  submissions.unshift(storedSubmission);
  submissions.splice(MAX_STORED_SUBMISSIONS);

  return storedSubmission;
}

export function listLeadSubmissions() {
  return [...getMutableLeadSubmissions()];
}

function getMutableLeadSubmissions() {
  globalThis.flytBdrLeadSubmissions ??= [];

  return globalThis.flytBdrLeadSubmissions;
}
