# hrToolkit Redesign — Lead Architect Blueprint

One coherent, conflict-free implementation plan synthesizing the four council
specs (product-architect, hr-expert, ux-interaction, doc-craft) into the seven
approved moves:

1. Person-as-hero · 2. Lifecycle IA · 3. Guided first-run home · 4. Emotional
register · 5. PDF document craft · 6. Batch / mail-merge · 7. Visible trust.

> **North star:** "hrToolkit turns a PERSON (or company) into any document or
> number you need — in two minutes, with nothing leaving your machine."

---

## 0. Ground truth (verified in code, not assumed)

These facts override any conflicting numbers in the council specs:

| Fact | Value | Source |
|---|---|---|
| Templates | **26** (12 letters + 10 emails + 4 payroll) | `grep -c` on `templates.ts` |
| Calculators | **26** | `calculators.ts` keys |
| Custom tools | **7** (incl. `profiles`) | `CUSTOM[]` in `catalog.ts` |
| **Total tools** | **59** | 26 + 26 + 7 |
| Calculator CTC input key | `ctc` (lowercase) | `calculators.ts:200` |
| Existing localStorage keys | `hrt.active`, `hrt.region`, `hrt.favorites`, `hrt.recents`, `hrt.sidebar`, `hrt.profiles` | `App.tsx`, `profiles.ts` |
| Icons already mapped | `Wallet Sparkles CalendarClock Wrench GraduationCap Users UserPlus Receipt FileText ChevronRight Pencil` | `icons.tsx` |
| Icons **missing** (must add) | `DoorOpen DoorClosed ShieldCheck Stamp Image` | `icons.tsx` |
| `select` signature today | `(id: string) => void`, sets `activeId` + recents | `App.tsx:29` |
| `CUSTOM` type today | `Record<string, React.FC>` | `ToolView.tsx:14` |
| Templates already bake text letterhead+signature into the body | yes — graphical letterhead must be **opt-in, default OFF** | `templates.ts` |

### Conflict resolutions (where councils disagreed)

1. **Stage grouping — additive, not destructive.** product-architect proposed
   *replacing* `NAV` with derived moment groups. hr-expert and ux-interaction
   keep `NAV` intact and add a **parallel lifecycle index**. **DECISION: keep
   `NAV`, `ALL_TOOLS`, `TOOL_BY_ID`, `GROUP_BY_TOOL` byte-identical** (Sidebar,
   CommandPalette, breadcrumb all depend on them). Lifecycle is a new presentation
   layer (`STAGES` + `TOOLS_BY_STAGE`) consumed only by Home. This satisfies HARD
   RULE 5 (all 59 reachable) with zero reachability risk.
2. **Single source for stage data.** Three specs each defined `Stage`/`STAGES`.
   **DECISION: one file, `src/data/lifecycle.ts`**, owns the stage model and the
   stage→tool mapping. `catalog.ts` only gains the optional `stage`/`register`/
   `batch` annotations on `Tool` (used by register + batch features), set from the
   same lifecycle table so the two never drift.
3. **Person context vs. one-shot seed.** product-architect proposed an ambient
   `activePersonId` that auto-fills every open template. ux-interaction proposed a
   one-shot `prefill` seed launched from a PersonCard. **DECISION: ship the
   one-shot seed as the v1 mechanism** (smaller, safer, no clobber risk, no new
   persisted global). The ambient `activePersonId` "context bar" is **deferred to
   v2** and noted as a hook point. Rationale: the seed delivers the same
   "person → document, pre-filled" north-star moment with far less surface area
   and no risk to the 59 existing tools' default behavior.
4. **Gratuity dual-staging.** hr-expert dual-tags 4 final-settlement calculators
   into Pay **and** Exit via `altStages`. **DECISION: adopt** — but counted once in
   `ALL_TOOLS`; `altStages` only affects the Home lifecycle view. No double-count.
5. **`profiles.ts` field additions.** product-architect adds `companyId`,
   `updatedAt`, new PERSON_FIELDS, `contextFillMap`, `useActiveContext`.
   **DECISION: defer `companyId`/`contextFillMap`/`useActiveContext` (v2 ambient
   context).** For v1 keep `profiles.ts` additions minimal: `logo?` (doc-craft),
   new PERSON_FIELDS keys, extra `fillMap` aliases, and `PERSON_ACTIONS`. All
   append-only, all back-compatible.

