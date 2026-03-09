import ExcelJS from "exceljs";
import { toChineseAmount } from "@/lib/utils/chineseAmount";

export interface PaymentData {
  department: string;
  date: string;
  serialNo: string;
  purpose: string;
  paymentMethod: string;
  amount: number;
  basis: string;
  contractNo: string;
  payeeName: string;
  payeeAccount: string;
  payeeBank: string;
  operator: string;
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

export async function generatePaymentExcel(data: PaymentData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("资金支付审批表");

  ws.getColumn(1).width = 16;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 16;

  // 行1: 公司名
  m(ws, 1, 1, 1, 4, COMPANY, { bold: true, size: 12 });

  // 行2: 标题
  m(ws, 2, 1, 2, 4, "资金支付审批表", { bold: true, size: 16 });
  ws.getRow(2).height = 28;

  // 行3: 部门/日期 + 编号
  m(ws, 3, 1, 3, 3, `部门：${data.department}      ${data.date}`, { align: "left" });
  c(ws, 3, 4, `编号：${data.serialNo}`, { align: "left" });

  // 行4: 付款用途 + 付款方式
  c(ws, 4, 1, "付款用途：");
  c(ws, 4, 2, data.purpose, { align: "left" });
  c(ws, 4, 3, "付款方式：");
  c(ws, 4, 4, data.paymentMethod, { align: "left" });

  // 行5: 付款金额大写 + 小写
  c(ws, 5, 1, "付款金额（大写）：");
  c(ws, 5, 2, toChineseAmount(data.amount), { align: "left" });
  c(ws, 5, 3, "小写：");
  c(ws, 5, 4, `¥${data.amount.toFixed(2)}`);

  // 行6: 付款依据 + 合同号码
  c(ws, 6, 1, "付款依据：");
  c(ws, 6, 2, data.basis, { align: "left" });
  c(ws, 6, 3, "合同号码：");
  c(ws, 6, 4, data.contractNo, { align: "left" });

  // 行7: 收款单位全称 + 账号
  c(ws, 7, 1, "收款单位全称：");
  c(ws, 7, 2, data.payeeName, { align: "left" });
  c(ws, 7, 3, "账号：");
  c(ws, 7, 4, data.payeeAccount, { align: "left" });

  // 行8: 收款开户行 + 财务负责人
  c(ws, 8, 1, "收款单位开户行：");
  c(ws, 8, 2, data.payeeBank, { align: "left" });
  c(ws, 8, 3, "财务负责人：");
  c(ws, 8, 4, "");
  ws.getRow(8).height = 30;

  // 行9: 经办人 + 总裁审批
  c(ws, 9, 1, "经办人：");
  c(ws, 9, 2, data.operator, { align: "left" });
  c(ws, 9, 3, "总裁审批：");
  c(ws, 9, 4, "");
  ws.getRow(9).height = 30;

  // 行10: 部门负责人
  c(ws, 10, 1, "部门负责人：");
  m(ws, 10, 2, 10, 4, "");
  ws.getRow(10).height = 30;

  // 行11: 会计/出纳/附件
  m(ws, 11, 1, 11, 4, "会计：              出纳：                    附件      张", { align: "left" });

  [1, 3, 4, 5, 6, 7, 11].forEach(r => { ws.getRow(r).height = 20; });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
