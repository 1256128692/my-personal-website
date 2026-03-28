import type { Metadata } from "next";
import "./globals.css";
import SmokeFluid from "@/components/SmokeFluid";
import OtterMascot from "@/components/OtterMascot";

export const metadata: Metadata = {
  title: "饶家兴 | Rao Jiaxing",
  description: "AI售前工程师 · 王者荣耀3枚射手国标 · 永劫无间修罗段位",
  keywords: ["饶家兴", "Rao Jiaxing", "AI工程师", "王者荣耀", "永劫无间"],
  authors: [{ name: "饶家兴" }],
  openGraph: {
    title: "饶家兴 | Rao Jiaxing",
    description: "AI售前工程师 · 王者荣耀3枚射手国标 · 永劫无间修罗段位",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased" style={{ fontFamily: "'Noto Sans SC', sans-serif", backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <SmokeFluid />
        <OtterMascot />
        {children}
      </body>
    </html>
  );
}
