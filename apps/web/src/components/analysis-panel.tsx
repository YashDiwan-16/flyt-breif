"use client";

import type {
  BANTQualification,
  BantItem,
  EmailSequenceStep,
  LeadAnalysis,
  LeadInput,
  SourceCitation,
} from "@flyt-breif/core";
import { Button } from "@flyt-breif/ui/components/button";
import { toast } from "@flyt-breif/ui/components/sonner";
import {
  AlertCircle,
  ArrowUpRight,
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
} from "lucide-react";

export type AnalysisPanelState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string; details?: readonly string[] }
  | {
      status: "success";
      analysis: LeadAnalysis;
      analysisStatus: AnalysisGenerationStatus;
      leadInput: LeadInput;
      modelId: string;
      statusMessage?: string;
      submittedAt: string;
    };

export type AnalysisGenerationStatus = "ai" | "fallback";

type AnalysisPanelProps = {
  onRetry?: () => void;
  state: AnalysisPanelState;
};

type BadgeTone = "default" | "success" | "warning" | "danger" | "muted" | "strong";

const workflowSteps = [
  "Qualification",
  "Deep account research",
  "Response generation",
  "Case-study matching",
  "GTM routing",
  "AE handoff + report",
] as const;

export function AnalysisPanel({ onRetry, state }: AnalysisPanelProps) {
  return (
    <section className="flex min-h-[680px] flex-1 flex-col overflow-hidden rounded-xl border bg-background shadow-[0_16px_40px_rgba(0,0,0,0.18)] lg:min-h-0">
      <PanelHeader state={state} />
      <div className="min-h-0 flex-1 overflow-auto p-5">
        {state.status === "success"
          ? renderWorkflow(state)
          : renderEmptyState(state, onRetry)}
      </div>
    </section>
  );
}

function PanelHeader({ state }: { state: AnalysisPanelState }) {
  return (
    <div className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-[#242421] px-5 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-[#7db7ff]">
          <Radar className="size-3.5" />
          Inspectable BDR workflow
        </div>
        <h2 className="mt-1 text-xl font-semibold">
          {state.status === "success"
            ? `${state.analysis.leadSnapshot.companyName} report`
            : "FlytBase inbound lead workflow"}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
          {getPanelSubtitle(state)}
        </p>
      </div>
      {state.status === "success" ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge tone={state.analysisStatus === "fallback" ? "warning" : "success"}>
            {state.analysisStatus === "fallback" ? "Fallback validated" : "Gemini validated"}
          </Badge>
          <span className="max-w-48 truncate rounded-md border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
            {state.modelId}
          </span>
          <WorkflowActions analysis={state.analysis} />
        </div>
      ) : (
        <Badge tone={state.status === "loading" ? "strong" : "muted"}>
          {state.status === "loading" ? "Running" : "Awaiting lead"}
        </Badge>
      )}
    </div>
  );
}

