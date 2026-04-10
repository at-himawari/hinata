import type { Metadata } from "next";
import { NotificationScheduler } from "@/components/shared/notification-scheduler";
import "./globals.css";

export const metadata: Metadata = {
  title: "hinata",
  description: "あたたかい気分で日々を残す、ローカル保存の日記アプリ",
  metadataBase: new URL("https://hinata.at-himawari.com"),
  icons: {
    icon: "/hinata-favicon.svg",
    shortcut: "/hinata-favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "hinata",
    description: "あたたかい気分で日々を残す、ローカル保存の日記アプリ",
    url: "https://hinata.at-himawari.com",
    siteName: "hinata",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "hinata の OGP 画像",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "hinata",
    description: "あたたかい気分で日々を残す、ローカル保存の日記アプリ",
    images: ["/twitter-card.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">
        <NotificationScheduler />
        {children}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6651283997191475"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
