import ExcelJS from "exceljs";
import { toChineseAmount } from "@/lib/utils/chineseAmount";

export interface ExpenseRow {
  usage: string;
  project: string;
  amount: number;
}

export interface EntertainRow {
  date: string;
  vendor: string;
  detail: string;
  amount: number;
  witness: string;
}

export interface ExpenseFormData {
  department: string;
  date: string;
  serialNo: string;
  reimburser: string;
  payee: string;
  attachments: number;
  advancePaid: number;
  alreadyPaid: number;
  expenses: ExpenseRow[];
}

export interface EntertainFormData {
  department: string;
  operator: string;
  entertainRows: EntertainRow[];
}

const COMPANY = "珠海一微半导体股份有限公司";

const THIN = { style: "thin" } as const;
const BDR: Partial<ExcelJS.Borders> = { top: THIN, left: THIN, bottom: THIN, right: THIN };

function applyCell(
  ws: ExcelJS.Worksheet,
  r: number, c: number,
  value: ExcelJS.CellValue,
  size = 12,
  bold = false,
  align: "left" | "center" | "right" = "center",
  wrap = false,
) {
  const cl = ws.getCell(r, c);
  cl.value = value;
  cl.font = { name: "宋体", size, bold };
  cl.alignment = { horizontal: align, vertical: "middle", wrapText: wrap };
  cl.border = BDR;
}

function mc(
  ws: ExcelJS.Worksheet,
  r1: number, c1: number, r2: number, c2: number,
  value: ExcelJS.CellValue,
  size = 12,
  bold = false,
  align: "left" | "center" | "right" = "center",
  wrap = false,
) {
  ws.mergeCells(r1, c1, r2, c2);
  applyCell(ws, r1, c1, value, size, bold, align, wrap);
}