---

## (a) FILE-OWNERSHIP MAP

Each file lists which **step** owns which region, so no two steps edit the same
lines. Steps are: **CORE** (person seed + lifecycle + guided home + trust),
then isolated features **F4** (register), **F5** (PDF craft), **F6** (batch).

| File | Status | Owned by | Exact ownership |
|---|---|---|---|
| `src/data/lifecycle.ts` | **NEW** | CORE | entire file: `StageId`, `Stage`, `STAGES`, `STAGE_BY_ID`, `TOOLS_BY_STAGE`, dev-validation |
| `src/lib/profiles.ts` | edit | CORE (+F5) | CORE: append `PERSON_FIELDS` keys, `fillMap` aliases, `PersonAction`+`PERSON_ACTIONS`. F5: append `logo?` to `Profile`. **Disjoint regions.** |
| `src/lib/icons.tsx` | edit | CORE (+F4) | CORE: add `ShieldCheck`. F4: add `DoorOpen`,`DoorClosed`. F5: add `Stamp`,`Image`. Single import block + MAP — coordinate as one append (see Build Order note). |
| `src/lib/useFlash.ts` | **NEW** | CORE | entire file (shared flash hook) |
| `src/App.tsx` | edit | CORE | widen `select(id, seed?)`; add `prefill` state; pass `prefill`/`onPrefillConsumed` to `ToolView`; pass `hasProfiles`/`onNewPerson` to `Home`; mount `<OfflineBadge/>` |
| `src/components/OfflineBadge.tsx` | **NEW** | CORE | entire file |
| `src/components/Home.tsx` | **rewrite** | CORE | whole component: first-run vs returning, hero copy, `StageGrid`, inline stage drawer, "Start with a person", full `NAV` disclosure |
| `src/components/custom/PersonCard.tsx` | **NEW** | CORE | entire file |
| `src/components/custom/Profiles.tsx` | edit | CORE (+F5) | CORE: person rows default to PersonCard, accept `onLaunch`, Edit toggle, debounced autosave. F5: company logo upload tile. **Disjoint: CORE owns the row/launch logic; F5 owns the logo `<input>` block in the company editor.** |
| `src/components/ToolView.tsx` | edit | CORE (+F6) | CORE: thread `prefill`/`onPrefillConsumed` to `TemplateTool`+`CalculatorTool`; widen `CUSTOM` to `React.FC<CustomToolProps>` with `onLaunch`. F6: nothing here (batch lives inside TemplateTool). |
| `src/components/CalculatorTool.tsx` | edit | CORE | consume `prefill` in state init (by field `key`, e.g. `ctc`) |
| `src/components/TemplateTool.tsx` | edit | CORE / F4 / F5 / F6 | **Region-partitioned (see below).** |
| `src/data/catalog.ts` | edit | F4 / F6 | F4: `Register` type + `register?` on `Tool` + `CARE_CHECKLISTS` + `registerStyle`. F6: `batch?` on `Tool`. Both append-only after `ALL_TOOLS`. |
| `src/components/CarePanel.tsx` | **NEW** | F4 | entire file (or co-located in TemplateTool) |
| `src/components/BatchPanel.tsx` | **NEW** | F6 | entire file |
| `src/lib/batch.ts` | **NEW** | F6 | entire file (CSV + buildBatch, dependency-free) |
| `src/lib/pdf.ts` | edit | F5 / F6 | F5: `Letterhead`/`SignatureBlock`/`DocOptions` types, typographic defaults, `drawLetterhead`/`drawSignature`/`rule`, thread `opts`. F6: `exportBatchPdf`. **Disjoint exports.** |

### `TemplateTool.tsx` internal partition (the one hot file — four steps touch it)

To prevent conflicts, each step edits a **named, disjoint region**:

