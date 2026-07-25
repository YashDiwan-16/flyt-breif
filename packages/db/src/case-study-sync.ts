import { flytBaseCaseStudyKnowledgeBase } from "@flyt-breif/data";

import { CaseStudyModel } from "./models/sales-intelligence.model";

let syncPromise: Promise<void> | undefined;

export function syncCaseStudyKnowledgeBase() {
  syncPromise ??= CaseStudyModel.bulkWrite(
    flytBaseCaseStudyKnowledgeBase.map((caseStudy) => ({
      updateOne: {
        filter: { id: caseStudy.id },
        update: {
          $set: {
            ...caseStudy,
            painPoints: [...caseStudy.painPoints],
            proofPoints: [...caseStudy.proofPoints],
            keywords: [...caseStudy.keywords],
            useCases: [...caseStudy.useCases],
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  ).then(() => undefined);

  return syncPromise;
}
