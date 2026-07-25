import "server-only";

import { LeadAnalysisModel, LeadInputModel } from "@flyt-breif/db";

import type { StoredLeadSubmission } from "@/lib/lead-submissions";

const MAX_STORED_SUBMISSIONS = 50;

export async function storeLeadSubmission(
  submission: Omit<StoredLeadSubmission, "id" | "submittedAt">,
) {
  const leadInputRecord = await LeadInputModel.create(submission.leadInput);
  const analysisRecord = await LeadAnalysisModel.create({
    ...submission.analysis,
    analysisStatus: submission.analysisStatus,
    leadInputId: leadInputRecord._id,
    modelId: submission.modelId,
    statusMessage: submission.statusMessage,
  });

  return {
    ...submission,
    id: analysisRecord._id.toString(),
    submittedAt: analysisRecord.createdAt.toISOString(),
  };
}

export async function listLeadSubmissions(): Promise<StoredLeadSubmission[]> {
  const analysisRecords = await LeadAnalysisModel.find()
    .sort({ createdAt: -1 })
    .limit(MAX_STORED_SUBMISSIONS)
    .lean();

  const leadInputIds = analysisRecords
    .map((record) => record.leadInputId)
    .filter(Boolean);
  const leadInputRecords = await LeadInputModel.find({
    _id: { $in: leadInputIds },
  }).lean();
  const leadInputsById = new Map(
    leadInputRecords.map((record) => [record._id.toString(), record]),
  );

  return analysisRecords.flatMap((record) => {
    const leadInputId = record.leadInputId?.toString();
    const leadInput = leadInputId ? leadInputsById.get(leadInputId) : undefined;

    if (!leadInput) {
      return [];
    }

    const {
      _id,
      __v: _analysisVersion,
      analysisStatus,
      createdAt,
      leadInputId: _leadInputId,
      modelId,
      statusMessage,
      updatedAt: _updatedAt,
      ...analysis
    } = record;
    const {
      _id: _leadInputRecordId,
      __v: _leadInputVersion,
      createdAt: _leadInputCreatedAt,
      updatedAt: _leadInputUpdatedAt,
      ...leadInputData
    } = leadInput;

    return [
      {
        analysis,
        analysisStatus,
        id: _id.toString(),
        leadInput: leadInputData,
        modelId,
        statusMessage,
        submittedAt: createdAt.toISOString(),
      },
    ];
  });
}
