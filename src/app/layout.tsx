import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "주역점 (I Ching Divination) - 음양오행 맞춤 주역 운세",
  description: "사주명리 음양오행과 주역(周易) 64괘를 융합하여 당신의 선천적 기운에 꼭 맞는 깊이 있는 맞춤형 운세와 고민 상담을 제공합니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#FDFBF7] text-slate-800 antialiased selection:bg-amber-100">
        {/* 배경 장식 */}
        <div className="fixed top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-slate-400 blur-[120px]"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
