# Security Policy

## Reporting a vulnerability

If you find a security issue, please **do not open a public issue**. Instead, use
GitHub's [private vulnerability reporting](https://github.com/Yupcha/hr-tools/security/advisories/new)
(Security → Report a vulnerability) so it can be fixed before disclosure.

Please include: what the issue is, how to reproduce it, and the impact. We aim to
acknowledge reports within a few days.

## Threat model

hrToolkit is **offline by default**. By design it:

- Makes **no network requests** out of the box — no accounts, no cloud, no telemetry.
- Ships a strict **Content-Security-Policy** (`default-src 'self'`, no remote
  origins) so the **webview** cannot exfiltrate data even if content were injected.
- Stores all user data in **`localStorage`** on the device; saving a PDF writes
  only to a file *you* pick via the native dialog (scoped to Desktop / Documents /
  Downloads / Home).
- Renders user input as text (no `innerHTML`), avoiding HTML/script injection.

### The one optional network path: AI Assist

AI Assist is **off by default**. When *you* turn it on (Workspace → AI Assist), the
app can draft/extract with either a **local model** (Ollama on `localhost` — nothing
leaves the device) or **Anthropic Claude using your own API key**. Notes:

- The request is made by the **Rust backend** (`ai_complete`), never the webview —
  so the strict webview CSP stays in force and the egress point is auditable in one
  place (`src-tauri/src/lib.rs`).
- It fires **only** when AI is enabled and you trigger a draft; nothing is sent in
  the background.
- With **Anthropic**, only the text you draft is sent, to `api.anthropic.com`, with
  your key (stored on-device). With **Ollama**, traffic stays on `localhost`.

The optional MCP server (`mcp/`) is read-only and also makes **no** network calls.

Because nothing leaves the machine, the main realistic risks are local
(supply-chain of dependencies, a malicious build). Verify releases against the
source and prefer building from source if in doubt.

## Supported versions

Pre-1.0: only the latest release receives fixes.
