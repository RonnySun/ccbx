import { NextRequest, NextResponse } from "next/server";
import { generateExpenseExcel, ExpenseFormData, EntertainFormData } from "@/lib/excel/expense";

export async function POST(req: NextRequest) {
  try {
    const { expense, entertain }: { expense: ExpenseFormData; entertain?: EntertainFormData } =
      await req.json();
    const buffer = await generateExpenseExcel(expense, entertain);

    const filename = encodeURIComponent(`费用报销审批单-${expense.reimburser}-${expense.date}.xlsx`);
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
