"use client";
import { useState, useEffect, useCallback } from "react";
import FormLayout from "@/components/FormLayout";
import Section from "@/components/Section";
import { Field } from "@/components/Field";
import { toChineseAmount } from "@/lib/utils/chineseAmount";
import type { TransportRow, TravelFormData } from "@/lib/excel/travel";
import {
  PRESET_PLACES,
  PRESET_REASONS,
  lookupRoute,
  saveRoute,
} from "@/lib/data/travelHistory";

const VEHICLES = ["的士", "滴滴", "高德", "地铁", "公交", "火车", "飞机", "高铁", "自驾"];

const LS_PLACES_KEY = "ccbx_travel_places";
const LS_REASONS_KEY = "ccbx_travel_reasons";

function loadFromLS(key: string, defaults: string[]): string[] {
  if (typeof window === "undefined") return defaults;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    return [...new Set([...defaults, ...saved])];
  } catch {
    return defaults;
  }
}

function saveToLS(key: string, value: string) {
  if (!value.trim() || typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    if (!existing.includes(value.trim())) {
      localStorage.setItem(key, JSON.stringify([...existing, value.trim()]));
    }
  } catch {}
}

// 地点/事由输入框（带历史记录 datalist）
function ComboInput({
  id,
  label,
  value,
  onChange,
  onCommit,
  placeholder,
  options,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit?: (v: string) => void;
  placeholder?: string;
  options: string[];
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <input
        list={`dl-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onCommit?.(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <datalist id={`dl-${id}`}>
        {options.map((o) => <option key={o} value={o} />)}
      </datalist>
    </div>
  );
}

const emptyTransport = (): TransportRow => ({
  month: new Date().getMonth() + 1,
  day: new Date().getDate(),
  reason: "",
  departTime: "",
  departPlace: "",
  arriveTime: "",
  arrivePlace: "",
  vehicle: "的士",
  amount: 0,
  toll: 0,
  km: 0,
  parking: 0,
  fuelAmount: 0,
});

export default function TravelPage() {
  const today = new Date();
  const [exporting, setExporting] = useState(false);
  const [places, setPlaces] = useState<string[]>(PRESET_PLACES);
  const [reasons, setReasons] = useState<string[]>(PRESET_REASONS);
  // 记录哪些行的自驾信息是被自动填入的（区分"自动匹配到"vs"需要手动填"）
  const [routeMatched, setRouteMatched] = useState<Record<number, boolean | null>>({});

  useEffect(() => {
    setPlaces(loadFromLS(LS_PLACES_KEY, PRESET_PLACES));
    setReasons(loadFromLS(LS_REASONS_KEY, PRESET_REASONS));
  }, []);

  const commitPlace = useCallback((v: string) => {
    if (!v.trim()) return;
    saveToLS(LS_PLACES_KEY, v);
    setPlaces((p) => (p.includes(v.trim()) ? p : [...p, v.trim()]));
  }, []);

  const commitReason = useCallback((v: string) => {
    if (!v.trim()) return;
    saveToLS(LS_REASONS_KEY, v);
    setReasons((p) => (p.includes(v.trim()) ? p : [...p, v.trim()]));
  }, []);

  const [base, setBase] = useState({
    date: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    serialNo: "",
    travelerName: "孙荣孟",
    department: "机器人产品中心",
    position: "产品经理",
    reimburser: "孙荣孟",
    destination: "",
    startDate: "",
    endDate: "",
    days: 1,
    reason: "",
    rdNo: "",
    payee: "孙荣孟",
    attachments: 0,
    otherNote: "",
  });

  const [fees, setFees] = useState({
    transportAmount: 0, transportCount: 0,
    mealAmount: 0, mealCount: 0,
    hotelAmount: 0, hotelCount: 0,
    otherAmount: 0, otherCount: 0,
    advanceAmount: 0,
  });

  const [transports, setTransports] = useState<TransportRow[]>([emptyTransport()]);

  const setB = (k: keyof typeof base) => (v: string) =>
    setBase((p) => ({ ...p, [k]: v }));
  const setF = (k: keyof typeof fees) => (v: string) =>
    setFees((p) => ({ ...p, [k]: parseFloat(v) || 0 }));

  const total = fees.transportAmount + fees.mealAmount + fees.hotelAmount + fees.otherAmount;
  const reimburseAmount = total - fees.advanceAmount;
  const transportTotal = transports.reduce((s, t) => s + (t.amount || 0), 0);

  /** 更新某行某字段，如果是自驾且出发/到达地点变化则自动查询路线 */
  function setRow(i: number, k: keyof TransportRow, v: string | number) {
    setTransports((rows) => {
      const updated = rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r));
      const row = updated[i];

      if (row.vehicle === "自驾" && (k === "departPlace" || k === "arrivePlace")) {
        const match = lookupRoute(row.departPlace, row.arrivePlace);
        if (match) {
          updated[i] = { ...row, [k]: v, km: match.km, fuelAmount: match.fuel };
          setRouteMatched((m) => ({ ...m, [i]: true }));
        } else if (row.departPlace && row.arrivePlace) {
          // 有地点但没记录，清空提示
          updated[i] = { ...row, [k]: v, km: 0, fuelAmount: 0 };
          setRouteMatched((m) => ({ ...m, [i]: false }));
        }
      }

      if (k === "vehicle") {
        if (v === "自驾") {
          const match = lookupRoute(row.departPlace, row.arrivePlace);
          if (match) {
            updated[i] = { ...row, vehicle: v as string, km: match.km, fuelAmount: match.fuel };
            setRouteMatched((m) => ({ ...m, [i]: true }));
          } else if (row.departPlace && row.arrivePlace) {
            setRouteMatched((m) => ({ ...m, [i]: false }));
          }
        } else {
          setRouteMatched((m) => ({ ...m, [i]: null }));
        }
      }

      return updated;
    });
  }

  /** 离开公里/油费字段时，保存自定义路线 */
  function commitDrivingData(i: number) {
    const row = transports[i];
    if (row.vehicle === "自驾" && row.departPlace && row.arrivePlace) {
      saveRoute(row.departPlace, row.arrivePlace, row.km, row.fuelAmount);
    }
  }

  function addRow() {
    setTransports((rows) => [...rows, emptyTransport()]);
  }

  function removeRow(i: number) {
    setTransports((rows) => rows.filter((_, idx) => idx !== i));
    setRouteMatched((m) => {
      const next: typeof m = {};
      Object.entries(m).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < i) next[ki] = v;
        else if (ki > i) next[ki - 1] = v;
      });
      return next;
    });
  }

  function syncTransportTotal() {
    setFees((p) => ({ ...p, transportAmount: transportTotal }));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data: TravelFormData = {
        ...base,
        ...fees,
        days: Number(base.days),
        attachments: Number(base.attachments),
        transports,
      };
      const res = await fetch("/api/export/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `差旅费报销单-${base.travelerName}-${base.date}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  return (
    <FormLayout title="差旅费报销单" subtitle="含交通费用明细表" icon="✈️" onExport={handleExport} exporting={exporting}>
      {/* 基本信息 */}
      <Section title="基本信息">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="报销日期" value={base.date} onChange={setB("date")} required />
          <Field label="编号" value={base.serialNo} onChange={setB("serialNo")} placeholder="可留空" />
          <Field label="出差人姓名" value={base.travelerName} onChange={setB("travelerName")} required />
          <Field label="部门" value={base.department} onChange={setB("department")} required />
          <Field label="职务" value={base.position} onChange={setB("position")} />
          <Field label="报销人" value={base.reimburser} onChange={setB("reimburser")} required />
          <Field label="出差地点" value={base.destination} onChange={setB("destination")} required className="col-span-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Field label="开始日期" value={base.startDate} onChange={setB("startDate")} placeholder="2025/3/3上午" required />
          <Field label="结束日期" value={base.endDate} onChange={setB("endDate")} placeholder="2025/3/5下午" required />
          <Field label="出差天数" value={base.days} onChange={setB("days")} type="number" required />
          <Field label="RD项目号" value={base.rdNo} onChange={setB("rdNo")} placeholder="可留空" />
          <Field label="出差事由" value={base.reason} onChange={setB("reason")} required className="col-span-2" />
          <Field label="领款人" value={base.payee} onChange={setB("payee")} required />
          <Field label="附件张数" value={base.attachments} onChange={setB("attachments")} type="number" />
        </div>
      </Section>

      {/* 费用金额 */}
      <Section title="费用金额">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 md:col-span-4 flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            <span>交通费用明细合计：</span>
            <span className="font-bold text-base">¥{transportTotal.toFixed(2)}</span>
            <button
              onClick={syncTransportTotal}
              className="ml-auto text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
            >
              同步到交通费 ↓
            </button>
          </div>
          <div>
            <Field label="交通费（元）" value={fees.transportAmount} onChange={setF("transportAmount")} type="number" />
          </div>
          <Field label="交通费票据张数" value={fees.transportCount} onChange={setF("transportCount")} type="number" />
          <Field label="伙食补助（元）" value={fees.mealAmount} onChange={setF("mealAmount")} type="number" />
          <Field label="伙食补助票据张数" value={fees.mealCount} onChange={setF("mealCount")} type="number" />
          <Field label="住宿费（元）" value={fees.hotelAmount} onChange={setF("hotelAmount")} type="number" />
          <Field label="住宿费票据张数" value={fees.hotelCount} onChange={setF("hotelCount")} type="number" />
          <Field label="其他费用（元）" value={fees.otherAmount} onChange={setF("otherAmount")} type="number" />
          <Field label="其他票据张数" value={fees.otherCount} onChange={setF("otherCount")} type="number" />
          <Field label="预支金额（元）" value={fees.advanceAmount} onChange={setF("advanceAmount")} type="number" />
        </div>

        <div className="mt-5 p-4 bg-gray-50 rounded-xl grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400">合计金额</p>
            <p className="text-xl font-bold text-gray-900">¥{total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">预支金额</p>
            <p className="text-xl font-bold text-orange-500">¥{fees.advanceAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{reimburseAmount >= 0 ? "应补金额" : "应退金额"}</p>
            <p className={`text-xl font-bold ${reimburseAmount >= 0 ? "text-green-600" : "text-red-500"}`}>
              ¥{Math.abs(reimburseAmount).toFixed(2)}
            </p>
          </div>
          <div className="col-span-3 border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-400 mb-1">金额大写</p>
            <p className="text-sm font-medium text-gray-700">{toChineseAmount(total)}</p>
          </div>
        </div>
      </Section>

      {/* 交通费用明细 */}
      <Section title="交通费用明细">
        <p className="text-xs text-gray-400 mb-3">
          地点支持历史记录（含2025年全年出差数据）；自驾时选择出发/到达地点后自动填入公里数和油费
        </p>
        <div className="space-y-3">
          {transports.map((row, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500">第 {i + 1} 条</span>
                {transports.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-xs text-red-400 hover:text-red-600">
                    删除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="月" value={row.month} onChange={(v) => setRow(i, "month", parseInt(v) || 0)} type="number" />
                <Field label="日" value={row.day} onChange={(v) => setRow(i, "day", parseInt(v) || 0)} type="number" />

                <ComboInput
                  id={`reason-${i}`}
                  label="事由"
                  value={row.reason}
                  onChange={(v) => setRow(i, "reason", v)}
                  onCommit={commitReason}
                  placeholder="如：去机场"
                  options={reasons}
                  className="col-span-2"
                />

                <Field label="出发时间" value={row.departTime} onChange={(v) => setRow(i, "departTime", v)} placeholder="09:30" />

                <ComboInput
                  id={`depart-${i}`}
                  label="出发地点"
                  value={row.departPlace}
                  onChange={(v) => setRow(i, "departPlace", v)}
                  onCommit={commitPlace}
                  placeholder="梅华|美林书苑-北门"
                  options={places}
                  className="col-span-2"
                />

                <Field label="到达时间" value={row.arriveTime} onChange={(v) => setRow(i, "arriveTime", v)} placeholder="10:15" />

                <ComboInput
                  id={`arrive-${i}`}
                  label="到达地点"
                  value={row.arrivePlace}
                  onChange={(v) => setRow(i, "arrivePlace", v)}
                  onCommit={commitPlace}
                  placeholder="珠海金湾机场"
                  options={places}
                  className="col-span-2"
                />

                {/* 交通工具 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">交通工具</label>
                  <select
                    value={row.vehicle}
                    onChange={(e) => setRow(i, "vehicle", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {VEHICLES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>

                <Field label="金额（元）" value={row.amount} onChange={(v) => setRow(i, "amount", parseFloat(v) || 0)} type="number" />
                <Field label="通行费（元）" value={row.toll} onChange={(v) => setRow(i, "toll", parseFloat(v) || 0)} type="number" />
              </div>

              {/* 自驾信息 */}
              {row.vehicle === "自驾" ? (
                <div className="mt-3">
                  {/* 路线匹配状态提示 */}
                  {routeMatched[i] === true && (
                    <p className="text-xs text-green-600 mb-2">✓ 已自动匹配历史路线数据，请确认后修改</p>
                  )}
                  {routeMatched[i] === false && (
                    <p className="text-xs text-orange-500 mb-2">⚠ 未找到此路线历史记录，请手动填写公里数和油费，填完后自动保存</p>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <Field
                      label="公里数"
                      value={row.km}
                      onChange={(v) => setRow(i, "km", parseFloat(v) || 0)}
                      onBlur={() => commitDrivingData(i)}
                      type="number"
                      placeholder={routeMatched[i] === false ? "请填写" : ""}
                    />
                    <Field
                      label="停车费（元）"
                      value={row.parking}
                      onChange={(v) => setRow(i, "parking", parseFloat(v) || 0)}
                      type="number"
                    />
                    <Field
                      label="报销油费（元）"
                      value={row.fuelAmount}
                      onChange={(v) => setRow(i, "fuelAmount", parseFloat(v) || 0)}
                      onBlur={() => commitDrivingData(i)}
                      type="number"
                      placeholder={routeMatched[i] === false ? "请填写" : ""}
                    />
                  </div>
                </div>
              ) : (
                <details className="mt-3">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">自驾信息（可选）</summary>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <Field label="公里数" value={row.km} onChange={(v) => setRow(i, "km", parseFloat(v) || 0)} type="number" />
                    <Field label="停车费（元）" value={row.parking} onChange={(v) => setRow(i, "parking", parseFloat(v) || 0)} type="number" />
                    <Field label="报销油费（元）" value={row.fuelAmount} onChange={(v) => setRow(i, "fuelAmount", parseFloat(v) || 0)} type="number" />
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          + 添加交通记录
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 flex justify-between">
          <span>交通费合计</span>
          <span className="font-bold">¥{transportTotal.toFixed(2)}　{toChineseAmount(transportTotal)}</span>
        </div>
      </Section>
    </FormLayout>
  );
}