| Region | Owner | What |
|---|---|---|
| R1 `useEffect([meta])` init + `prefill` merge | CORE | merge `prefill` into empty fields once, call `onPrefillConsumed()` |
| R2 preview `<pre>` tone cross-fade | CORE | add `key={tone}` + `animate-fade` |
| R3 Save-PDF button feedback | CORE | replace ad-hoc state with `useFlash` |
| R4 tone init default | F4 | `setTone(register==="warm" ? "friendly" : "formal")` |
| R5 `<CarePanel/>` mount above inputs | F4 | render when `CARE_CHECKLISTS[id]` exists; gate Save until ticked |
| R6 Letterhead toggle + `DocOptions` builder | F5 | toggle pill + `docOptions()` passed to `exportTextPdf` |
| R7 Single/Batch tab + `<BatchPanel/>` | F6 | tab shown when `tool.batch`; mounts BatchPanel |

> **Build-order guarantee:** CORE lands R1–R3 first. F4 adds R4–R5 (new lines,
> no overlap with R1–R3). F5 adds R6 (new toolbar button + builder). F6 adds R7
> (new tab wrapper around the existing Single layout). Because each region is a
> distinct insertion, later steps never re-edit earlier lines.

---

## (b) SAFE BUILD ORDER

The coupled CORE lands first as one shippable, tsc-green slice; isolated
features follow in dependency order. Verify `bunx tsc --noEmit` green after each.

### STEP 0 — Icons (5 min, unblocks everything)
Add all five missing icons in ONE edit to `icons.tsx` import block + MAP:
`ShieldCheck, DoorOpen, DoorClosed, Stamp, Image`. Doing this once avoids three
steps fighting over the same import line.
**AC:** `getIcon("ShieldCheck")` etc. resolve; tsc green.

### STEP 1 — CORE (person-seed + lifecycle + guided home + trust) — lands as one PR
Coupled because Home consumes both the lifecycle data and the seed-launch path,
and PersonCard is the person-as-hero surface. Sub-order within CORE:

1a. **`lifecycle.ts`** (pure data, dev-validated against `TOOL_BY_ID`).
1b. **`profiles.ts`** PERSON_FIELDS + aliases + `PERSON_ACTIONS`.
1c. **`useFlash.ts`** + **`OfflineBadge.tsx`** (leaf, no deps).
1d. **`App.tsx`** `select(id, seed?)` + `prefill` state + mount badge + new Home props.
1e. **`ToolView.tsx`** thread `prefill`; widen `CUSTOM` type with `onLaunch`.
1f. **`TemplateTool.tsx` R1–R3** + **`CalculatorTool.tsx`** consume `prefill`.
1g. **`PersonCard.tsx`** + **`Profiles.tsx`** (PersonCard default view, `onLaunch`, autosave).
1h. **`Home.tsx`** rewrite (first-run, StageGrid, drawer, full-NAV disclosure).

**CORE AC:** all 59 reachable from sidebar + ⌘K + Home; person → "Create offer"
opens Offer Letter pre-filled; calculator seed maps `Annual CTC → ctc`; badge
visible everywhere & absent from PDFs; tsc green; existing single-arg `onSelect`
callers still compile.

### STEP 2 — F4 Emotional register (self-contained: catalog data + TemplateTool R4–R5)
Depends on CORE only for `getIcon` additions. Adds `register`, `CARE_CHECKLISTS`,
`CarePanel`, warm/careful tone defaults.

### STEP 3 — F5 PDF document craft (pdf.ts + TemplateTool R6 + Profiles logo)
Independent of F4/F6. Default OFF preserves byte-identical output.

### STEP 4 — F6 Batch / mail-merge (largest; depends on F4 careful-gating + `batch` flag)
Last because it reuses F4's careful-register confirmation and the `batch` flag,
and wraps the existing Single layout (R7) without disturbing it.

---

## (c) COMPONENT TREE + STATE / LOCALSTORAGE SHAPES

### Component tree (after redesign)

