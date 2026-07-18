import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { AccessGate } from "@/components/layout/access-gate";
import { ScenarioProvider } from "@/components/layout/scenario-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PortIndus — Pilotage de projets APQP",
  description: "Démonstration de pilotage APQP automobile.",
};

/** Lecture du scénario à la racine du dépôt : SCENARIO.md reste la source unique. */
async function loadScenario(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "SCENARIO.md"), "utf8");
  } catch {
    return "# Scénario indisponible\n\nLe fichier `SCENARIO.md` est introuvable à la racine du projet.";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const scenario = await loadScenario();

  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">
        <ScenarioProvider value={scenario}>
          <AccessGate>{children}</AccessGate>
        </ScenarioProvider>
      </body>
    </html>
  );
}
