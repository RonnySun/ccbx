"use client";
import Link from "next/link";

const forms = [
  {
    href: "/travel",
    title: "差旅费报销单",
    subtitle: "含交通费用明细表",
    icon: "✈️",
    color: "from-blue-500 to-blue-600",
    desc: "出差交通、住宿、伙食补助等费用报销",
  },
  {
    href: "/entertainment",
    title: "招待费报销单",
    subtitle: "含费用报销审批单",
    icon: "🍽️",
    color: "from-orange-500 to-orange-600",
    desc: "客户招待费用明细及审批",
  },
  {
    href: "/expense",
    title: "费用报销审批单",
    subtitle: "通用费用报销",
    icon: "📋",
    color: "from-green-500 to-green-600",
    desc: "日常办公、采购等通用费用报销",
  },
  {
    href: "/loan",
    title: "借款审批单",
    subtitle: "预支借款申请",
    icon: "💰",
    color: "from-purple-500 to-purple-600",
    desc: "出差或项目预支借款申请",
  },
  {
    href: "/payment",
    title: "资金支付审批表",
    subtitle: "对外付款审批",
    icon: "🏦",
    color: "from-red-500 to-red-600",
    desc: "供应商付款、合同款项支付审批",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">财</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">财务单据填写系统</h1>
              <p className="text-xs text-gray-500">珠海一微半导体股份有限公司</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主体 */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">选择单据类型</h2>
          <p className="text-gray-500 mt-1">填写表单后，一键导出符合格式要求的 Excel 文件</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((f) => (
            <Link key={f.href} href={f.href}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${f.color}`} />
                <div className="p-6">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">{f.subtitle}</p>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    开始填写 <span className="ml-1">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-12">
          导出文件格式：.xlsx　｜　自动计算金额大写　｜　符合公司财务规范
        </p>
      </main>
    </div>
  );
}
