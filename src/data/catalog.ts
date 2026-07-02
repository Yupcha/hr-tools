// The master tool catalog. It merges three sources into one navigation model:
//   • template tools  (letters / emails / payroll docs)  — data in templates.ts
//   • calculator tools (declarative specs)               — data in calculators.ts
//   • custom tools     (richer interactive React views)  — components/custom/*
// Adding a tool = adding an entry here (+ its data/component).

import { templateRegistry } from "./templates";
import { calculatorRegistry } from "./calculators";
import type { RegionId } from "../lib/regions";

export type ToolKind = "template" | "calculator" | "custom";

/**
 * Emotional register (F4) — the *tone of the moment*, not the document tone.
 *   • "warm"    → a happy moment (offers, welcomes): a small, tasteful warmth.
 *   • "careful" → a sensitive moment (exit, termination, relieving, rejection):
 *                 the view renders quieter and adds a "handle with care" checklist.
 *   • undefined → neutral, no change.
 * Styling is token-only so both themes work automatically.
 */
export type Register = "warm" | "careful";

export interface Tool {
  id: string;
  title: string;
  description: string;
  kind: ToolKind;
  icon: string;
  region?: RegionId;
  audience?: "hr" | "teacher" | "all";
  keywords?: string;
  /** Emotional register of this moment (F4). Set centrally from REGISTER below. */
  register?: Register;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: string;
  tools: Tool[];
}

/* ── Per-calculator presentation metadata (logic lives in calculators.ts) ── */
const CALC_META: Record<string, Omit<Tool, "id" | "kind">> = {
  "salary-hike-calculator": { title: "Salary Hike Calculator", description: "New salary, increment and monthly bump after an appraisal.", icon: "TrendingUp", audience: "hr" },
  "reverse-hike-calculator": { title: "Offer Hike %", description: "Work out the effective hike between current and offered salary.", icon: "Percent", audience: "hr" },
  "overtime-calculator": { title: "Overtime Calculator", description: "Overtime pay from hourly rate, extra hours and multiplier.", icon: "Clock", audience: "all" },
  "hourly-to-salary": { title: "Hourly → Salary", description: "Convert an hourly rate into annual, monthly and weekly pay.", icon: "Banknote", audience: "all" },
  "pro-rata-salary": { title: "Pro-rata Salary", description: "Part-month salary for joiners, leavers and unpaid days.", icon: "PieChart", audience: "hr" },
  "emi-calculator": { title: "Loan / EMI Calculator", description: "Monthly EMI, total interest and payable for any loan.", icon: "Landmark", audience: "all" },
  "gross-net-flat": { title: "CTC ⇄ Take-home (flat)", description: "Convert gross↔net in either direction with a flat deduction %.", icon: "ArrowLeftRight", audience: "hr" },

  "india-take-home": { title: "India In-Hand Salary", description: "CTC → monthly take-home with PF, gratuity, PT and TDS.", icon: "Wallet", region: "IN", audience: "hr" },
  "india-gratuity": { title: "India Gratuity", description: "Gratuity under the Payment of Gratuity Act (15/26 rule).", icon: "PiggyBank", region: "IN", audience: "hr" },
  "india-hra-exemption": { title: "India HRA Exemption", description: "Exempt vs taxable HRA under Section 10(13A).", icon: "Home", region: "IN", audience: "hr" },
  "india-ctc-reverse": { title: "India CTC from In-Hand", description: "Reverse-solve the CTC needed for a target monthly take-home.", icon: "Undo2", region: "IN", audience: "hr" },
  "leave-encashment": { title: "India Leave Encashment", description: "Encashment value of unused leave on (Basic + DA).", icon: "Coins", region: "IN", audience: "hr" },
  "europe-take-home": { title: "Europe Take-Home", description: "Net pay for Germany, France, Netherlands, Ireland & Spain.", icon: "Euro", region: "EU", audience: "hr" },
  "us-paycheck": { title: "US Paycheck", description: "Net per paycheck after federal tax, FICA and state.", icon: "DollarSign", region: "US", audience: "hr" },
  "uk-take-home": { title: "UK Take-Home", description: "Net pay after Income Tax and National Insurance.", icon: "PoundSterling", region: "UK", audience: "hr" },
  "uae-gratuity": { title: "UAE End-of-Service", description: "Gratuity under UAE Labour Law (21/30 days rule).", icon: "Coins", region: "AE", audience: "hr" },
  "ksa-gratuity": { title: "Saudi End-of-Service", description: "KSA end-of-service award with resignation rules.", icon: "Coins", region: "SA", audience: "hr" },
  "nigeria-paye": { title: "Nigeria PAYE", description: "Net income after PAYE tax and pension relief.", icon: "Banknote", region: "NG", audience: "hr" },
  "south-africa-paye": { title: "South Africa PAYE", description: "Net pay after SARS brackets, rebates and UIF.", icon: "Banknote", region: "ZA", audience: "hr" },

  "tenure-calculator": { title: "Tenure / Experience", description: "Exact years, months and days between two dates.", icon: "CalendarDays", audience: "all" },
  "notice-period": { title: "Notice Period Date", description: "Find the last working day from a notice date.", icon: "CalendarClock", audience: "hr" },
  "working-days": { title: "Working Days", description: "Count working days between two dates, minus holidays.", icon: "CalendarCheck", audience: "hr" },
  "age-calculator": { title: "Age Calculator", description: "Age in years/months/days and days to next birthday.", icon: "Cake", audience: "all" },

  "grade-percentage": { title: "Grade & Percentage", description: "Percentage, letter grade and pass/fail from marks.", icon: "GraduationCap", audience: "teacher" },
  "cgpa-percentage": { title: "CGPA ⇄ Percentage", description: "Convert between CGPA and percentage (CBSE 9.5).", icon: "Sigma", audience: "teacher" },
  "attendance-calculator": { title: "Attendance Calculator", description: "Attendance %, classes you can skip or must attend.", icon: "ClipboardCheck", audience: "teacher" },
};

