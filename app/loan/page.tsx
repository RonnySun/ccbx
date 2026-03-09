"use client";
import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import Section from "@/components/Section";
import { Field } from "@/components/Field";
import { toChineseAmount } from "@/lib/utils/chineseAmount";

interface LoanData {
  date: string;
  department: string;
  borrower: string;
  reason: string;
  amount: number;
}

export default function LoanPage() {
  const today = new Date();
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState<LoanData>({
    date: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    department: "机器人产品中心",
    borrower: "孙荣孟",
    reason: "",
    amount: 0,
  });

  const set = (k: keyof LoanData) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export/loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `借款审批单-${form.borrower}-${form.date}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  return (
    <FormLayout title="借款审批单" subtitle="预支借款申请" icon="💰" onExport={handleExport} exporting={exporting}>
      <Section title="借款信息">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="日期" value={form.date} onChange={set("date")} required />
          <Field label="部门" value={form.department} onChange={set("department")} required />
          <Field label="借款人" value={form.borrower} onChange={set("borrower")} required />
          <div className="col-span-2 md:col-span-3 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">借款事由 <span className="text-red-400">*</span></label>
            <textarea
              value={form.reason}
              onChange={(e) => set("reason")(e.target.value)}
              placeholder="请填写借款用途和原因"
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <Field label="借款金额（元）" value={form.amount} onChange={(v) => setForm(p => ({ ...p, amount: parseFloat(v) || 0 }))} type="number" required />
        </div>

        <div className="mt-5 p-4 bg-purple-50 rounded-xl text-center">
          <p className="text-xs text-gray-400 mb-1">借款金额大写</p>
          <p className="text-lg font-bold text-purple-700">{toChineseAmount(form.amount)}</p>
          <p className="text-sm text-gray-500 mt-1">¥{Number(form.amount).toFixed(2)} 元</p>
        </div>
      </Section>

      <Section title="审批签字区">
        <div className="grid grid-cols-3 gap-4">
          {["部门负责人", "财务负责人", "总裁审批"].map((label) => (
            <div key={label} className="border border-dashed border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 mb-6">{label}</p>
              <div className="h-8 border-b border-gray-200" />
              <p className="text-xs text-gray-300 mt-2">签字</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">签字区仅供预览参考，导出 Excel 后手动签字</p>
      </Section>
    </FormLayout>
  );
}
