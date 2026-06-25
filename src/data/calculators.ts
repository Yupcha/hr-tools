// Declarative calculator specs. Every entry is inputs + a pure compute().
// Formulas are documented inline; statutory ones are clearly marked estimates
// because rates change yearly and vary by state/emirate/contract.

import {
  type CalcSpec,
  type ResultRow,
  n,
  daysBetween,
  ymd,
  progressiveTax,
} from "../lib/calc";

const grade = (p: number): string => {
  if (p >= 90) return "A+ / Outstanding";
  if (p >= 80) return "A / Excellent";
  if (p >= 70) return "B / Very Good";
  if (p >= 60) return "C / Good";
  if (p >= 50) return "D / Average";
  if (p >= 40) return "E / Pass";
  return "F / Fail";
};

const pct = (x: number) => `${(isFinite(x) ? x : 0).toFixed(2)}%`;

// Shared India in-hand model, used by both the forward calculator and the
// reverse "what CTC do I need" solver so they can never drift apart.
function indiaNet(ctc: number, basicPct: number, regime: string) {
  const basic = ctc * (basicPct / 100);
  const basicMonthly = basic / 12;
  const pfBaseMonthly = Math.min(basicMonthly, 15000);
  const employerPf = Math.min(pfBaseMonthly * 0.12, 1800) * 12;
  const gratuity = basic * 0.0481;
  const grossCash = ctc - employerPf - gratuity;
  const employeePf = employerPf;
  const profTax = 2400;
  let incomeTax = 0;
  if (regime !== "none") {
    // New regime FY 2024-25: standard deduction ₹75,000 (raised in Budget 2024).
    const taxable = Math.max(0, grossCash - 75000);
    if (taxable > 700000) {
      let tax = progressiveTax(taxable, [
        [300000, 0], [700000, 0.05], [1000000, 0.1],
        [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3],
      ]);
      // §87A marginal relief: tax cannot exceed income above the ₹7L rebate limit.
      tax = Math.min(tax, taxable - 700000);
      incomeTax = tax * 1.04; // 4% health & education cess
    }
  }
  const net = grossCash - employeePf - profTax - incomeTax;
  return { net, grossCash, basic, employerPf, gratuity, employeePf, profTax, incomeTax };
}

