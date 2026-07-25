import { z } from "zod";

const nonEmptyStringSchema = z.string().trim().min(1);
const stringListSchema = z.array(nonEmptyStringSchema);

export const leadUrgencySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const leadScaleSchema = z.enum([
  "unknown",
  "pilot",
  "single-site",
  "multi-site",
  "enterprise",
]);

export const leadMetadataSchema = z.strictObject({
  senderName: nonEmptyStringSchema.optional(),
  senderEmail: z.email().optional(),
  companyWebsite: z.url().optional(),
  companyName: nonEmptyStringSchema.optional(),
  role: nonEmptyStringSchema.optional(),
  region: nonEmptyStringSchema.optional(),
  source: nonEmptyStringSchema.optional(),
});

export const extractLeadSignalsInputSchema = z.strictObject({
  rawEmail: nonEmptyStringSchema,
  metadata: leadMetadataSchema.optional(),
});

export const parsedLeadSignalsSchema = z.strictObject({
  companyName: nonEmptyStringSchema,
  role: nonEmptyStringSchema,
  region: nonEmptyStringSchema,
  industry: nonEmptyStringSchema,
  useCase: nonEmptyStringSchema,
  painPoints: stringListSchema,
  urgency: leadUrgencySchema,
  scale: leadScaleSchema,
  keywords: stringListSchema,
});

export const caseStudyToolResultSchema = z.strictObject({
  id: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  industry: nonEmptyStringSchema,
  useCases: stringListSchema,
  painPoints: stringListSchema,
  keywords: stringListSchema,
  proofPoints: stringListSchema,
  recommendedEmailLine: nonEmptyStringSchema,
  url: z.url(),
  searchText: nonEmptyStringSchema,
  score: z.number().min(0),
  matchedTerms: stringListSchema,
});

export const searchCaseStudiesOutputSchema = z.array(
  caseStudyToolResultSchema,
);

export const bantScoreSchema = z.number().int().min(0).max(5);

export const bantItemSchema = z.strictObject({
  score: bantScoreSchema,
  evidence: stringListSchema,
  missingInfo: stringListSchema,
});

export const bantScoringOutputSchema = z.strictObject({
  Budget: bantItemSchema,
  Authority: bantItemSchema,
  Need: bantItemSchema,
  Timeline: bantItemSchema,
});

export const gtmMotionInputSchema = z.strictObject({
  parsedLead: parsedLeadSignalsSchema,
  qualification: bantScoringOutputSchema,
  caseStudyMatch: caseStudyToolResultSchema,
});

export const gtmMotionOutputSchema = z.strictObject({
  motion: z.enum(["Direct AE", "Partner-led", "Hybrid"]),
  reasoning: nonEmptyStringSchema,
  recommendedNextStep: nonEmptyStringSchema,
  supportingSignals: stringListSchema,
  risks: stringListSchema,
});

export type LeadUrgency = z.infer<typeof leadUrgencySchema>;
export type LeadScale = z.infer<typeof leadScaleSchema>;
export type LeadMetadata = z.infer<typeof leadMetadataSchema>;
export type ExtractLeadSignalsInput = z.infer<
  typeof extractLeadSignalsInputSchema
>;
export type ParsedLeadSignals = z.infer<typeof parsedLeadSignalsSchema>;
export type CaseStudyToolResult = z.infer<typeof caseStudyToolResultSchema>;
export type BANTScoringOutput = z.infer<typeof bantScoringOutputSchema>;
export type GTMMotionInput = z.infer<typeof gtmMotionInputSchema>;
export type GTMMotionOutput = z.infer<typeof gtmMotionOutputSchema>;
