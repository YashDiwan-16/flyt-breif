export const FLYTBASE_DATABASE_NAME = "flytbase";

export const flytbaseCollections = {
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

export type FlytbaseCollectionKey = keyof typeof flytbaseCollections;
export type FlytbaseCollectionName =
  (typeof flytbaseCollections)[FlytbaseCollectionKey];

export const FLYTBREIF_DATABASE_NAME = FLYTBASE_DATABASE_NAME;
export const flytbreifCollections = flytbaseCollections;
export type FlytbreifCollectionKey = FlytbaseCollectionKey;
export type FlytbreifCollectionName = FlytbaseCollectionName;
