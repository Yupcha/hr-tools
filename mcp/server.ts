#!/usr/bin/env bun
/**
 * hrToolkit MCP server — broadcasts the toolkit's capabilities for agentic use.
 *
 * Lets an MCP-aware agent (Claude Desktop, etc.) discover hrToolkit's 59 tools,
 * generate any letter/email/payslip from a template, and run any payroll/HR
 * calculator — all locally, with no network calls and no data leaving the machine.
 *
 * Run:  bun mcp/server.ts        (stdio transport)
 * Wire it into an MCP client — see mcp/README.md.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { ALL_TOOLS, TOOL_BY_ID, templateRegistry, calculatorRegistry } from "../src/data/catalog.ts";
import { regionById, money as fmtMoney, num as fmtNum, type RegionId } from "../src/lib/regions.ts";

const json = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] });
const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });

/** Replace [Placeholder] tokens with values, leaving unknown tokens in place. */
const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\[(.*?)\]/g, (_, key) => values[key]?.trim() || `[${key}]`);

const server = new McpServer({ name: "hrtoolkit", version: "0.1.0" });

// 1) Discovery — what can this toolkit do?
server.tool(
  "list_hr_tools",
  "List every hrToolkit tool (letters, HR emails, payslips, payroll/tax calculators, classroom tools) with its id, kind and description. Use the id with generate_hr_document or run_hr_calculator.",
  async () =>
    json(
      ALL_TOOLS.map((t) => ({ id: t.id, kind: t.kind, title: t.title, description: t.description })),
    ),
);

// 2) Generate a document from a template.
server.tool(
  "generate_hr_document",
  "Generate an HR letter, email or payslip from a template. Pass the tool id (kind 'template' from list_hr_tools), an optional tone, and a map of placeholder → value. Returns the filled document text and any placeholders left unfilled.",
  {
    toolId: z.string().describe("Template tool id, e.g. 'offer-letter'"),
    tone: z.enum(["formal", "modern", "friendly"]).optional().describe("Defaults to formal"),
    values: z.record(z.string(), z.string()).optional().describe("Placeholder → value, e.g. {\"Employee Name\":\"Priya\"}"),
  },
  async ({ toolId, tone, values }) => {
    const meta = templateRegistry[toolId];
    if (!meta) return text(`No template tool with id "${toolId}". Call list_hr_tools to see valid ids.`);
    const vals = values ?? {};
    const filled = fill(meta.templates[tone ?? "formal"], vals);
    const missing = meta.placeholders.filter((p) => !vals[p]?.trim());
    return json({ title: meta.title, tone: tone ?? "formal", document: filled, unfilledPlaceholders: missing });
  },
);

// 3) Run a calculator.
server.tool(
  "run_hr_calculator",
  "Run an hrToolkit payroll/HR/education calculator. Pass the tool id (kind 'calculator' from list_hr_tools), an optional region for generic calculators (IN/US/UK/EU/AE/SA/ZA/NG), and a map of input key → value. Statutory results are estimates (FY 2024-25).",
  {
    toolId: z.string().describe("Calculator tool id, e.g. 'india-take-home'"),
    region: z.string().optional().describe("Region for generic calculators; ignored by region-fixed ones"),
    values: z.record(z.string(), z.string()).describe("Input field key → value, e.g. {\"ctc\":\"1200000\"}"),
  },
  async ({ toolId, region, values }) => {
    const spec = calculatorRegistry[toolId];
    if (!spec) return text(`No calculator with id "${toolId}". Call list_hr_tools to see valid ids.`);
    const reg = regionById((spec.currency ?? (region as RegionId) ?? "IN") as RegionId);
    try {
      const result = spec.compute(values, {
        region: reg,
        money: (v, d) => fmtMoney(v, reg, { decimals: d }),
        num: (v, d) => fmtNum(v, reg, d),
      });
      return json({
        tool: TOOL_BY_ID[toolId]?.title ?? toolId,
        currency: reg.currency,
        rows: result.rows.map((r) => ({ label: r.label, value: r.value })),
        note: result.note,
      });
    } catch (e) {
      return text(`Calculation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
);

await server.connect(new StdioServerTransport());
console.error("hrToolkit MCP server running on stdio.");
