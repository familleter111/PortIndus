import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { AccessGate } from "@/components/layout/access-gate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APQP Pilot — Suivi des projets",
  description: "Démonstration de pilotage APQP automobile.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">
        <AccessGate>{children}</AccessGate>
      </body>
    </html>
  );
}
