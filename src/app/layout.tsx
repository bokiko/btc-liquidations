import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BTC Liquidations | Real-time Binance Futures Monitor",
  description: "Monitor Bitcoin liquidations in real-time from Binance Futures. Track longs and shorts getting liquidated with live charts and analytics.",
  keywords: ["bitcoin", "liquidations", "binance", "futures", "trading", "crypto"],
  openGraph: {
    title: "BTC Liquidations Monitor",
    description: "Real-time Bitcoin liquidation tracking",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#09090b] text-white`}>
        {children}
      </body>
    </html>
  );
}
