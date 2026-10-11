import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Fund Advisor — AI-Powered Portfolio Analysis",
  description: "Multi-fund analyser and AI financial advisor personalized to your income and goals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
