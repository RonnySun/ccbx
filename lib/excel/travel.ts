import ExcelJS from "exceljs";
import { toChineseAmount } from "@/lib/utils/chineseAmount";

export interface TransportRow {
  month: number;
  day: number;
  reason: string;
  departTime: string;
  departPlace: string;
  arriveTime: string;
  arrivePlace: string;
  vehicle: string;
  amount: number;
  toll: number;
  km: number;
  parking: number;
  fuelAmount: number;
}

export interface TravelFormData {
  date: string;
  serialNo: string;
  travelerName: string;
  department: string;
  position: string;
  reimburser: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  rdNo: string;
  transportAmount: number;
  transportCount: number;
  mealAmount: number;
  mealCount: number;
  hotelAmount: number;
  hotelCount: number;
  otherAmount: number;
  otherCount: number;
  otherNote: string;
  advanceAmount: number;
  payee: string;
  attachments: number;
  transports: TransportRow[];
}

const COMPANY = "珠海一微半导体股份有限公司";

const THIN = { style: "thin" } as const;
const BDR: Partial<ExcelJS.Borders> = { top: THIN, left: THIN, bottom: THIN, right: THIN };

function applyCell(
  ws: ExcelJS.Worksheet,
  r: number, c: number,
  value: ExcelJS.CellValue,
  size = 11,
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
  size = 11,
  bold = false,
  align: "left" | "center" | "right" = "center",
  wrap = false,
) {
  ws.mergeCells(r1, c1, r2, c2);
  applyCell(ws, r1, c1, value, size, bold, align, wrap);
}