function renderWorkflow(state: Extract<AnalysisPanelState, { status: "success" }>) {
  const { analysis, analysisStatus, leadInput, modelId, statusMessage, submittedAt } =
    state;
  const missingInfo = getMissingInfoRollup(analysis);
  const sources = getUniqueSources(analysis);
  const publicSourceCount = sources.filter((source) => source.url).length;
  const bantTotal = getBantTotal(analysis.qualification);

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-3 xl:sticky xl:top-0 xl:self-start">
        <div className="rounded-xl border bg-card p-4 shadow-[0_12px_34px_rgba(0,0,0,0.14)]">
          <p className="text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
            Current lead
          </p>
          <h3 className="mt-2 text-lg font-semibold">
            {analysis.leadSnapshot.companyName}
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {leadInput.senderName} · {analysis.leadSnapshot.contactRole}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric label="Score" value={`${analysis.leadSnapshot.leadScore}/100`} />
            <Metric label="BANT" value={`${bantTotal}/20`} />
            <Metric label="Motion" value={analysis.gtmRecommendation.recommendedMotion} />
            <Metric label="Sources" value={`${publicSourceCount}/${sources.length}`} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-[0_12px_34px_rgba(0,0,0,0.12)]">
          <p className="text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
            Assignment stages
          </p>
          <div className="mt-3 space-y-2">
            {workflowSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2 text-xs">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-[10px] font-semibold">
                  {index + 1}
                </span>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-[0_12px_34px_rgba(0,0,0,0.12)]">
          <p className="text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
            Run status
          </p>
          <div className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
            <p>Submitted: {formatSubmittedAt(submittedAt)}</p>
            <p>Generation: {analysisStatus === "fallback" ? "Fallback" : "AI"}</p>
            {statusMessage ? <p>{statusMessage}</p> : null}
          </div>
        </div>
      </aside>

      <div className="space-y-5">
        <StageSection
          icon={<ShieldCheck />}
          number={1}
          title="Qualification"
          subtitle="BANT is used because a contact form is sparse: it separates known operational need from missing budget, authority, and timeline."
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <InfoGrid
                items={[
                  ["Contact", `${leadInput.senderName} (${leadInput.senderEmail})`],
                  ["Role", analysis.leadSnapshot.contactRole],
                  ["Company", analysis.leadSnapshot.companyName],
                  ["Website", leadInput.companyWebsite],
                  ["Region", analysis.leadSnapshot.region],
                  ["Use case", analysis.leadSnapshot.useCase],
                ]}
              />
              <BantCards qualification={analysis.qualification} />
            </div>
            <div className="space-y-4">
              <Callout
                title="Fit assessment"
                body={`${formatLabel(analysis.leadSnapshot.qualificationLabel)} · ${analysis.leadSnapshot.urgency} urgency · ${analysis.gtmRecommendation.priority} GTM priority.`}
                tone={scoreTone(analysis.leadSnapshot.leadScore)}
              />
              <ListBlock
                icon={<CircleDashed />}
                items={missingInfo.slice(0, 10)}
                title="Missing for full qualification"
                tone="warning"
              />
            </div>
          </div>
        </StageSection>

        <StageSection
          icon={<BriefcaseBusiness />}
          number={2}
          title="Deep account research"
          subtitle="Only facts from fetched public pages and the inbound email should be treated as verified. Everything else stays inferred or unknown."
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <TextPanel title="Research brief" body={analysis.accountResearch.companyOverview} />
              <TextPanel title="Operating context" body={analysis.accountResearch.operatingContext} />
              <ListBlock
                icon={<Radar />}
                items={analysis.accountResearch.keySignals.slice(0, 12)}
                title="Public and inferred signals"
              />
            </div>
            <div className="space-y-4">
              <InfoGrid
                items={[
                  ["Industry", analysis.accountResearch.industry],
                  ["Region", analysis.accountResearch.region],
                  ["Company size", analysis.accountResearch.companySize],
                  ["Headquarters", analysis.accountResearch.headquarters],
                ]}
              />
              <ListBlock
                icon={<Target />}
                items={analysis.accountResearch.likelyBuyingCommittee}
                title="Likely buying committee"
              />
              <ListBlock
                icon={<AlertCircle />}
                items={analysis.accountResearch.researchGaps}
                title="Research gaps"
                tone="warning"
              />
            </div>
          </div>
        </StageSection>

        <StageSection
          icon={<Mail />}
          number={3}
          title="Response generation"
          subtitle="The sequence should use research context, discover BANT unknowns, and adapt to the buyer's seniority and industrial operation."
        >
          <TextPanel title="Progression logic" body={analysis.emailSequence.strategy} />
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            {analysis.emailSequence.steps.map((step) => (
              <EmailStepCard key={`${step.step}-${step.subject}`} step={step} />
            ))}
          </div>
        </StageSection>

        <StageSection
          icon={<SearchCheck />}
          number={4}
          title="Case study and material matching"
          subtitle="Matches should come from FlytBase public case-study material and explain why the material is the strongest fit."
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <TextPanel
                title={analysis.matchedCaseStudy.title}
                body={analysis.matchedCaseStudy.relevanceRationale}
              />
              <TextPanel
                title="Recommended email line"
                body={analysis.matchedCaseStudy.recommendedEmailLine}
              />
              <ListBlock
                icon={<CheckCircle2 />}
                items={analysis.matchedCaseStudy.proofPoints}
                title="Proof points"
              />
            </div>
            <div className="space-y-4">
              <InfoGrid
                items={[
                  ["Industry", analysis.matchedCaseStudy.industry],
                  ["Region", analysis.matchedCaseStudy.region],
                  ["Confidence", formatPercent(analysis.matchedCaseStudy.confidence)],
                  ["Anglo signal", detectAngloAmericanSignal(leadInput.rawEmail)],
                ]}
              />
              <ListBlock
                icon={<Target />}
                items={analysis.matchedCaseStudy.matchedUseCases}
                title="Matched use cases"
              />
              <a
                href={analysis.matchedCaseStudy.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium transition-[background-color,border-color,color,transform] duration-150 hover:bg-muted active:scale-[0.98]"
              >
                Open FlytBase material
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </StageSection>

        <StageSection
          icon={<Route />}
          number={5}
          title="Go-to-market routing"
          subtitle="Recommend Direct AE, Partner-led, or Hybrid based on fit, region, qualification risk, and implementation path."
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <InfoGrid
                items={[
                  ["Recommended motion", analysis.gtmRecommendation.recommendedMotion],
                  ["Primary persona", analysis.gtmRecommendation.primaryPersona],
                  ["Recommended offer", analysis.gtmRecommendation.recommendedOffer],
                  ["Priority", formatLabel(analysis.gtmRecommendation.priority)],
                ]}
              />
              <TextPanel title="Positioning" body={analysis.gtmRecommendation.positioning} />
              <TextPanel title="Next best action" body={analysis.gtmRecommendation.nextBestAction} />
            </div>
            <div className="space-y-4">
              <ListBlock
                icon={<Target />}
                items={analysis.gtmRecommendation.discoveryFocus}
                title="Discovery focus"
              />
              <ListBlock
                icon={<AlertCircle />}
                items={analysis.gtmRecommendation.riskNotes}
                title="Routing risks"
                tone="warning"
              />
            </div>
          </div>
        </StageSection>

        <StageSection
          icon={<ClipboardList />}
          number={6}
          title="AE handoff and report generation"
          subtitle="The AE should be able to trust what is known, what is missing, and what to ask next."
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <TextPanel title="Why this lead matters" body={analysis.aeHandoffSummary.whyThisLeadMatters} />
              <TextPanel title="Pain hypothesis" body={analysis.aeHandoffSummary.painHypothesis} />
              <ListBlock
                icon={<CheckCircle2 />}
                items={analysis.aeHandoffSummary.evidence}
                title="Evidence"
              />
              <ListBlock
                icon={<ArrowUpRight />}
                items={analysis.aeHandoffSummary.recommendedNextSteps}
                title="Recommended next steps"
              />
            </div>
            <div className="space-y-4">
              <Metric label="GTM owner" value={analysis.aeHandoffSummary.gtmOwner} />
              <ListBlock
                icon={<Target />}
                items={analysis.aeHandoffSummary.topDiscoveryQuestions}
                title="Top discovery questions"
              />
              <ListBlock
                icon={<FileText />}
                items={analysis.aeHandoffSummary.suggestedCallAgenda}
                title="Suggested call agenda"
              />
            </div>
          </div>
        </StageSection>

        <AuditTrail
          analysis={analysis}
          analysisStatus={analysisStatus}
          modelId={modelId}
          sources={sources}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  );
}

function renderEmptyState(state: AnalysisPanelState, onRetry?: () => void) {
  if (state.status === "loading") {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-[0_12px_34px_rgba(0,0,0,0.14)]">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <LoaderCircle className="size-4 animate-spin" />
          Running inbound BDR workflow
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <div key={step} className="rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium">
                  Stage {index + 1}: {step}
                </p>
                {index === 0 ? (
                  <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <CircleDashed className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="mt-3 h-1.5 rounded-full border bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: index === 0 ? "70%" : "12%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card p-5 shadow-[0_12px_34px_rgba(0,0,0,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Analysis did not complete</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{state.error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry} disabled={!onRetry}>
            <RefreshCcw />
            Retry
          </Button>
        </div>
        {state.details?.length ? (
          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            {state.details.slice(0, 8).map((detail) => (
              <p key={detail}>{detail}</p>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-[0_12px_34px_rgba(0,0,0,0.14)]">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4" />
        Waiting for a contact-form submission
      </div>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
        When a lead submits the public form, this panel will show the complete
        BDR workflow: qualification, public account research, response sequence,
        FlytBase material match, GTM routing, and AE handoff.
      </p>
    </div>
  );
}

function StageSection({
  children,
  icon,
  number,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  number: number;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-xl border bg-card shadow-[0_12px_34px_rgba(0,0,0,0.14)]">
      <div className="border-b bg-[#242421] px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-sm font-semibold">
            {number}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-[#7db7ff]">
              <span className="[&_svg]:size-3.5">{icon}</span>
              Stage {number}
            </div>
            <h3 className="mt-1 text-base font-semibold">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function BantCards({ qualification }: { qualification: BANTQualification }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {getBantRows(qualification).map(({ item, label }) => (
        <div key={label} className="rounded-lg border bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{label}</p>
            <Badge tone={bantTone(item.score)}>{item.score}/5</Badge>
          </div>
          <ScoreBar score={item.score} />
          <EvidenceSplit item={item} />
        </div>
      ))}
    </div>
  );
}

function EvidenceSplit({ item }: { item: BantItem }) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <ListBlock
        compact
        icon={<CheckCircle2 />}
        items={item.evidence}
        title="Known evidence"
      />
      <ListBlock
        compact
        icon={<CircleDashed />}
        items={item.missingInfo}
        title="Missing"
        tone="warning"
      />
      <div className="md:col-span-2">
        <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
          Discovery question
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {item.discoveryQuestion}
        </p>
      </div>
    </div>
  );
}

function EmailStepCard({ step }: { step: EmailSequenceStep }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
            Step {step.step} · {formatEmailStepType(step.type)}
          </p>
          <p className="mt-1 text-sm font-semibold">{step.subject}</p>
        </div>
        <Badge tone="muted">
          {step.delayDays === 0 ? "Same day" : `Day +${step.delayDays}`}
        </Badge>
      </div>
      <TextPanel title="Purpose" body={step.purpose} compact />
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
  );
}

function AuditTrail({
  analysis,
  analysisStatus,
  modelId,
  sources,
  statusMessage,
}: {
  analysis: LeadAnalysis;
  analysisStatus: AnalysisGenerationStatus;
  modelId: string;
  sources: readonly SourceCitation[];
  statusMessage?: string;
}) {
  return (
    <section className="rounded-xl border bg-card shadow-[0_12px_34px_rgba(0,0,0,0.14)]">
      <div className="border-b bg-[#242421] px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-normal text-[#7db7ff]">
          <BarChart3 className="size-3.5" />
          Audit trail
        </div>
        <h3 className="mt-1 text-base font-semibold">
          Sources, warnings, and validation
        </h3>
      </div>
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_360px]">
        <div>
          <p className="text-[10px] uppercase tracking-normal text-muted-foreground">
            Sources
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {sources.map((source) => (
              <div key={`${source.title}-${source.sourceType}-${source.url ?? ""}`} className="rounded-lg border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold">{source.title}</p>
                  <Badge tone={source.url ? "success" : "muted"}>{source.sourceType}</Badge>
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                  {source.usedFor.join(", ")}
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
        <div className="space-y-4">
          <InfoGrid
            items={[
              ["Generation", analysisStatus === "fallback" ? "Fallback" : "AI"],
              ["Model", modelId],
              ["Confidence", formatPercent(analysis.confidence)],
              ["Status", statusMessage ?? "Validated structured output"],
            ]}
          />
          <ListBlock
            icon={<AlertCircle />}
            items={analysis.warnings}
            title="Warnings"
            tone="warning"
          />
        </div>
      </div>
    </section>
  );
}

function WorkflowActions({ analysis }: { analysis: LeadAnalysis }) {
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
        Copy Emails
      </Button>
      <Button variant="default" size="sm" onClick={() => exportWorkflowMarkdown(analysis)}>
        <Download />
        Export Markdown
      </Button>
    </div>
  );
}

function InfoGrid({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <Metric key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border bg-background p-3 shadow-[0_6px_18px_rgba(0,0,0,0.10)]">
      <p className="text-[10px] uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function TextPanel({
  body,
  compact = false,
  title,
}: {
  body: string;
  compact?: boolean;
  title: string;
}) {
  return (
    <div className={compact ? "mt-3" : "rounded-lg border bg-background p-3"}>
      <p className="text-[10px] uppercase tracking-normal text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}

function ListBlock({
  compact = false,
  icon,
  items,
  title,
  tone = "default",
}: {
  compact?: boolean;
  icon: React.ReactNode;
  items: readonly string[];
  title: string;
  tone?: BadgeTone;
}) {
  const content = (
    <>
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-normal text-muted-foreground">
        <span className="[&_svg]:size-3.5">{icon}</span>
        {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="flex gap-2 text-xs leading-5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/55" />
              <span className={tone === "warning" ? "text-amber-200" : tone === "danger" ? "text-destructive" : "text-muted-foreground"}>
                {item}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">Not captured.</p>
        )}
      </div>
    </>
  );

  return compact ? content : <div className="rounded-lg border bg-background p-3">{content}</div>;
}

function Callout({
  body,
  title,
  tone,
}: {
  body: string;
  title: string;
  tone: BadgeTone;
}) {
  return (
    <div className={["rounded-lg border p-3", calloutClassName(tone)].join(" ")}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-xs leading-5">{body}</p>
    </div>
  );
}

function ChipList({
  items,
  limit,
  tone = "muted",
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
        "inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-normal",
        badgeToneClassName(tone),
      ].join(" ")}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-3 h-2.5 overflow-hidden rounded-full border bg-muted">
      <div
        className={["h-full rounded-full", score >= 4 ? "bg-emerald-600" : score >= 2 ? "bg-amber-500" : "bg-destructive"].join(" ")}
        style={{ width: `${Math.max(0, Math.min(100, (score / 5) * 100))}%` }}
      />
    </div>
  );
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
      // Fall through for browsers that gate clipboard access.
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
  ].join("\n\n");
}

function formatQualificationMarkdown(analysis: LeadAnalysis, heading: string) {
  return [
    `${heading} Qualification - BANT`,
    "BANT is used because a contact form can support Need quickly while Budget, Authority, and Timeline often require discovery.",
    ...getBantRows(analysis.qualification).map(({ item, label }) =>
      [
        `${heading}# ${label} (${item.score}/5)`,
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
    `${heading} Deep Account Research`,
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
    `${heading} GTM Routing`,
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
  return [
    `${heading} Response Sequence`,
    `**Strategy:** ${analysis.emailSequence.strategy}`,
    ...analysis.emailSequence.steps.map((step) =>
      [
        `${heading}# ${step.step}. ${formatEmailStepType(step.type)}`,
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

  return [
    `${heading} AE Handoff`,
    handoff.summary,
    `${heading}# Why This Lead Matters`,
    handoff.whyThisLeadMatters,
    `${heading}# Pain Hypothesis`,
    handoff.painHypothesis,
    `${heading}# Evidence`,
    markdownList(handoff.evidence),
    `${heading}# Missing Info`,
    markdownList(handoff.missingInfo),
    `${heading}# Top Discovery Questions`,
    markdownList(handoff.topDiscoveryQuestions),
    `${heading}# Suggested Call Agenda`,
    markdownList(handoff.suggestedCallAgenda),
    `${heading}# Recommended Next Steps`,
    markdownList(handoff.recommendedNextSteps),
    `${heading}# GTM Owner`,
    handoff.gtmOwner,
    `${heading}# Risk Notes`,
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
  const sources = getUniqueSources(analysis).map((source) => {
    const url = source.url ? ` (${source.url})` : "";
    return `${source.title}${url} - ${source.usedFor.join(", ")}`;
  });

  return [`${heading} Sources`, markdownList(sources)].join("\n\n");
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

function getUniqueSources(analysis: LeadAnalysis): readonly SourceCitation[] {
  const sources = [...analysis.sources, ...analysis.accountResearch.sources];
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = `${source.title}-${source.sourceType}-${source.url ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
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

function singleLineMarkdown(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "lead-analysis"
  );
}

function getPanelSubtitle(state: AnalysisPanelState) {
  if (state.status === "loading") {
    return "Running the six-stage inbound BDR workflow.";
  }

  if (state.status === "error") {
    return "Review input and retry.";
  }

  if (state.status === "success") {
    return "Qualification, public research, response sequence, FlytBase proof, GTM route, and AE handoff.";
  }

  return "Submit a contact-form lead to generate the workflow.";
}

function detectAngloAmericanSignal(rawEmail: string) {
  return /anglo\s+american/i.test(rawEmail)
    ? "Referenced in inbound note"
    : "Not referenced in inbound note";
}

function bantTone(score: BantItem["score"]): BadgeTone {
  if (score >= 4) {
    return "success";
  }

  if (score >= 2) {
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

function badgeToneClassName(tone: BadgeTone) {
  switch (tone) {
    case "strong":
      return "border-foreground bg-foreground text-background";
    case "success":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
    case "warning":
      return "border-amber-400/30 bg-amber-500/10 text-amber-200";
    case "danger":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "muted":
      return "border-border bg-muted/40 text-muted-foreground";
    case "default":
      return "border-border bg-background text-foreground";
  }
}

function calloutClassName(tone: BadgeTone) {
  switch (tone) {
    case "success":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    case "warning":
      return "border-amber-400/30 bg-amber-500/10 text-amber-100";
    case "danger":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "bg-background";
  }
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
