import "server-only";

import nodemailer from "nodemailer";
import { z } from "zod";

import type { StoredLeadSubmission } from "@/lib/server/lead-submissions";

export type LeadNotificationStatus =
  | { status: "sent"; messageId?: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

const optionalEnvString = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  },
  z.string().trim().min(1).optional(),
);

const notificationEnvSchema = z.object({
  EMAIL_ADMIN: optionalEnvString,
  EMAIL_SERVER_HOST: optionalEnvString,
  EMAIL_SERVER_PASSWORD: optionalEnvString,
  EMAIL_SERVER_PORT: z.coerce.number().int().positive().optional(),
  EMAIL_SERVER_USER: optionalEnvString,
});

export async function sendLeadNotificationEmail(
  submission: StoredLeadSubmission,
): Promise<LeadNotificationStatus> {
  const config = getLeadNotificationConfig();

  if (!config.success) {
    return {
      status: "skipped",
      reason: config.reason,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      auth:
        config.data.user && config.data.password
          ? {
              pass: config.data.password,
              user: config.data.user,
            }
          : undefined,
      host: config.data.host,
      port: config.data.port,
      secure: config.data.secure,
    });
    const info = await transporter.sendMail({
      from: config.data.from,
      html: buildLeadNotificationHtml(submission),
      subject: `New FlytBDR lead: ${submission.analysis.leadSnapshot.companyName}`,
      text: buildLeadNotificationText(submission),
      to: config.data.to,
    });

    return {
      status: "sent",
      messageId:
        typeof info.messageId === "string" ? info.messageId : undefined,
    };
  } catch (error) {
    return {
      status: "failed",
      reason: sanitizeNotificationReason(
        error instanceof Error ? error.message : "Unknown email error.",
      ),
    };
  }
}

function getLeadNotificationConfig():
  | {
      success: true;
      data: {
        from: string;
        host: string;
        password?: string;
        port: number;
        secure: boolean;
        to: string;
        user?: string;
      };
    }
  | { success: false; reason: string } {
  const parsed = notificationEnvSchema.safeParse({
    EMAIL_ADMIN: process.env.EMAIL_ADMIN,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
  });

  if (!parsed.success) {
    return {
      success: false,
      reason: "Lead email notification env vars are invalid.",
    };
  }

  const env = parsed.data;

  if (!env.EMAIL_ADMIN) {
    return {
      success: false,
      reason: "Set EMAIL_ADMIN to receive contact form notifications.",
    };
  }

  if (!env.EMAIL_SERVER_HOST || !env.EMAIL_SERVER_USER) {
    return {
      success: false,
      reason:
        "Lead notification email is configured, but EMAIL_SERVER_HOST or EMAIL_SERVER_USER is missing.",
    };
  }

  if (!env.EMAIL_SERVER_PASSWORD) {
    return {
      success: false,
      reason:
        "Lead notification email is configured, but EMAIL_SERVER_PASSWORD is missing.",
    };
  }

  const port = env.EMAIL_SERVER_PORT ?? 465;

  return {
    success: true,
    data: {
      from: env.EMAIL_SERVER_USER,
      host: env.EMAIL_SERVER_HOST,
      password: env.EMAIL_SERVER_PASSWORD.replace(/\s+/g, ""),
      port,
      secure: port === 465,
      to: env.EMAIL_ADMIN,
      user: env.EMAIL_SERVER_USER,
    },
  };
}

function buildLeadNotificationText(submission: StoredLeadSubmission) {
  const { analysis, leadInput } = submission;
  const { leadSnapshot } = analysis;

  return [
    `New FlytBDR lead submitted`,
    ``,
    `Company: ${leadSnapshot.companyName}`,
    `Contact: ${leadInput.senderName} <${leadInput.senderEmail}>`,
    `Website: ${leadInput.companyWebsite}`,
    `Region: ${leadInput.region}`,
    `Lead score: ${leadSnapshot.leadScore}/100`,
    `Qualification: ${formatLabel(leadSnapshot.qualificationLabel)}`,
    `GTM motion: ${analysis.gtmRecommendation.recommendedMotion}`,
    `Case study: ${analysis.matchedCaseStudy.title}`,
    `Generation: ${submission.analysisStatus}`,
    ``,
    `Use case: ${leadSnapshot.useCase}`,
    `Why it matters: ${analysis.aeHandoffSummary.whyThisLeadMatters}`,
    ``,
    `Inbound note:`,
    leadInput.rawEmail,
  ].join("\n");
}

function buildLeadNotificationHtml(submission: StoredLeadSubmission) {
  const { analysis, leadInput } = submission;
  const { leadSnapshot } = analysis;

  return `
    <div style="font-family: Inter, Arial, sans-serif; background: #292927; color: #f7f6f2; padding: 28px;">
      <div style="max-width: 720px; margin: 0 auto; border: 1px solid #45443f; border-radius: 16px; padding: 24px; background: #242421;">
        <p style="margin: 0 0 8px; color: #7db7ff; font-size: 12px; font-weight: 700; text-transform: uppercase;">New FlytBDR lead</p>
        <h1 style="margin: 0; font-size: 28px; line-height: 1.2;">${escapeHtml(leadSnapshot.companyName)}</h1>
        <p style="margin: 10px 0 0; color: #c9c7c1; font-size: 16px;">${escapeHtml(leadSnapshot.useCase)}</p>

        <div style="display: grid; gap: 12px; margin-top: 24px;">
          ${notificationRow("Contact", `${leadInput.senderName} <${leadInput.senderEmail}>`)}
          ${notificationRow("Website", leadInput.companyWebsite)}
          ${notificationRow("Region", leadInput.region)}
          ${notificationRow("Lead score", `${leadSnapshot.leadScore}/100`)}
          ${notificationRow("Qualification", formatLabel(leadSnapshot.qualificationLabel))}
          ${notificationRow("GTM motion", analysis.gtmRecommendation.recommendedMotion)}
          ${notificationRow("Case study", analysis.matchedCaseStudy.title)}
          ${notificationRow("Generation", submission.analysisStatus)}
        </div>

        <h2 style="margin: 24px 0 8px; font-size: 18px;">Why this lead matters</h2>
        <p style="margin: 0; color: #c9c7c1; line-height: 1.6;">${escapeHtml(analysis.aeHandoffSummary.whyThisLeadMatters)}</p>

        <h2 style="margin: 24px 0 8px; font-size: 18px;">Inbound note</h2>
        <pre style="white-space: pre-wrap; margin: 0; color: #c9c7c1; line-height: 1.6; font-family: Inter, Arial, sans-serif;">${escapeHtml(leadInput.rawEmail)}</pre>
      </div>
    </div>
  `;
}

function notificationRow(label: string, value: string) {
  return `
    <div style="border: 1px solid #45443f; border-radius: 12px; padding: 12px; background: #292927;">
      <p style="margin: 0 0 4px; color: #928f89; font-size: 11px; font-weight: 700; text-transform: uppercase;">${escapeHtml(label)}</p>
      <p style="margin: 0; color: #f7f6f2; font-size: 15px; font-weight: 700;">${escapeHtml(value)}</p>
    </div>
  `;
}

function formatLabel(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeNotificationReason(reason: string) {
  return reason.replace(/\s+/g, " ").trim().slice(0, 240);
}
