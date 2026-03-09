import ExcelJS from "exceljs";
import { toChineseAmount } from "@/lib/utils/chineseAmount";

export interface LoanData {
  date: string;
  department: string;
  borrower: string;
  reason: string;
  amount: number;
}

const COMPANY = "珠海一微半导体股份有限公司";

function b(): Partial<ExcelJS.Borders> {
  const t: Partial<ExcelJS.Border> = { style: "thin" };
  return { top: t, left: t, bottom: t, right: t };
}

function c(
  ws: ExcelJS.Worksheet, r: number, col: number,
  value: ExcelJS.CellValue,
  opts: { bold?: boolean; size?: number; align?: "left" | "center" | "right" } = {}
) {
  const cl = ws.getCell(r, col);
  cl.value = value;
  cl.font = { name: "宋体", size: opts.size ?? 10, bold: opts.bold ?? false };
  cl.alignment = { horizontal: opts.align ?? "center", vertical: "middle", wrapText: true };
  cl.border = b();
}

function m(
  ws: ExcelJS.Worksheet, r1: number, c1: number, r2: number, c2: number,
  value: ExcelJS.CellValue,
  opts: { bold?: boolean; size?: number; align?: "left" | "center" | "right" } = {}
) {
  ws.mergeCells(r1, c1, r2, c2);
  c(ws, r1, c1, value, opts);
}

export async function generateLoanExcel(data: LoanData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("借款审批单");

  ws.getColumn(1).width = 12;
  ws.getColumn(2).width = 8;
  ws.getColumn(3).width = 20;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 12;

  // 行1: 公司名
  m(ws, 1, 1, 1, 5, COMPANY, { bold: true, size: 12 });

  // 行2: 标题
  m(ws, 2, 1, 2, 5, "借 款 审 批 单", { bold: true, size: 16 });
  ws.getRow(2).height = 28;

  // 行3: 日期
  m(ws, 3, 1, 3, 5, data.date, { align: "left" });

  // 行4: 部门 + 借款人
  c(ws, 4, 1, "部门");
  m(ws, 4, 2, 4, 3, data.department, { align: "left" });
  c(ws, 4, 4, "借款人");
  c(ws, 4, 5, data.borrower, { align: "left" });

  // 行5: 借款事由
  c(ws, 5, 1, "借款事由");
  m(ws, 5, 2, 5, 5, data.reason, { align: "left" });
  ws.getRow(5).height = 36;

  // 行6: 借款金额
  c(ws, 6, 1, "借款金额");
  c(ws, 6, 2, "（大写）");
  c(ws, 6, 3, toChineseAmount(data.amount), { align: "left" });
  c(ws, 6, 4, "小写：");
  c(ws, 6, 5, `¥${data.amount.toFixed(2)}`);

  // 行7: 部门负责人 + 总裁审批
  c(ws, 7, 1, "部门负责人");
  m(ws, 7, 2, 7, 3, "");
  c(ws, 7, 4, "总裁审批");
  c(ws, 7, 5, "");
  ws.getRow(7).height = 30;

  // 行8: 财务负责人
  c(ws, 8, 1, "财务负责人");
  m(ws, 8, 2, 8, 5, "");
  ws.getRow(8).height = 30;

  // 行9: 会计/出纳
  m(ws, 9, 1, 9, 5, "会计：                               出纳：", { align: "left" });

  [1, 3, 4, 6, 9].forEach(r => { ws.getRow(r).height = 20; });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
