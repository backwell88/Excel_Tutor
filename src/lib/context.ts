import type { ContextSnapshot, SelectionInfo } from "./types";

const RAW_ROW_LIMIT = 200;
const RAW_COLUMN_LIMIT = 30;
const SAMPLE_ROW_LIMIT = 30;

type CellValue = string | number | boolean | null;

function toCellValue(value: unknown): CellValue {
  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value === "number" || typeof value === "boolean") return value;
  return value === null || value === undefined ? null : String(value).slice(0, 500);
}

function columnName(index: number): string {
  let current = index + 1;
  let name = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

function selectionOrigin(rangeAddress: string): { column: number; row: number } {
  const address = rangeAddress.split("!").at(-1)?.replaceAll("$", "") ?? "A1";
  const match = address.match(/([A-Z]+)(\d+)/i);
  if (!match) {
    return { column: 0, row: 1 };
  }

  const column = match[1].toUpperCase().split("").reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0) - 1;
  return { column, row: Number(match[2]) };
}

function dataTypeSummary(values: unknown[][]): Record<string, number> {
  return values.flat().reduce<Record<string, number>>((summary, value) => {
    const type = value === null || value === undefined || value === "" ? "empty" : typeof value;
    summary[type] = (summary[type] ?? 0) + 1;
    return summary;
  }, {});
}

export function shouldReadWorkbookContext(question: string): boolean {
  return /\b(this|these|selected|selection|current|formula.*(?:error|wrong)|pivot|summari[sz]e)\b|\u8fd9|\u8fd9\u4e9b|\u9009\u4e2d|\u5f53\u524d|\u516c\u5f0f.*(?:\u9519\u8bef|\u4e0d\u5bf9)|\u8fd9\u5757|\u6c47\u603b|\u900f\u89c6\u8868/i.test(question);
}

export function buildContextSnapshot({
  worksheetName,
  rangeAddress,
  values,
  formulas,
}: {
  worksheetName: string;
  rangeAddress: string;
  values: unknown[][];
  formulas: unknown[][];
}): ContextSnapshot {
  const rows = values.length;
  const columns = values[0]?.length ?? 0;
  const headers = (values[0] ?? []).map((value, index) => {
    const text = String(value ?? "").trim();
    return text || `Column ${index + 1}`;
  });
  const oversized = rows > RAW_ROW_LIMIT || columns > RAW_COLUMN_LIMIT;
  const origin = selectionOrigin(rangeAddress);

  if (oversized) {
    return {
      worksheet_name: worksheetName,
      selected_range: rangeAddress,
      rows,
      columns,
      headers,
      sample_rows: values.slice(0, SAMPLE_ROW_LIMIT).map((row) => row.slice(0, RAW_COLUMN_LIMIT).map(toCellValue)),
      data_types: dataTypeSummary(values.slice(0, SAMPLE_ROW_LIMIT).map((row) => row.slice(0, RAW_COLUMN_LIMIT))),
      sampled: true,
    };
  }

  return {
    worksheet_name: worksheetName,
    selected_range: rangeAddress,
    rows,
    columns,
    headers,
    cells: values.flatMap((row, rowIndex) =>
      row.map((value, columnIndex) => {
        const formula = formulas[rowIndex]?.[columnIndex];
        return {
          address: `${columnName(origin.column + columnIndex)}${origin.row + rowIndex}`,
          value: toCellValue(value),
          formula: typeof formula === "string" && formula.startsWith("=") ? formula : null,
        };
      }),
    ),
  };
}

export async function getSelectionInfo(): Promise<SelectionInfo> {
  return Excel.run(async (context) => {
    const worksheet = context.workbook.worksheets.getActiveWorksheet();
    const range = context.workbook.getSelectedRange();
    worksheet.load("name");
    range.load("address");
    await context.sync();
    return { worksheetName: worksheet.name, rangeAddress: range.address };
  });
}

export async function getContextSnapshot(): Promise<ContextSnapshot> {
  return Excel.run(async (context) => {
    const worksheet = context.workbook.worksheets.getActiveWorksheet();
    const range = context.workbook.getSelectedRange();
    worksheet.load("name");
    range.load("address,values,formulas");
    await context.sync();
    return buildContextSnapshot({
      worksheetName: worksheet.name,
      rangeAddress: range.address,
      values: range.values,
      formulas: range.formulas,
    });
  });
}

