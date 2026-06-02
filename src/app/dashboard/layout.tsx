import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Live dashboard for tracking whale inflow and outflow activity across Ethereum, Base, and Polygon.",
  keywords: [
    "whale dashboard",
    "crypto inflow outflow",
    "on-chain whale alerts",
    "ethereum base polygon tracker",
  ],
  alternates: {
    canonical: "/dashboard",
  },
  openGraph: {
    title: "WhaleScope Dashboard",
    description:
      "Monitor real-time whale wallet flow, transfer activity, and chain-level movement analytics.",
    url: "https://web3-whale-tracker-dashboard.vercel.app/dashboard",
  },
  twitter: {
    title: "WhaleScope Dashboard",
    description:
      "Real-time whale wallet intelligence across major EVM chains.",
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
