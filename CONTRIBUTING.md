# Contributing to hrToolkit

Thanks for helping make free HR & teaching tools better! hrToolkit is small, offline and
data-driven on purpose — most contributions are tiny, local changes.

## Setup

```bash
bun install
bun run tauri dev      # desktop app with hot reload
```

Requires [Rust](https://rustup.rs) (stable) and [Bun](https://bun.sh). On first run Tauri compiles
the Rust shell, which can take a couple of minutes; subsequent runs are instant.

## Useful commands

| Command | What it does |
| --- | --- |
| `bun run tauri dev` | Run the desktop app |
| `bun run tauri build` | Build a distributable bundle (.dmg / .app / .msi / AppImage) |
| `bun run build` | Frontend-only production build (also runs `tsc`) |
| `bunx tsc --noEmit` | Type-check only |
| `bun run tauri icon src-tauri/icons/icon-source.png` | Regenerate all app icons |

## Adding a tool

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full picture. In short:

- **Letter / email / document** → add an entry to `src/data/templates.ts`.
- **Calculator** → add a `CalcSpec` to `src/data/calculators.ts`, a `CALC_META` entry and a
  `NAV` placement in `src/data/catalog.ts`.
- **Custom interactive tool** → add a component under `src/components/custom/`, register it in
  `catalog.ts` (`CUSTOM`) and `ToolView.tsx`.

## Ground rules

1. **Stay offline.** No network calls, accounts, analytics or external services. Ever.
2. **Label estimates.** Tax/PF/gratuity/PAYE rates change and vary by jurisdiction — comment the
   source year and surface a caveat via the calculator's `note`.
3. **Keep it typed.** `bunx tsc --noEmit` must pass; no `any` unless unavoidable.
4. **Match the style.** Reuse the Tailwind theme tokens and existing component patterns.
5. **Be inclusive.** This serves India, the US, Europe, the Middle East and Africa — prefer
   region-aware designs and neutral example data.

## Pull requests

- Keep PRs focused (ideally one tool or one fix).
- Update `CHANGELOG.md` under an "Unreleased" heading.
- Confirm the app still builds: `bun run build`.

By contributing you agree your work is licensed under the project's [MIT License](./LICENSE).
