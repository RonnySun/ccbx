import { NextRequest, NextResponse } from "next/server";
import { generatePaymentExcel, PaymentData } from "@/lib/excel/payment";

export async function POST(req: NextRequest) {
  try {
    const data: PaymentData = await req.json();
    const buffer = await generatePaymentExcel(data);
    const filename = encodeURIComponent(`资金支付审批表-${data.operator}-${data.date}.xlsx`);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}
