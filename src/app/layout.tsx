import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "주역 AI 상담",
  description: "주역 64괘와 AI 해석을 결합한 개인 상담 MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-rice text-slate-800 antialiased">{children}</body>
    </html>
  );
}
