import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WhaleScope - Web3 Whale Tracker Dashboard",
    template: "%s | WhaleScope",
  },
  description:
    "Track large whale inflows and outflows across Ethereum, Base, and Polygon with real-time alerts, wallet metrics, and flow analytics.",
  keywords: [
    "web3 whale tracker",
    "crypto whale dashboard",
    "on-chain inflow outflow analytics",
    "large transaction alerts",
    "ethereum whale tracking",
    "base chain whale monitor",
    "polygon whale activity",
    "multi-chain wallet analytics",
    "defi whale movements",
    "nextjs web3 analytics dashboard",
  ],
  authors: [{ name: "Khalil Ahmed", url: "https://www.khalilahmed.dev" }],
  creator: "Khalil Ahmed",
  metadataBase: new URL("https://web3-whale-tracker-dashboard.vercel.app/"),
  openGraph: {
    title: "WhaleScope - Web3 Whale Tracker Dashboard",
    description:
      "Monitor whale activity with inflow/outflow trends, large transfer alerts, and per-wallet analytics across major EVM chains.",
    url: "https://web3-whale-tracker-dashboard.vercel.app/",
    siteName: "WhaleScope",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WhaleScope Web3 Whale Tracker Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhaleScope - Web3 Whale Tracker Dashboard",
    description:
      "Track whale transfers, inflow/outflow trends, and multi-chain activity in a clean and fast dashboard.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
