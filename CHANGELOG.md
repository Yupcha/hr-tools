# Changelog

All notable changes to **hrToolkit** are documented here.
This project adheres to [Semantic Versioning](https://semver.org).

## [0.1.0] — 2026-06-25

First release. A free, open-source, fully-offline desktop app (Tauri v2 + React + TypeScript +
Tailwind v4) for recruiters, HR teams and teachers — **59 tools across 9 categories**, curated for
India, the US, Europe/UK, the Middle East and Africa.

### Added — app shell
- Tauri v2 desktop shell (`com.hrtoolkit.app`), 1180×800 window, no backend / network / telemetry.
- Sidebar with live **search**, **favorites** (starred) and **recents**, plus a **region/currency**
  switcher (🇮🇳 INR · 🇺🇸 USD · 🇬🇧 GBP · 🇪🇺 EUR · 🇦🇪 AED · 🇿🇦 ZAR · 🇳🇬 NGN).
- Home dashboard with category grids and recently-used tools.
- All state (active tool, favorites, recents, region) persisted on-device via `localStorage`.
- Custom app icon (HR document + check badge) generated for all desktop & mobile targets.

### Added — tools ported from the yupcha.com HR Toolkit
- **12 letter generators**: offer, conditional offer, intent-to-hire, interview call, appointment,
  welcome, probation confirmation, employment verification, resignation acceptance, termination,
  experience, relieving.
- **10 HR email templates**: interview scheduling, rejection, offer follow-up, candidate sourcing,
  referral request, policy updates, event invitations, performance review, team announcements,
  new-hire announcement.
- **5 payroll documents**: salary slip, salary structure, reimbursement claim, bonus policy.
- Every template renders in **formal / modern / friendly** tones with live preview, one-click
  **Copy** and **Save as PDF** (print).

### Added — new tools
- **Recruitment**: offline **JD ⇄ Resume keyword matcher** with an ATS-style match score, matched
  and missing keyword lists (re-implemented as a real local analyzer, not the website's stub).
- **Pay & salary calculators**: salary hike, offer-hike %, overtime, hourly→salary, pro-rata
  salary, loan/EMI, and a two-way CTC ⇄ take-home (flat-deduction) converter.
- **Region payroll**: India in-hand (PF/gratuity/PT/TDS), **India CTC-from-in-hand** (reverse
  solver), India gratuity, India HRA exemption, **India leave encashment**, US paycheck (federal +
  FICA + state), UK take-home (tax + NI), **Europe take-home** (Germany, France, Netherlands,
  Ireland, Spain), UAE & Saudi end-of-service, Nigeria & South Africa PAYE.
- **Dates & tenure**: tenure/experience, notice-period date, working-days, age.
- **Teachers & education**: grade & percentage, GPA/CGPA, weighted grade, CGPA⇄%, attendance,
  **lesson timetable** generator and a **seating-plan** generator (shuffle + print).
- **Utilities**: secure password generator (Web Crypto, entropy meter).

### Notes
- All statutory calculators (tax, PF, gratuity, end-of-service, PAYE) use hard-coded ~2024 rates and
  are clearly labelled **estimates** in-app. Verify against local rules before relying on them.
- Architecture is **data-driven**: templates and calculators are pure data, so most new tools are a
  single registry entry. See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
