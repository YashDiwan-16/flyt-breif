# FlytBDR Copilot

FlytBDR Copilot is an internal sales intelligence context for turning inbound FlytBase lead signals into qualified BDR and AE-ready analysis.

## Language

**Lead Input**:
The raw inbound information supplied to the copilot, including the email content, sender identity, company website, and region.
_Avoid_: Form payload, raw request

**Parsed Lead**:
The normalized buying and account signals extracted from a Lead Input before scoring or recommendation.
_Avoid_: Extracted fields, parsed email

**BANT Qualification**:
The budget, authority, need, and timeline assessment used to qualify an inbound lead.
_Avoid_: Scorecard, qualification blob

**Account Research**:
The summarized company context and research signals used to understand the account behind the inbound lead.
_Avoid_: Company lookup, enrichment dump

**Case Study Match**:
The FlytBase customer proof point selected as the closest match for the lead's industry, use case, and pain points.
_Avoid_: Reference, example customer

**GTM Motion**:
The recommended sales motion for pursuing the lead, including persona, positioning, offer, and next action.
_Avoid_: Sales recommendation, play

**Email Sequence**:
The ordered outreach emails recommended for the BDR to follow up with the lead.
_Avoid_: Cadence, nurture copy

**AE Handoff Summary**:
The concise briefing that prepares an account executive to continue the conversation with context and open questions.
_Avoid_: Handoff notes, AE brief

**Lead Analysis**:
The validated end-to-end intelligence output produced from a Lead Input.
_Avoid_: AI response, analysis result
