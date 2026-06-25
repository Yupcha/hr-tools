# hrToolkit

**Free, open-source desktop toolkit for busy recruiters, HR teams and teachers.**
Letters, HR emails, payslips, region-aware payroll calculators and classroom tools —
in one tiny, fast, fully **offline** app. No accounts, no cloud, nothing leaves your machine.

[![CI](https://github.com/debpalash/hrtoolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/debpalash/hrtoolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
![Platforms](https://img.shields.io/badge/platform-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-lightgrey)
![Offline](https://img.shields.io/badge/network-100%25%20offline-success)

Built with [Tauri](https://tauri.app) (Rust) + React + TypeScript. Curated for
🇮🇳 India · 🇺🇸 US · 🇬🇧🇪🇺 Europe · 🇦🇪 Middle East · 🇿🇦🇳🇬 Africa.

---

## Download

Grab the latest build for your OS from the [**Releases**](https://github.com/debpalash/hrtoolkit/releases) page:

| OS | File |
| --- | --- |
| **macOS** | `.dmg` (Apple Silicon & Intel) |
| **Windows** | `.msi` / `.exe` |
| **Linux** | `.AppImage` / `.deb` |

> **Heads-up — the app is unsigned** (no paid code-signing certificate yet), so your OS may warn on first launch:
> - **macOS:** right-click the app → **Open** → **Open** (or `System Settings → Privacy & Security → Open Anyway`).
> - **Windows:** **More info** → **Run anyway** on the SmartScreen prompt.
>
> It's safe — the source is right here and the app is **offline by default** (the only optional network path is opt-in [AI Assist](#ai-assist-optional)). Prefer to build it yourself? See [Develop](#develop).

---

## Screenshots

| Light | Dark |
| --- | --- |
| ![hrToolkit in light mode](docs/screenshots/light.png) | ![hrToolkit in dark mode](docs/screenshots/dark.png) |
| **Region payroll calculator** with live breakdown | **`⌘K` command palette** over every tool |
| ![Region payroll calculator](docs/screenshots/calculator.png) | ![Command palette](docs/screenshots/palette.png) |

> A warm, **Notion-calm × Obsidian-dense** interface: full dark mode, a `⌘K`
> command palette, and keyboard-first navigation. See [`DESIGN.md`](./DESIGN.md).

---

## What's inside

| Category | Tools |
| --- | --- |
| **My Workspace** | **Saved Profiles** — store a company & its people once, then **“Fill from saved…”** auto-fills any letter, email or payslip |
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
one-click **Copy** and a real **Save as PDF** (generated on-device, works offline).
Calculators show a clear breakdown and a `⌘K` palette jumps to any tool.

> ⚠️ **Statutory calculators (tax, PF, gratuity, end-of-service) are estimates.**
> Figures use **FY 2024-25** rules and vary by state/emirate/contract and your
> declarations. The app shows this disclaimer in-product too — always verify with
> an official source or payroll team before relying on a number.

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
bun run build          # frontend-only build + typecheck
bun run test           # run the calculator/formula test suite (vitest)
```

Requires [Rust](https://rustup.rs) and [Bun](https://bun.sh) (or npm).

Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) and the design
language in [DESIGN.md](./DESIGN.md). Statutory formula changes should cite a
source and ship with a test in `src/data/calculators.test.ts`.

## AI Assist (optional)

hrToolkit is offline by default. **AI Assist is off until you turn it on** (Workspace →
**AI Assist**) and pick a backend:

- **Local (Ollama)** — runs a model like `llama3.1` on your machine; nothing leaves the device.
- **Anthropic Claude (BYOK)** — uses *your own* API key; default model `claude-opus-4-8`.

Once enabled, a **✨ Draft with AI** box appears in every letter/email/payslip — type a
one-line brief and it fills the fields. The request is made by the app's **Rust backend**
(not the web layer), so the strict offline security policy stays in force and your key
never touches the front-end. See [SECURITY.md](./SECURITY.md) for the full posture.

### Agentic use (MCP)

hrToolkit also ships an **MCP server** (`mcp/`) that broadcasts its tools to agents
(Claude Desktop, Claude Code, …) — discover the 59 tools, generate documents, and run
calculators programmatically, all locally. Run `bun run mcp`; see [mcp/README.md](./mcp/README.md).

## Security & privacy

hrToolkit is **offline by default** and ships a strict Content-Security-Policy
(`default-src 'self'`) so the webview *can't* phone home. All data stays in
`localStorage` on your device. The only optional network path is opt-in AI Assist
(above), made by the audited Rust backend. To report a vulnerability, see
[SECURITY.md](./SECURITY.md).

## License

MIT — free to use, modify and distribute. See [LICENSE](./LICENSE).