export const calculatorRegistry: Record<string, CalcSpec> = {
  /* ─────────────────────────  Pay & salary (generic)  ───────────────────────── */
  "salary-hike-calculator": {
    fields: [
      { key: "current", label: "Current CTC / Salary", type: "currency", default: 600000 },
      { key: "hike", label: "Hike %", type: "percent", default: 15, half: true },
      { key: "period", label: "Period", type: "select", half: true, default: "annual",
        options: [
          { value: "annual", label: "Per year" },
          { value: "monthly", label: "Per month" },
        ] },
    ],
    compute: (v, c) => {
      const cur = n(v, "current");
      const hike = n(v, "hike");
      const next = cur * (1 + hike / 100);
      const inc = next - cur;
      const monthly = v.period === "monthly" ? inc : inc / 12;
      return {
        rows: [
          { label: "Revised salary", value: c.money(next), emphasize: true },
          { label: "Increment amount", value: c.money(inc), tone: "positive" },
          { label: v.period === "monthly" ? "Extra per month" : "Extra per month (avg)", value: c.money(monthly) },
          { label: "Hike applied", value: pct(hike), tone: "muted" },
        ],
      };
    },
  },

  "reverse-hike-calculator": {
    fields: [
      { key: "current", label: "Current salary", type: "currency", default: 600000, half: true },
      { key: "offered", label: "Offered / new salary", type: "currency", default: 750000, half: true },
    ],
    compute: (v, c) => {
      const cur = n(v, "current");
      const off = n(v, "offered");
      const hike = cur ? ((off - cur) / cur) * 100 : 0;
      return {
        rows: [
          { label: "Effective hike", value: pct(hike), emphasize: true, tone: hike >= 0 ? "positive" : "negative" },
          { label: "Difference", value: c.money(off - cur) },
          { label: "Per month", value: c.money((off - cur) / 12) },
        ],
      };
    },
  },

  "overtime-calculator": {
    fields: [
      { key: "rate", label: "Base hourly rate", type: "currency", default: 500, half: true },
      { key: "regular", label: "Regular hours", type: "number", default: 40, half: true },
      { key: "ot", label: "Overtime hours", type: "number", default: 8, half: true },
      { key: "mult", label: "OT multiplier", type: "select", half: true, default: "1.5",
        options: [
          { value: "1.5", label: "1.5× (time and a half)" },
          { value: "2", label: "2× (double time)" },
          { value: "1.25", label: "1.25×" },
        ] },
    ],
    compute: (v, c) => {
      const rate = n(v, "rate");
      const mult = parseFloat(v.mult) || 1.5;
      const regPay = rate * n(v, "regular");
      const otRate = rate * mult;
      const otPay = otRate * n(v, "ot");
      return {
        rows: [
          { label: "Total pay", value: c.money(regPay + otPay), emphasize: true },
          { label: "Regular pay", value: c.money(regPay) },
          { label: "Overtime rate", value: c.money(otRate) + " / hr", tone: "muted" },
          { label: "Overtime pay", value: c.money(otPay), tone: "positive" },
        ],
      };
    },
  },

  "hourly-to-salary": {
    fields: [
      { key: "rate", label: "Hourly rate", type: "currency", default: 25, half: true },
      { key: "hpw", label: "Hours / week", type: "number", default: 40, half: true },
      { key: "wpy", label: "Weeks / year", type: "number", default: 52, half: true },
    ],
    compute: (v, c) => {
      const rate = n(v, "rate");
      const hpw = n(v, "hpw");
      const annual = rate * hpw * n(v, "wpy");
      return {
        rows: [
          { label: "Annual salary", value: c.money(annual), emphasize: true },
          { label: "Monthly", value: c.money(annual / 12) },
          { label: "Weekly", value: c.money(rate * hpw) },
          { label: "Daily (5-day week)", value: c.money(rate * (hpw / 5)) },
        ],
      };
    },
  },

  "pro-rata-salary": {
    fields: [
      { key: "monthly", label: "Full monthly salary", type: "currency", default: 50000, half: true },
      { key: "worked", label: "Days worked / paid", type: "number", default: 18, half: true },
      { key: "days", label: "Days in month", type: "number", default: 30, half: true },
    ],
    compute: (v, c) => {
      const m = n(v, "monthly");
      const worked = n(v, "worked");
      const days = n(v, "days") || 30;
      const prorata = (m / days) * worked;
      return {
        rows: [
          { label: "Pro-rated salary", value: c.money(prorata), emphasize: true },
          { label: "Per-day rate", value: c.money(m / days) },
          { label: "Deduction for absence", value: c.money(m - prorata), tone: "negative" },
        ],
      };
    },
  },

  "emi-calculator": {
    fields: [
      { key: "principal", label: "Loan amount", type: "currency", default: 1000000, half: true },
      { key: "rate", label: "Interest rate (p.a.)", type: "percent", default: 9, half: true },
      { key: "months", label: "Tenure (months)", type: "number", default: 60, half: true },
    ],
    compute: (v, c) => {
      const p = n(v, "principal");
      const r = n(v, "rate") / 1200;
      const nm = n(v, "months");
      const emi = r === 0 ? p / nm : (p * r * Math.pow(1 + r, nm)) / (Math.pow(1 + r, nm) - 1);
      const total = emi * nm;
      return {
        rows: [
          { label: "Monthly EMI", value: c.money(emi), emphasize: true },
          { label: "Total interest", value: c.money(total - p), tone: "negative" },
          { label: "Total payable", value: c.money(total) },
        ],
      };
    },
  },

  /* ─────────────────────────  India payroll  ───────────────────────── */
  "india-take-home": {
    currency: "IN",
    fields: [
      { key: "ctc", label: "Annual CTC", type: "currency", default: 1200000, half: true },
      { key: "basicPct", label: "Basic % of CTC", type: "percent", default: 40, half: true },
      { key: "regime", label: "Tax regime", type: "select", default: "new",
        options: [
          { value: "new", label: "New regime (FY 2024-25)" },
          { value: "none", label: "Ignore income tax" },
        ] },
    ],
    compute: (v, c) => {
      const ctc = n(v, "ctc");
      const { net, grossCash, basic, employerPf, gratuity, employeePf, profTax, incomeTax } =
        indiaNet(ctc, n(v, "basicPct"), v.regime);
      return {
        rows: [
          { label: "Monthly in-hand (est.)", value: c.money(net / 12), emphasize: true },
          { label: "Annual take-home", value: c.money(net), tone: "positive" },
          { label: "Gross salary (cash)", value: c.money(grossCash), hint: "CTC minus employer PF & gratuity" },
          { label: "Basic salary", value: c.money(basic) },
          { label: "Employer PF", value: c.money(employerPf), tone: "muted" },
          { label: "Gratuity provision", value: c.money(gratuity), tone: "muted" },
          { label: "Employee PF (−)", value: c.money(employeePf), tone: "negative" },
          { label: "Professional tax (−)", value: c.money(profTax), tone: "negative" },
          { label: "Income tax / TDS (−)", value: c.money(incomeTax), tone: "negative" },
        ],
        note: "Estimate only. PF cap, professional tax and TDS vary by state, employer policy and your declarations.",
      };
    },
  },

  "india-gratuity": {
    currency: "IN",
    fields: [
      { key: "basic", label: "Last drawn Basic + DA (monthly)", type: "currency", default: 40000, half: true },
      { key: "years", label: "Years of service", type: "number", default: 6, half: true, help: "≥ 5 years to be eligible" },
    ],
    compute: (v, c) => {
      const basic = n(v, "basic");
      const years = n(v, "years");
      const eligible = years >= 5;
      const raw = basic * (15 / 26) * Math.round(years);
      const gratuity = Math.min(raw, 2000000);
      return {
        rows: [
          { label: "Gratuity payable", value: eligible ? c.money(gratuity) : c.money(0), emphasize: true, tone: eligible ? "positive" : "negative" },
          { label: "Eligibility", value: eligible ? "Eligible (≥ 5 yrs)" : "Not eligible (< 5 yrs)", tone: eligible ? "positive" : "negative" },
          { label: "Formula", value: "Basic × 15/26 × years", tone: "muted" },
          ...(gratuity >= 2000000 ? [{ label: "Statutory cap applied", value: c.money(2000000), tone: "muted" as const }] : []),
        ],
        note: "Payment of Gratuity Act: 15 days' wages per completed year (26-day month). Capped at ₹20,00,000.",
      };
    },
  },

  "india-hra-exemption": {
    currency: "IN",
    fields: [
      { key: "basic", label: "Basic salary (monthly)", type: "currency", default: 40000, half: true },
      { key: "hra", label: "HRA received (monthly)", type: "currency", default: 20000, half: true },
      { key: "rent", label: "Rent paid (monthly)", type: "currency", default: 18000, half: true },
      { key: "metro", label: "Metro city?", type: "select", half: true, default: "yes",
        options: [{ value: "yes", label: "Yes (50%)" }, { value: "no", label: "No (40%)" }] },
    ],
    compute: (v, c) => {
      const basic = n(v, "basic");
      const hra = n(v, "hra");
      const rent = n(v, "rent");
      const a = hra;
      const b = Math.max(0, rent - 0.1 * basic);
      const cc = basic * (v.metro === "yes" ? 0.5 : 0.4);
      const exempt = Math.max(0, Math.min(a, b, cc));
      return {
        rows: [
          { label: "Exempt HRA (monthly)", value: c.money(exempt), emphasize: true, tone: "positive" },
          { label: "Taxable HRA (monthly)", value: c.money(hra - exempt), tone: "negative" },
          { label: "Exempt HRA (annual)", value: c.money(exempt * 12) },
          { label: "Actual HRA received", value: c.money(a), tone: "muted" },
          { label: "Rent − 10% of basic", value: c.money(b), tone: "muted" },
          { label: (v.metro === "yes" ? "50%" : "40%") + " of basic", value: c.money(cc), tone: "muted" },
        ],
        note: "Exemption = least of the three values (Section 10(13A)). Old regime only.",
      };
    },
  },

  /* ─────────────────────────  US payroll  ───────────────────────── */
  "us-paycheck": {
    currency: "US",
    fields: [
      { key: "gross", label: "Gross annual pay", type: "currency", default: 80000, half: true },
      { key: "status", label: "Filing status", type: "select", half: true, default: "single",
        options: [{ value: "single", label: "Single" }, { value: "married", label: "Married (jointly)" }] },
      { key: "freq", label: "Pay frequency", type: "select", half: true, default: "biweekly",
        options: [
          { value: "weekly", label: "Weekly (52)" },
          { value: "biweekly", label: "Bi-weekly (26)" },
          { value: "semimonthly", label: "Semi-monthly (24)" },
          { value: "monthly", label: "Monthly (12)" },
        ] },
      { key: "state", label: "State tax rate", type: "percent", default: 0, half: true, help: "Flat estimate" },
    ],
    compute: (v, c) => {
      const gross = n(v, "gross");
      const married = v.status === "married";
      const stdDed = married ? 29200 : 14600;
      const taxable = Math.max(0, gross - stdDed);
      const bandsSingle: [number, number][] = [
        [11600, 0.1], [47150, 0.12], [100525, 0.22], [191950, 0.24],
        [243725, 0.32], [609350, 0.35], [Infinity, 0.37],
      ];
      const bandsMarried: [number, number][] = [
        [23200, 0.1], [94300, 0.12], [201050, 0.22], [383900, 0.24],
        [487450, 0.32], [731200, 0.35], [Infinity, 0.37],
      ];
      const federal = progressiveTax(taxable, married ? bandsMarried : bandsSingle);
      const ss = Math.min(gross, 168600) * 0.062;
      let medicare = gross * 0.0145;
      const addlThreshold = married ? 250000 : 200000;
      if (gross > addlThreshold) medicare += (gross - addlThreshold) * 0.009;
      const state = gross * (n(v, "state") / 100);
      const net = gross - federal - ss - medicare - state;
      const periods = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 }[v.freq] ?? 26;
      return {
        rows: [
          { label: "Net per paycheck", value: c.money(net / periods), emphasize: true, tone: "positive" },
          { label: "Annual take-home", value: c.money(net) },
          { label: "Federal income tax", value: c.money(federal), tone: "negative" },
          { label: "Social Security (6.2%)", value: c.money(ss), tone: "negative" },
          { label: "Medicare (1.45%)", value: c.money(medicare), tone: "negative" },
          { label: "State tax", value: c.money(state), tone: "negative" },
          { label: "Effective tax rate", value: pct(((gross - net) / gross) * 100), tone: "muted" },
        ],
        note: "2024 federal brackets, standard deduction & FICA. Excludes 401(k), pre-tax benefits and local taxes.",
      };
    },
  },

  /* ─────────────────────────  UK payroll  ───────────────────────── */
  "uk-take-home": {
    currency: "UK",
    fields: [
      { key: "gross", label: "Gross annual salary", type: "currency", default: 45000 },
    ],
    compute: (v, c) => {
      const gross = n(v, "gross");
      // Personal allowance tapers £1 per £2 over £100,000.
      let pa = 12570;
      if (gross > 100000) pa = Math.max(0, 12570 - (gross - 100000) / 2);
      const taxable = Math.max(0, gross - pa);
      // Bands measured above the personal allowance.
      const tax = progressiveTax(taxable, [
        [37700, 0.2], [125140 - 12570, 0.4], [Infinity, 0.45],
      ]);
      // Employee NI 2024/25: 8% between PT and UEL, 2% above.
      let ni = 0;
      if (gross > 12570) ni += (Math.min(gross, 50270) - 12570) * 0.08;
      if (gross > 50270) ni += (gross - 50270) * 0.02;
      const net = gross - tax - ni;
      return {
        rows: [
          { label: "Monthly take-home", value: c.money(net / 12), emphasize: true, tone: "positive" },
          { label: "Annual take-home", value: c.money(net) },
          { label: "Income tax", value: c.money(tax), tone: "negative" },
          { label: "National Insurance", value: c.money(ni), tone: "negative" },
          { label: "Personal allowance", value: c.money(pa), tone: "muted" },
          { label: "Effective deductions", value: pct(((gross - net) / gross) * 100), tone: "muted" },
        ],
        note: "England/NI/Wales 2024-25 rates. Excludes pension, student loan and Scottish bands.",
      };
    },
  },

  /* ─────────────────────────  Middle East gratuity  ───────────────────────── */
  "uae-gratuity": {
    currency: "AE",
    fields: [
      { key: "basic", label: "Basic monthly salary", type: "currency", default: 10000, half: true },
      { key: "years", label: "Years of service", type: "number", default: 6, half: true },
      { key: "reason", label: "Leaving reason", type: "select", default: "termination",
        options: [
          { value: "termination", label: "Termination / end of contract" },
          { value: "resignation", label: "Resignation" },
        ] },
    ],
    compute: (v, c) => {
      const basic = n(v, "basic");
      const years = n(v, "years");
      const daily = basic / 30;
      let days = 0;
      if (years >= 1) {
        const first5 = Math.min(years, 5);
        const after5 = Math.max(0, years - 5);
        days = first5 * 21 + after5 * 30;
      }
      let gratuity = daily * days;
      // Legacy resignation reduction (pre-2022 unlimited contracts) for < 5 yrs.
      let note = "UAE Labour Law: 21 days' basic pay per year (first 5 yrs), 30 days after. Capped at 2 years' total pay.";
      if (v.reason === "resignation" && years < 5) {
        const frac = years < 3 ? 1 / 3 : 2 / 3;
        gratuity *= frac;
        note += " Resignation reduction applied (legacy unlimited contracts).";
      }
      gratuity = Math.min(gratuity, basic * 24);
      return {
        rows: [
          { label: "End-of-service gratuity", value: years >= 1 ? c.money(gratuity) : c.money(0), emphasize: true, tone: years >= 1 ? "positive" : "negative" },
          { label: "Eligibility", value: years >= 1 ? "Eligible (≥ 1 yr)" : "Not eligible (< 1 yr)", tone: years >= 1 ? "positive" : "negative" },
          { label: "Daily wage", value: c.money(daily), tone: "muted" },
          { label: "Gratuity days", value: `${days.toFixed(0)} days`, tone: "muted" },
        ],
        note,
      };
    },
  },

  "ksa-gratuity": {
    currency: "SA",
    fields: [
      { key: "wage", label: "Last monthly wage", type: "currency", default: 12000, half: true },
      { key: "years", label: "Years of service", type: "number", default: 7, half: true },
      { key: "reason", label: "Leaving reason", type: "select", default: "termination",
        options: [
          { value: "termination", label: "Termination / end of contract" },
          { value: "resignation", label: "Resignation" },
        ] },
    ],
    compute: (v, c) => {
      const wage = n(v, "wage");
      const years = n(v, "years");
      const first5 = Math.min(years, 5) * 0.5 * wage; // half month/yr first 5
      const after5 = Math.max(0, years - 5) * wage; // full month/yr after
      let award = first5 + after5;
      let note = "Saudi Labour Law: ½ month wage per year for first 5 years, full month after.";
      if (v.reason === "resignation") {
        let frac = 0;
        if (years >= 10) frac = 1;
        else if (years >= 5) frac = 2 / 3;
        else if (years >= 2) frac = 1 / 3;
        award *= frac;
        note += " Resignation: none < 2 yrs, ⅓ for 2-5 yrs, ⅔ for 5-10 yrs, full ≥ 10 yrs.";
      }
      return {
        rows: [
          { label: "End-of-service award", value: c.money(award), emphasize: true, tone: award > 0 ? "positive" : "negative" },
          { label: "First 5 years", value: c.money(first5), tone: "muted" },
          { label: "Beyond 5 years", value: c.money(after5), tone: "muted" },
        ],
        note,
      };
    },
  },

  /* ─────────────────────────  Africa payroll  ───────────────────────── */
  "nigeria-paye": {
    currency: "NG",
    fields: [
      { key: "gross", label: "Gross annual income", type: "currency", default: 6000000 },
    ],
    compute: (v, c) => {
      const gross = n(v, "gross");
      const pension = gross * 0.08;
      const cra = Math.max(200000, gross * 0.01) + gross * 0.2; // consolidated relief
      const taxable = Math.max(0, gross - cra - pension);
      const paye = progressiveTax(taxable, [
        [300000, 0.07], [600000, 0.11], [1100000, 0.15],
        [1600000, 0.19], [3200000, 0.21], [Infinity, 0.24],
      ]);
      const net = gross - paye - pension;
      return {
        rows: [
          { label: "Monthly net", value: c.money(net / 12), emphasize: true, tone: "positive" },
          { label: "Annual net", value: c.money(net) },
          { label: "PAYE tax", value: c.money(paye), tone: "negative" },
          { label: "Pension (8%)", value: c.money(pension), tone: "negative" },
          { label: "Consolidated relief", value: c.money(cra), tone: "muted" },
        ],
        note: "Nigeria PITA estimate: CRA = ₦200k or 1% of gross + 20% of gross; pension relief 8%.",
      };
    },
  },

  "south-africa-paye": {
    currency: "ZA",
    fields: [
      { key: "gross", label: "Gross annual income", type: "currency", default: 500000, half: true },
      { key: "age", label: "Age band", type: "select", half: true, default: "under65",
        options: [
          { value: "under65", label: "Under 65" },
          { value: "65to74", label: "65 – 74" },
          { value: "over75", label: "75+" },
        ] },
    ],
    compute: (v, c) => {
      const gross = n(v, "gross");
      const tax = progressiveTax(gross, [
        [237100, 0.18], [370500, 0.26], [512800, 0.31], [673000, 0.36],
        [857900, 0.39], [1817000, 0.41], [Infinity, 0.45],
      ]);
      let rebate = 17235; // primary
      if (v.age === "65to74") rebate += 9444;
      if (v.age === "over75") rebate += 9444 + 3145;
      const payable = Math.max(0, tax - rebate);
      const uif = Math.min(gross * 0.01, 2125.44); // capped
      const net = gross - payable - uif;
      return {
        rows: [
          { label: "Monthly net", value: c.money(net / 12), emphasize: true, tone: "positive" },
          { label: "Annual net", value: c.money(net) },
          { label: "PAYE (after rebate)", value: c.money(payable), tone: "negative" },
          { label: "UIF (1%, capped)", value: c.money(uif), tone: "negative" },
          { label: "Tax rebate", value: c.money(rebate), tone: "muted" },
        ],
        note: "SARS 2024/25 brackets and rebates. Excludes medical credits and retirement deductions.",
      };
    },
  },

  /* ─────────────────────────  Dates & tenure  ───────────────────────── */
  "tenure-calculator": {
    fields: [
      { key: "start", label: "Start date", type: "date", half: true },
      { key: "end", label: "End date", type: "date", half: true, help: "Leave blank for today" },
    ],
    compute: (v) => {
      const start = v.start;
      const end = v.end || new Date().toISOString().slice(0, 10);
      const days = daysBetween(start, end);
      const { y, m, d } = ymd(days);
      return {
        rows: [
          { label: "Total tenure", value: isFinite(days) ? `${y} yr ${m} mo ${d} d` : "—", emphasize: true },
          { label: "In months", value: isFinite(days) ? `${(days / 30.44).toFixed(1)} months` : "—" },
          { label: "Total days", value: isFinite(days) ? `${days.toLocaleString()} days` : "—", tone: "muted" },
        ],
      };
    },
  },

  "notice-period": {
    fields: [
      { key: "resign", label: "Resignation / notice date", type: "date", half: true },
      { key: "days", label: "Notice period (days)", type: "number", default: 30, half: true },
    ],
    compute: (v) => {
      const base = new Date(v.resign);
      if (isNaN(base.getTime())) return { rows: [{ label: "Last working day", value: "—" }] };
      const last = new Date(base.getTime() + n(v, "days") * 86400000);
      const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
      return {
        rows: [
          { label: "Last working day", value: fmt(last), emphasize: true },
          { label: "Notice length", value: `${n(v, "days")} days` },
        ],
      };
    },
  },

  "working-days": {
    fields: [
      { key: "start", label: "Start date", type: "date", half: true },
      { key: "end", label: "End date", type: "date", half: true },
      { key: "holidays", label: "Public holidays in range", type: "number", default: 0, half: true },
    ],
    compute: (v) => {
      const s = new Date(v.start);
      const e = new Date(v.end);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s)
        return { rows: [{ label: "Working days", value: "—" }] };
      let total = 0, weekend = 0;
      for (let t = s.getTime(); t <= e.getTime(); t += 86400000) {
        const day = new Date(t).getDay();
        total++;
        if (day === 0 || day === 6) weekend++;
      }
      const working = total - weekend - n(v, "holidays");
      return {
        rows: [
          { label: "Working days", value: `${Math.max(0, working)} days`, emphasize: true, tone: "positive" },
          { label: "Calendar days", value: `${total} days` },
          { label: "Weekend days", value: `${weekend} days`, tone: "muted" },
          { label: "Holidays excluded", value: `${n(v, "holidays")} days`, tone: "muted" },
        ],
      };
    },
  },

  "age-calculator": {
    fields: [{ key: "dob", label: "Date of birth", type: "date" }],
    compute: (v) => {
      const dob = new Date(v.dob);
      if (isNaN(dob.getTime())) return { rows: [{ label: "Age", value: "—" }] };
      const today = new Date();
      const days = daysBetween(v.dob, today.toISOString().slice(0, 10));
      const { y, m, d } = ymd(days);
      const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const toNext = Math.ceil((next.getTime() - today.getTime()) / 86400000);
      return {
        rows: [
          { label: "Age", value: `${y} years, ${m} months, ${d} days`, emphasize: true },
          { label: "Total days", value: `${days.toLocaleString()} days`, tone: "muted" },
          { label: "Next birthday in", value: `${toNext} days`, tone: "positive" },
        ],
      };
    },
  },

  /* ─────────────────────────  Teachers & education  ───────────────────────── */
  "grade-percentage": {
    fields: [
      { key: "obtained", label: "Marks obtained", type: "number", default: 78, half: true },
      { key: "total", label: "Total marks", type: "number", default: 100, half: true },
      { key: "pass", label: "Pass mark %", type: "percent", default: 40, half: true },
    ],
    compute: (v) => {
      const p = (n(v, "obtained") / (n(v, "total") || 1)) * 100;
      const passed = p >= n(v, "pass");
      return {
        rows: [
          { label: "Percentage", value: pct(p), emphasize: true },
          { label: "Grade", value: grade(p) },
          { label: "Result", value: passed ? "PASS" : "FAIL", tone: passed ? "positive" : "negative" },
        ],
      };
    },
  },

  "cgpa-percentage": {
    fields: [
      { key: "mode", label: "Convert", type: "select", default: "cgpa2pct",
        options: [
          { value: "cgpa2pct", label: "CGPA → Percentage" },
          { value: "pct2cgpa", label: "Percentage → CGPA" },
        ] },
      { key: "value", label: "Value", type: "number", default: 8.2, half: true },
      { key: "factor", label: "Multiplier", type: "number", default: 9.5, half: true, help: "CBSE uses 9.5" },
    ],
    compute: (v) => {
      const val = n(v, "value");
      const f = n(v, "factor") || 9.5;
      if (v.mode === "pct2cgpa") {
        return { rows: [{ label: "CGPA", value: (val / f).toFixed(2), emphasize: true }, { label: "Formula", value: `% ÷ ${f}`, tone: "muted" }] };
      }
      return {
        rows: [
          { label: "Percentage", value: pct(val * f), emphasize: true },
          { label: "Formula", value: `CGPA × ${f}`, tone: "muted" },
        ],
      };
    },
  },

  "attendance-calculator": {
    fields: [
      { key: "attended", label: "Classes attended", type: "number", default: 60, half: true },
      { key: "total", label: "Total classes held", type: "number", default: 80, half: true },
      { key: "required", label: "Required %", type: "percent", default: 75, half: true },
    ],
    compute: (v) => {
      const att = n(v, "attended");
      const tot = n(v, "total");
      const req = n(v, "required");
      const current = tot ? (att / tot) * 100 : 0;
      const rows: ResultRow[] = [
        { label: "Current attendance", value: pct(current), emphasize: true, tone: current >= req ? "positive" : "negative" },
      ];
      if (current >= req) {
        // How many can be skipped while staying ≥ required.
        const canSkip = Math.floor((att - (req / 100) * tot) / (req / 100));
        rows.push({ label: "Classes you can skip", value: `${Math.max(0, canSkip)}`, tone: "muted" });
      } else {
        // Consecutive classes to attend to reach required.
        const need = Math.ceil(((req / 100) * tot - att) / (1 - req / 100));
        rows.push({ label: "Attend next (in a row)", value: `${Math.max(0, need)} classes`, tone: "negative" });
      }
      return { rows };
    },
  },

  /* ─────────────────────────  Added: reverse & cross-region pay  ───────────────────────── */
  "india-ctc-reverse": {
    currency: "IN",
    fields: [
      { key: "target", label: "Desired monthly in-hand", type: "currency", default: 80000, half: true },
      { key: "basicPct", label: "Basic % of CTC", type: "percent", default: 40, half: true },
      { key: "regime", label: "Tax regime", type: "select", default: "new",
        options: [
          { value: "new", label: "New regime (FY 2024-25)" },
          { value: "none", label: "Ignore income tax" },
        ] },
    ],
    compute: (v, c) => {
      const targetAnnual = n(v, "target") * 12;
      const basicPct = n(v, "basicPct");
      // Binary-search the CTC whose modelled net matches the target take-home.
      let lo = targetAnnual, hi = targetAnnual * 3 + 1000000;
      for (let i = 0; i < 64; i++) {
        const mid = (lo + hi) / 2;
        if (indiaNet(mid, basicPct, v.regime).net < targetAnnual) lo = mid;
        else hi = mid;
      }
      const ctc = (lo + hi) / 2;
      const r = indiaNet(ctc, basicPct, v.regime);
      return {
        rows: [
          { label: "Required annual CTC", value: c.money(ctc), emphasize: true },
          { label: "Gives monthly in-hand", value: c.money(r.net / 12), tone: "positive" },
          { label: "Annual take-home", value: c.money(r.net) },
          { label: "Income tax / TDS", value: c.money(r.incomeTax), tone: "muted" },
        ],
        note: "Inverts the India in-hand model. Same PF/PT/TDS assumptions and caveats apply.",
      };
    },
  },

  "leave-encashment": {
    currency: "IN",
    fields: [
      { key: "basic", label: "Basic + DA (monthly)", type: "currency", default: 40000, half: true },
      { key: "days", label: "Unused leave days", type: "number", default: 30, half: true },
      { key: "base", label: "Per-day basis", type: "select", half: true, default: "30",
        options: [{ value: "30", label: "Monthly ÷ 30" }, { value: "26", label: "Monthly ÷ 26" }] },
    ],
    compute: (v, c) => {
      const perDay = n(v, "basic") / (parseFloat(v.base) || 30);
      const amount = perDay * n(v, "days");
      return {
        rows: [
          { label: "Leave encashment", value: c.money(amount), emphasize: true, tone: "positive" },
          { label: "Per-day wage", value: c.money(perDay) },
          { label: "Days encashed", value: `${n(v, "days")} days`, tone: "muted" },
        ],
        note: "(Basic + DA) ÷ basis × unused leave. Exemption limits apply on retirement (Section 10(10AA)).",
      };
    },
  },

  "gross-net-flat": {
    fields: [
      { key: "mode", label: "Direction", type: "select", default: "g2n",
        options: [
          { value: "g2n", label: "Gross / CTC → Net" },
          { value: "n2g", label: "Net → Gross / CTC" },
        ] },
      { key: "amount", label: "Amount (annual)", type: "currency", default: 1000000, half: true },
      { key: "ded", label: "Total deductions %", type: "percent", default: 25, half: true },
    ],
    compute: (v, c) => {
      const amt = n(v, "amount");
      const d = n(v, "ded") / 100;
      if (v.mode === "n2g") {
        const gross = d < 1 ? amt / (1 - d) : 0;
        return {
          rows: [
            { label: "Required gross / CTC", value: c.money(gross), emphasize: true },
            { label: "Target net", value: c.money(amt), tone: "positive" },
            { label: "Monthly gross", value: c.money(gross / 12) },
          ],
        };
      }
      const net = amt * (1 - d);
      return {
        rows: [
          { label: "Net / take-home", value: c.money(net), emphasize: true, tone: "positive" },
          { label: "Total deductions", value: c.money(amt - net), tone: "negative" },
          { label: "Monthly net", value: c.money(net / 12) },
        ],
      };
    },
  },

  "europe-take-home": {
    currency: "EU",
    fields: [
      { key: "country", label: "Country", type: "select", default: "DE",
        options: [
          { value: "DE", label: "🇩🇪 Germany" },
          { value: "FR", label: "🇫🇷 France" },
          { value: "NL", label: "🇳🇱 Netherlands" },
          { value: "IE", label: "🇮🇪 Ireland" },
          { value: "ES", label: "🇪🇸 Spain" },
        ] },
      { key: "gross", label: "Gross annual salary", type: "currency", default: 60000 },
    ],
    compute: (v, c) => {
      const gross = n(v, "gross");
      let tax = 0, social = 0, credit = 0;
      switch (v.country) {
        case "DE":
          tax = progressiveTax(gross, [[11604, 0], [17005, 0.16], [66760, 0.3], [277825, 0.42], [Infinity, 0.45]]);
          social = Math.min(gross, 69300) * 0.205;
          break;
        case "FR":
          social = gross * 0.22;
          tax = progressiveTax(gross - social, [[11294, 0], [28797, 0.11], [82341, 0.3], [177106, 0.41], [Infinity, 0.45]]);
          break;
        case "NL":
          tax = progressiveTax(gross, [[75518, 0.3697], [Infinity, 0.495]]);
          credit = 3362;
          break;
        case "IE": {
          tax = progressiveTax(gross, [[42000, 0.2], [Infinity, 0.4]]);
          credit = 4000;
          const prsi = gross * 0.04;
          const usc = progressiveTax(gross, [[12012, 0.005], [25760, 0.02], [70044, 0.04], [Infinity, 0.08]]);
          social = prsi + usc;
          break;
        }
        case "ES":
          tax = progressiveTax(Math.max(0, gross - 5550), [[12450, 0.19], [20200, 0.24], [35200, 0.3], [60000, 0.37], [300000, 0.45], [Infinity, 0.47]]);
          social = Math.min(gross, 53946) * 0.0635;
          break;
      }
      tax = Math.max(0, tax - credit);
      const net = gross - tax - social;
      return {
        rows: [
          { label: "Monthly net (est.)", value: c.money(net / 12), emphasize: true, tone: "positive" },
          { label: "Annual net", value: c.money(net) },
          { label: "Income tax", value: c.money(tax), tone: "negative" },
          { label: "Social / other", value: c.money(social), tone: "negative" },
          { label: "Effective rate", value: pct(((gross - net) / gross) * 100), tone: "muted" },
        ],
        note: "Rough single-filer 2024 estimate. Ignores regional rates, allowances and most credits — verify locally.",
      };
    },
  },
};
