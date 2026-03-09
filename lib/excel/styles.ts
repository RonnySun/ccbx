import ExcelJS from "exceljs";

export type CellStyle = Partial<ExcelJS.Style>;

export const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

export const BORDER_MEDIUM: Partial<ExcelJS.Borders> = {
  top: { style: "medium" },
  left: { style: "medium" },
  bottom: { style: "medium" },
  right: { style: "medium" },
};

export const FONT_TITLE: Partial<ExcelJS.Font> = {
  name: "宋体",
  size: 16,
  bold: true,
};

export const FONT_COMPANY: Partial<ExcelJS.Font> = {
  name: "宋体",
  size: 11,
  bold: true,
};

export const FONT_NORMAL: Partial<ExcelJS.Font> = {
  name: "宋体",
  size: 10,
};

export const FONT_BOLD: Partial<ExcelJS.Font> = {
  name: "宋体",
  size: 10,
  bold: true,
};

export const ALIGN_CENTER: Partial<ExcelJS.Alignment> = {
  horizontal: "center",
  vertical: "middle",
  wrapText: true,
};

export const ALIGN_LEFT: Partial<ExcelJS.Alignment> = {
  horizontal: "left",
  vertical: "middle",
  wrapText: true,
};

/** 给工作表设置默认行高和列宽 */
export function applyDefaultStyle(ws: ExcelJS.Worksheet) {
  ws.properties.defaultRowHeight = 20;
}

/** 合并单元格并设置值和样式 */
export function mergeAndSet(
  ws: ExcelJS.Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  value: ExcelJS.CellValue,
  style: CellStyle = {}
) {
  ws.mergeCells(startRow, startCol, endRow, endCol);
  const cell = ws.getCell(startRow, startCol);
  cell.value = value;
  if (style.font) cell.font = style.font;
  if (style.alignment) cell.alignment = style.alignment;
  if (style.border) cell.border = style.border;
  if (style.fill) cell.fill = style.fill;
  if (style.numFmt) cell.numFmt = style.numFmt;
}

/** 设置单元格（不合并）*/
export function setCell(
  ws: ExcelJS.Worksheet,
  row: number,
  col: number,
  value: ExcelJS.CellValue,
  style: CellStyle = {}
) {
  const cell = ws.getCell(row, col);
  cell.value = value;
  if (style.font) cell.font = style.font;
  if (style.alignment) cell.alignment = style.alignment;
  if (style.border) cell.border = style.border;
  if (style.fill) cell.fill = style.fill;
  if (style.numFmt) cell.numFmt = style.numFmt;
}

/** 给一行的所有单元格加细边框 */
export function setBorderRow(
  ws: ExcelJS.Worksheet,
  row: number,
  startCol: number,
  endCol: number
) {
  for (let c = startCol; c <= endCol; c++) {
    ws.getCell(row, c).border = BORDER_THIN;
  }
}
