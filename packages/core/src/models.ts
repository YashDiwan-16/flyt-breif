export type Region = string;

export type LeadInput = {
  rawEmail: string;
  senderName: string;
  senderEmail: string;
  companyWebsite: string;
  region: Region;
};

export type LeadUrgency = "low" | "medium" | "high" | "critical";

export type QualificationLabel = "unqualified" | "nurture" | "qualified" | "sales-ready";

export type LeadSnapshot = {
  companyName: string;
  contactName: string;
  contactRole: string;
  industry: string;
  region: Region;
  useCase: string;
  urgency: LeadUrgency;
  leadScore: number;
  qualificationLabel: QualificationLabel;
};

export type BantCategory = "Budget" | "Authority" | "Need" | "Timeline";

export type BantScore = 0 | 1 | 2 | 3 | 4 | 5;

export type BantItem = {
  score: BantScore;
  evidence: readonly string[];
  missingInfo: readonly string[];
  discoveryQuestion: string;
};

export type Qualification = Record<BantCategory, BantItem>;

export type ResearchSource = {
  label: string;
  url?: string;
};

export type AccountResearch = {
  summary: string;
  keySignals: readonly string[];
  sources: readonly ResearchSource[];
};

export type MatchedCaseStudy = {
  title: string;
  summary: string;
  relevance: string;
  url?: string;
};

export type GtmRecommendation = {
  priority: "low" | "medium" | "high";
  recommendedMotion: string;
  rationale: string;
  nextBestAction: string;
};

export type EmailSequenceStep = {
  step: number;
  subject: string;
  angle: string;
  body: string;
};

export type AeHandoffSummary = {
  summary: string;
  talkingPoints: readonly string[];
  openQuestions: readonly string[];
  recommendedNextSteps: readonly string[];
};

export type LeadAnalysis = {
  leadSnapshot: LeadSnapshot;
  qualification: Qualification;
  accountResearch: AccountResearch;
  matchedCaseStudy: MatchedCaseStudy;
  gtmRecommendation: GtmRecommendation;
  emailSequence: readonly EmailSequenceStep[];
  aeHandoffSummary: AeHandoffSummary;
};
