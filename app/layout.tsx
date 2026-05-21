import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Piggy-Book",
    template: "%s | Piggy-Book",
  },
  description: "수입과 지출을 한눈에 관리하세요. 월별 예산 관리와 소비 패턴 분석을 간편하게.",
  keywords: ["가계부", "예산관리", "지출관리", "수입관리", "소비패턴", "월별결산"],
  authors: [{ name: "Piggy-Book" }],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "Piggy-Book",
    description: "수입과 지출을 한눈에 관리하세요. 월별 예산 관리와 소비 패턴 분석을 간편하게.",
    siteName: "Piggy-Book",
    images: [
      {
        url: "/icon.png",
        width: 1254,
        height: 1254,
        alt: "Piggy-Book 로고",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Piggy-Book",
    description: "수입과 지출을 한눈에 관리하세요. 월별 예산 관리와 소비 패턴 분석을 간편하게.",
    images: ["/icon.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
