# Changelog

All notable changes to **hrToolkit** are documented here.
This project adheres to [Semantic Versioning](https://semver.org).

## [0.1.0] — 2026-06-25

First release. A free, open-source, **offline-by-default** desktop app (Tauri v2 + React 19 +
TypeScript + Tailwind v4) for recruiters, HR teams and teachers — **60+ tools across 10 categories**,
curated for India, the US, Europe/UK, the Middle East and Africa.

### Added — app shell
- Tauri v2 desktop shell (`com.hrtoolkit.app`), 1180×800 window, **offline by default**, no telemetry.
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
  **Copy** and **Save as PDF**.

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

### Added — design system
- **Notion-calm × Obsidian-dense** redesign on a semantic-token system; full **dark mode** +
  light mode with a toggle (OS-aware, no flash on load). See [`DESIGN.md`](./DESIGN.md).
- **Command palette** (`⌘K` / `Ctrl K`) — fuzzy-search and jump to any tool; keyboard-first
  navigation (`/` to filter, `⌘\` to collapse the sidebar, `Esc` home), collapsible nav groups.

### Added — person-centric workspace
- **My Workspace** — the app is organized around the employee lifecycle
  (**Hire → Onboard → Pay → Manage → Exit → Teach**) with a person-as-hero home: open a person and
  every relevant document/calculation is one click away.
- **Saved Profiles** — store a company & its people once, then **"Fill from saved…"** auto-fills any
  letter, email or payslip (kept on-device).
- **Emotional register** — exit/termination flows are quieter with a "handle with care" checklist;
  offers open warm.
- **Batch / mail-merge** — generate one document per saved person in a single pass.

### Added — documents & export
- **Real on-device PDF export** (jsPDF) for letters/emails/payslips and the timetable/seating tools —
  native save dialog in the desktop app, works fully offline (replaces browser print).
- Opt-in **letterhead + signature** drawn from a saved Company profile.

### Added — optional AI & agentic use
- **AI Assist** (off by default) — draft & extract with a **local model (Ollama)** or
  **your own Anthropic key**; the request is made by the audited Rust backend, never the webview.
- **MCP server** (`mcp/`) — broadcasts the toolkit's tools to agents (Claude Desktop, etc.) for
  local, offline agentic use.

### Quality & security
- **Test suite** (Vitest) pinning the statutory formulas; **CI** (typecheck + tests + build) and a
  tagged **release workflow** that builds macOS/Windows/Linux bundles.
- Strict **Content-Security-Policy** (`default-src 'self'`) on the webview; see [`SECURITY.md`](./SECURITY.md).
- Calculator accuracy pass: corrected the India new-regime **standard deduction (₹75,000)** and
  **§87A marginal relief**, fixed the **Saudi (SAR)** currency, and added an in-app statutory
  **estimate** disclaimer to every region-fixed calculator.

### Notes
- All statutory calculators (tax, PF, gratuity, end-of-service, PAYE) use hard-coded **FY 2024-25**
  rates and are clearly labelled **estimates** in-app. Verify against local rules before relying on them.
- Architecture is **data-driven**: templates and calculators are pure data, so most new tools are a
  single registry entry. See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
