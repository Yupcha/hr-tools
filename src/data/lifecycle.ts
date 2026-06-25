// Lifecycle information architecture — the "people & moments" presentation layer.
//
// This is ADDITIVE and Home-only. It does NOT replace NAV / ALL_TOOLS /
// TOOL_BY_ID / GROUP_BY_TOOL (those stay byte-identical so every tool keeps its
// stable home in the sidebar + ⌘K). Here we simply re-cut the same 59 tools into
// the six lifecycle moments a person passes through:
//
//   Hire → Onboard → Pay → Manage → Exit → Teach
//
// `primaryIds` partition the catalog exactly once (their sum === 59). `altIds`
// let a tool *also* surface under another stage on Home without being re-counted
// (e.g. final-settlement calculators appear under Exit too). A dev-only validator
// at the bottom warns — never throws — if the partition drifts from the catalog.

import { ALL_TOOLS, type Tool } from "./catalog";

export interface Stage {
  id: string;
  /** Imperative verb shown as the moment label. */
  label: string;
  /** One-line "what you do here", person-centric. */
  blurb: string;
  icon: string;
  /** Tools that live primarily in this moment — partition the catalog (sum 59). */
  primaryIds: string[];
  /** Tools that ALSO surface here (counted in their primary stage only). */
  altIds?: string[];
}

export const STAGES: Stage[] = [
  {
    id: "hire",
    label: "Hire",
    blurb: "Source, interview and make the offer.",
    icon: "UserPlus",
    primaryIds: [
      "candidate-sourcing",
      "jd-resume-matcher",
      "interview-call-letter",
      "interview-scheduling",
      "rejection-email",
      "intent-to-hire-letter",
      "offer-letter",
      "conditional-offer-letter",
      "offer-follow-up",
    ],
  },
  {
    id: "onboard",
    label: "Onboard",
    blurb: "Bring a new hire on board and set them up.",
    icon: "DoorOpen",
    primaryIds: [
      "appointment-letter",
      "welcome-letter",
      "new-hire-announcement",
      "referral-request",
      "employment-verification",
      "password-generator",
    ],
  },
  {
    id: "pay",
    label: "Pay",
    blurb: "Salary, take-home, payslips and offer numbers.",
    icon: "Wallet",
    primaryIds: [
      // Pay documents
      "salary-slip",
      "salary-structure",
      "reimbursement-claim",
      "bonus-policy",
      // Generic pay calculators
      "salary-hike-calculator",
      "reverse-hike-calculator",
      "overtime-calculator",
      "hourly-to-salary",
      "pro-rata-salary",
      "emi-calculator",
      "gross-net-flat",
      // Region payroll / tax
      "india-take-home",
      "india-ctc-reverse",
      "india-hra-exemption",
      "us-paycheck",
      "uk-take-home",
      "europe-take-home",
      "nigeria-paye",
      "south-africa-paye",
      "india-gratuity",
      "uae-gratuity",
      "ksa-gratuity",
    ],
  },
  {
    id: "manage",
    label: "Manage",
    blurb: "Confirm, review, announce and keep your people in the loop.",
    icon: "Users",
    primaryIds: [
      "profiles",
      "probation-confirmation",
      "performance-review",
      "team-announcements",
      "policy-updates",
      "event-invitations",
      "tenure-calculator",
      "notice-period",
      "working-days",
      "age-calculator",
    ],
    altIds: ["salary-hike-calculator"], // appraisal raises also live here
  },
  {
    id: "exit",
    label: "Exit",
    blurb: "Resignation, settlement and a clean handover.",
    icon: "DoorClosed",
    primaryIds: [
      "resignation-acceptance",
      "termination-letter",
      "experience-letter",
      "relieving-letter",
      "leave-encashment",
    ],
    // Final-settlement calculators also surface here without re-counting.
    altIds: ["india-gratuity", "uae-gratuity", "ksa-gratuity", "notice-period"],
  },
  {
    id: "teach",
    label: "Teach",
    blurb: "Grades, schedules and classroom tools for teachers.",
    icon: "GraduationCap",
    primaryIds: [
      "grade-percentage",
      "cgpa-percentage",
      "attendance-calculator",
      "gpa-calculator",
      "weighted-grade",
      "lesson-planner",
      "seating-plan",
    ],
  },
];

/** Stage lookup by id. */
export const STAGE_BY_ID: Record<string, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
);

/** The stage a tool primarily belongs to (for breadcrumbs / grouping). */
export const STAGE_BY_TOOL: Record<string, Stage> = Object.fromEntries(
  STAGES.flatMap((s) => s.primaryIds.map((id) => [id, s])),
);

const TOOL_INDEX: Record<string, Tool> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.id, t]),
);

/** Resolved tools for a stage: primary first, then alts, de-duplicated. */
export function stageTools(stage: Stage): Tool[] {
  const ids = [...stage.primaryIds, ...(stage.altIds ?? [])];
  const seen = new Set<string>();
  const out: Tool[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const t = TOOL_INDEX[id];
    if (t) out.push(t);
  }
  return out;
}

// ── Dev-only partition validation (warns, never throws) ────────────────────
if (import.meta.env?.DEV) {
  const primary = STAGES.flatMap((s) => s.primaryIds);
  const counts = new Map<string, number>();
  for (const id of primary) counts.set(id, (counts.get(id) ?? 0) + 1);

  const dupes = [...counts].filter(([, n]) => n > 1).map(([id]) => id);
  if (dupes.length) console.warn("[lifecycle] tool in multiple primary stages:", dupes);

  const catalogIds = new Set(ALL_TOOLS.map((t) => t.id));
  const missing = [...catalogIds].filter((id) => !counts.has(id));
  if (missing.length) console.warn("[lifecycle] catalog tools with no stage:", missing);

  const unknown = [...counts.keys()].filter((id) => !catalogIds.has(id));
  if (unknown.length) console.warn("[lifecycle] stage ids not in catalog:", unknown);

  if (primary.length !== ALL_TOOLS.length)
    console.warn(`[lifecycle] primary count ${primary.length} ≠ catalog ${ALL_TOOLS.length}`);
}
