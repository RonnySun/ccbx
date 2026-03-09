"use client";
import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import Section from "@/components/Section";
import { Field } from "@/components/Field";
import { toChineseAmount } from "@/lib/utils/chineseAmount";
import type { ExpenseFormData, EntertainFormData, EntertainRow } from "@/lib/excel/expense";

const emptyEntertain = (): EntertainRow => ({
  date: "",
  vendor: "",
  detail: "",
  amount: 0,
  witness: "",
});

export default function EntertainmentPage() {
  const today = new Date();
  const [exporting, setExporting] = useState(false);

  const [expense, setExpense] = useState<ExpenseFormData>({
    department: "机器人产品中心",
    date: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    serialNo: "",
    reimburser: "孙荣孟",
    payee: "孙荣孟",
    attachments: 0,
    advancePaid: 0,
    alreadyPaid: 0,
    expenses: [{ usage: "招待费", project: "", amount: 0 }],
  });

  const [entertain, setEntertain] = useState<EntertainFormData>({
    department: "机器人产品中心",
    operator: "孙荣孟",
    entertainRows: [emptyEntertain()],
  });

  const setE = (k: keyof ExpenseFormData) => (v: string) =>
    setExpense((p) => ({ ...p, [k]: v }));

  const entertainTotal = entertain.entertainRows.reduce((s, r) => s + (r.amount || 0), 0);

  function syncTotal() {
    setExpense((p) => ({
      ...p,
      expenses: [{ usage: "招待费", project: "", amount: entertainTotal }],
    }));
  }

  function setRow(i: number, k: keyof EntertainRow, v: string | number) {
    setEntertain((p) => ({
      ...p,
      entertainRows: p.entertainRows.map((r, idx) =>
        idx === i ? { ...r, [k]: v } : r
      ),
    }));
  }

  function addRow() {
    setEntertain((p) => ({ ...p, entertainRows: [...p.entertainRows, emptyEntertain()] }));
  }

  function removeRow(i: number) {
    setEntertain((p) => ({
      ...p,
      entertainRows: p.entertainRows.filter((_, idx) => idx !== i),
    }));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expense, entertain }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `招待费报销单-${expense.reimburser}-${expense.date}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  const total = expense.expenses.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <FormLayout title="招待费报销单" subtitle="费用报销审批单 + 招待费明细单" icon="🍽️" onExport={handleExport} exporting={exporting}>
      {/* 审批单基本信息 */}
      <Section title="费用报销审批单">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="部门" value={expense.department} onChange={setE("department")} required />
          <Field label="日期" value={expense.date} onChange={setE("date")} required />
          <Field label="编号" value={expense.serialNo} onChange={setE("serialNo")} placeholder="可留空" />
          <Field label="报销人" value={expense.reimburser} onChange={(v) => setExpense(p => ({ ...p, reimburser: v }))} required />
          <Field label="领款人" value={expense.payee} onChange={(v) => setExpense(p => ({ ...p, payee: v }))} required />
          <Field label="附件张数" value={expense.attachments} onChange={(v) => setExpense(p => ({ ...p, attachments: parseInt(v) || 0 }))} type="number" />
          <Field label="原借金额（元）" value={expense.advancePaid} onChange={(v) => setExpense(p => ({ ...p, advancePaid: parseFloat(v) || 0 }))} type="number" />
          <Field label="已报金额（元）" value={expense.alreadyPaid} onChange={(v) => setExpense(p => ({ ...p, alreadyPaid: parseFloat(v) || 0 }))} type="number" />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-500">招待费明细合计：</span>
            <span className="ml-2 font-bold text-blue-700">¥{entertainTotal.toFixed(2)}</span>
          </div>
          <button onClick={syncTotal} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
            同步到审批金额 ↑
          </button>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-400 mb-1">报销金额大写</p>
          <p className="text-base font-bold text-gray-700">{toChineseAmount(total)}</p>
          <p className="text-sm text-gray-500 mt-1">共计 ¥{total.toFixed(2)} 元</p>
        </div>
      </Section>

      {/* 招待费明细 */}
      <Section title="招待费明细单">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="部门" value={entertain.department} onChange={(v) => setEntertain(p => ({ ...p, department: v }))} />
          <Field label="经办人" value={entertain.operator} onChange={(v) => setEntertain(p => ({ ...p, operator: v }))} />
        </div>

        <div className="space-y-3">
          {entertain.entertainRows.map((row, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500">第 {i + 1} 条</span>
                {entertain.entertainRows.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-xs text-red-400 hover:text-red-600">删除</button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="时间（日期）" value={row.date} onChange={(v) => setRow(i, "date", v)} placeholder="2025/3/3" />
                <Field label="开票方简称" value={row.vendor} onChange={(v) => setRow(i, "vendor", v)} placeholder="北京潇湘甲鱼村" />
                <Field label="金额（元）" value={row.amount} onChange={(v) => setRow(i, "amount", parseFloat(v) || 0)} type="number" />
                <Field label="证明人" value={row.witness} onChange={(v) => setRow(i, "witness", v)} placeholder="可留空" />
                <div className="col-span-2 md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">招待人员及事由</label>
                  <input
                    type="text"
                    value={row.detail}
                    onChange={(e) => setRow(i, "detail", e.target.value)}
                    placeholder="接待XX公司XX总；一微：孙荣孟"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
        >
          + 添加招待记录
        </button>

        <div className="mt-4 p-3 bg-orange-50 rounded-xl text-sm text-orange-700 flex justify-between">
          <span>招待费合计</span>
          <span className="font-bold">¥{entertainTotal.toFixed(2)}　{toChineseAmount(entertainTotal)}</span>
        </div>
      </Section>
    </FormLayout>
  );
}
