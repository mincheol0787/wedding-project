import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MC Page",
  description: "모바일 청첩장과 예식 준비를 관리하는 웨딩 제작 SaaS"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
