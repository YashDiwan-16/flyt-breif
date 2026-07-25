export const FLYTBREIF_DATABASE_NAME = "flytbreif";

export const flytbreifCollections = {
  users: "users",
  sessions: "sessions",
  accounts: "accounts",
  verifications: "verifications",
  leadInputs: "lead_inputs",
  parsedLeads: "parsed_leads",
  leadAnalyses: "lead_analyses",
  accountResearch: "account_research",
  caseStudyMatches: "case_study_matches",
  caseStudies: "case_studies",
  gtmMotions: "gtm_motions",
  emailSequences: "email_sequences",
  aeHandoffSummaries: "ae_handoff_summaries",
} as const;

export type FlytbreifCollectionKey = keyof typeof flytbreifCollections;
export type FlytbreifCollectionName =
  (typeof flytbreifCollections)[FlytbreifCollectionKey];
