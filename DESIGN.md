# hrToolkit — Design Language

> **One line:** the calm, content-first clarity of **Notion** married to the
> dense, keyboard-driven power of **Obsidian** — wrapped in a warm, coral-accented
> identity that's wholly its own. A *tool for thought* for HR & teaching.

This document is the source of truth for how hrToolkit looks and feels. Adding a
tool or a screen? Match what's written here. The system is **token-driven**, so
"following the design" mostly means *using the semantic tokens*, never raw hex.

---

## 1. Principles

1. **Calm by default, dense on demand.** Notion's generous whitespace and quiet
   surfaces for reading; Obsidian's compact rows and hotkeys for doing. The home
   and document views breathe; the sidebar and command palette are tight and fast.
2. **Keyboard is a first-class citizen.** Every primary action has a shortcut.
   `⌘K` goes anywhere. You should be able to run the app without a mouse.
3. **Warm, not corporate.** The accent is a confident coral on a warm-neutral
   canvas — never the cold blue/grey of generic SaaS. This is the app's signature.
4. **One identity, two moods.** A single warm palette expressed as **Light**
   (Notion-calm) and **Dark** (Obsidian near-black). The same coral threads through
   both. Themes are token overrides — components never branch on theme.
5. **Offline-honest.** No skeletons faking network latency, no spinners. State is
   local and instant; the UI reflects that with immediate, snappy feedback.

---

## 2. Color — semantic tokens

Defined in `src/index.css` under `@theme` (light) and overridden under `.dark`.
**Always use the token, never the hex.** Utilities: `bg-surface`, `text-ink`,
`border-hairline`, `text-coral`, etc.

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `canvas` | app background | warm off-white | warm near-black |
| `surface` | cards, panels, inputs | white | raised charcoal |
| `soft` | subtle fills, hover | warm sand | warm graphite |
| `hairline` | borders, dividers | sand line | charcoal line |
| `ink` | primary text / headings | near-black brown | warm off-white |
| `body` | body text | dark brown | warm grey |
| `muted` | secondary text | mid brown | mid grey |
| `faint` | labels, captions, icons-at-rest | light brown | dim grey |
| `coral` | **primary accent** — actions, active, emphasis | `#e05d35` | `#f0764d` |
| `coral-soft` | accent tint backgrounds | warm blush | deep coral-brown |
| `mint` / `teal` | positive / secondary | — | brighter in dark |
| `ochre` | favorites / warning | — | brighter in dark |
| `sky` | informational | — | brighter in dark |

**Accent discipline:** coral marks *one* primary thing per view (active tool,
primary button, the emphasized result row). Overusing it kills the calm.

---

## 3. Typography

- **Family:** `SUSE` (geometric, friendly, distinctive) → system sans fallback.
  Monospace (`ui-monospace`) for **numbers, currency, counts, shortcut keys** —
  tabular figures make calculators legible.
- **Scale (px):** hero `34` · h1 `19` · section-label `11–13` (uppercase, tracked)
  · body `13–15` · caption `11–12`.
- **Weight:** headings `bold`; section labels `bold` + `uppercase` +
  `tracking-[0.12em]`; body `regular`; interactive `semibold`.
- **Numbers** are always `font-mono tabular-nums` so columns align and don't jitter.

---

## 4. Shape, space, elevation

- **Radius:** `--radius-yc` (`0.85rem`) for cards/inputs/buttons; `lg` (`0.5rem`)
  for rows and small chips. Nothing fully square, nothing pill except status chips.
- **Spacing rhythm:** 4px base. Card padding `20px` (`p-5`); page gutters `24–32px`;
  row height ~`32–34px` in the sidebar (Obsidian density).
- **Elevation:** Light mode uses soft shadows (`shadow-sm`/`md`) + a hairline.
  Dark mode drops shadows almost entirely and leans on the hairline + a slightly
  raised `surface` — shadows read as noise on near-black.

---

## 5. Motion

Quick and physical, never decorative-slow.

- **Transitions:** `150–200ms ease` on color, background, border, transform.
- **Hover lift:** cards `-translate-y-0.5` + shadow step. Icons `scale-110`.
- **Command palette:** `120ms` fade + `scale(0.98→1)` in; backdrop blur.
- **Collapsible sidebar groups:** grid-rows height animation, `180ms ease`.
- **Theme switch:** a global `200ms` color transition so light⇄dark melts, not snaps.
- Respect `prefers-reduced-motion`: drop transforms, keep opacity.

---

## 6. Signature interactions (the "one of a kind" layer)

1. **Command palette — `⌘K` / `Ctrl+K`.** Fuzzy-search all 52 tools, arrow-key
   navigation, `↵` to open. The fastest path to anything. Notion+Obsidian's soul.
2. **Dual theme — `☾/☀` toggle.** Persisted, OS-aware, no flash-on-load (a tiny
   inline script in `index.html` sets the class before first paint).
3. **Keyboard-first nav.** `⌘K` palette · `⌘\` collapse sidebar · `/` focus search
   · `Esc` close / go home. Shortcuts are shown in-UI on `kbd` chips.
4. **Collapsible sidebar sections.** Notion-style groups that fold away with a
   chevron; collapsed state persists per-section.

---

## 7. Component patterns

- **Sidebar:** quiet (`bg-soft/40`), tight rows, icon at rest in `faint`, active
  row is a raised `surface` chip with coral icon. Group headers are foldable.
- **Cards (Home grid):** `surface` + hairline + `shadow-sm`; hover lifts and tints
  the border coral. Icon sits in a `coral-soft` rounded square.
- **Inputs:** `surface`/`canvas` fill, hairline border, coral focus ring
  (`ring-4 ring-coral/10`). Currency/percent affix in mono `faint`.
- **Result panels:** emphasized row gets a `coral-soft` background + large mono
  coral number; other rows zebra-stripe faintly.
- **Buttons:** primary = solid `coral` + white; secondary = `surface` + hairline.
- **`kbd` chips:** mono, `soft` background, hairline, for showing shortcuts.

---

## 8. Adding a tool — the design checklist

- [ ] Uses **only semantic tokens** (works in light *and* dark automatically).
- [ ] Numbers are `font-mono tabular-nums`.
- [ ] One coral emphasis max per view.
- [ ] Reachable from the command palette (it indexes the catalog — just add the tool).
- [ ] No raw hex, no cold greys, no network spinners.
