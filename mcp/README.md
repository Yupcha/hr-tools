# hrToolkit MCP server

Broadcasts hrToolkit's capabilities over the [Model Context Protocol](https://modelcontextprotocol.io)
so an MCP-aware agent (Claude Desktop, Claude Code, your own agent) can **use the
toolkit programmatically** — discover its 59 tools, generate any letter/email/payslip
from a template, and run any payroll/HR/education calculator.

Everything runs **locally** — the server makes no network calls and nothing leaves
your machine. It's the "agentic" surface of the same offline toolkit.

## Tools exposed

| Tool | What it does |
| --- | --- |
| `list_hr_tools` | List every tool (id, kind, title, description). |
| `generate_hr_document` | Fill a letter/email/payslip template — `{ toolId, tone?, values }`. |
| `run_hr_calculator` | Run a calculator — `{ toolId, region?, values }` → labelled result rows. |

## Run it

Requires [Bun](https://bun.sh) (the server imports the app's TypeScript data directly):

```bash
bun run mcp        # = bun mcp/server.ts   (stdio transport)
```

## Wire into Claude Desktop

Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "hrtoolkit": {
      "command": "bun",
      "args": ["mcp/server.ts"],
      "cwd": "/absolute/path/to/hrToolkit"
    }
  }
}
```

Restart Claude Desktop, then ask it things like *"use hrToolkit to draft an offer
letter for Priya Sharma, Senior Engineer at Acme"* or *"compute India in-hand for a
₹18L CTC with hrToolkit."*

> **Note:** this server is read-only and offline by design — it generates text and
> runs pure calculations. It does not send email, write files, or call any network API.
