import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  EXPORT_BRAND_RGB,
  EXPORT_CONTACT_EMAIL,
  EXPORT_LOGO_PATH,
  EXPORT_PRODUCT_NAME,
} from "@/lib/export/constants";
import type { ExportPayload } from "@/lib/export/types";

async function loadLogoDataUrl(): Promise<string> {
  const response = await fetch(EXPORT_LOGO_PATH);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function drawPageChrome(doc: jsPDF, logoDataUrl: string): void {
  doc.addImage(logoDataUrl, "PNG", 14, 10, 12, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...EXPORT_BRAND_RGB);
  doc.text(EXPORT_PRODUCT_NAME, 29, 17.5);

  doc.setDrawColor(...EXPORT_BRAND_RGB);
  doc.setLineWidth(0.4);
  doc.line(14, 24, doc.internal.pageSize.getWidth() - 14, 24);
}

function drawPageFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(EXPORT_CONTACT_EMAIL, pageWidth - 14, pageHeight - 10, {
    align: "right",
  });
}

export async function downloadPdf(payload: ExportPayload): Promise<void> {
  const logoDataUrl = await loadLogoDataUrl();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  let cursorY = 32;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(payload.documentTitle, 14, cursorY);
  cursorY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const subtitleLines = doc.splitTextToSize(payload.subtitle, pageWidth - 28);
  doc.text(subtitleLines, 14, cursorY);
  cursorY += subtitleLines.length * 5 + 2;

  doc.setFontSize(9);
  doc.text(`Generated ${generatedAt}`, 14, cursorY);
  cursorY += 6;

  autoTable(doc, {
    startY: cursorY,
    head: [["Field", "Value"]],
    body: payload.meta.map(({ label, value }) => [label, value]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: {
      fillColor: EXPORT_BRAND_RGB,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      drawPageChrome(doc, logoDataUrl);
      drawPageFooter(doc);
    },
  });

  cursorY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY
    ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    : cursorY + 10;

  for (const table of payload.tables) {
    if (cursorY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      cursorY = 32;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...EXPORT_BRAND_RGB);
    doc.text(table.title, 14, cursorY);
    cursorY += 5;

    if (table.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const lines = doc.splitTextToSize(table.subtitle, pageWidth - 28);
      doc.text(lines, 14, cursorY);
      cursorY += lines.length * 4 + 2;
    }

    autoTable(doc, {
      startY: cursorY,
      head: [table.headers],
      body: table.rows.map((row) => row.map(String)),
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 2.2, overflow: "linebreak" },
      headStyles: {
        fillColor: EXPORT_BRAND_RGB,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [252, 247, 243] },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        drawPageChrome(doc, logoDataUrl);
        drawPageFooter(doc);
      },
    });

    cursorY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY
      ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
      : cursorY + 12;
  }

  doc.save(`${payload.filenameBase}.pdf`);
}
