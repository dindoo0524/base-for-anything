import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 가족 말씀편지",
  description: "묵상한 말씀과 가족에게 전하고 싶은 마음을 나누는 공간",
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
