"use client";

import { AnalysisPanel, type AnalysisPanelState } from "@/components/analysis-panel";
import { LeadInputPanel } from "@/components/lead-input-panel";
import type { LeadAnalysis } from "@flyt-breif/core";
import { useState } from "react";

export function DashboardWorkspace() {
  const [analysisState, setAnalysisState] = useState<AnalysisPanelState>({
    status: "idle",
  });

  return (
    <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[390px_1fr]">
      <LeadInputPanel
        isAnalyzing={analysisState.status === "loading"}
        onAnalyzeError={(error, details) =>
          setAnalysisState({ status: "error", error, details })
        }
        onAnalyzeStart={() => setAnalysisState({ status: "loading" })}
        onAnalyzeSuccess={(analysis: LeadAnalysis, modelId: string) =>
          setAnalysisState({ status: "success", analysis, modelId })
        }
        onSampleLoaded={() => setAnalysisState({ status: "idle" })}
      />
      <AnalysisPanel state={analysisState} />
    </div>
  );
}