export async function generateTravelExcel(data: TravelFormData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("报销");

  // 列宽（精确匹配源文件）
  const colWidths = [
    5.9, 4.9, 9.4, 9.0, 8.7, 11.4, 8.7, 8.9, 11.5, 12.9, // A-J
    13.0,                                                     // K gap
    4.8, 4.9, 17.0, 11.9, 16.2, 11.9, 17.0, 9.9, 9.1, 9.1, 8.7, 8.7, 17.4, // L-X
  ];
  colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  // 行高（全部 24pt，与源文件一致）
  for (let r = 1; r <= 30; r++) ws.getRow(r).height = 24;
  ws.getRow(1).height = 8;
  ws.getRow(15).height = 8;

  // ── 差旅费报销单（列 1-10，行 2-14）──

  // 行2: 公司名 18pt
  mc(ws, 2, 1, 2, 10, COMPANY, 18, false, "center");

  // 行3: 标题 16pt
  mc(ws, 3, 1, 3, 10, "差旅费报销单", 16, false, "center");

  // 行4: 日期 + 编号
  mc(ws, 4, 1, 4, 8, `                   ${data.date}`, 12, false, "left");
  mc(ws, 4, 9, 4, 10, `编号：${data.serialNo}`, 12, false, "left");

  // 行5: 人员信息
  mc(ws, 5, 1, 5, 2, "出差人姓名", 11);
  mc(ws, 5, 3, 5, 4, data.travelerName, 11, false, "left");
  applyCell(ws, 5, 5, "部门", 11);
  applyCell(ws, 5, 6, data.department, 11, false, "left");
  applyCell(ws, 5, 7, "职务", 11);
  applyCell(ws, 5, 8, data.position, 11, false, "left");
  applyCell(ws, 5, 9, "报销人", 11);
  applyCell(ws, 5, 10, data.reimburser, 11, false, "left");

  // 行6: 出差地点 + 部门负责人（行6-7 纵向合并）
  mc(ws, 6, 1, 6, 2, "出差地点", 11);
  mc(ws, 6, 3, 6, 8, data.destination, 11, false, "left");
  mc(ws, 6, 9, 7, 9, "部门负责人", 11);
  mc(ws, 6, 10, 7, 10, "", 11);

  // 行7: 起止日期
  mc(ws, 7, 1, 7, 2, "起止日期", 11);
  mc(ws, 7, 3, 7, 8,
    `自 ${data.startDate} 至 ${data.endDate}   出差天数共${data.days}天`,
    11, false, "left");

  // 行8: 出差事由 + 财务负责人（行8-9 纵向合并）
  mc(ws, 8, 1, 8, 2, "出差事由", 11);
  mc(ws, 8, 3, 8, 6, data.reason, 11, false, "left");
  applyCell(ws, 8, 7, "RD项目号", 11);
  applyCell(ws, 8, 8, data.rdNo, 11, false, "left");
  mc(ws, 8, 9, 9, 9, "财务负责人", 11);
  mc(ws, 8, 10, 9, 10, "", 11);

  // 行9: 费用项目表头
  mc(ws, 9, 1, 9, 2, "费用项目", 11);
  applyCell(ws, 9, 3, "交通费", 11);
  applyCell(ws, 9, 4, "伙食补助", 11);
  applyCell(ws, 9, 5, "住宿费", 11);
  applyCell(ws, 9, 6, "其他", 11);
  mc(ws, 9, 7, 9, 8, "说明", 11);

  // 行10: 票据种类 + 预支金额 + 总经理审批（行10-12 纵向合并）
  mc(ws, 10, 1, 10, 2, "票据种类", 11);
  applyCell(ws, 10, 3, "发票", 11);
  applyCell(ws, 10, 4, "", 11);
  applyCell(ws, 10, 5, "", 11);
  applyCell(ws, 10, 6, "", 11);
  mc(ws, 10, 7, 10, 8, "预支金额：", 11);
  mc(ws, 10, 9, 12, 9, "总经理审批", 11);
  mc(ws, 10, 10, 12, 10, "", 11);

  // 行11: 票据张数
  mc(ws, 11, 1, 11, 2, "票据张数", 11);
  applyCell(ws, 11, 3, data.transportCount || "", 11);
  applyCell(ws, 11, 4, data.mealCount || "", 11);
  applyCell(ws, 11, 5, data.hotelCount || "", 11);
  applyCell(ws, 11, 6, data.otherCount || "", 11);
  mc(ws, 11, 7, 11, 8, "补报金额：", 11);

  // 行12: 金额
  const total = (data.transportAmount || 0) + (data.mealAmount || 0) +
    (data.hotelAmount || 0) + (data.otherAmount || 0);
  const reimburse = total - (data.advanceAmount || 0);
  mc(ws, 12, 1, 12, 2, "金额", 11);
  applyCell(ws, 12, 3, data.transportAmount || "", 11);
  applyCell(ws, 12, 4, data.mealAmount || "", 11);
  applyCell(ws, 12, 5, data.hotelAmount || "", 11);
  applyCell(ws, 12, 6, data.otherAmount || "", 11);
  mc(ws, 12, 7, 12, 8,
    `补、退金额：${reimburse >= 0 ? "+" : ""}${reimburse.toFixed(2)}`,
    11, false, "left");

  // 行13: 金额大写
  applyCell(ws, 13, 1, "金额大写：", 11, false, "left");
  applyCell(ws, 13, 2, "", 11);
  mc(ws, 13, 3, 13, 7, toChineseAmount(total), 11, false, "left");
  applyCell(ws, 13, 8, "（￥：", 11);
  applyCell(ws, 13, 9, total ? total.toFixed(2) : "", 11);
  applyCell(ws, 13, 10, "元）", 11);

  // 行14: 会计/出纳/领款人/附件
  applyCell(ws, 14, 1, "会计：", 11, false, "left");
  applyCell(ws, 14, 2, "", 11);
  applyCell(ws, 14, 3, "", 11);
  applyCell(ws, 14, 4, "出纳：", 11, false, "left");
  applyCell(ws, 14, 5, "", 11);
  applyCell(ws, 14, 6, "", 11);
  applyCell(ws, 14, 7, "领款人：", 11, false, "left");
  applyCell(ws, 14, 8, data.payee, 11, false, "left");
  applyCell(ws, 14, 9, "", 11);
  applyCell(ws, 14, 10, `附件${data.attachments || ""}张`, 11);

  // ── 交通费用明细表（列 12-24，行 16-30）──

  // 行16: 标题 16pt
  mc(ws, 16, 12, 16, 24, "交通费用明细表", 16, false, "center");

  // 行17-18: 双行表头（精确还原合并）
  mc(ws, 17, 12, 18, 12, "月", 11);
  mc(ws, 17, 13, 18, 13, "日", 11);
  mc(ws, 17, 14, 18, 14, "事 由", 11);
  mc(ws, 17, 15, 17, 16, "出发", 11);
  mc(ws, 17, 17, 17, 18, "到达", 11);
  mc(ws, 17, 19, 17, 20, "公共交通", 11);
  mc(ws, 17, 21, 18, 21, "通行费", 11);
  mc(ws, 17, 22, 17, 24, "自驾交通", 11);

  applyCell(ws, 18, 15, "出发时间", 10);
  applyCell(ws, 18, 16, "出发地点", 10);
  applyCell(ws, 18, 17, "到达时间", 10);
  applyCell(ws, 18, 18, "到达地点", 10);
  applyCell(ws, 18, 19, "交通工具", 10);
  applyCell(ws, 18, 20, "金额", 10);
  applyCell(ws, 18, 22, "公里数", 10);
  applyCell(ws, 18, 23, "停车费", 10);
  applyCell(ws, 18, 24, "报销油费金额", 10);

  // 数据行（固定 10 行）
  const MAX_ROWS = 10;
  for (let i = 0; i < MAX_ROWS; i++) {
    const r = 19 + i;
    const t = data.transports[i];
    applyCell(ws, r, 12, t?.month ?? "", 10);
    applyCell(ws, r, 13, t?.day ?? "", 10);
    applyCell(ws, r, 14, t?.reason ?? "", 10, false, "left");
    applyCell(ws, r, 15, t?.departTime ?? "", 10);
    applyCell(ws, r, 16, t?.departPlace ?? "", 10, false, "left", true);
    applyCell(ws, r, 17, t?.arriveTime ?? "", 10);
    applyCell(ws, r, 18, t?.arrivePlace ?? "", 10, false, "left", true);
    applyCell(ws, r, 19, t?.vehicle ?? "", 10);
    applyCell(ws, r, 20, t?.amount || "", 10);
    applyCell(ws, r, 21, t?.toll || "", 10);
    applyCell(ws, r, 22, t?.km || "", 10);
    applyCell(ws, r, 23, t?.parking || "", 10);
    applyCell(ws, r, 24, t?.fuelAmount || "", 10);
  }

  // 行29: 小计
  const pubTotal = data.transports.reduce((s, t) => s + (t?.amount || 0), 0);
  const tollTotal = data.transports.reduce((s, t) => s + (t?.toll || 0), 0);
  const parkTotal = data.transports.reduce((s, t) => s + (t?.parking || 0), 0);
  const fuelTotal = data.transports.reduce((s, t) => s + (t?.fuelAmount || 0), 0);
  mc(ws, 29, 12, 29, 19, "小计", 11);
  applyCell(ws, 29, 20, pubTotal || "", 11);
  applyCell(ws, 29, 21, tollTotal || "", 11);
  applyCell(ws, 29, 22, "", 11);
  applyCell(ws, 29, 23, parkTotal || "", 11);
  applyCell(ws, 29, 24, fuelTotal || "", 11);

  // 行30: 合计
  const grandTotal = pubTotal + tollTotal + parkTotal + fuelTotal;
  mc(ws, 30, 12, 30, 14, "报销金额合计：", 11);
  applyCell(ws, 30, 15, "大写：", 11);
  mc(ws, 30, 16, 30, 19, toChineseAmount(grandTotal), 11, false, "left");
  mc(ws, 30, 20, 30, 21, "小写：", 11);
  mc(ws, 30, 22, 30, 24, grandTotal ? grandTotal.toFixed(2) : "", 11);

  // 打印设置（A4 横向，适合一页）
  ws.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: "A1:X30",
  };
  ws.pageMargins = {
    left: 0.28, right: 0.28,
    top: 0.4, bottom: 0.4,
    header: 0.2, footer: 0.2,
  };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
