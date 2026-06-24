# hrToolkit

**Free, open-source desktop toolkit for busy recruiters, HR teams and teachers.**
Letters, HR emails, payslips, region-aware payroll calculators and classroom tools —
in one tiny, fast, fully **offline** app. No accounts, no cloud, nothing leaves your machine.

Built with [Tauri](https://tauri.app) (Rust) + React + TypeScript. Curated for
🇮🇳 India · 🇺🇸 US · 🇬🇧🇪🇺 Europe · 🇦🇪 Middle East · 🇿🇦🇳🇬 Africa.

---

## What's inside

| Category | Tools |
| --- | --- |
| **Letters & Documents** | Offer, conditional offer, intent-to-hire, interview call, appointment, welcome, probation, employment verification, resignation acceptance, termination, experience, relieving |
| **HR Email Templates** | Interview scheduling, rejection, offer follow-up, sourcing, referral, policy updates, event invites, performance review, team & new-hire announcements |
| **Payroll Documents** | Salary slip, salary structure, reimbursement claim, bonus policy |
| **Recruitment** | Offline JD ⇄ Resume keyword matcher (ATS-style score) |
| **Pay & Salary Calculators** | Salary hike, offer hike %, overtime, hourly→salary, pro-rata, loan/EMI, CTC⇄take-home (flat) |
| **Payroll by Region** | India in-hand · CTC-from-in-hand (reverse) · gratuity · HRA · leave encashment, US paycheck, UK take-home, Europe (DE/FR/NL/IE/ES) take-home, UAE & Saudi end-of-service, Nigeria & South Africa PAYE |
| **Dates & Tenure** | Tenure/experience, notice-period date, working days, age |
| **Teachers & Education** | Grade & percentage, GPA/CGPA, weighted grade, CGPA⇄%, attendance, lesson timetable, seating-plan generator |
| **Utilities** | Secure password generator |

Every letter/email comes in **formal, modern and friendly** tones, with live preview,
one-click **Copy** and **Save as PDF** (print). Calculators show a clear breakdown.

> ⚠️ Statutory calculators (tax, PF, gratuity, end-of-service) are **estimates**.
> Rates change yearly and vary by state/emirate/contract — always verify locally.

## Architecture

Everything is **data-driven** so adding a tool is a small, local change:

- `src/data/templates.ts` — letter / email / payroll templates (pure data)
- `src/data/calculators.ts` — declarative calculator specs (inputs + a pure `compute()`)
- `src/data/catalog.ts` — the master navigation catalog
- `src/components/custom/*` — richer interactive tools (JD matcher, GPA, password gen)

No backend, no network calls, no telemetry.

## Develop

```bash
bun install
bun run tauri dev      # run the desktop app
bun run tauri build    # produce a distributable bundle
bun run build          # frontend-only build (web preview)
```

Requires [Rust](https://rustup.rs) and [Bun](https://bun.sh) (or npm).

## License

MIT — free to use, modify and distribute. See [LICENSE](./LICENSE).
