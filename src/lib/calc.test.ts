import { describe, it, expect } from "vitest";
import { progressiveTax, daysBetween, ymd, n } from "./calc";

describe("progressiveTax", () => {
  const slabs: [number, number][] = [
    [300000, 0], [700000, 0.05], [1000000, 0.1],
    [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3],
  ];

  it("is zero below the first taxable band", () => {
    expect(progressiveTax(250000, slabs)).toBe(0);
  });

  it("taxes only the slice within each band", () => {
    // 3–7L @ 5% = 20,000 on income of exactly 7L
    expect(progressiveTax(700000, slabs)).toBe(20000);
  });

  it("accumulates across bands", () => {
    // 20,000 (3–7L) + 30,000 (7–10L) + 30,000 (10–12L @15%) = 80,000 at 12L
    expect(progressiveTax(1200000, slabs)).toBe(80000);
  });
});

describe("daysBetween", () => {
  it("counts whole days forward", () => {
    expect(daysBetween("2026-01-01", "2026-01-31")).toBe(30);
  });
  it("is negative when reversed", () => {
    expect(daysBetween("2026-02-01", "2026-01-01")).toBe(-31);
  });
  it("returns NaN for invalid dates", () => {
    expect(Number.isNaN(daysBetween("not-a-date", "2026-01-01"))).toBe(true);
  });
});

describe("ymd", () => {
  it("splits a day count into years/months/days", () => {
    const r = ymd(400);
    expect(r.y).toBe(1);
    expect(r.m).toBe(1);
  });
  it("clamps negatives to zero", () => {
    expect(ymd(-5)).toEqual({ y: 0, m: 0, d: 0 });
  });
});

describe("n (numeric field parse)", () => {
  it("parses numbers and defaults junk to 0", () => {
    expect(n({ a: "1200.5" }, "a")).toBe(1200.5);
    expect(n({ a: "" }, "a")).toBe(0);
    expect(n({}, "missing")).toBe(0);
  });
});
