"use client";
import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  onExport: () => void;
  exporting: boolean;
}

export default function FormLayout({ title, subtitle, icon, children, onExport, exporting }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
              ← 返回
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-lg">{icon}</span>
            <div>
              <h1 className="text-base font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onExport}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                生成中...
              </>
            ) : (
              <>📥 导出 Excel</>
            )}
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">{children}</main>
    </div>
  );
}
