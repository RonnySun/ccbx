"use client";
import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import Section from "@/components/Section";
import { Field } from "@/components/Field";
import { toChineseAmount } from "@/lib/utils/chineseAmount";

interface PaymentData {
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

const PAYMENT_METHODS = ["银行转账", "现金", "支票", "网银"];

export default function PaymentPage() {
  const today = new Date();
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState<PaymentData>({
    department: "机器人产品中心",
    date: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    serialNo: "",
    purpose: "",
    paymentMethod: "银行转账",
    amount: 0,
    basis: "",
    contractNo: "",
    payeeName: "",
    payeeAccount: "",
    payeeBank: "",
    operator: "孙荣孟",
  });

  const set = (k: keyof PaymentData) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `资金支付审批表-${form.operator}-${form.date}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  return (
    <FormLayout title="资金支付审批表" subtitle="对外付款审批" icon="🏦" onExport={handleExport} exporting={exporting}>
      <Section title="基本信息">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="部门" value={form.department} onChange={set("department")} required />
          <Field label="日期" value={form.date} onChange={set("date")} required />
          <Field label="编号" value={form.serialNo} onChange={set("serialNo")} placeholder="可留空" />
          <Field label="经办人" value={form.operator} onChange={set("operator")} required />
          <Field label="付款用途" value={form.purpose} onChange={set("purpose")} required className="col-span-2" />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">付款方式</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => set("paymentMethod")(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <Field label="付款金额（元）" value={form.amount} onChange={(v) => setForm(p => ({ ...p, amount: parseFloat(v) || 0 }))} type="number" required />
          <Field label="付款依据" value={form.basis} onChange={set("basis")} placeholder="合同/发票/协议" className="col-span-2" />
          <Field label="合同号码" value={form.contractNo} onChange={set("contractNo")} placeholder="可留空" className="col-span-2" />
        </div>

        <div className="mt-5 p-4 bg-red-50 rounded-xl text-center">
          <p className="text-xs text-gray-400 mb-1">付款金额大写</p>
          <p className="text-lg font-bold text-red-700">{toChineseAmount(form.amount)}</p>
          <p className="text-sm text-gray-500 mt-1">¥{Number(form.amount).toFixed(2)} 元</p>
        </div>
      </Section>

      <Section title="收款方信息">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="收款单位全称" value={form.payeeName} onChange={set("payeeName")} required className="md:col-span-3" />
          <Field label="收款账号" value={form.payeeAccount} onChange={set("payeeAccount")} required className="md:col-span-2" />
          <Field label="收款开户行" value={form.payeeBank} onChange={set("payeeBank")} required />
        </div>
      </Section>

      <Section title="审批签字区">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["部门负责人", "财务负责人", "总裁审批", "经办人"].map((label) => (
            <div key={label} className="border border-dashed border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 mb-6">{label}</p>
              <div className="h-8 border-b border-gray-200" />
              <p className="text-xs text-gray-300 mt-2">签字</p>
            </div>
          ))}
        </div>
      </Section>
    </FormLayout>
  );
}
