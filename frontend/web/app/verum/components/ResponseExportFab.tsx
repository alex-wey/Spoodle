"use client";

import React, { useCallback, useState } from "react";
import { Download, Loader2, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  defaultPdfFilename,
  generateSpoodleResponsePdf,
  type PdfTurn,
} from "../lib/exportResponsePdf";

interface ResponseExportFabProps {
  turns: PdfTurn[];
}

/** Match AssistantTurn response card surface */
const EXPORT_BTN =
  "h-10 w-10 shrink-0 rounded-xl border border-border/60 bg-muted/45 text-muted-foreground hover:bg-muted/55 hover:text-foreground dark:bg-muted/25 dark:hover:bg-muted/35";

/**
 * In-flow toolbar below the response: email, download, print (PDF).
 * Web Share attaches PDF when supported; else download + mailto (see emailPdf).
 */
export function ResponseExportFab({ turns }: ResponseExportFabProps) {
  const [busy, setBusy] = useState<null | "dl" | "print" | "mail">(null);

  const buildPdf = useCallback(async () => {
    if (turns.length === 0) throw new Error("No conversation to export");
    return generateSpoodleResponsePdf(turns);
  }, [turns]);

  const downloadPdf = useCallback(async () => {
    setBusy("dl");
    try {
      const blob = await buildPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = defaultPdfFilename();
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }, [buildPdf]);

  const printPdf = useCallback(async () => {
    setBusy("print");
    try {
      const blob = await buildPdf();
      const url = URL.createObjectURL(blob);
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) {
        w.addEventListener("load", () => {
          try {
            w.focus();
            w.print();
          } finally {
            setTimeout(() => URL.revokeObjectURL(url), 120_000);
          }
        });
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = defaultPdfFilename();
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }
    } finally {
      setBusy(null);
    }
  }, [buildPdf]);

  const emailPdf = useCallback(async () => {
    setBusy("mail");
    try {
      const blob = await buildPdf();
      const name = defaultPdfFilename();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);

      const subject = encodeURIComponent("Spoodle literature summary");
      const body = encodeURIComponent(
        `A PDF of your Spoodle response has been downloaded as "${name}".\n\nPlease attach that file to this email from your Downloads folder (or the folder you use for saved files).\n\n`
      );
      // Defer mailto so the browser finishes the download first
      setTimeout(() => {
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }, 200);
    } finally {
      setBusy(null);
    }
  }, [buildPdf]);

  if (turns.length === 0) return null;

  return (
    <div
      className="mt-8 flex w-full min-w-0 flex-row flex-wrap items-center justify-end gap-2"
      role="toolbar"
      aria-label="Export response as PDF"
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={EXPORT_BTN}
        disabled={busy !== null}
        title="Email — downloads the PDF, then opens your mail app to compose (attach the file from Downloads)"
        aria-label="Email PDF"
        onClick={() => void emailPdf()}
      >
        {busy === "mail" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" aria-hidden />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={EXPORT_BTN}
        disabled={busy !== null}
        title="Download PDF"
        aria-label="Download PDF"
        onClick={() => void downloadPdf()}
      >
        {busy === "dl" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" aria-hidden />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={EXPORT_BTN}
        disabled={busy !== null}
        title="Print or save as PDF"
        aria-label="Print PDF"
        onClick={() => void printPdf()}
      >
        {busy === "print" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" aria-hidden />}
      </Button>
    </div>
  );
}
