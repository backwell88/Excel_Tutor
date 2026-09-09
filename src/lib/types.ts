export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface ContextSnapshot {
  worksheet_name: string;
  selected_range: string;
  rows: number;
  columns: number;
  headers: string[];
  cells?: Array<{ address: string; value: string | number | boolean | null; formula: string | null }>;
  sample_rows?: Array<Array<string | number | boolean | null>>;
  data_types?: Record<string, number>;
  sampled?: boolean;
}

export interface SelectionInfo {
  worksheetName: string;
  rangeAddress: string;
}

export interface Note {
  knowledge_point: string;
  type: "Shortcut" | "Formula" | "Operation" | "Pivot" | "Power Query" | "Chart" | "Other";
  core_operation: string;
  description: string;
  example: string;
}

