# Security Policy

## Reporting a vulnerability

If you find a security issue, please **do not open a public issue**. Instead, use
GitHub's [private vulnerability reporting](https://github.com/Yupcha/hr-tools/security/advisories/new)
(Security → Report a vulnerability) so it can be fixed before disclosure.

Please include: what the issue is, how to reproduce it, and the impact. We aim to
acknowledge reports within a few days.

## Threat model

hrToolkit v2 is **strictly local**. By design it:

- Makes **no network requests** out of the box — no accounts, no cloud, no telemetry,
  and since v2 **no cloud AI provider exists in the app at all**.
- Ships a strict **Content-Security-Policy** (`default-src 'self'`, no remote
  origins, no `unsafe-eval`, `form-action 'none'`) so the **webview** cannot
  exfiltrate data even if content were injected. Dev-server origins live only in
  `devCsp` and are not present in release builds.
- Stores all user data in **`localStorage`** on the device; saving a PDF writes
  only to a file *you* pick via the native dialog (scoped to Desktop / Documents /
  Downloads).
- Renders user input as text (no `innerHTML`), avoiding HTML/script injection.
- On Android, ships with `allowBackup="false"` so the OS never uploads the app's
  data to Google Drive backups.

### The one optional network path: AI Assist (local-only)

AI Assist is **off by default**, and in v2 its only backend is a **local model via
Ollama on this machine**. Notes:

- The request is made by the **Rust backend** (`ai_complete`), never the webview —
  the egress point is auditable in one place (`src-tauri/src/lib.rs`).
- The backend **refuses any endpoint that is not loopback** (`localhost`,
  `127.0.0.1`, `[::1]`) and disables HTTP redirects — so even a tampered settings
  record cannot route drafted HR text off the device.
- It fires **only** when AI is enabled and you trigger a draft; nothing is sent in
  the background.
- The v1 Anthropic bring-your-own-key provider was **removed** in 2.0.0; upgrading
  scrubs any stored API key from settings.

The optional MCP server (`mcp/`) is read-only and also makes **no** network calls.

Because nothing leaves the machine, the main realistic risks are local. Be aware of
what remains **outside the app's control** on a shared computer:

- `localStorage` (saved company/people profiles) is **not encrypted at rest** —
  it is protected by your OS user account, so anyone who can log in as you can
  read it. Use separate OS accounts on shared machines.
- Exported PDFs are plain files: folders synced to iCloud/OneDrive will upload
  them, and OS search indexes their contents.
- "Copy" places document text on the system clipboard, which clipboard managers
  and OS clipboard sync can capture.

Verify releases against the source and prefer building from source if in doubt.

## Supported versions

Only the latest release receives fixes.
