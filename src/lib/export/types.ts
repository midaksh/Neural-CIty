export type ExportKind = "city" | "compare";

export interface ExportTable {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface ExportPayload {
  kind: ExportKind;
  documentTitle: string;
  subtitle: string;
  filenameBase: string;
  shareUrl: string;
  meta: { label: string; value: string }[];
  tables: ExportTable[];
}
