import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Shared, on-device "address book" for hrToolkit. Save a Company or a Person
 * once, then auto-fill matching placeholders across every letter / email /
 * payroll template. Everything stays in localStorage — nothing leaves the device.
 */
export type ProfileKind = "company" | "person";

export interface Profile {
  id: string;
  kind: ProfileKind;
  label: string; // the primary name (Organization Name / Employee Name)
  fields: Record<string, string>; // canonical placeholder name -> value
  /**
   * SEAM (F5 PDF letterhead): optional company logo as a self-contained data:
   * URL so it stays 100% offline. Unused in v1 — declared so the editor/PDF
   * layer can adopt it later without a schema migration.
   */
  logo?: string;
}

/** Editable fields per kind — keys are the canonical template placeholder names. */
export const COMPANY_FIELDS = [
  "Organization Address Line 1",
  "Organization Address Line 2",
  "HR Name",
  "Manager Name",
  "Department",
] as const;

export const PERSON_FIELDS = [
  "Job Title",
  "Annual CTC",
  "Joining Date",
  "Email",
  "Phone",
  "Department",
] as const;

/** The label field's meaning depends on the kind. */
export const labelPlaceholder = (kind: ProfileKind) =>
  kind === "company" ? "Organization Name" : "Employee Name";

/**
 * Expand a profile into a { placeholder -> value } map, including aliases so a
 * single saved value fills the differently-named-but-equivalent placeholders
 * used across templates (e.g. Employee Name ⇄ Candidate Name).
 */
export function fillMap(p: Profile): Record<string, string> {
  const m: Record<string, string> = {};
  const put = (k: string, v?: string) => {
    if (v && v.trim()) m[k] = v.trim();
  };

  if (p.kind === "company") {
    put("Organization Name", p.label);
  } else {
    put("Employee Name", p.label);
    put("Candidate Name", p.label); // alias
  }
  for (const [k, v] of Object.entries(p.fields)) put(k, v);
  if (p.kind === "person") {
    put("Position", p.fields["Job Title"]); // alias
    put("Salary", p.fields["Annual CTC"]); // alias
    put("Start Date", p.fields["Joining Date"]); // alias
  }
  return m;
}

/** How many of a template's placeholders this profile can fill. */
export function matchCount(p: Profile, placeholders: string[]): number {
  const map = fillMap(p);
  return placeholders.filter((ph) => ph in map).length;
}

export function newProfile(kind: ProfileKind): Profile {
  return { id: crypto.randomUUID(), kind, label: "", fields: {} };
}

/* ────────────────────────────────────────────────────────────────────────
 * Person → document/number actions (the "person as hero" seed channel).
 *
 * Opening a Person on Home surfaces a short list of the documents and
 * calculations *about them*. Each action targets one tool and turns the
 * person's saved fields into a one-shot `prefill` seed (see App.select(id,
 * seed)). For templates the seed is alias-aware `fillMap`. For calculators we
 * remap canonical field names onto the spec's input keys — e.g. the in-hand
 * calc keys CTC as `ctc`, so we must strip currency punctuation and map
 * "Annual CTC" → "ctc", or the calculator silently fails to prefill.
 * ──────────────────────────────────────────────────────────────────────── */
export interface PersonAction {
  toolId: string;
  label: string;
  /** Build the one-shot prefill seed for this tool from the person. */
  seed: (p: Profile) => Record<string, string>;
}

/** Strip currency symbols, spaces and grouping commas → a bare number string. */
export function numericSeed(v?: string): string {
  if (!v) return "";
  const cleaned = v.replace(/[^0-9.]/g, "");
  return cleaned || "";
}

/** Templates seed straight from the alias-aware fillMap (only this person's data). */
const templateSeed = (p: Profile) => fillMap(p);

export const PERSON_ACTIONS: PersonAction[] = [
  // ── Documents (templates) — seeded via fillMap aliases ──
  { toolId: "offer-letter", label: "Offer letter", seed: templateSeed },
  { toolId: "appointment-letter", label: "Appointment letter", seed: templateSeed },
  { toolId: "welcome-letter", label: "Welcome letter", seed: templateSeed },
  { toolId: "salary-slip", label: "Payslip", seed: templateSeed },
  { toolId: "salary-structure", label: "Salary structure", seed: templateSeed },
  { toolId: "experience-letter", label: "Experience letter", seed: templateSeed },
  { toolId: "relieving-letter", label: "Relieving letter", seed: templateSeed },
  // ── Numbers (calculators) — canonical fields remapped onto spec input keys ──
  {
    toolId: "india-take-home",
    label: "India in-hand from CTC",
    // The in-hand calc keys CTC as `ctc` (lowercase) and wants a bare number.
    seed: (p) => {
      const ctc = numericSeed(p.fields["Annual CTC"]);
      const out: Record<string, string> = {};
      if (ctc) out.ctc = ctc;
      return out;
    },
  },
];

/** Actions whose target tool exists in the catalog and yields a non-empty seed. */
export function personActions(
  p: Profile,
  has: (toolId: string) => boolean,
): { action: PersonAction; seed: Record<string, string> }[] {
  if (p.kind !== "person") return [];
  return PERSON_ACTIONS.filter((a) => has(a.toolId))
    .map((action) => ({ action, seed: action.seed(p) }))
    .filter(({ seed }) => Object.keys(seed).length > 0);
}

/** Persisted CRUD over the saved profiles. */
export function useProfiles() {
  const [profiles, setProfiles] = useLocalStorage<Profile[]>("hrt.profiles", []);

  const upsert = useCallback(
    (p: Profile) =>
      setProfiles((list) => {
        const i = list.findIndex((x) => x.id === p.id);
        if (i === -1) return [...list, p];
        const copy = [...list];
        copy[i] = p;
        return copy;
      }),
    [setProfiles],
  );

  const remove = useCallback(
    (id: string) => setProfiles((l) => l.filter((x) => x.id !== id)),
    [setProfiles],
  );

  return { profiles, upsert, remove };
}