/* ── Custom (richer) tools ── */
const CUSTOM: Tool[] = [
  { id: "jd-resume-matcher", kind: "custom", title: "JD ⇄ Resume Matcher", description: "Offline keyword & skill overlap score between a job description and a resume.", icon: "ScanSearch", audience: "hr", keywords: "ats screening keywords match" },
  { id: "gpa-calculator", kind: "custom", title: "GPA / CGPA Calculator", description: "Credit-weighted GPA across any number of courses.", icon: "GraduationCap", audience: "teacher", keywords: "grade point average credits" },
  { id: "weighted-grade", kind: "custom", title: "Weighted Grade", description: "Final grade from weighted components (exams, assignments).", icon: "Scale", audience: "teacher", keywords: "weighting final mark" },
  { id: "password-generator", kind: "custom", title: "Password Generator", description: "Strong offline passwords for new-hire accounts.", icon: "KeyRound", audience: "all", keywords: "secure random credentials" },
  { id: "lesson-planner", kind: "custom", title: "Lesson Timetable", description: "Build a class day's period schedule with breaks and lunch.", icon: "CalendarRange", audience: "teacher", keywords: "schedule periods bell timetable" },
  { id: "seating-plan", kind: "custom", title: "Seating Plan", description: "Generate and shuffle a classroom seating chart you can print.", icon: "LayoutGrid", audience: "teacher", keywords: "classroom chart students random" },
  { id: "profiles", kind: "custom", title: "Saved Profiles", description: "Save companies & people once, then auto-fill them across every letter, email and payslip.", icon: "Users", audience: "all", keywords: "company employee candidate address book autofill contacts directory" },
  { id: "ai-settings", kind: "custom", title: "AI Assist", description: "Optional AI drafting with a local model (Ollama) on this machine. Off by default, strictly local — no cloud provider, nothing leaves your device.", icon: "Sparkles", audience: "all", keywords: "ai llm ollama llama draft autofill assistant settings optional offline local private" },
  { id: "about", kind: "custom", title: "About this project", description: "What hr-tools is, what's inside, and more from Yupcha.", icon: "Heart", audience: "all", keywords: "about info help yupcha website credits license version source github" },
];

/* ── Build template tools from the registry, grouped by tab + category ── */
function templateTool(id: string): Tool {
  const m = templateRegistry[id];
  const icon = m.tab === "email-templates" ? "Mail" : m.tab === "payroll" ? "Receipt" : "FileText";
  return {
    id,
    kind: "template",
    title: m.title,
    description: `${m.category} — fill-in template with formal, modern & friendly tones.`,
    icon,
    audience: "hr",
    keywords: m.category.toLowerCase(),
  };
}

const templateIdsByTab = (tab: string) =>
  Object.keys(templateRegistry).filter((id) => templateRegistry[id].tab === tab);

const calcTool = (id: string): Tool => ({ id, kind: "calculator", ...CALC_META[id] });

