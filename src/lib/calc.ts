// A tiny declarative calculator engine. Each calculator is a list of input
// fields plus a pure `compute` function that returns labelled result rows.
// This keeps every calculator small and makes adding new ones trivial.

import type { Region, RegionId } from "./regions";

export type FieldType =
  | "number"
  | "currency"
  | "percent"
  | "select"
  | "text"
  | "date";

export interface CalcField {
  key: string;
  label: string;
  type: FieldType;
  default?: string | number;
  options?: { value: string; label: string }[];
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  half?: boolean;
}

export interface ResultRow {
  label: string;
  value: string;
  emphasize?: boolean;
  tone?: "default" | "positive" | "negative" | "muted";
  hint?: string;
}

export interface CalcResult {
  rows: ResultRow[];
  note?: string;
}

export interface CalcContext {
  region: Region;
  money: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
}

export interface CalcSpec {
  /** Force a fixed currency region (for region-specific payroll tools). */
  currency?: RegionId;
  fields: CalcField[];
  compute: (values: Record<string, string>, ctx: CalcContext) => CalcResult;
}

/** Parse a field value as a finite number, defaulting to 0. */
export function n(values: Record<string, string>, key: string): number {
  const v = parseFloat(values[key]);
  return isFinite(v) ? v : 0;
}

/** Days between two ISO date strings (b - a) in whole days. */
export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return NaN;
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

/** Break a day count into years / months / days (approximate, 30.44d months). */
export function ymd(days: number): { y: number; m: number; d: number } {
  if (!isFinite(days) || days < 0) return { y: 0, m: 0, d: 0 };
  let rem = days;
  const y = Math.floor(rem / 365.25);
  rem -= y * 365.25;
  const m = Math.floor(rem / 30.44);
  rem -= m * 30.44;
  return { y, m, d: Math.round(rem) };
}

/** Progressive tax helper: bands as [upperBound, rate]; Infinity for the top. */
export function progressiveTax(
  income: number,
  bands: [number, number][],
): number {
  let tax = 0;
  let last = 0;
  for (const [upper, rate] of bands) {
    if (income <= last) break;
    const slice = Math.min(income, upper) - last;
    if (slice > 0) tax += slice * rate;
    last = upper;
  }
  return tax;
}
