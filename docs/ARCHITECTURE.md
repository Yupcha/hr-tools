# Architecture

hrToolkit is a **Tauri v2** desktop app with a **React + TypeScript** frontend styled with
**Tailwind CSS v4**. There is intentionally **no backend, no network access and no telemetry** —
every tool runs locally in the webview, and all state lives in `localStorage`. The Rust side is the
stock Tauri shell; all logic is in the frontend.

```
hrToolkit/
├── src/                      # React frontend (all app logic)
│   ├── main.tsx              # entry — mounts <App/>, imports index.css
│   ├── App.tsx               # shell: sidebar + header + tool panel + Home
│   ├── index.css             # Tailwind v4 theme (@theme tokens) + print CSS
│   ├── components/
│   │   ├── Sidebar.tsx       # search, region switcher, favorites, nav groups
│   │   ├── Home.tsx          # landing dashboard (category grids + recents)
│   │   ├── ToolView.tsx      # dispatches a Tool to the right renderer
│   │   ├── TemplateTool.tsx  # generic letter/email/doc engine (preview/copy/print)
│   │   ├── CalculatorTool.tsx# generic engine that renders a CalcSpec
│   │   └── custom/           # richer interactive tools (one file each)
│   ├── data/
│   │   ├── templates.ts      # 27 letter/email/payroll templates (pure data)
│   │   ├── calculators.ts    # 26 declarative calculator specs (inputs + compute)
│   │   └── catalog.ts        # master navigation catalog (the source of truth)
│   └── lib/
│       ├── calc.ts           # CalcSpec types + helpers (tax bands, dates, etc.)
│       ├── regions.ts        # regions + currency formatting (Intl)
│       ├── icons.tsx         # string → lucide icon resolver
│       └── useLocalStorage.ts# persisted-state hook + cn() classnames helper
└── src-tauri/                # Tauri/Rust shell (default scaffold) + icons
```

## The three kinds of tool

Every tool is one of three `kind`s, declared in `src/data/catalog.ts` and rendered by `ToolView`:

| kind | data lives in | rendered by | use for |
| --- | --- | --- | --- |
| `template` | `templates.ts` | `TemplateTool` | fill-in letters, emails, documents |
| `calculator` | `calculators.ts` | `CalculatorTool` | input fields → computed result rows |
| `custom` | a component in `components/custom/` | that component | dynamic UIs (tables, grids, shuffles) |

`catalog.ts` merges all three into a single `NAV` array (the sidebar order) and exposes lookups
(`TOOL_BY_ID`, `GROUP_BY_TOOL`, `ALL_TOOLS`).

## Data shapes

**Template** (`TemplateMeta`): `title`, `category`, `tab`, `placeholders[]`, and `templates`
(`{ formal, modern, friendly }`). Placeholders are `[Bracketed]` tokens; `TemplateTool` swaps them
for user input and renders a live, copyable, printable preview.

**Calculator** (`CalcSpec`): a list of `fields` (number / currency / percent / select / date / text)
plus a pure `compute(values, ctx)` that returns `{ rows: ResultRow[]; note? }`. `ctx` provides
`region`, `money()` and `num()` formatters. Set `currency: "IN" | "US" | ...` on a spec to pin it to
a region's currency (used by region-specific payroll); otherwise it follows the app's region switch.

## How to add a tool

**A letter or email** → add one entry to `templates.ts` (pick the right `tab`). It appears
automatically in the matching sidebar group.

**A calculator** → add a `CalcSpec` to `calculators.ts`, then a presentation entry in `CALC_META`
and the id into a `NAV` group in `catalog.ts`. Statutory formulas should be commented with their
source year and surfaced as an estimate via the `note` field.

**A custom tool** → create `components/custom/MyTool.tsx`, add a `Tool` entry (`kind: "custom"`) to
`CUSTOM` in `catalog.ts`, reference it in a `NAV` group, and register it in `ToolView`'s `CUSTOM`
map. Add any new lucide icon names to `lib/icons.tsx`.

## Printing

"Save as PDF" calls `window.print()`. `index.css` hides everything marked `.no-print` and promotes
the `.printable` element to a full-page A4 layout, so the browser/OS print dialog produces a clean
document with no app chrome.

## Conventions

- Keep tool logic **pure and offline** — no fetches, no Date.now in shared modules where avoidable.
- Statutory rates are **estimates**; always label them and date the assumptions in comments.
- Prefer adding data over adding components; the engines should cover most needs.
