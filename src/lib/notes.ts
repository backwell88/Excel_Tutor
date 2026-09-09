import type { Note } from "./types";

const notesSheetName = "Excel Notes";
const notesTableName = "ExcelTutorNotesTable";
const headers = [["\u77e5\u8bc6\u70b9", "\u7c7b\u578b", "\u6838\u5fc3\u64cd\u4f5c", "\u8bf4\u660e", "\u793a\u4f8b"]];

async function getOrCreateNotesTable(context: Excel.RequestContext): Promise<Excel.Table> {
  const table = context.workbook.tables.getItemOrNullObject(notesTableName);
  table.load("name");
  await context.sync();

  if (!table.isNullObject) {
    table.worksheet.load("position");
    await context.sync();
    table.worksheet.position = 0;
    return table;
  }

  const existingSheet = context.workbook.worksheets.getItemOrNullObject(notesSheetName);
  existingSheet.load("name");
  await context.sync();
  if (!existingSheet.isNullObject) {
    throw new Error("An Excel Notes sheet already exists without the Excel Tutor notes table.");
  }

  const sheet = context.workbook.worksheets.add(notesSheetName);
  sheet.position = 0;
  const newTable = sheet.tables.add("A1:E1", true);
  newTable.name = notesTableName;
  newTable.getHeaderRowRange().values = headers;
  newTable.getHeaderRowRange().format.font.bold = true;
  newTable.getRange().format.autofitColumns();
  return newTable;
}

export async function appendNote(note: Note): Promise<void> {
  await Excel.run(async (context) => {
    const table = await getOrCreateNotesTable(context);
    table.rows.add(undefined, [[note.knowledge_point, note.type, note.core_operation, note.description, note.example]]);
    table.worksheet.position = 0;
    await context.sync();
  });
}