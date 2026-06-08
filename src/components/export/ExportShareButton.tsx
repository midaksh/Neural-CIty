"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileDown, Link2 } from "lucide-react";
import { useExportShare } from "@/context/ExportShareContext";
import { downloadCsv } from "@/lib/export/export-csv";
import { downloadPdf } from "@/lib/export/export-pdf";
import { cn } from "@/lib/utils";

export function ExportShareButton() {
  const { payload, showCopiedToast } = useExportShare();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!payload) setOpen(false);
  }, [payload]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!payload) {
    return null;
  }

  const exportPayload = payload;
  const shareUrl = exportPayload.shareUrl;

  async function handleExport(format: "pdf" | "csv") {
    setExporting(format);
    try {
      if (format === "csv") {
        downloadCsv(exportPayload);
      } else {
        await downloadPdf(exportPayload);
      }
      setOpen(false);
    } finally {
      setExporting(null);
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showCopiedToast();
      setOpen(false);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showCopiedToast();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(243,112,33,0.35)] transition-colors",
          "bg-[#f37021] hover:bg-[#f5833d] active:bg-[#d9621a]",
          open && "bg-[#d9621a]",
        )}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Export &amp; Share</span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-md"
            role="menu"
          >
            <div className="border-b border-border/70 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Export</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                    Download this view as a formatted PDF or CSV report.
                  </p>
                </div>
                <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-[#f37021]" aria-hidden />
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  role="menuitem"
                  disabled={exporting !== null}
                  onClick={() => handleExport("pdf")}
                  className="flex-1 rounded-lg bg-[#f37021] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#f5833d] disabled:opacity-60"
                >
                  {exporting === "pdf" ? "Preparing…" : "PDF"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={exporting !== null}
                  onClick={() => handleExport("csv")}
                  className="flex-1 rounded-lg border border-[#f37021]/35 px-3 py-2 text-xs font-semibold text-[#f37021] transition-colors hover:bg-[#f37021]/10 disabled:opacity-60"
                >
                  {exporting === "csv" ? "Preparing…" : "CSV"}
                </button>
              </div>
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={handleCopyUrl}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/70"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Copy URL</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Share a link to this page
                </p>
              </div>
              <Link2 className="h-4 w-4 shrink-0 text-[#f37021]" aria-hidden />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
