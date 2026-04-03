import { jsPDF } from "jspdf";
import type { VerumMessage } from "./types";
import { CLINICAL_FRAMEWORK_DISCLAIMER, CLINICAL_FRAMEWORK_STEPS } from "./clinicalNextStepsDemo";

export type PdfTurn = { question: string; message: VerumMessage };

const FOOTER_NOTE =
  "Spoodle surfaces licensed veterinary information. It does not diagnose conditions or replace clinical judgment.";

async function fetchLogoDataUrl(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  pageH: number,
  margin: number,
  lineH: number
): number {
  const lines = doc.splitTextToSize(text || " ", maxW);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (y + lineH > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, x, y);
    y += lineH;
  }
  return y;
}

/**
 * Builds a PDF with Spoodle logo, question(s), full response text (sections, follow-up, clinical framework, sources).
 */
export async function generateSpoodleResponsePdf(turns: PdfTurn[]): Promise<Blob> {
  const logoDataUrl = await fetchLogoDataUrl("/spoodle-logo.png");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - 2 * margin;
  const bodyLine = 5.0;
  const smallLine = 4.2;

  let y = margin;

  if (logoDataUrl) {
    const lw = 72;
    const lh = (lw * 137) / 400;
    doc.addImage(logoDataUrl, "PNG", margin, y, lw, lh);
    y += lh + 6;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Spoodle", margin, y + 6);
    y += 12;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  y = addWrappedText(doc, "Veterinary literature summary", margin, y, contentW, pageH, margin, smallLine);
  y += 2;
  doc.setTextColor(0, 0, 0);

  const generated = new Date().toLocaleString();
  doc.setFontSize(8);
  y = addWrappedText(doc, `Generated: ${generated}`, margin, y, contentW, pageH, margin, smallLine);
  y += 6;
  doc.setFontSize(10);

  for (let t = 0; t < turns.length; t++) {
    const turn = turns[t];
    if (t > 0) {
      y += 4;
      doc.setDrawColor(200);
      if (y > pageH - margin - 15) {
        doc.addPage();
        y = margin;
      } else {
        doc.line(margin, y, pageW - margin, y);
        y += 6;
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (y + bodyLine > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text("Question", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y = addWrappedText(doc, turn.question, margin, y, contentW, pageH, margin, bodyLine);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (y + bodyLine > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text("Response", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const m = turn.message;
    if (m.sections?.length) {
      for (const sec of m.sections) {
        doc.setFont("helvetica", "bold");
        y = addWrappedText(doc, sec.title, margin, y, contentW, pageH, margin, bodyLine);
        y += 1;
        doc.setFont("helvetica", "normal");
        y = addWrappedText(doc, sec.body, margin, y, contentW, pageH, margin, bodyLine);
        y += 3;
      }
    } else {
      y = addWrappedText(doc, m.content, margin, y, contentW, pageH, margin, bodyLine);
      y += 3;
    }

    if (m.followUp) {
      doc.setFont("helvetica", "italic");
      y = addWrappedText(doc, m.followUp, margin, y, contentW, pageH, margin, bodyLine);
      doc.setFont("helvetica", "normal");
      y += 4;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    y = addWrappedText(doc, "CLINICAL FRAMEWORK", margin, y, contentW, pageH, margin, smallLine);
    y += 1;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const step of CLINICAL_FRAMEWORK_STEPS) {
      y = addWrappedText(doc, `${step.label}: ${step.text}`, margin, y, contentW, pageH, margin, smallLine);
      y += 1;
    }
    y = addWrappedText(doc, CLINICAL_FRAMEWORK_DISCLAIMER, margin, y, contentW, pageH, margin, smallLine);
    y += 4;
    doc.setFontSize(10);

    if (m.sources?.length) {
      doc.setFont("helvetica", "bold");
      y = addWrappedText(doc, "Sources", margin, y, contentW, pageH, margin, bodyLine);
      y += 1;
      doc.setFont("helvetica", "normal");
      let n = 1;
      for (const s of m.sources) {
        const line = `[${n}] ${s.journal} — ${s.title} (${s.year})`;
        y = addWrappedText(doc, line, margin, y, contentW, pageH, margin, bodyLine);
        n += 1;
        y += 0.5;
      }
    }
  }

  y += 4;
  if (y > pageH - margin - 12) {
    doc.addPage();
    y = margin;
  }
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  addWrappedText(doc, FOOTER_NOTE, margin, y, contentW, pageH, margin, smallLine);

  return doc.output("blob");
}

export function defaultPdfFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `Spoodle-response-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.pdf`;
}
