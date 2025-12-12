import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConsoleSignature from "@/components/ConsoleSignature";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BTC Liquidations | Real-time Multi-Exchange Monitor",
  description: "Monitor Bitcoin liquidations in real-time across Binance, Bybit, OKX, Hyperliquid & Aevo. Track longs and shorts getting liquidated with live charts and analytics.",
  keywords: ["bitcoin", "liquidations", "binance", "bybit", "okx", "hyperliquid", "futures", "trading", "crypto", "defi"],
  authors: [{ name: "bokiko", url: "https://github.com/bokiko" }],
  creator: "bokiko",
  publisher: "bokiko",
  openGraph: {
    title: "BTC Liquidations Monitor",
    description: "Real-time Bitcoin liquidation tracking across 5 exchanges",
    type: "website",
    url: "https://btc-liquidations.vercel.app",
    siteName: "BTC Liquidations",
  },
  twitter: {
    card: "summary_large_image",
    title: "BTC Liquidations Monitor",
    description: "Real-time Bitcoin liquidation tracking across 5 exchanges",
    creator: "@bokiko",
  },
  metadataBase: new URL("https://btc-liquidations.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#09090b] text-white`}>
        <ConsoleSignature />
        {children}
      </body>
    </html>
  );
}
