import { z } from "zod";

const nonEmptyStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(nonEmptyStringSchema);

export const regionSchema = nonEmptyStringSchema;
export type Region = z.infer<typeof regionSchema>;

export const leadUrgencySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);
export type LeadUrgency = z.infer<typeof leadUrgencySchema>;

export const qualificationLabelSchema = z.enum([
  "unqualified",
  "nurture",
  "qualified",
  "sales-ready",
]);
export type QualificationLabel = z.infer<typeof qualificationLabelSchema>;

export const leadInputSchema = z.strictObject({
  rawEmail: nonEmptyStringSchema,
  senderName: nonEmptyStringSchema,
  senderEmail: z.email(),
  companyWebsite: z.url(),
  region: regionSchema,
});
export type LeadInput = z.infer<typeof leadInputSchema>;

export const parsedLeadSchema = z.strictObject({
  companyName: nonEmptyStringSchema,
  contactName: nonEmptyStringSchema,
  contactRole: nonEmptyStringSchema,
  contactEmail: z.email(),
  companyWebsite: z.url(),
  region: regionSchema,
  industry: nonEmptyStringSchema,
  useCase: nonEmptyStringSchema,
  painPoints: stringListSchema,
  businessTriggers: stringListSchema,
  budgetSignals: stringListSchema,
  authoritySignals: stringListSchema,
  needSignals: stringListSchema,
  timelineSignals: stringListSchema,
  missingInfo: stringListSchema,
});
export type ParsedLead = z.infer<typeof parsedLeadSchema>;

export const leadScoreSchema = z.number().int().min(0).max(100);

export const leadSnapshotSchema = z.strictObject({
  companyName: nonEmptyStringSchema,
  contactName: nonEmptyStringSchema,
  contactRole: nonEmptyStringSchema,
  industry: nonEmptyStringSchema,
  region: regionSchema,
  useCase: nonEmptyStringSchema,
  urgency: leadUrgencySchema,
  leadScore: leadScoreSchema,
  qualificationLabel: qualificationLabelSchema,
});
export type LeadSnapshot = z.infer<typeof leadSnapshotSchema>;

export const bantCategorySchema = z.enum([
  "budget",
  "authority",
  "need",
  "timeline",
]);
export type BantCategory = z.infer<typeof bantCategorySchema>;

export const bantScoreSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type BantScore = z.infer<typeof bantScoreSchema>;

export const bantItemSchema = z.strictObject({
  score: bantScoreSchema,
  evidence: stringListSchema,
  missingInfo: stringListSchema,
  discoveryQuestion: nonEmptyStringSchema,
});
export type BantItem = z.infer<typeof bantItemSchema>;

export const bantQualificationSchema = z.strictObject({
  budget: bantItemSchema,
  authority: bantItemSchema,
  need: bantItemSchema,
  timeline: bantItemSchema,
});
export type BANTQualification = z.infer<typeof bantQualificationSchema>;

export const sourceTypeSchema = z.enum([
  "lead-email",
  "company-website",
  "case-study",
  "account-research",
  "manual-note",
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const sourceCitationSchema = z.strictObject({
  title: nonEmptyStringSchema,
  sourceType: sourceTypeSchema,
  usedFor: stringListSchema,
  url: z.url().optional(),
});
export type SourceCitation = z.infer<typeof sourceCitationSchema>;
export const researchSourceSchema = sourceCitationSchema;
export type ResearchSource = SourceCitation;

export const accountResearchSchema = z.strictObject({
  companyOverview: nonEmptyStringSchema,
  industry: nonEmptyStringSchema,
  region: regionSchema,
  companySize: nonEmptyStringSchema,
  headquarters: nonEmptyStringSchema,
  operatingContext: nonEmptyStringSchema,
  keySignals: stringListSchema,
  likelyBuyingCommittee: stringListSchema,
  researchGaps: stringListSchema,
  sources: z.array(sourceCitationSchema),
});
export type AccountResearch = z.infer<typeof accountResearchSchema>;

export const caseStudyMatchSchema = z.strictObject({
  caseStudyId: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  industry: nonEmptyStringSchema,
  region: regionSchema,
  matchedUseCases: stringListSchema,
  matchedPainPoints: stringListSchema,
  proofPoints: stringListSchema,
  relevanceRationale: nonEmptyStringSchema,
  recommendedEmailLine: nonEmptyStringSchema,
  url: z.url(),
  confidence: z.number().min(0).max(1),
});
export type CaseStudyMatch = z.infer<typeof caseStudyMatchSchema>;

export const gtmPrioritySchema = z.enum(["low", "medium", "high"]);
export type GTMPriority = z.infer<typeof gtmPrioritySchema>;

export const gtmMotionSchema = z.strictObject({
  priority: gtmPrioritySchema,
  recommendedMotion: nonEmptyStringSchema,
  primaryPersona: nonEmptyStringSchema,
  positioning: nonEmptyStringSchema,
  recommendedOffer: nonEmptyStringSchema,
  nextBestAction: nonEmptyStringSchema,
  discoveryFocus: stringListSchema,
  riskNotes: stringListSchema,
});
export type GTMMotion = z.infer<typeof gtmMotionSchema>;

export const emailSequenceStepSchema = z.strictObject({
  step: z.number().int().min(1),
  delayDays: z.number().int().min(0),
  subject: nonEmptyStringSchema,
  body: nonEmptyStringSchema,
  callToAction: nonEmptyStringSchema,
  personalizationNotes: stringListSchema,
});
export type EmailSequenceStep = z.infer<typeof emailSequenceStepSchema>;

export const emailSequenceSchema = z.strictObject({
  strategy: nonEmptyStringSchema,
  steps: z.array(emailSequenceStepSchema).min(1),
});
export type EmailSequence = z.infer<typeof emailSequenceSchema>;

export const aeHandoffSummarySchema = z.strictObject({
  summary: nonEmptyStringSchema,
  whyNow: nonEmptyStringSchema,
  talkingPoints: stringListSchema,
  openQuestions: stringListSchema,
  recommendedNextSteps: stringListSchema,
  risks: stringListSchema,
  suggestedMeetingAgenda: stringListSchema,
});
export type AEHandoffSummary = z.infer<typeof aeHandoffSummarySchema>;

export const leadAnalysisSchema = z.strictObject({
  leadSnapshot: leadSnapshotSchema,
  parsedSignals: parsedLeadSchema,
  qualification: bantQualificationSchema,
  accountResearch: accountResearchSchema,
  matchedCaseStudy: caseStudyMatchSchema,
  gtmRecommendation: gtmMotionSchema,
  emailSequence: emailSequenceSchema,
  aeHandoffSummary: aeHandoffSummarySchema,
  confidence: z.number().min(0).max(1),
  sources: z.array(sourceCitationSchema),
  warnings: stringListSchema,
});
export type LeadAnalysis = z.infer<typeof leadAnalysisSchema>;

export const qualificationSchema = bantQualificationSchema;
export type Qualification = BANTQualification;

export const matchedCaseStudySchema = caseStudyMatchSchema;
export type MatchedCaseStudy = CaseStudyMatch;

export const gtmRecommendationSchema = gtmMotionSchema;
export type GtmRecommendation = GTMMotion;

export type AeHandoffSummary = AEHandoffSummary;
