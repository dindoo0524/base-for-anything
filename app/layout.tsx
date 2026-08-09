import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base for Anything",
  description: "작은 웹 서비스를 한 단계씩 만들어 가는 재사용 가능한 베이스 키트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
