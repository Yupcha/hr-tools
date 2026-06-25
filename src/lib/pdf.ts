import { jsPDF } from "jspdf";

/** True when running inside the Tauri desktop webview (vs a plain browser). */
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Turn an arbitrary title into a safe-ish PDF filename. */
function toFilename(title: string): string {
  const base = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "document";
  return `${base}.pdf`;
}

/**
 * Optional document craft applied to a text PDF. Everything here is opt-in and
 * fully offline: the logo is a self-contained `data:` URL carried on a saved
 * Company profile, and all fonts are jsPDF built-ins.
 */
export interface DocCraft {
  /** Letterhead masthead: company name (and optional address lines). */
  letterhead?: {
    company: string;
    addressLines?: string[];
    /** Self-contained PNG/JPEG `data:` URL (offline). Downscaled to fit. */
    logo?: string;
  };
  /** Signature block appended after the body (name / title / company). */
  signature?: {
    name: string;
    title?: string;
    company?: string;
  };
}

/** Detect jsPDF image format from a data: URL. Defaults to PNG. */
function imageFormat(dataUrl: string): "PNG" | "JPEG" {
  return /^data:image\/jpe?g/i.test(dataUrl) ? "JPEG" : "PNG";
}

/**
 * Render a plain-text document (letters, emails, payslips) to a clean A4 PDF.
 * The text is wrapped to the page width and paginated; an optional graphical
 * letterhead and signature block can be layered on (all opt-in, all offline).
 */
function buildTextPdf(body: string, mono = false, craft?: DocCraft): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  renderTextDoc(doc, body, mono, craft);
  return doc;
}

/**
 * Render a text document onto `doc`, starting at the top of the CURRENT page
 * (the caller is responsible for adding a fresh page first when chaining). This
 * is the single shared renderer behind both the single-document and the
 * batch / mail-merge paths, so a batch page matches the standalone export.
 */
function appendTextPdf(doc: jsPDF, body: string, mono = false, craft?: DocCraft): void {
  renderTextDoc(doc, body, mono, craft);
}

function renderTextDoc(doc: jsPDF, body: string, mono: boolean, craft?: DocCraft): void {
  const margin = 56;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const lineH = mono ? 15 : 16;
  const contentW = pageW - margin * 2;

  const serif = mono ? "courier" : "times";
  const bodySize = mono ? 10 : 11;

  const setBody = () => {
    doc.setFont(serif, "normal");
    doc.setFontSize(bodySize);
    doc.setTextColor(20, 20, 20);
  };
  setBody();

  const footer = () => {
    doc.setFont(serif, "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated with hrToolkit · free & offline", margin, pageH - 28);
    setBody();
  };

  let y = margin;

  // ── Letterhead masthead (opt-in) ───────────────────────────────────────
  // Refined typographic header: an optional logo on the left, the company
  // name set large in the serif, address lines beneath, then a hairline rule.
  if (craft?.letterhead?.company) {
    const lh = craft.letterhead;
    let textX = margin;
    let headerBottom = margin;

    if (lh.logo) {
      try {
        const fmt = imageFormat(lh.logo);
        const props = doc.getImageProperties(lh.logo);
        const maxW = 96;
        const maxH = 56;
        const ratio = Math.min(maxW / props.width, maxH / props.height, 1);
        const w = props.width * ratio;
        const h = props.height * ratio;
        doc.addImage(lh.logo, fmt, margin, y, w, h);
        textX = margin + w + 16;
        headerBottom = Math.max(headerBottom, y + h);
      } catch {
        // Bad/unsupported image → silently skip; name-only letterhead still renders.
      }
    }

    // Company name — large serif, near-black.
    doc.setFont(serif, "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text(lh.company, textX, y + 16);
    let ay = y + 16;

    // Address lines — small, muted.
    const addr = (lh.addressLines ?? []).filter((l) => l && l.trim());
    if (addr.length) {
      doc.setFont(serif, "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(110, 110, 110);
      for (const line of addr) {
        ay += 13;
        doc.text(line.trim(), textX, ay);
      }
    }
    headerBottom = Math.max(headerBottom, ay);

    // Hairline rule under the masthead.
    const ruleY = headerBottom + 14;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.75);
    doc.line(margin, ruleY, pageW - margin, ruleY);

    setBody();
    y = ruleY + 22;
  }

  // ── Body ───────────────────────────────────────────────────────────────
  const lines = doc.splitTextToSize(body, contentW);
  for (const line of lines) {
    if (y > pageH - margin) {
      footer();
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineH;
  }

  // ── Signature block (opt-in) ───────────────────────────────────────────
  if (craft?.signature?.name) {
    const sig = craft.signature;
    const sigLines = [sig.name, sig.title, sig.company].filter((l): l is string => !!l && !!l.trim());
    const blockH = 28 + sigLines.length * 15;
    if (y + blockH > pageH - margin) {
      footer();
      doc.addPage();
      y = margin;
    }
    y += 22; // breathing room above the signature
    // Signature rule.
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 180, y);
    y += 16;
    setBody();
    doc.setFont(serif, "bold");
    doc.text(sigLines[0], margin, y);
    doc.setFont(serif, "normal");
    doc.setTextColor(90, 90, 90);
    for (let i = 1; i < sigLines.length; i++) {
      y += 14;
      doc.text(sigLines[i], margin, y);
    }
    setBody();
  }

  footer();
}

/** Persist a jsPDF doc — native save dialog in Tauri, browser download on web. */
async function persist(doc: jsPDF, filename: string): Promise<void> {
  if (isTauri()) {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeFile } = await import("@tauri-apps/plugin-fs");
      const path = await save({
        defaultPath: filename,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      if (!path) return; // user cancelled
      const bytes = new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
      await writeFile(path, bytes);
      return;
    } catch {
      // Fall back to the browser download path below.
    }
  }
  doc.save(filename);
}

/**
 * Export a text document (letter / email / payslip) as a PDF. Pass an optional
 * `craft` to layer on a letterhead and/or signature block — both opt-in, so an
 * absent `craft` produces the same clean document as before.
 */
export async function exportTextPdf(title: string, body: string, craft?: DocCraft): Promise<void> {
  const doc = buildTextPdf(body, false, craft);
  await persist(doc, toFilename(title));
}

/** Export a monospaced, column-aligned document (timetables, seating grids) as a PDF. */
export async function exportMonoPdf(title: string, body: string): Promise<void> {
  const doc = buildTextPdf(body, true);
  await persist(doc, toFilename(title));
}

/** One document in a batch / mail-merge export. */
export interface BatchDoc {
  /** Used only for the filename when a single doc is exported; ignored otherwise. */
  title: string;
  body: string;
  craft?: DocCraft;
}

/**
 * Export many text documents (one per saved Person) into a single, paginated
 * PDF — each document starts on a fresh page. Reuses the same offline text/
 * letterhead renderer as the single-document path, so a batch page is
 * byte-identical to the same person exported on their own. Fully offline.
 */
export async function exportTextPdfBatch(fileTitle: string, docs: BatchDoc[]): Promise<void> {
  const first = docs[0];
  if (!first) return;
  const doc = buildTextPdf(first.body, false, first.craft);
  for (let i = 1; i < docs.length; i++) {
    doc.addPage();
    appendTextPdf(doc, docs[i].body, false, docs[i].craft);
  }
  await persist(doc, toFilename(fileTitle));
}