```
App
├─ Sidebar                      (unchanged — reads NAV)
├─ main
│  ├─ header (breadcrumb, Save/fav)             [when tool active]
│  ├─ ToolView                                  [when tool active]
│  │   ├─ TemplateTool  ─ ProfileBar
│  │   │                 ├─ CarePanel           [F4, careful tools]
│  │   │                 ├─ BatchPanel          [F6, when tool.batch]
│  │   │                 └─ preview <pre key={tone}>
│  │   ├─ CalculatorTool
│  │   └─ custom/{… , Profiles}
│  │        └─ Profiles
│  │            ├─ PersonCard  (default for person rows)   [CORE]
│  │            │   └─ PERSON_ACTIONS → onLaunch(toolId, seed)
│  │            └─ Editor (company logo upload [F5]; autosave)
│  ├─ Home                                       [when no tool]
│  │   ├─ Hero (north-star copy)
│  │   ├─ "Start with a person" card    [first run]
│  │   ├─ StageGrid (6 stage tiles) → inline stage drawer (Grid)
│  │   └─ full NAV grid  (behind disclosure on first run)
│  └─ OfflineBadge   (fixed, always mounted)     [CORE]
└─ CommandPalette                               (unchanged)
```

### New / changed types

```ts
// src/data/lifecycle.ts
export type StageId = "hire" | "onboard" | "pay" | "manage" | "exit" | "teach";
export interface Stage { id: StageId; label: string; blurb: string; icon: string; toolIds: string[]; altIds?: string[]; }

// src/data/catalog.ts  (append-only, optional → back-compatible)
export type Register = "neutral" | "warm" | "careful";
export interface Tool { /* …existing… */ register?: Register; batch?: boolean; }

// src/lib/profiles.ts
export interface Profile { /* …existing… */ logo?: string; }   // F5, company only, data: URL
export interface PersonAction { id: string; label: string; toolId: string; icon: string; seed: (p: Profile) => Record<string,string>; }

// src/components/ToolView.tsx
export interface CustomToolProps { onLaunch?: (id: string, seed?: Record<string,string>) => void; }

// src/lib/pdf.ts  (F5)
export interface DocOptions { letterhead?: Letterhead; signature?: SignatureBlock; }
```

### State / localStorage

| Where | Kind | Key / name | Shape | Notes |
|---|---|---|---|---|
| App | persisted | `hrt.active` … `hrt.profiles` | unchanged | — |
| App | **transient** | `prefill` | `Record<string,string> \| null` | one-shot seed, **not persisted**; cleared via `onPrefillConsumed` |
| Profiles | persisted | `hrt.profiles` | `Profile[]` (now with optional `logo`) | back-compatible |
| TemplateTool | local | `tone`,`values`,flash | as today + `useFlash` | R1 merges `prefill` into empty fields only |
| CarePanel (F4) | local | checklist ticks | `Record<string,boolean>` | **not persisted**; resets per open |
| BatchPanel (F6) | local | recipients | `BatchRow[]` | **not persisted**; CSV/profiles imported in-session |
| OfflineBadge | none | — | — | pure presentation |

### `PERSON_ACTIONS` (the person-as-hero payload — load-bearing seed mapping)

```ts
export const PERSON_ACTIONS: PersonAction[] = [
  { id: "offer",      label: "Create offer",      toolId: "offer-letter",      icon: "FileText", seed: (p) => fillMap(p) },
  { id: "payslip",    label: "Make payslip",      toolId: "salary-slip",       icon: "Receipt",  seed: (p) => fillMap(p) },
  { id: "experience", label: "Experience letter", toolId: "experience-letter", icon: "FileText", seed: (p) => fillMap(p) },
  { id: "inhand",     label: "Run their in-hand", toolId: "india-take-home",   icon: "Wallet",
    seed: (p) => { const c = p.fields["Annual CTC"]; return c ? { ctc: c.replace(/[^\d.]/g, "") } : {}; } },
];
```

> **Critical:** templates key by human placeholder (`fillMap` aliases handle
> them); the `india-take-home` calculator keys by `ctc`. The 4th action must
> remap `Annual CTC → ctc` and strip currency symbols, or the calc silently
> fails to prefill.

### Lifecycle stage → tool map (validated subsets; all ids confirmed in registries)

