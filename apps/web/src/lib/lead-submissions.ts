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