/* ── Navigation groups (order defines the sidebar) ── */
export const NAV: NavGroup[] = [
  {
    id: "workspace",
    label: "My Workspace",
    icon: "Users",
    tools: [CUSTOM[6], CUSTOM[7]], // Saved Profiles + AI Assist (optional)
  },
  {
    id: "letters",
    label: "Letters & Documents",
    icon: "FileText",
    tools: templateIdsByTab("generate-letters").map(templateTool),
  },
  {
    id: "emails",
    label: "HR Email Templates",
    icon: "Mail",
    tools: templateIdsByTab("email-templates").map(templateTool),
  },
  {
    id: "payroll-docs",
    label: "Payroll Documents",
    icon: "Receipt",
    tools: templateIdsByTab("payroll").map(templateTool),
  },
  {
    id: "recruitment",
    label: "Recruitment Tools",
    icon: "ScanSearch",
    tools: [CUSTOM[0]],
  },
  {
    id: "pay-calc",
    label: "Pay & Salary Calculators",
    icon: "Calculator",
    tools: ["salary-hike-calculator", "reverse-hike-calculator", "overtime-calculator", "hourly-to-salary", "pro-rata-salary", "emi-calculator", "gross-net-flat"].map(calcTool),
  },
  {
    id: "region-payroll",
    label: "Payroll by Region",
    icon: "Globe",
    tools: ["india-take-home", "india-ctc-reverse", "india-gratuity", "india-hra-exemption", "leave-encashment", "us-paycheck", "uk-take-home", "europe-take-home", "uae-gratuity", "ksa-gratuity", "nigeria-paye", "south-africa-paye"].map(calcTool),
  },
  {
    id: "dates",
    label: "Dates & Tenure",
    icon: "CalendarDays",
    tools: ["tenure-calculator", "notice-period", "working-days", "age-calculator"].map(calcTool),
  },
  {
    id: "teachers",
    label: "Teachers & Education",
    icon: "GraduationCap",
    tools: [
      calcTool("grade-percentage"),
      CUSTOM[1],
      CUSTOM[2],
      calcTool("cgpa-percentage"),
      calcTool("attendance-calculator"),
      CUSTOM[4], // lesson-planner
      CUSTOM[5], // seating-plan
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    // (about tool is CUSTOM[8])
    icon: "Wrench",
    tools: [CUSTOM[3], CUSTOM[8]],
  },
];

export const ALL_TOOLS: Tool[] = NAV.flatMap((g) => g.tools);
export const TOOL_BY_ID: Record<string, Tool> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.id, t]),
);
export const GROUP_BY_TOOL: Record<string, NavGroup> = Object.fromEntries(
  NAV.flatMap((g) => g.tools.map((t) => [t.id, g])),
);

/* ── Emotional register (F4) ──────────────────────────────────────────────
 * Central, data-driven map of which moments carry warmth or need care. We tag
 * the existing Tool objects in place (single source of truth, no new tool
 * entries, every tool stays reachable). NAV / ALL_TOOLS / TOOL_BY_ID are
 * unchanged in shape and membership — only an optional `register` is added. */
const REGISTER: Record<string, Register> = {
  // Warm — happy lifecycle moments get a small, tasteful warmth.
  "offer-letter": "warm",
  "conditional-offer-letter": "warm",
  "intent-to-hire-letter": "warm",
  "offer-follow-up": "warm",
  "welcome-letter": "warm",
  "new-hire-announcement": "warm",
  "probation-confirmation": "warm",
  // Careful — sensitive moments render quieter, with a "handle with care" list.
  "termination-letter": "careful",
  "resignation-acceptance": "careful",
  "relieving-letter": "careful",
  "experience-letter": "careful",
  "rejection-email": "careful",
};
for (const [id, r] of Object.entries(REGISTER)) {
  const t = TOOL_BY_ID[id];
  if (t) t.register = r;
}

/** Brief "handle with care" checklists for the most sensitive exit moments.
 *  In-session only (ticks live in the component), never persisted. */
export const CARE_CHECKLISTS: Record<string, string[]> = {
  "termination-letter": [
    "Confirm the reason and notice terms with a second reviewer.",
    "Double-check the employee's name, role and final working day.",
    "State final settlement, dues and what they keep access to.",
    "Use plain, respectful language — no blame, no surprises.",
  ],
  "resignation-acceptance": [
    "Confirm the last working day and notice served.",
    "Acknowledge their contribution warmly and sincerely.",
    "Note handover, dues and exit-formality next steps.",
  ],
  "relieving-letter": [
    "Verify dates of joining and relieving are correct.",
    "Confirm all dues are cleared and assets returned.",
    "Keep the wording clean — this is a record they'll reuse.",
  ],
  "experience-letter": [
    "Check the job title, tenure and dates match their record.",
    "Keep it factual and generous — they'll share it widely.",
  ],
  "rejection-email": [
    "Use the candidate's name — never a bulk, faceless tone.",
    "Thank them for their time and keep it kind and brief.",
    "Avoid specifics that could read as feedback unless intended.",
  ],
};

// Calculator-spec lookup re-export for the renderer.
export { calculatorRegistry };
export { templateRegistry };
