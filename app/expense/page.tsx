"use client";
import { useState } from "react";
import FormLayout from "@/components/FormLayout";
import Section from "@/components/Section";
import { Field } from "@/components/Field";
import { toChineseAmount } from "@/lib/utils/chineseAmount";
import type { ExpenseFormData, ExpenseRow } from "@/lib/excel/expense";

const emptyRow = (): ExpenseRow => ({ usage: "", project: "", amount: 0 });

export default function ExpensePage() {
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
    expenses: [emptyRow()],
  });

  function setRow(i: number, k: keyof ExpenseRow, v: string | number) {
    setExpense((p) => ({
      ...p,
      expenses: p.expenses.map((r, idx) =>
        idx === i ? { ...r, [k]: v } : r
      ),
    }));
  }

  const total = expense.expenses.reduce((s, r) => s + (r.amount || 0), 0);
  const reimburse = total - (expense.advancePaid || 0) - (expense.alreadyPaid || 0);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expense }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `费用报销审批单-${expense.reimburser}-${expense.date}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  return (
    <FormLayout title="费用报销审批单" subtitle="通用费用报销" icon="📋" onExport={handleExport} exporting={exporting}>
      <Section title="基本信息">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="部门" value={expense.department} onChange={(v) => setExpense(p => ({ ...p, department: v }))} required />
          <Field label="日期" value={expense.date} onChange={(v) => setExpense(p => ({ ...p, date: v }))} required />
          <Field label="编号" value={expense.serialNo} onChange={(v) => setExpense(p => ({ ...p, serialNo: v }))} placeholder="可留空" />
          <Field label="报销人" value={expense.reimburser} onChange={(v) => setExpense(p => ({ ...p, reimburser: v }))} required />
          <Field label="领款人" value={expense.payee} onChange={(v) => setExpense(p => ({ ...p, payee: v }))} />
          <Field label="附件张数" value={expense.attachments} onChange={(v) => setExpense(p => ({ ...p, attachments: parseInt(v) || 0 }))} type="number" />
          <Field label="原借金额（元）" value={expense.advancePaid} onChange={(v) => setExpense(p => ({ ...p, advancePaid: parseFloat(v) || 0 }))} type="number" />
          <Field label="已报金额（元）" value={expense.alreadyPaid} onChange={(v) => setExpense(p => ({ ...p, alreadyPaid: parseFloat(v) || 0 }))} type="number" />
        </div>
      </Section>

      <Section title="费用明细">
        <div className="space-y-3">
          {expense.expenses.map((row, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500">第 {i + 1} 条</span>
                {expense.expenses.length > 1 && (
                  <button
                    onClick={() => setExpense(p => ({ ...p, expenses: p.expenses.filter((_, idx) => idx !== i) }))}
                    className="text-xs text-red-400 hover:text-red-600"
                  >删除</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="用途" value={row.usage} onChange={(v) => setRow(i, "usage", v)} placeholder="如：办公用品、招待费" />
                <Field label="项目名称" value={row.project} onChange={(v) => setRow(i, "project", v)} placeholder="可留空" />
                <Field label="金额（元）" value={row.amount} onChange={(v) => setRow(i, "amount", parseFloat(v) || 0)} type="number" />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setExpense(p => ({ ...p, expenses: [...p.expenses, emptyRow()] }))}
          className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-green-300 hover:text-green-500 transition-colors"
        >
          + 添加费用条目
        </button>

        <div className="mt-5 p-4 bg-gray-50 rounded-xl grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400">合计金额</p>
            <p className="text-xl font-bold text-gray-900">¥{total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">原借/已报</p>
            <p className="text-xl font-bold text-orange-500">¥{(expense.advancePaid + expense.alreadyPaid).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{reimburse >= 0 ? "应补报" : "应退回"}</p>
            <p className={`text-xl font-bold ${reimburse >= 0 ? "text-green-600" : "text-red-500"}`}>
              ¥{Math.abs(reimburse).toFixed(2)}
            </p>
          </div>
          <div className="col-span-3 border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-400 mb-1">金额大写</p>
            <p className="text-sm font-medium text-gray-700">{toChineseAmount(total)}</p>
          </div>
        </div>
      </Section>
    </FormLayout>
  );
}
