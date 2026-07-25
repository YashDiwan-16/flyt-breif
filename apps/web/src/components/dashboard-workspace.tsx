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

  const sharedLeadInputProps = {
    isAnalyzing: analysisState.status === "loading",
    onAnalyzeError: (error: string, details?: readonly string[]) =>
      setAnalysisState({ status: "error", error, details }),
    onAnalyzeStart: () => setAnalysisState({ status: "loading" }),
    onAnalyzeSuccess: (
      analysis: LeadAnalysis,
      modelId: string,
      analysisStatus: "ai" | "fallback",
      statusMessage?: string,
    ) =>
      setAnalysisState({
        status: "success",
        analysis,
        modelId,
        analysisStatus,
        statusMessage,
      }),
    onReset: () => setAnalysisState({ status: "idle" }),
    retryRequestId,
  };

  if (analysisState.status === "idle") {
    return (
      <div className="flex flex-1 items-start justify-center overflow-auto p-3 md:p-6">
        <div className="w-full max-w-[560px]">
          <LeadInputPanel {...sharedLeadInputProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid flex-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[minmax(360px,410px)_minmax(0,1fr)]">
      <LeadInputPanel
        {...sharedLeadInputProps}
        mode={analysisState.status === "success" ? "submitted" : "form"}
        submittedAnalysis={
          analysisState.status === "success" ? analysisState.analysis : undefined
        }
      />
      <AnalysisPanel
        state={analysisState}
        onRetry={() => setRetryRequestId((current) => current + 1)}
      />
    </div>
  );
}
