import {
  EXPORT_CONTACT_EMAIL,
  EXPORT_PRODUCT_NAME,
} from "@/lib/export/constants";
import type { ExportPayload, ExportTable } from "@/lib/export/types";

const UTF8_BOM = "\uFEFF";

function escapeCsvField(value: string | number): string {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(values: (string | number)[]): string {
  return values.map(escapeCsvField).join(",");
}

function blankRow(): string {
  return "";
}

function sectionTitle(title: string): string {
  return rowToCsv([title]);
}

function sectionSubtitle(subtitle: string): string {
  return rowToCsv(["", subtitle]);
}

function reportTypeLabel(kind: ExportPayload["kind"]): string {
  return kind === "city" ? "City Profile" : "City Comparison";
}

function buildHeaderBlock(payload: ExportPayload, generatedAt: string): string[] {
  return [
    rowToCsv([EXPORT_PRODUCT_NAME, "Street Intelligence Export"]),
    blankRow(),
    rowToCsv(["Document", payload.documentTitle]),
    rowToCsv(["Subtitle", payload.subtitle]),
    rowToCsv(["Report type", reportTypeLabel(payload.kind)]),
    rowToCsv(["Generated", generatedAt]),
    rowToCsv(["Share URL", payload.shareUrl]),
    rowToCsv(["Contact", EXPORT_CONTACT_EMAIL]),
    blankRow(),
  ];
}

function buildSummaryBlock(payload: ExportPayload): string[] {
  return [
    sectionTitle("Summary"),
    rowToCsv(["Field", "Value"]),
    ...payload.meta.map(({ label, value }) => rowToCsv([label, value])),
    blankRow(),
  ];
}

function buildTableBlock(table: ExportTable): string[] {
  const lines: string[] = [sectionTitle(table.title)];

  if (table.subtitle) {
    lines.push(sectionSubtitle(table.subtitle));
  }

  lines.push(rowToCsv(table.headers));
  lines.push(...table.rows.map((row) => rowToCsv(row)));
  lines.push(blankRow());

  return lines;
}

function buildFooterBlock(): string[] {
  return [
    rowToCsv(["—"]),
    rowToCsv([
      EXPORT_PRODUCT_NAME,
      "Outcome-based street intelligence for Indian cities",
    ]),
    rowToCsv(["Contact", EXPORT_CONTACT_EMAIL]),
    rowToCsv([
      "Disclaimer",
      "Scores are normalized 0–100 across an 11-city proof-of-concept cohort. Population uses Census 2011.",
    ]),
  ];
}

export function exportPayloadToCsv(payload: ExportPayload): string {
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: string[] = [
    ...buildHeaderBlock(payload, generatedAt),
    ...buildSummaryBlock(payload),
    ...payload.tables.flatMap((table) => buildTableBlock(table)),
    ...buildFooterBlock(),
  ];

  return `${UTF8_BOM}${lines.join("\r\n")}\r\n`;
}

export function downloadCsv(payload: ExportPayload): void {
  const csv = exportPayloadToCsv(payload);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${payload.filenameBase}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
