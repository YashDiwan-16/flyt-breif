import "server-only";

import { syncCaseStudyKnowledgeBase } from "@flyt-breif/db";

let setupPromise: Promise<void> | undefined;

export function ensureSalesIntelligenceDatabase() {
  setupPromise ??= syncCaseStudyKnowledgeBase();

  return setupPromise;
}
