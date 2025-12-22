import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'XM Ledger - 财务追踪系统',
  description: '公司内部财务记账系统,支持多币种自动汇率转换',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
