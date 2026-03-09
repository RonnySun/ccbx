import { NextRequest, NextResponse } from "next/server";
import { generateLoanExcel, LoanData } from "@/lib/excel/loan";

export async function POST(req: NextRequest) {
  try {
    const data: LoanData = await req.json();
    const buffer = await generateLoanExcel(data);
    const filename = encodeURIComponent(`借款审批单-${data.borrower}-${data.date}.xlsx`);
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
