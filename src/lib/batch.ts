/**
 * Batch / mail-merge core (F6).
 *
 * Turn ONE template into many documents — one per selected saved Person — each
 * auto-filled from that person's profile via the same alias-aware `fillMap`
 * the single-document path uses. Pure, offline, token-agnostic: this module
 * only computes strings + missing-field flags; the UI renders them.
 */
import { fillMap, type Profile } from "./profiles";

/** Replace [Placeholder] tokens with values, leaving unknown tokens intact. */
function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\[(.*?)\]/g, (_, key) => values[key]?.trim() || `[${key}]`);
}

/** One person's rendered document within a batch run. */
export interface BatchRow {
  person: Profile;
  /** The fully rendered body for this person, in the chosen tone. */
  body: string;
  /** Alias-expanded values used to fill this person's document. */
  values: Record<string, string>;
  /** Template placeholders this person could NOT fill (still bracketed). */
  missing: string[];
}

/**
 * Build a batch row per person. `shared` carries values typed once into the
 * Single editor (e.g. Organization Name, Date) that apply to everyone; each
 * person's own `fillMap` then layers their data on top, so personal fields win.
 */
export function buildBatch(
  template: string,
  placeholders: string[],
  people: Profile[],
  shared: Record<string, string> = {},
): BatchRow[] {
  const sharedClean: Record<string, string> = {};
  for (const [k, v] of Object.entries(shared)) if (v?.trim()) sharedClean[k] = v.trim();

  return people.map((person) => {
    const values = { ...sharedClean, ...fillMap(person) };
    const missing = placeholders.filter((ph) => !values[ph]?.trim());
    return { person, body: fillTemplate(template, values), values, missing };
  });
}

/** Total unfilled placeholders across every row — used to gate / warn. */
export function totalMissing(rows: BatchRow[]): number {
  return rows.reduce((n, r) => n + r.missing.length, 0);
}

/** Join every rendered document into one clipboard payload with light dividers. */
export function batchToText(rows: BatchRow[]): string {
  return rows
    .map((r) => `${"─".repeat(48)}\n${r.person.label}\n${"─".repeat(48)}\n\n${r.body}`)
    .join("\n\n\n");
}
