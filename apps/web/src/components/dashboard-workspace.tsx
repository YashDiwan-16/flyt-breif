"use client";

import { AnalysisPanel, type AnalysisPanelState } from "@/components/analysis-panel";
import type { StoredLeadSubmission } from "@/lib/lead-submissions";
import { Button } from "@flyt-breif/ui/components/button";
import {
  AlertCircle,
  Clock3,
  Inbox,
  RefreshCcw,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdminLeadsResponse =
  | {
      ok: true;
      leads: StoredLeadSubmission[];
    }
  | {
      ok: false;
      error: string;
    };

export function DashboardWorkspace() {
  const [leads, setLeads] = useState<StoredLeadSubmission[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadLeads();
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0],
    [leads, selectedLeadId],
  );
  const panelState = getPanelState({
    error,
    isLoading,
    selectedLead,
  });

  async function loadLeads() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/leads", {
        headers: {
          Accept: "application/json",
        },
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isAdminLeadsResponse(payload) || !payload.ok) {
        setError(getAdminLeadsError(payload));
        return;
      }

      setLeads(payload.leads);
      setSelectedLeadId((currentSelectedId) => {
        if (payload.leads.some((lead) => lead.id === currentSelectedId)) {
          return currentSelectedId;
        }

        return payload.leads[0]?.id ?? "";
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load submitted leads.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid flex-1 gap-3 bg-[#292927] p-3 lg:min-h-0 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
      <section className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border bg-card shadow-[0_16px_40px_rgba(0,0,0,0.18)] lg:min-h-0">
        <div className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b bg-[#242421] px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-[#7db7ff]">
              <Inbox className="size-3.5" />
              Contact submissions
            </div>
            <h2 className="mt-1 text-xl font-semibold">Admin Queue</h2>
            <p className="text-sm leading-5 text-muted-foreground">
              Review leads submitted from the public contact form
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadLeads()}
            disabled={isLoading}
          >
            <RefreshCcw />
            Refresh
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {isLoading ? (
            <QueueNotice
              icon={<Clock3 />}
              title="Loading submitted leads"
              body="Fetching the latest contact form submissions for admin review."
            />
          ) : error ? (
            <QueueNotice
              icon={<AlertCircle />}
              title="Could not load leads"
              body={error}
              tone="danger"
            />
          ) : leads.length === 0 ? (
            <div className="space-y-4">
              <QueueNotice
                icon={<Inbox />}
                title="No submissions yet"
                body="When someone submits the public contact form, their generated sales intelligence report will appear here."
              />
              <Link
                href="/contact-us"
                className="inline-flex h-8 w-full items-center justify-center rounded-lg border bg-background px-2.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted active:scale-[0.98]"
              >
                Open contact form
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => {
                const isSelected =
                  lead.id === selectedLead?.id ||
                  (!selectedLeadId && lead.id === leads[0]?.id);

                return (
                  <button
                    key={lead.id}
                    type="button"
                    className={[
                      "w-full rounded-lg border p-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.99]",
                      isSelected
                        ? "border-[#1f5d9c]/60 bg-[#0b4f9c]/20 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                        : "bg-background hover:bg-muted/50",
                    ].join(" ")}
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {lead.analysis.leadSnapshot.companyName}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {lead.leadInput.senderName} - {lead.leadInput.region}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md border border-[#fafafa] bg-[#fafafa] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-[#060606]">
                        {lead.analysis.leadSnapshot.leadScore}/100
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <QueueChip>{formatLabel(lead.analysis.leadSnapshot.qualificationLabel)}</QueueChip>
                      <QueueChip>{lead.analysis.gtmRecommendation.recommendedMotion}</QueueChip>
                      <QueueChip>{lead.analysisStatus === "fallback" ? "Fallback" : "Gemini"}</QueueChip>
                    </div>
                    <p className="mt-3 flex items-center gap-1 text-[10px] uppercase tracking-normal text-muted-foreground">
                      <Clock3 className="size-3" />
                      {formatSubmittedAt(lead.submittedAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t bg-[#242421] p-4">
          <Link
            href="/contact-us"
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-transparent px-2.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted active:scale-[0.98] [&_svg]:size-4"
          >
            <UserRoundCheck />
            Public contact form
          </Link>
        </div>
      </section>

      <AnalysisPanel state={panelState} onRetry={() => void loadLeads()} />
    </div>
  );
}

function getPanelState({
  error,
  isLoading,
  selectedLead,
}: {
  error: string;
  isLoading: boolean;
  selectedLead?: StoredLeadSubmission;
}): AnalysisPanelState {
  if (isLoading) {
    return { status: "loading" };
  }

  if (error) {
    return { status: "error", error };
  }

  if (!selectedLead) {
    return { status: "idle" };
  }

  return {
    status: "success",
    analysis: selectedLead.analysis,
    analysisStatus: selectedLead.analysisStatus,
    modelId: selectedLead.modelId,
    statusMessage: selectedLead.statusMessage,
  };
}

function QueueNotice({
  body,
  icon,
  title,
  tone = "default",
}: {
  body: string;
  icon: React.ReactNode;
  title: string;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={[
        "rounded-lg border p-4",
        tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "bg-background",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="[&_svg]:size-4">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}

function QueueChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
      <span className="truncate">{children}</span>
    </span>
  );
}

function isAdminLeadsResponse(value: unknown): value is AdminLeadsResponse {
  return (
    isRecord(value) &&
    typeof value.ok === "boolean" &&
    (value.ok === false || Array.isArray(value.leads))
  );
}

function getAdminLeadsError(value: unknown) {
  return isRecord(value) && typeof value.error === "string"
    ? value.error
    : "Could not load submitted leads.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatSubmittedAt(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatLabel(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}
