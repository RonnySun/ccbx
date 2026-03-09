import { NextRequest, NextResponse } from "next/server";
import { generateTravelExcel, TravelFormData } from "@/lib/excel/travel";

export async function POST(req: NextRequest) {
  try {
    const data: TravelFormData = await req.json();
    const buffer = await generateTravelExcel(data);

    const filename = encodeURIComponent(`差旅费报销单-${data.travelerName}-${data.date}.xlsx`);
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
