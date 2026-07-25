"use client";

import { AnalysisPanel, type AnalysisPanelState } from "@/components/analysis-panel";
import { LeadInputPanel } from "@/components/lead-input-panel";
import type { LeadAnalysis } from "@flyt-breif/core";
import { useState } from "react";

export function DashboardWorkspace() {
  const [analysisState, setAnalysisState] = useState<AnalysisPanelState>({
    status: "idle",
  });
  const [retryRequestId, setRetryRequestId] = useState(0);

  return (
    <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[minmax(360px,390px)_minmax(0,1fr)]">
      <LeadInputPanel
        isAnalyzing={analysisState.status === "loading"}
        onAnalyzeError={(error, details) =>
          setAnalysisState({ status: "error", error, details })
        }
        onAnalyzeStart={() => setAnalysisState({ status: "loading" })}
        onAnalyzeSuccess={(analysis: LeadAnalysis, modelId, analysisStatus, statusMessage) =>
          setAnalysisState({
            status: "success",
            analysis,
            modelId,
            analysisStatus,
            statusMessage,
          })
        }
        onSampleLoaded={() => setAnalysisState({ status: "idle" })}
        retryRequestId={retryRequestId}
      />
      <AnalysisPanel
        state={analysisState}
        onRetry={() => setRetryRequestId((current) => current + 1)}
      />
    </div>
  );
}
