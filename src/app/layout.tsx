import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Bloom — Your Personal Cycle Companion",
  description: "Beautiful, private period tracking made just for you. Track your cycle, symptoms, mood, and more — with zero data sharing.",
  keywords: ["period tracker", "cycle tracking", "menstrual health", "ovulation", "fertility"],
  authors: [{ name: "Made with love" }],
  openGraph: {
    title: "Bloom — Your Personal Cycle Companion",
    description: "Beautiful, private period tracking made just for you.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B8A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
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
