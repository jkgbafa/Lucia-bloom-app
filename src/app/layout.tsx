import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Bloom — Your Personal Cycle Companion",
  description: "Beautiful, private period tracking made just for Lucia. Track your cycle, symptoms, mood, and more — with zero data sharing.",
  keywords: ["period tracker", "cycle tracking", "menstrual health", "ovulation", "fertility"],
  authors: [{ name: "Made with love" }],
  openGraph: {
    title: "Bloom — Your Personal Cycle Companion",
    description: "Beautiful, private period tracking made just for Lucia.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF708C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icons/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icons/icon-192.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bloom" />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
