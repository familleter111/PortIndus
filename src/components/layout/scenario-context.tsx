"use client";

import * as React from "react";

/**
 * Le contenu de SCENARIO.md est lu côté serveur dans le layout racine, puis
 * mis à disposition des composants clients. Le fichier reste la source unique :
 * il n'est ni dupliqué dans `public/`, ni recopié dans le code.
 */
const ScenarioContext = React.createContext<string>("");

export function ScenarioProvider({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario(): string {
  return React.useContext(ScenarioContext);
}
