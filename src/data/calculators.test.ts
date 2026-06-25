import { describe, it, expect } from "vitest";
import { calculatorRegistry } from "./calculators";
import { regionById, money as fmtMoney, num as fmtNum } from "../lib/regions";
import type { CalcResult } from "../lib/calc";

/** Run a calculator's compute() the same way the UI does. */
function run(id: string, values: Record<string, string>): CalcResult {
  const spec = calculatorRegistry[id];
  if (!spec) throw new Error(`unknown calculator: ${id}`);
  const region = regionById(spec.currency ?? "IN");
  return spec.compute(values, {
    region,
    money: (v, d) => fmtMoney(v, region, { decimals: d }),
    num: (v, d) => fmtNum(v, region, d),
  });
}

const row = (r: CalcResult, label: string) => r.rows.find((x) => x.label === label)?.value ?? "";
const numOf = (s: string) => {
  const m = String(s).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
};

describe("salary-hike-calculator", () => {
  it("computes revised salary and increment", () => {
    const r = run("salary-hike-calculator", { current: "100000", hike: "10", period: "annual" });
    expect(numOf(row(r, "Revised salary"))).toBe(110000);
    expect(numOf(row(r, "Increment amount"))).toBe(10000);
  });
});

describe("reverse-hike-calculator", () => {
  it("computes the effective hike percent", () => {
    const r = run("reverse-hike-calculator", { current: "100000", offered: "130000" });
    expect(numOf(row(r, "Effective hike"))).toBeCloseTo(30, 1);
  });
  it("is safe when current is zero (no divide-by-zero)", () => {
    const r = run("reverse-hike-calculator", { current: "0", offered: "100000" });
    expect(numOf(row(r, "Effective hike"))).toBe(0);
  });
});

describe("emi-calculator", () => {
  it("matches the standard EMI formula", () => {
    // 100000 @ 12% p.a. for 12 months → 8884.88
    const r = run("emi-calculator", { principal: "100000", rate: "12", months: "12" });
    expect(numOf(row(r, "Monthly EMI"))).toBe(8885);
  });
});

describe("india-hra-exemption", () => {
  it("takes the least of the three statutory values (Section 10(13A))", () => {
    // a=20000, b=18000-4000=14000, 50% basic=20000 → exempt 14000
    const r = run("india-hra-exemption", { basic: "40000", hra: "20000", rent: "18000", metro: "yes" });
    expect(numOf(row(r, "Exempt HRA (monthly)"))).toBe(14000);
  });
});

describe("india-take-home (new regime, FY2024-25)", () => {
  it("applies the ₹75,000 standard deduction and §87A marginal relief", () => {
    // Pinned regression: with the correct ₹75k standard deduction the annual
    // take-home is ₹10,66,783 (a ₹50k deduction would give a different number).
    const r = run("india-take-home", { ctc: "1200000", basicPct: "40", regime: "new" });
    expect(numOf(row(r, "Annual take-home"))).toBe(1066783);
    expect(numOf(row(r, "Income tax / TDS (−)"))).toBe(64529);
  });

  it("charges no income tax when the regime is ignored", () => {
    const r = run("india-take-home", { ctc: "1200000", basicPct: "40", regime: "none" });
    expect(numOf(row(r, "Income tax / TDS (−)"))).toBe(0);
  });
});

describe("ksa-gratuity", () => {
  it("formats amounts in Saudi Riyal (currency fix)", () => {
    const r = run("ksa-gratuity", { wage: "12000", years: "7", reason: "termination" });
    const emphasized = r.rows.find((x) => x.emphasize)?.value ?? "";
    expect(emphasized).toMatch(/SAR|﷼/);
  });
});