export async function generateExpenseExcel(
  expense: ExpenseFormData,
  entertain?: EntertainFormData
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("报销");

  // 列宽（精确匹配源文件 33招待费.xlsx）
  // A=13.375, B=10.875, C=18.69, D=13.0, E=19.0
  // F-H gap (13.0 each)
  // I=12.825, J=15.533, K=26.75, L=11.408, M=17.6
  const colWidths = [13.375, 10.875, 18.69, 13.0, 19.0, 13.0, 13.0, 13.0, 12.825, 15.533, 26.75, 11.408, 17.6];
  colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  // ── 费用报销审批单（列 A-E，行 1-10）──
  // 字体全部 宋体 12pt，标签行 bold

  // 行1: 公司名 (A1:E1)
  mc(ws, 1, 1, 1, 5, COMPANY, 12, true, "center");

  // 行2: 标题 (A2:E2)
  mc(ws, 2, 1, 2, 5, "费用报销审批单", 12, true, "center");

  // 行3: 部门日期 + 编号 (A3:C3 | D3:E3)
  mc(ws, 3, 1, 3, 3, `部门：${expense.department}      ${expense.date}`, 12, true, "left");
  mc(ws, 3, 4, 3, 5, `编号：${expense.serialNo}`, 12, true, "left");

  // 行4: 表头
  applyCell(ws, 4, 1, "用  途", 12, true);
  applyCell(ws, 4, 2, "项目名称", 12, true);
  applyCell(ws, 4, 3, "金额（元）", 12, true);
  applyCell(ws, 4, 4, "报销人", 12, true);
  applyCell(ws, 4, 5, expense.reimburser, 12, false, "left");
  ws.getRow(4).height = 20;

  // 行5-7: 3 条费用数据行（固定3行，与模板一致）
  const approvalLabels = ["部门负责人", "财务负责人", "总裁审批"];
  for (let i = 0; i < 3; i++) {
    const r = 5 + i;
    const row = expense.expenses[i];
    applyCell(ws, r, 1, row?.usage ?? "", 12, false, "left");
    applyCell(ws, r, 2, row?.project ?? "", 12, false, "left");
    applyCell(ws, r, 3, row?.amount || "", 12);
    if (i < 2) {
      // 行5-6: 各自独立
      applyCell(ws, r, 4, approvalLabels[i], 12, true);
      applyCell(ws, r, 5, "", 12);
    }
    ws.getRow(r).height = 20;
  }
  // 行7: 总裁审批（D7:D8 纵向合并，E7:E8 纵向合并）
  mc(ws, 7, 4, 8, 4, approvalLabels[2], 12, true);
  mc(ws, 7, 5, 8, 5, "", 12);

  // 行8: 合计（D8:E8 已被行7合并）
  applyCell(ws, 8, 1, "合   计", 12, true);
  applyCell(ws, 8, 2, "￥", 12);
  const total = expense.expenses.reduce((s, r) => s + (r?.amount || 0), 0);
  applyCell(ws, 8, 3, total || "", 12);
  ws.getRow(8).height = 14;

  // 行9: 金额大写（B9:C9 合并，D9:E9 合并）
  applyCell(ws, 9, 1, "金额大写：", 12, true, "left");
  mc(ws, 9, 2, 9, 3, toChineseAmount(total), 12, false, "left");
  const reimburseNote = `原借${expense.advancePaid || "      "}元，已报金额:${expense.alreadyPaid || "      "}元\n应退/报金额：${(total - (expense.advancePaid || 0) - (expense.alreadyPaid || 0)).toFixed(2)}元`;
  mc(ws, 9, 4, 9, 5, reimburseNote, 12, true, "left", true);
  ws.getRow(9).height = 34;

  // 行10: 签名行（A10:E10 合并）
  mc(ws, 10, 1, 10, 5,
    `会计：            出纳：          领款人:${expense.payee}              附件${expense.attachments || ""}张`,
    12, true, "left");
  ws.getRow(10).height = 20;

  // ── 招待费明细单（列 I-M，行 12-?）──
  if (entertain) {
    const IC = 9; // 列I = col 9

    // 行12: 标题（I12:M12，16pt bold）
    mc(ws, 12, IC, 12, IC + 4, "招待费明细单", 16, true, "center");
    ws.getRow(12).height = 37;

    // 行13: 部门+经办人（I13:M13，14pt bold）
    mc(ws, 13, IC, 13, IC + 4,
      `部门：${entertain.department}                         经办人：${entertain.operator}`,
      14, true, "left");
    ws.getRow(13).height = 35;

    // 行14: 表头（14pt bold）
    applyCell(ws, 14, IC,     "时间",           14, true);
    applyCell(ws, 14, IC + 1, "开票方简称",      14, true);
    applyCell(ws, 14, IC + 2, "招待人员及事由",  14, true);
    applyCell(ws, 14, IC + 3, "金额",           14, true);
    applyCell(ws, 14, IC + 4, "证明人",         14, true);
    ws.getRow(14).height = 20;

    // 数据行（固定 5 行）
    const eRows = [...entertain.entertainRows];
    while (eRows.length < 5) eRows.push({ date: "", vendor: "", detail: "", amount: 0, witness: "" });

    eRows.slice(0, 5).forEach((row, i) => {
      const r = 15 + i;
      applyCell(ws, r, IC,     row.date,   10, false, "center");
      applyCell(ws, r, IC + 1, row.vendor, 10, false, "left");
      applyCell(ws, r, IC + 2, row.detail, 8,  false, "left", true);
      applyCell(ws, r, IC + 3, row.amount || "", 14, false, "center");
      applyCell(ws, r, IC + 4, row.witness, 10, false, "center");
      ws.getRow(r).height = 20;
    });

    const etotalRow = 20;
    const etotal = entertain.entertainRows.reduce((s, r) => s + (r?.amount || 0), 0);

    // 合计行（I:J 合并）
    mc(ws, etotalRow, IC, etotalRow, IC + 1, "合计", 14, true);
    applyCell(ws, etotalRow, IC + 2, "小写：￥", 14, true);
    applyCell(ws, etotalRow, IC + 3, etotal || "", 14);
    applyCell(ws, etotalRow, IC + 4, "", 14);
    ws.getRow(etotalRow).height = 20;

    // 大写行（L:M 合并）
    mc(ws, etotalRow + 1, IC, etotalRow + 1, IC + 1, "", 14);
    applyCell(ws, etotalRow + 1, IC + 2, "人民币大写：", 14, true);
    mc(ws, etotalRow + 1, IC + 3, etotalRow + 1, IC + 4, toChineseAmount(etotal), 14, false, "left");
    ws.getRow(etotalRow + 1).height = 20;
  }

  // 打印设置（A4 纵向，96% 缩放）
  ws.pageSetup = {
    paperSize: 9,
    orientation: "portrait",
    scale: 96,
    printArea: entertain ? "A1:M21" : "A1:E10",
  };
  ws.pageMargins = {
    left: 0.7, right: 0.7,
    top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3,
  };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
