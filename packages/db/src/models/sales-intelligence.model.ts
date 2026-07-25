import {
  flytbaseCollections,
  type LeadAnalysis,
  type LeadInput,
} from "@flyt-breif/core";
import type { FlytBaseCaseStudyKnowledgeBaseEntry } from "@flyt-breif/data";
import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;
const { Mixed, ObjectId } = Schema.Types;

const sourceCitationSchema = new Schema(
  {
    title: { type: String, required: true },
    sourceType: { type: String, required: true },
    usedFor: { type: [String], required: true, default: [] },
    url: { type: String },
  },
  {
    _id: false,
    strict: "throw",
  },
);

export type LeadInputRecord = LeadInput & {
  createdAt: Date;
  updatedAt: Date;
};

export type LeadAnalysisRecord = LeadAnalysis & {
  analysisStatus: "ai" | "fallback";
  leadInputId?: mongoose.Types.ObjectId;
  modelId: string;
  statusMessage?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseStudyRecord = FlytBaseCaseStudyKnowledgeBaseEntry & {
  createdAt: Date;
  updatedAt: Date;
};

const leadInputSchema = new Schema<LeadInputRecord>(
  {
    rawEmail: { type: String, required: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    companyWebsite: { type: String, required: true },
    region: { type: String, required: true },
  },
  {
    collection: flytbaseCollections.leadInputs,
    strict: "throw",
    timestamps: true,
  },
);
leadInputSchema.index({ senderEmail: 1 });
leadInputSchema.index({ companyWebsite: 1 });
leadInputSchema.index({ createdAt: -1 });

const leadAnalysisSchema = new Schema<LeadAnalysisRecord>(
  {
    leadInputId: { type: ObjectId, ref: "LeadInput" },
    analysisStatus: {
      type: String,
      required: true,
      enum: ["ai", "fallback"],
      default: "fallback",
    },
    modelId: { type: String, required: true },
    statusMessage: { type: String },
    leadSnapshot: { type: Mixed, required: true },
    parsedSignals: { type: Mixed, required: true },
    qualification: { type: Mixed, required: true },
    accountResearch: { type: Mixed, required: true },
    matchedCaseStudy: { type: Mixed, required: true },
    gtmRecommendation: { type: Mixed, required: true },
    emailSequence: { type: Mixed, required: true },
    aeHandoffSummary: { type: Mixed, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    sources: { type: [sourceCitationSchema], required: true, default: [] },
    warnings: { type: [String], required: true, default: [] },
  },
  {
    collection: flytbaseCollections.leadAnalyses,
    strict: "throw",
    timestamps: true,
  },
);
leadAnalysisSchema.index({ leadInputId: 1 });
leadAnalysisSchema.index({ analysisStatus: 1 });
leadAnalysisSchema.index({ "leadSnapshot.leadScore": -1 });
leadAnalysisSchema.index({ "leadSnapshot.qualificationLabel": 1 });
leadAnalysisSchema.index({ createdAt: -1 });

const caseStudySchema = new Schema<CaseStudyRecord>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    industry: { type: String, required: true },
    useCases: { type: [String], required: true, default: [] },
    painPoints: { type: [String], required: true, default: [] },
    keywords: { type: [String], required: true, default: [] },
    proofPoints: { type: [String], required: true, default: [] },
    recommendedEmailLine: { type: String, required: true },
    url: { type: String, required: true },
    searchText: { type: String, required: true },
  },
  {
    collection: flytbaseCollections.caseStudies,
    strict: "throw",
    timestamps: true,
  },
);
caseStudySchema.index({ industry: 1 });
caseStudySchema.index({ keywords: 1 });
caseStudySchema.index({ useCases: 1 });

const LeadInputModel =
  (models.LeadInput as Model<LeadInputRecord> | undefined) ??
  model<LeadInputRecord>("LeadInput", leadInputSchema);

const LeadAnalysisModel =
  (models.LeadAnalysis as Model<LeadAnalysisRecord> | undefined) ??
  model<LeadAnalysisRecord>("LeadAnalysis", leadAnalysisSchema);

const CaseStudyModel =
  (models.CaseStudy as Model<CaseStudyRecord> | undefined) ??
  model<CaseStudyRecord>("CaseStudy", caseStudySchema);

export { CaseStudyModel, LeadAnalysisModel, LeadInputModel };