```ts
export const STAGES: Stage[] = [
  { id:"hire",    label:"Hire",    icon:"UserPlus",      blurb:"Source, interview, offer.",
    toolIds:["jd-resume-matcher","candidate-sourcing","interview-call-letter","interview-scheduling",
             "intent-to-hire-letter","conditional-offer-letter","offer-letter","offer-follow-up","rejection-email"] },
  { id:"onboard", label:"Onboard", icon:"Sparkles",     blurb:"Appoint, welcome, set up.",
    toolIds:["appointment-letter","welcome-letter","new-hire-announcement","salary-structure",
             "password-generator","probation-confirmation"] },
  { id:"pay",     label:"Pay",     icon:"Wallet",       blurb:"Payslips, take-home, payroll.",
    toolIds:["salary-slip","reimbursement-claim","bonus-policy","salary-hike-calculator","reverse-hike-calculator",
             "overtime-calculator","hourly-to-salary","pro-rata-salary","emi-calculator","gross-net-flat",
             "india-take-home","india-ctc-reverse","india-hra-exemption","india-gratuity","leave-encashment",
             "us-paycheck","uk-take-home","europe-take-home","uae-gratuity","ksa-gratuity","nigeria-paye","south-africa-paye"] },
  { id:"manage",  label:"Manage",  icon:"Users",        blurb:"Comms, reviews, tenure.",
    toolIds:["employment-verification","performance-review","policy-updates","event-invitations",
             "team-announcements","referral-request","tenure-calculator","working-days","age-calculator","profiles"] },
  { id:"exit",    label:"Exit",    icon:"DoorClosed",   blurb:"Resignation, relieving, F&F.",
    toolIds:["resignation-acceptance","termination-letter","experience-letter","relieving-letter","notice-period"],
    altIds:["india-gratuity","leave-encashment","uae-gratuity","ksa-gratuity"] },   // dual-tagged; counted once
  { id:"teach",   label:"Teach",   icon:"GraduationCap",blurb:"Grades, plans, classroom.",
    toolIds:["grade-percentage","gpa-calculator","weighted-grade","cgpa-percentage",
             "attendance-calculator","lesson-planner","seating-plan"] },
];
```

> Coverage check (primary `toolIds` only): 9+6+22+10+5+7 = **59**. Every tool has
> exactly one primary stage; the 4 final-settlement calcs *also* surface under
> Exit via `altIds` without re-counting. Add a dev-only `console.warn` loop:
> every `toolIds`/`altIds` entry must exist in `TOOL_BY_ID`, and the union of
> primary `toolIds` must equal `ALL_TOOLS.length` (=59). **Never throw** — keep
> tools reachable.

### Emotional register data (F4)

```ts
const REGISTER: Record<string, Register> = {
  "offer-letter":"warm","welcome-letter":"warm","new-hire-announcement":"warm","probation-confirmation":"warm",
  "intent-to-hire-letter":"warm","conditional-offer-letter":"warm","offer-follow-up":"warm","candidate-sourcing":"warm",
  "rejection-email":"careful","termination-letter":"careful","resignation-acceptance":"careful","relieving-letter":"careful",
};
export const CARE_CHECKLISTS: Record<string, string[]> = { /* termination, resignation, relieving, rejection — see F4 */ };
export const registerStyle = (r: Register) =>
  r==="warm"    ? { accent:"coral", note:"A warm moment — keep it personal." } :
  r==="careful" ? { accent:"sky",   note:"Handle with care." } :
                  { accent:"muted", note:"" };
```

### Batch types (F6)

```ts
export const BATCH = new Set(["offer-letter","appointment-letter","welcome-letter","salary-slip","salary-structure",
  "interview-call-letter","interview-scheduling","intent-to-hire-letter","conditional-offer-letter","offer-follow-up",
  "rejection-email","probation-confirmation","employment-verification","experience-letter","relieving-letter",
  "resignation-acceptance","termination-letter"]);   // → set Tool.batch from this
export interface BatchRow { id: string; values: Record<string,string>; }
export function buildBatch(meta: TemplateMeta, tone: Tone, rows: BatchRow[]): { row: BatchRow; text: string }[];
export function rowsFromCsv(csv: string, placeholders: string[]): BatchRow[];   // quote-aware, no deps
export function csvTemplate(placeholders: string[]): string;
// pdf.ts
export async function exportBatchPdf(title: string, docs: { name: string; body: string }[]): Promise<void>;  // page-break per person
```

---

## (d) PER-STEP ACCEPTANCE CRITERIA

### Global (every step must hold)
- `cd /Users/user4/Desktop/yupcha/hrToolkit && bunx tsc --noEmit` is green.
- `ALL_TOOLS.length === 59`; all 59 reachable via Sidebar + ⌘K + `/` + Home.
- 100% offline: no network/remote font/asset; CSV + batch PDF + logos are local
  (`data:` URLs, jsPDF built-in `times`/`courier`). `grep -rn "http" src/lib` clean.
