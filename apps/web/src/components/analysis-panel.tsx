"use client";

import {
  type BANTQualification,
  type BantItem,
  type EmailSequenceStep,
  type LeadAnalysis,
  qualificationSignals,
} from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@flyt-breif/ui/components/card";
import { toast } from "@flyt-breif/ui/components/sonner";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileText,
  LoaderCircle,
  Mail,
  Radar,
  RefreshCcw,
  Route,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCheck,
} from "lucide-react";

export type AnalysisPanelState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string; details?: readonly string[] }
  | {
      status: "success";
      analysis: LeadAnalysis;
      analysisStatus: AnalysisGenerationStatus;
      modelId: string;
      statusMessage?: string;
    };

export type AnalysisGenerationStatus = "ai" | "fallback";

type AnalysisPanelProps = {
  onRetry?: () => void;
  state: AnalysisPanelState;
};

type BadgeTone = "default" | "strong" | "success" | "warning" | "muted" | "danger";

const loadingPipeline = [
  "Parsing lead",
  "Researching account",
  "Scoring qualification",
  "Matching case study",
  "Drafting outreach",
  "Preparing AE handoff",
] as const;

export function AnalysisPanel({ onRetry, state }: AnalysisPanelProps) {
  const summaryCards = getSummaryCards(state);

  return (
    <section className="flex min-h-[680px] flex-1 flex-col overflow-hidden border bg-background shadow-[0_16px_40px_rgba(12,35,29,0.08)] lg:min-h-0">
      <div className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-[#fbfdf9] px-5 py-2">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-emerald-700">
            <Radar className="size-3.5" />
            Sales intelligence cockpit
          </div>
          <h2 className="mt-1 text-sm font-semibold">Analysis Results</h2>
          <p className="text-xs text-muted-foreground">{getPanelSubtitle(state)}</p>
        </div>
        {state.status === "success" ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ModelStatusIndicator
              analysisStatus={state.analysisStatus}
              modelId={state.modelId}
              statusMessage={state.statusMessage}
            />
            <AnalysisWorkflowActions analysis={state.analysis} />
          </div>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {state.status === "loading" ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            {state.status === "loading" ? "Running" : "Server AI"}
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {summaryCards.map((card, index) => (
            <Card
              key={card.label}
              size="sm"
              className={summaryCardClassName(index, state.status)}
            >
              <CardHeader>
                <CardTitle>{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="break-words text-sm font-semibold">{card.value}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {card.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {state.status === "success" ? (
          <SuccessDemoRibbon
            analysis={state.analysis}
            analysisStatus={state.analysisStatus}
          />
        ) : null}

        <div className="mt-4">
          {state.status === "success"
            ? renderAnalysisCockpit(
                state.analysis,
                state.modelId,
                state.analysisStatus,
                state.statusMessage,
              )
            : renderNonSuccessState(state, onRetry)}
        </div>
      </div>
    </section>
  );
}

function ModelStatusIndicator({
  analysisStatus,
  modelId,
  statusMessage,
}: {
  analysisStatus: AnalysisGenerationStatus;
  modelId: string;
  statusMessage?: string;
}) {
  const isFallback = analysisStatus === "fallback";

  return (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-2 text-xs">
      <Badge tone={isFallback ? "warning" : "success"}>
        {isFallback ? "Fallback" : "Gemini"}
      </Badge>
      <span className="max-w-44 truncate border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
        {modelId}
      </span>
      {statusMessage ? (
        <span className="hidden max-w-64 truncate text-[10px] text-muted-foreground xl:inline">
          {statusMessage}
        </span>
      ) : null}
    </div>
  );
}

function AnalysisWorkflowActions({ analysis }: { analysis: LeadAnalysis }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => void copyWorkflowText("AE summary", buildAeSummaryText(analysis))}
      >
        <Copy />
        Copy AE Summary
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => void copyWorkflowText("Email sequence", buildEmailSequenceText(analysis))}
      >
        <Copy />
        Copy Email Sequence
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => exportWorkflowMarkdown(analysis)}
      >
        <Download />
        Export Markdown
      </Button>
    </div>
  );
}

function SuccessDemoRibbon({
  analysis,
  analysisStatus,
}: {
  analysis: LeadAnalysis;
  analysisStatus: AnalysisGenerationStatus;
}) {
  const bantTotal = getBantTotal(analysis.qualification);
  const handoffQuestions = analysis.aeHandoffSummary.topDiscoveryQuestions.length;

  return (
    <section className="mt-3 border bg-[#172b24] p-4 text-[#f4fbf4] shadow-[0_18px_45px_rgba(12,35,29,0.16)]">
      <div className="grid gap-3 xl:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-emerald-200/80">
            <Award className="size-3.5 text-emerald-300" />
            Demo outcome
          </div>
          <p className="mt-2 text-lg font-semibold">
            {analysis.leadSnapshot.companyName} is ready for sales action
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-emerald-50/75">
            {analysis.matchedCaseStudy.title} supports the recommended{" "}
            {analysis.gtmRecommendation.recommendedMotion} motion.
          </p>
        </div>
        <OutcomeStat label="Lead score" value={`${analysis.leadSnapshot.leadScore}/100`} />
        <OutcomeStat label="BANT total" value={`${bantTotal}/20`} />
        <OutcomeStat label="Case study" value={analysis.matchedCaseStudy.caseStudyId.includes("enbw") ? "EnBW" : analysis.matchedCaseStudy.title} />
        <OutcomeStat
          label={analysisStatus === "fallback" ? "Demo safety" : "Model"}
          value={analysisStatus === "fallback" ? "Fallback" : "Gemini"}
          detail={`${handoffQuestions} AE questions`}
        />
      </div>
    </section>
  );
}

function OutcomeStat({
  detail,
  label,
  value,
}: {
  detail?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 border border-white/15 bg-white/10 p-3">
      <p className="text-[10px] uppercase tracking-normal text-emerald-100/70">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-white">{value}</p>
      {detail ? <p className="mt-1 truncate text-xs text-emerald-50/70">{detail}</p> : null}
    </div>
  );
}

function renderAnalysisCockpit(
  analysis: LeadAnalysis,
  modelId: string,
  analysisStatus: AnalysisGenerationStatus,
  statusMessage?: string,
) {
  return (
    <div className="space-y-4">
      <LeadSnapshotSection analysis={analysis} />
      <BantQualificationSection qualification={analysis.qualification} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AccountResearchSection analysis={analysis} />
        <CaseStudyMatchSection analysis={analysis} />
      </div>

      <GtmMotionSection analysis={analysis} />
      <EmailSequenceSection steps={analysis.emailSequence.steps} strategy={analysis.emailSequence.strategy} />
      <AeHandoffSection analysis={analysis} />
      <AnalysisSignalsSection
        analysis={analysis}
        analysisStatus={analysisStatus}
        modelId={modelId}
        statusMessage={statusMessage}
      />
    </div>
  );
}

function LeadSnapshotSection({ analysis }: { analysis: LeadAnalysis }) {
  const { leadSnapshot } = analysis;

  return (
    <section className="border border-emerald-700/20 bg-card shadow-[0_12px_34px_rgba(12,35,29,0.08)]">
      <SectionHeader
        eyebrow="Lead Snapshot"
        icon={<Target />}
        title={leadSnapshot.companyName}
        action={<ConfidenceBadge value={analysis.confidence} />}
      />
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="Lead score" value={`${leadSnapshot.leadScore}/100`} />
            <Metric label="Qualification" value={formatLabel(leadSnapshot.qualificationLabel)} />
            <Metric label="Urgency" value={formatLabel(leadSnapshot.urgency)} />
            <Metric label="Region" value={leadSnapshot.region} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="border bg-background p-3">
              <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
                Contact
              </p>
              <p className="mt-1 text-sm font-semibold">{leadSnapshot.contactName}</p>
              <p className="mt-1 text-xs text-muted-foreground">{leadSnapshot.contactRole}</p>
            </div>
            <div className="border bg-background p-3">
              <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
                Use Case
              </p>
              <p className="mt-1 text-sm font-semibold">{leadSnapshot.useCase}</p>
              <p className="mt-1 text-xs text-muted-foreground">{leadSnapshot.industry}</p>
            </div>
          </div>
        </div>

        <div className="border bg-background p-3">
          <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
            Sales posture
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={scoreTone(leadSnapshot.leadScore)}>
              {formatLabel(leadSnapshot.qualificationLabel)}
            </Badge>
            <Badge tone={urgencyTone(leadSnapshot.urgency)}>
              {formatLabel(leadSnapshot.urgency)} urgency
            </Badge>
            <Badge tone={priorityTone(analysis.gtmRecommendation.priority)}>
              {formatLabel(analysis.gtmRecommendation.priority)} priority
            </Badge>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {analysis.gtmRecommendation.nextBestAction}
          </p>
        </div>
      </div>
    </section>
  );
}

function BantQualificationSection({
  qualification,
}: {
  qualification: BANTQualification;
}) {
  return (
    <section className="space-y-3">
      <SectionLabel icon={<ShieldCheck />} title="BANT Qualification Cards" />
      <div className="grid gap-3 xl:grid-cols-4">
        {getBantRows(qualification).map((row) => (
          <Card
            key={row.label}
            size="sm"
            className={[
              "min-h-52 border bg-card shadow-[0_10px_28px_rgba(12,35,29,0.06)]",
              row.item.score >= 4
                ? "border-emerald-600/25"
                : row.item.score >= 2
                  ? "border-amber-600/25"
                  : "border-destructive/25",
            ].join(" ")}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{row.label}</CardTitle>
                <ScoreBadge score={row.item.score} />
              </div>
            </CardHeader>
            <CardContent>
              <ScoreBar value={row.item.score} max={5} />
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
                  Evidence
                </p>
                <ChipList items={row.item.evidence} limit={3} />
              </div>
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
                  Missing
                </p>
                <ChipList items={row.item.missingInfo} limit={2} tone="warning" />
              </div>
              <p className="mt-3 border-t pt-3 text-xs leading-5 text-muted-foreground">
                {row.item.discoveryQuestion}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function AccountResearchSection({ analysis }: { analysis: LeadAnalysis }) {
  const { accountResearch } = analysis;

  return (
    <section className="border bg-card shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
      <SectionHeader
        eyebrow="Account Research"
        icon={<BriefcaseBusiness />}
        title={accountResearch.companyOverview}
        action={<Badge tone="muted">{accountResearch.sources.length} sources</Badge>}
      />
      <div className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Metric label="Industry" value={accountResearch.industry} />
          <Metric label="Region" value={accountResearch.region} />
          <Metric label="Company size" value={accountResearch.companySize} />
          <Metric label="Headquarters" value={accountResearch.headquarters} />
        </div>

        <TextBlock label="Operating context" value={accountResearch.operatingContext} />

        <div className="grid gap-4 md:grid-cols-2">
          <ListBlock
            label="Key account signals"
            items={accountResearch.keySignals}
            icon={<Radar />}
          />
          <ListBlock
            label="Likely buying committee"
            items={accountResearch.likelyBuyingCommittee}
            icon={<UserRoundCheck />}
          />
        </div>

        <ListBlock
          label="Research gaps"
          items={accountResearch.researchGaps}
          icon={<CircleDashed />}
          tone="warning"
        />
      </div>
    </section>
  );
}

function CaseStudyMatchSection({ analysis }: { analysis: LeadAnalysis }) {
  const { matchedCaseStudy } = analysis;

  return (
    <section className="border border-emerald-700/25 bg-card shadow-[0_12px_34px_rgba(12,35,29,0.08)]">
      <SectionHeader
        eyebrow="Case Study Match"
        icon={<SearchCheck />}
        title={matchedCaseStudy.title}
        action={<ConfidenceBadge value={matchedCaseStudy.confidence} />}
      />
      <div className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Industry" value={matchedCaseStudy.industry} />
          <Metric label="Region" value={matchedCaseStudy.region} />
        </div>
        <TextBlock label="Relevance rationale" value={matchedCaseStudy.relevanceRationale} />
        <TextBlock label="Recommended email line" value={matchedCaseStudy.recommendedEmailLine} />

        <div>
          <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
            Matched use cases
          </p>
          <ChipList items={matchedCaseStudy.matchedUseCases} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
            Matched pain points
          </p>
          <ChipList items={matchedCaseStudy.matchedPainPoints} tone="warning" />
        </div>
        <ListBlock
          label="Proof points"
          items={matchedCaseStudy.proofPoints}
          icon={<CheckCircle2 />}
        />
        <a
          href={matchedCaseStudy.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 border px-2 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Open case study
          <ExternalLink className="size-3" />
        </a>
      </div>
    </section>
  );
}

function GtmMotionSection({ analysis }: { analysis: LeadAnalysis }) {
  const { gtmRecommendation } = analysis;

  return (
    <section className="border bg-card shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
      <SectionHeader
        eyebrow="GTM Motion Recommendation"
        icon={<Route />}
        title={gtmRecommendation.recommendedMotion}
        action={<Badge tone={priorityTone(gtmRecommendation.priority)}>{formatLabel(gtmRecommendation.priority)} priority</Badge>}
      />
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Metric label="Primary persona" value={gtmRecommendation.primaryPersona} />
            <Metric label="Recommended offer" value={gtmRecommendation.recommendedOffer} />
          </div>
          <TextBlock label="Positioning" value={gtmRecommendation.positioning} />
          <TextBlock label="Next best action" value={gtmRecommendation.nextBestAction} />
        </div>
        <div className="space-y-4">
          <ListBlock
            label="Discovery focus"
            items={gtmRecommendation.discoveryFocus}
            icon={<Target />}
          />
          <ListBlock
            label="Risk notes"
            items={gtmRecommendation.riskNotes}
            icon={<AlertCircle />}
            tone="warning"
          />
        </div>
      </div>
    </section>
  );
}

function EmailSequenceSection({
  steps,
  strategy,
}: {
  steps: readonly EmailSequenceStep[];
  strategy: string;
}) {
  return (
    <section className="border bg-card shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
      <SectionHeader
        eyebrow="Adaptive Email Sequence"
        icon={<Mail />}
        title={strategy}
        action={<Badge tone="muted">{steps.length} steps</Badge>}
      />
      <div className="grid gap-3 p-4 xl:grid-cols-3">
        {steps.map((step) => (
          <div key={`${step.step}-${step.subject}`} className="border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
                  Step {step.step} - {formatEmailStepType(step.type)}
                </p>
                <p className="mt-1 text-sm font-semibold">{step.subject}</p>
              </div>
              <Badge tone="muted">
                {step.delayDays === 0 ? "Same day" : `Day +${step.delayDays}`}
              </Badge>
            </div>
            <TextBlock label="Purpose" value={step.purpose} />
            <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
              {step.body}
            </p>
            <div className="mt-3 border-t pt-3">
              <p className="flex items-center gap-1 text-xs font-medium">
                <Send className="size-3.5" />
                {step.callToAction}
              </p>
              <ChipList items={step.personalizationNotes} limit={3} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AeHandoffSection({ analysis }: { analysis: LeadAnalysis }) {
  const { aeHandoffSummary } = analysis;

  return (
    <section className="border border-emerald-700/25 bg-card shadow-[0_14px_38px_rgba(12,35,29,0.09)]">
      <SectionHeader
        eyebrow="AE Handoff Summary"
        icon={<ClipboardList />}
        title={aeHandoffSummary.summary}
        action={<Badge tone="strong">AE ready</Badge>}
      />
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <TextBlock
            label="Why this lead matters"
            value={aeHandoffSummary.whyThisLeadMatters}
          />
          <TextBlock label="Pain hypothesis" value={aeHandoffSummary.painHypothesis} />
          <ListBlock
            label="Evidence"
            items={aeHandoffSummary.evidence}
            icon={<CheckCircle2 />}
          />
          <ListBlock
            label="Recommended next steps"
            items={aeHandoffSummary.recommendedNextSteps}
            icon={<ArrowUpRight />}
          />
        </div>
        <div className="space-y-4">
          <ListBlock
            label="Missing info"
            items={aeHandoffSummary.missingInfo}
            icon={<CircleDashed />}
            tone="warning"
          />
          <ListBlock
            label="Top discovery questions"
            items={aeHandoffSummary.topDiscoveryQuestions}
            icon={<Target />}
          />
          <ListBlock
            label="Risk notes"
            items={aeHandoffSummary.riskNotes}
            icon={<AlertCircle />}
            tone="danger"
          />
          <ListBlock
            label="Suggested call agenda"
            items={aeHandoffSummary.suggestedCallAgenda}
            icon={<FileText />}
          />
          <Metric label="GTM owner" value={aeHandoffSummary.gtmOwner} />
        </div>
      </div>
    </section>
  );
}

function AnalysisSignalsSection({
  analysis,
  analysisStatus,
  modelId,
  statusMessage,
}: {
  analysis: LeadAnalysis;
  analysisStatus: AnalysisGenerationStatus;
  modelId: string;
  statusMessage?: string;
}) {
  const { parsedSignals } = analysis;
  const isFallback = analysisStatus === "fallback";

  return (
    <section className="border bg-card shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
      <SectionHeader
        eyebrow="Analysis Signals Debug Panel"
        icon={<BarChart3 />}
        title="Validated structured output and source trace"
        action={
          <div className="flex items-center gap-2">
            <Badge tone={isFallback ? "warning" : "success"}>
              {isFallback ? "Fallback" : "AI"}
            </Badge>
            <Badge tone="muted">{modelId}</Badge>
          </div>
        }
      />
      <div className="grid gap-4 p-4 xl:grid-cols-3">
        <div className="space-y-4">
          <Metric
            label="Generation status"
            value={isFallback ? "Deterministic fallback" : "Gemini validated"}
          />
          {statusMessage ? <TextBlock label="Status message" value={statusMessage} /> : null}
          <Metric label="Contact email" value={parsedSignals.contactEmail} />
          <Metric label="Company website" value={parsedSignals.companyWebsite} />
          <ListBlock label="Pain points" items={parsedSignals.painPoints} icon={<AlertCircle />} />
          <ListBlock
            label="Business triggers"
            items={parsedSignals.businessTriggers}
            icon={<Radar />}
          />
        </div>
        <div className="space-y-4">
          <SignalChipGroup label="Budget signals" items={parsedSignals.budgetSignals} />
          <SignalChipGroup label="Authority signals" items={parsedSignals.authoritySignals} />
          <SignalChipGroup label="Need signals" items={parsedSignals.needSignals} />
          <SignalChipGroup label="Timeline signals" items={parsedSignals.timelineSignals} />
          <SignalChipGroup label="Missing info" items={parsedSignals.missingInfo} tone="warning" />
        </div>
        <div className="space-y-4">
          <ListBlock
            label="Warnings"
            items={analysis.warnings}
            icon={<AlertCircle />}
            tone="warning"
          />
          <div>
            <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
              Sources
            </p>
            <div className="mt-2 space-y-2">
              {analysis.sources.map((source) => (
                <div key={`${source.title}-${source.sourceType}`} className="border bg-background p-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium">{source.title}</p>
                    <Badge tone="muted">{source.sourceType}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used for: {source.usedFor.join(", ")}
                  </p>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      Open source
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderNonSuccessState(state: AnalysisPanelState, onRetry?: () => void) {
  if (state.status === "loading") {
    return (
      <section className="border bg-card shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
        <SectionHeader
          eyebrow="Loading Pipeline"
          icon={<LoaderCircle className="animate-spin" />}
          title="Building sales cockpit"
          action={<Badge tone="strong">In progress</Badge>}
        />
        <div className="grid gap-4 p-4 xl:grid-cols-[1fr_320px]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {loadingPipeline.map((step, index) => (
              <div key={step} className="border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium">{step}</p>
                  {index === 0 ? (
                    <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <CircleDashed className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-3 h-1.5 border bg-muted">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: index === 0 ? "72%" : "18%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border bg-background p-4">
            <p className="text-sm font-semibold">Pipeline running</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              FlytBDR is validating the lead, preparing account context, scoring BANT,
              matching FlytBase proof, and assembling outreach plus AE handoff content.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="border bg-card shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
        <SectionHeader
          eyebrow="Analysis Error"
          icon={<AlertCircle />}
          title="Analysis did not complete"
          action={
            <div className="flex items-center gap-2">
              <Badge tone="danger">Needs attention</Badge>
              <Button variant="outline" size="sm" onClick={onRetry} disabled={!onRetry}>
                <RefreshCcw />
                Retry
              </Button>
            </div>
          }
        />
        <div className="p-4">
          <div className="border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-semibold">{state.error}</p>
            {state.details && state.details.length > 0 ? (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {state.details.slice(0, 8).map((detail) => (
                  <p key={detail}>{detail}</p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border bg-card shadow-[0_12px_34px_rgba(12,35,29,0.06)]">
      <SectionHeader
        eyebrow="Sales Cockpit"
        icon={<Sparkles />}
        title="Ready for inbound lead analysis"
        action={<Badge tone="muted">Empty</Badge>}
      />
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {loadingPipeline.map((step) => (
            <div key={step} className="border bg-background p-3">
              <div className="flex items-center gap-2">
                <CircleDashed className="size-4 text-muted-foreground" />
                <p className="text-xs font-medium">{step}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 border bg-background p-4">
          <p className="text-sm font-semibold">No analysis yet</p>
          <p className="text-xs leading-5 text-muted-foreground">
            The cockpit is waiting for a validated lead run. When analysis completes,
            this panel will show qualification, FlytBase proof, GTM motion, outreach,
            handoff notes, and the generation status.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Primary proof path" value="EnBW solar PV" />
            <Metric label="Demo-safe mode" value="Fallback ready" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  action,
  eyebrow,
  icon,
  title,
}: {
  action?: React.ReactNode;
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b bg-[#fbfdf9] px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
          <span className="[&_svg]:size-3.5">{icon}</span>
          <span>{eyebrow}</span>
        </div>
        <h3 className="mt-1 break-words text-sm font-semibold">{title}</h3>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      <h3>{title}</h3>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border bg-background p-3 shadow-[0_6px_18px_rgba(12,35,29,0.035)]">
      <p className="text-[10px] uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{value}</p>
    </div>
  );
}

function ListBlock({
  icon,
  items,
  label,
  tone = "default",
}: {
  icon: React.ReactNode;
  items: readonly string[];
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-normal text-muted-foreground">
        <span className="[&_svg]:size-3.5">{icon}</span>
        {label}
      </p>
      <div className="mt-2 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="flex gap-2 text-xs leading-5">
              <span className="mt-2 size-1.5 shrink-0 border bg-muted" />
              <span className={tone === "default" ? "text-muted-foreground" : ""}>
                {item}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No signals provided.</p>
        )}
      </div>
    </div>
  );
}

function SignalChipGroup({
  items,
  label,
  tone = "default",
}: {
  items: readonly string[];
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-normal text-muted-foreground">{label}</p>
      <ChipList items={items} tone={tone} />
    </div>
  );
}

function ChipList({
  items,
  limit,
  tone = "default",
}: {
  items: readonly string[];
  limit?: number;
  tone?: BadgeTone;
}) {
  const visibleItems = limit ? items.slice(0, limit) : items;
  const hiddenCount = limit && items.length > limit ? items.length - limit : 0;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {visibleItems.length > 0 ? (
        visibleItems.map((item) => (
          <Badge key={item} tone={tone}>
            {item}
          </Badge>
        ))
      ) : (
        <Badge tone="muted">No evidence</Badge>
      )}
      {hiddenCount ? <Badge tone="muted">+{hiddenCount}</Badge> : null}
    </div>
  );
}

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1 border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-normal",
        badgeToneClassName(tone),
      ].join(" ")}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  return (
    <Badge tone={confidenceTone(value)}>
      {Math.round(value * 100)}% confidence
    </Badge>
  );
}

function ScoreBadge({ score }: { score: BantItem["score"] }) {
  return <Badge tone={score >= 4 ? "success" : score >= 2 ? "warning" : "danger"}>{score}/5</Badge>;
}

function ScoreBar({ max, value }: { max: number; value: number }) {
  const width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;

  return (
    <div className="h-2.5 border bg-muted">
      <div className={["h-full", scoreBarClassName(value)].join(" ")} style={{ width }} />
    </div>
  );
}

function getBantRows(qualification: BANTQualification): readonly {
  label: string;
  item: BantItem;
}[] {
  return [
    { label: "Budget", item: qualification.budget },
    { label: "Authority", item: qualification.authority },
    { label: "Need", item: qualification.need },
    { label: "Timeline", item: qualification.timeline },
  ];
}

function getBantTotal(qualification: BANTQualification) {
  return getBantRows(qualification).reduce(
    (total, row) => total + row.item.score,
    0,
  );
}

function summaryCardClassName(index: number, status: AnalysisPanelState["status"]) {
  if (status === "success") {
    if (index === 0) {
      return "border-emerald-700/25 bg-emerald-500/10 shadow-[0_10px_28px_rgba(12,35,29,0.06)]";
    }

    if (index === 1) {
      return "border-amber-700/25 bg-amber-500/10 shadow-[0_10px_28px_rgba(83,58,14,0.05)]";
    }

    return "border-sky-700/20 bg-sky-500/10 shadow-[0_10px_28px_rgba(14,57,83,0.05)]";
  }

  return "border-border bg-card shadow-[0_8px_24px_rgba(12,35,29,0.04)]";
}

function scoreBarClassName(score: number) {
  if (score >= 4) {
    return "bg-emerald-600";
  }

  if (score >= 2) {
    return "bg-amber-500";
  }

  return "bg-destructive";
}

async function copyWorkflowText(label: string, text: string) {
  try {
    await writeClipboardText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea path for browsers that gate clipboard access.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

function exportWorkflowMarkdown(analysis: LeadAnalysis) {
  try {
    const markdown = buildAnalysisMarkdown(analysis);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flytbdr-${slugify(analysis.leadSnapshot.companyName)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Markdown exported");
  } catch {
    toast.error("Could not export markdown");
  }
}

function buildAeSummaryText(analysis: LeadAnalysis) {
  return [
    `# AE Handoff: ${analysis.leadSnapshot.companyName}`,
    formatLeadSnapshotMarkdown(analysis, "##"),
    formatAeHandoffMarkdown(analysis, "##"),
    formatWarningsMarkdown(analysis, "##"),
  ].join("\n\n");
}

function buildEmailSequenceText(analysis: LeadAnalysis) {
  return [
    `# Email Sequence: ${analysis.leadSnapshot.companyName}`,
    formatEmailSequenceMarkdown(analysis, "##"),
  ].join("\n\n");
}

function buildAnalysisMarkdown(analysis: LeadAnalysis) {
  return [
    `# FlytBDR Copilot Analysis: ${analysis.leadSnapshot.companyName}`,
    `Confidence: ${formatPercent(analysis.confidence)}`,
    formatLeadSnapshotMarkdown(analysis, "##"),
    formatQualificationMarkdown(analysis, "##"),
    formatAccountResearchMarkdown(analysis, "##"),
    formatCaseStudyMarkdown(analysis, "##"),
    formatGtmMotionMarkdown(analysis, "##"),
    formatEmailSequenceMarkdown(analysis, "##"),
    formatAeHandoffMarkdown(analysis, "##"),
    formatWarningsMarkdown(analysis, "##"),
    formatSourcesMarkdown(analysis, "##"),
  ].join("\n\n");
}

function formatLeadSnapshotMarkdown(analysis: LeadAnalysis, heading: string) {
  const { leadSnapshot, parsedSignals } = analysis;

  return [
    `${heading} Lead Snapshot`,
    markdownFields([
      ["Company", leadSnapshot.companyName],
      ["Contact", `${leadSnapshot.contactName} (${leadSnapshot.contactRole})`],
      ["Sender email", parsedSignals.contactEmail],
      ["Website", parsedSignals.companyWebsite],
      ["Industry", leadSnapshot.industry],
      ["Region", leadSnapshot.region],
      ["Use case", leadSnapshot.useCase],
      ["Urgency", formatLabel(leadSnapshot.urgency)],
      ["Lead score", `${leadSnapshot.leadScore}/100`],
      ["Qualification", formatLabel(leadSnapshot.qualificationLabel)],
    ]),
    `${heading}# Parsed Signals`,
    markdownFields([
      ["Pain points", inlineList(parsedSignals.painPoints)],
      ["Business triggers", inlineList(parsedSignals.businessTriggers)],
      ["Budget signals", inlineList(parsedSignals.budgetSignals)],
      ["Authority signals", inlineList(parsedSignals.authoritySignals)],
      ["Need signals", inlineList(parsedSignals.needSignals)],
      ["Timeline signals", inlineList(parsedSignals.timelineSignals)],
    ]),
  ].join("\n\n");
}

function formatQualificationMarkdown(analysis: LeadAnalysis, heading: string) {
  const sectionHeading = `${heading}#`;

  return [
    `${heading} Qualification`,
    ...getBantRows(analysis.qualification).map(({ label, item }) =>
      [
        `${sectionHeading} ${label} (${item.score}/5)`,
        "**Evidence**",
        markdownList(item.evidence),
        "**Missing Info**",
        markdownList(item.missingInfo),
        `**Discovery Question:** ${item.discoveryQuestion}`,
      ].join("\n\n"),
    ),
  ].join("\n\n");
}

function formatAccountResearchMarkdown(analysis: LeadAnalysis, heading: string) {
  const { accountResearch } = analysis;

  return [
    `${heading} Account Research`,
    markdownFields([
      ["Company overview", accountResearch.companyOverview],
      ["Industry", accountResearch.industry],
      ["Region", accountResearch.region],
      ["Company size", accountResearch.companySize],
      ["Headquarters", accountResearch.headquarters],
      ["Operating context", accountResearch.operatingContext],
    ]),
    "**Key Signals**",
    markdownList(accountResearch.keySignals),
    "**Likely Buying Committee**",
    markdownList(accountResearch.likelyBuyingCommittee),
    "**Research Gaps**",
    markdownList(accountResearch.researchGaps),
  ].join("\n\n");
}

function formatCaseStudyMarkdown(analysis: LeadAnalysis, heading: string) {
  const match = analysis.matchedCaseStudy;

  return [
    `${heading} Case Study Match`,
    markdownFields([
      ["Title", match.title],
      ["Industry", match.industry],
      ["Region", match.region],
      ["Confidence", formatPercent(match.confidence)],
      ["Rationale", match.relevanceRationale],
      ["Recommended email line", match.recommendedEmailLine],
      ["URL", match.url],
    ]),
    "**Matched Use Cases**",
    markdownList(match.matchedUseCases),
    "**Matched Pain Points**",
    markdownList(match.matchedPainPoints),
    "**Proof Points**",
    markdownList(match.proofPoints),
  ].join("\n\n");
}

function formatGtmMotionMarkdown(analysis: LeadAnalysis, heading: string) {
  const gtm = analysis.gtmRecommendation;

  return [
    `${heading} GTM Motion`,
    markdownFields([
      ["Priority", formatLabel(gtm.priority)],
      ["Recommended motion", gtm.recommendedMotion],
      ["Primary persona", gtm.primaryPersona],
      ["Positioning", gtm.positioning],
      ["Recommended offer", gtm.recommendedOffer],
      ["Next best action", gtm.nextBestAction],
    ]),
    "**Discovery Focus**",
    markdownList(gtm.discoveryFocus),
    "**Risk Notes**",
    markdownList(gtm.riskNotes),
  ].join("\n\n");
}

function formatEmailSequenceMarkdown(analysis: LeadAnalysis, heading: string) {
  const stepHeading = `${heading}#`;

  return [
    `${heading} Email Sequence`,
    `**Strategy:** ${analysis.emailSequence.strategy}`,
    ...analysis.emailSequence.steps.map((step) =>
      [
        `${stepHeading} ${step.step}. ${formatEmailStepType(step.type)}`,
        markdownFields([
          ["Delay", step.delayDays === 0 ? "Send immediately" : `${step.delayDays} days later`],
          ["Subject", step.subject],
          ["Purpose", step.purpose],
          ["Call to action", step.callToAction],
        ]),
        "**Body**",
        step.body.trim(),
        "**Personalization Notes**",
        markdownList(step.personalizationNotes),
      ].join("\n\n"),
    ),
  ].join("\n\n");
}

function formatAeHandoffMarkdown(analysis: LeadAnalysis, heading: string) {
  const handoff = analysis.aeHandoffSummary;
  const sectionHeading = `${heading}#`;

  return [
    `${heading} AE Handoff`,
    handoff.summary,
    `${sectionHeading} Why This Lead Matters`,
    handoff.whyThisLeadMatters,
    `${sectionHeading} Pain Hypothesis`,
    handoff.painHypothesis,
    `${sectionHeading} Evidence`,
    markdownList(handoff.evidence),
    `${sectionHeading} Missing Info`,
    markdownList(handoff.missingInfo),
    `${sectionHeading} Top Discovery Questions`,
    markdownList(handoff.topDiscoveryQuestions),
    `${sectionHeading} Suggested Call Agenda`,
    markdownList(handoff.suggestedCallAgenda),
    `${sectionHeading} Recommended Next Steps`,
    markdownList(handoff.recommendedNextSteps),
    `${sectionHeading} GTM Owner`,
    handoff.gtmOwner,
    `${sectionHeading} Risk Notes`,
    markdownList(handoff.riskNotes),
  ].join("\n\n");
}

function formatWarningsMarkdown(analysis: LeadAnalysis, heading: string) {
  return [
    `${heading} Warnings / Missing Info`,
    "**Warnings**",
    markdownList(analysis.warnings),
    "**Missing Info Rollup**",
    markdownList(getMissingInfoRollup(analysis)),
  ].join("\n\n");
}

function formatSourcesMarkdown(analysis: LeadAnalysis, heading: string) {
  const sources = collectUnique(
    [...analysis.sources, ...analysis.accountResearch.sources].map((source) => {
      const url = source.url ? ` (${source.url})` : "";
      return `${source.title}${url} - ${inlineList(source.usedFor)}`;
    }),
  );

  return [`${heading} Sources`, markdownList(sources)].join("\n\n");
}

function getMissingInfoRollup(analysis: LeadAnalysis) {
  const bantMissingInfo = getBantRows(analysis.qualification).flatMap(({ label, item }) =>
    item.missingInfo.map((info) => `${label}: ${info}`),
  );

  return collectUnique([
    ...analysis.parsedSignals.missingInfo,
    ...analysis.accountResearch.researchGaps.map((gap) => `Research gap: ${gap}`),
    ...bantMissingInfo,
    ...analysis.aeHandoffSummary.missingInfo,
    ...analysis.gtmRecommendation.riskNotes.map((note) => `GTM risk: ${note}`),
    ...analysis.aeHandoffSummary.riskNotes.map((note) => `AE risk: ${note}`),
  ]);
}

function markdownFields(fields: readonly (readonly [string, string])[]) {
  return fields
    .map(([label, value]) => `- **${label}:** ${singleLineMarkdown(value)}`)
    .join("\n");
}

function markdownList(items: readonly string[], fallback = "Not captured") {
  const cleanedItems = collectUnique(items);

  if (cleanedItems.length === 0) {
    return `- ${fallback}`;
  }

  return cleanedItems.map((item) => `- ${singleLineMarkdown(item)}`).join("\n");
}

function collectUnique(items: readonly string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function inlineList(items: readonly string[]) {
  const cleanedItems = collectUnique(items);

  return cleanedItems.length > 0 ? cleanedItems.join(", ") : "Not captured";
}

function singleLineMarkdown(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "lead-analysis";
}

function getSummaryCards(state: AnalysisPanelState) {
  if (state.status === "success") {
    const { analysis } = state;

    return [
      {
        label: "Qualification",
        value: formatLabel(analysis.leadSnapshot.qualificationLabel),
        detail: `Lead score ${analysis.leadSnapshot.leadScore}/100`,
      },
      {
        label: "Urgency",
        value: formatLabel(analysis.leadSnapshot.urgency),
        detail: `${formatLabel(analysis.gtmRecommendation.priority)} GTM priority`,
      },
      {
        label: "Next step",
        value: analysis.gtmRecommendation.recommendedMotion,
        detail:
          state.analysisStatus === "fallback"
            ? "Fallback-safe handoff generated"
            : analysis.gtmRecommendation.nextBestAction,
      },
    ];
  }

  if (state.status === "loading") {
    return [
      {
        label: "ICP fit",
        value: "Working",
        detail: "Parsing lead and matching FlytBase proof points",
      },
      {
        label: "Urgency",
        value: "Working",
        detail: "Looking for timeline and operational trigger signals",
      },
      {
        label: "Next step",
        value: "Working",
        detail: "Preparing AE-ready recommendation",
      },
    ];
  }

  if (state.status === "error") {
    return [
      {
        label: "ICP fit",
        value: "Needs retry",
        detail: state.error,
      },
      {
        label: "Urgency",
        value: "Unavailable",
        detail: "Analysis did not complete",
      },
      {
        label: "Next step",
        value: "Fix input",
        detail: "Check validation details and run again",
      },
    ];
  }

  return qualificationSignals.map((signal) => ({
    label: signal.label,
    value: "Pending",
    detail: signal.placeholder,
  }));
}

function getPanelSubtitle(state: AnalysisPanelState) {
  if (state.status === "loading") {
    return "Running sales intelligence pipeline";
  }

  if (state.status === "error") {
    return "Review input and retry";
  }

  if (state.status === "success") {
    return state.analysisStatus === "fallback"
      ? "Deterministic fallback analysis generated"
      : "Enterprise sales cockpit generated";
  }

  return "Awaiting lead intake";
}

function badgeToneClassName(tone: BadgeTone) {
  switch (tone) {
    case "strong":
      return "border-foreground bg-foreground text-background";
    case "success":
      return "border-emerald-600/30 bg-emerald-500/10 text-emerald-700";
    case "warning":
      return "border-amber-600/30 bg-amber-500/10 text-amber-700";
    case "danger":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "muted":
      return "border-border bg-muted/40 text-muted-foreground";
    case "default":
      return "border-border bg-background text-foreground";
  }
}

function confidenceTone(value: number): BadgeTone {
  if (value >= 0.75) {
    return "success";
  }

  if (value >= 0.45) {
    return "warning";
  }

  return "danger";
}

function scoreTone(score: number): BadgeTone {
  if (score >= 75) {
    return "success";
  }

  if (score >= 45) {
    return "warning";
  }

  return "danger";
}

function urgencyTone(urgency: string): BadgeTone {
  if (urgency === "critical" || urgency === "high") {
    return "success";
  }

  if (urgency === "medium") {
    return "warning";
  }

  return "muted";
}

function priorityTone(priority: string): BadgeTone {
  if (priority === "high") {
    return "success";
  }

  if (priority === "medium") {
    return "warning";
  }

  return "muted";
}

function formatLabel(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function formatEmailStepType(value?: EmailSequenceStep["type"]) {
  if (!value) {
    return "Email";
  }

  return formatLabel(value.replace(/-/g, " "));
}
