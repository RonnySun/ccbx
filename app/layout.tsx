import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "财务单据填写系统",
  description: "Amicro 财务单据在线填写与导出",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