- Only semantic tokens; no raw hex in components (raw RGB confined to `pdf.ts`);
  no theme branching. One coral emphasis per view.
- All numbers `font-mono tabular-nums`. `prefers-reduced-motion` respected
  (existing `index.css` media block neutralizes new `transition`/`animate-*`).

### STEP 0 — Icons
- All five new icons resolve via `getIcon`; tsc green.

### STEP 1 — CORE
1. Fresh localStorage: Home shows hero (north-star copy) + "Start with a person"
   + exactly 3 primary stage tiles above the fold; full 59-tool NAV behind one
   "Browse all 59 tools" toggle.
2. After ≥1 recent OR ≥1 saved profile: full 6 stage tiles + recents + full NAV.
3. Stage tiles show correct mono counts; clicking a tile opens an inline drawer of
   that stage's tools (no dead tiles — ids validated).
4. Saved person "Priya" row → **PersonCard** (4 actions), not the field editor.
   "Create offer" opens Offer Letter with Employee Name/Job Title/Annual CTC/
   Joining Date pre-filled. "Run their in-hand" opens India In-Hand with `ctc`
   pre-filled (currency stripped). Company rows behave exactly as before.
5. Opening any tool **without** a seed is byte-for-byte unchanged.
6. `prefill` never clobbers user-typed values; consumed once then cleared.
7. Editing an **existing** profile and pausing 600ms autosaves (status
   "Saving…"→"Saved"); a never-saved profile does NOT autosave until first Save.
8. OfflineBadge visible on Home + every tool view + sidebar collapsed; absent from
   PDFs (`no-print`); `pointer-events-none`; tooltip + `aria-label` present.
9. Existing single-arg `onSelect(id)` callers still compile (seed optional).

### STEP 2 — F4 Register
- `termination-letter` shows a quiet "Handle with care" panel (sky icon, **no
  coral**) with its checklist; Save PDF disabled until all items ticked.
- `offer-letter` defaults to **friendly** tone with a warm coral note.
- Both correct in light + dark with zero theme branches; tsc green.

### STEP 3 — F5 PDF craft
- `exportTextPdf(title, body)` / `exportMonoPdf(title, body)` still run with two
  args; LessonPlanner/SeatingPlan PDFs visually identical.
- Letterhead toggle appears **only** on templates containing `Organization Name`;
  default OFF → output unchanged except refined defaults (11.5pt/17pt leading/
  warm near-black/wider margins/hairline above footer).
- Toggle ON + company logo applied → page 1 shows logo (≤120×48pt, aspect kept) +
  right-aligned org name + ≤2 address lines + hairline rule, page-1 only; document
  ends with a ruled signature line + name/org.
- Company logo upload downscales to ≤240px long edge, `data:` URL ≤~120 KB; corrupt/
  non-image files never throw and are skipped/rejected.

### STEP 4 — F6 Batch
- A 5-row CSV → 5-page PDF, one person per page, all `[Placeholders]` resolved.
- Rows missing required person fields flagged with an **ochre** warning chip.
- Careful-register batch tools (rejection, termination) require typing `CONFIRM`
  before "Save all". Recipient counts/steppers use `font-mono tabular-nums`.
- Single/Batch tab only on `tool.batch` tools; Single view unchanged. Works offline.

---

## Deliberate v1 non-goals (documented hook points)
- **Ambient person context bar** (`activePersonId`, `contextFillMap`,
  `useActiveContext`, `Profile.companyId`) — deferred to v2. v1 uses the one-shot
  `prefill` seed, which delivers the same person→document moment with less risk.
- **Calculator-wide context auto-fill** beyond the explicit `PERSON_ACTIONS`
  remaps — future `CalcSpec.prefill`.
- **Replacing `NAV` with moments in the sidebar** — `NAV` stays; lifecycle is a
  Home-only presentation layer. No tool loses its sidebar home.
- **Template draft autosave** (`hrt.draft.${id}`) — optional, behind review;
  ship profile autosave only if the draft scope feels risky.
- **No profile schema migration** — flat strings + optional fields only.
