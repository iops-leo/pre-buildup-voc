import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: "--font-noto-sans-kr",
  display: 'swap',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "Pre-Build Up Voca",
  description: "한-영 단어 학습 앱 with 게이미피케이션",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BuildUp Voca",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon.svg" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKr.variable}`}>
      <body className="antialiased font-sans bg-slate-950 text-slate-100 selection:bg-blue-500/30">
        <ServiceWorkerRegistration />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10" />
        <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light -z-10" />
        {children}
      </body>
    </html>
  );
}

