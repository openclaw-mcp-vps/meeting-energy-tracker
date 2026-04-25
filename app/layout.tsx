import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://meeting-energy-tracker.app"),
  title: {
    default: "Meeting Energy Tracker | Track team energy levels across meetings",
    template: "%s | Meeting Energy Tracker"
  },
  description:
    "Measure meeting load, collect post-meeting energy scores, and turn team fatigue signals into actionable scheduling decisions.",
  keywords: [
    "meeting fatigue",
    "team energy",
    "engineering manager",
    "calendar analytics",
    "meeting optimization"
  ],
  openGraph: {
    type: "website",
    title: "Meeting Energy Tracker",
    description:
      "Track meeting frequency, duration, and team energy feedback to identify where calendars drain focus.",
    siteName: "Meeting Energy Tracker",
    url: "https://meeting-energy-tracker.app"
  },
  twitter: {
    card: "summary_large_image",
    title: "Meeting Energy Tracker",
    description:
      "Give team leads a weekly view of where meetings help and where they drain engineering momentum."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-[#0d1117] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
