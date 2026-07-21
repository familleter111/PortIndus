"use client";

import * as React from "react";

/**
 * Persistance des saisies de la démonstration.
 *
 * L'application n'a pas de serveur : sans cela, tout ce que l'utilisateur
 * ajoute ou corrige disparaît au rechargement de la page. Les modifications
 * sont donc conservées dans `localStorage`, qui survit à la fermeture du
 * navigateur — contrairement à `sessionStorage`, qui ne tient que l'onglet.
 *
 * Le préfixe porte un numéro de version : si la forme des données change dans
 * une prochaine version, les anciennes entrées sont ignorées plutôt que de
 * ressusciter un état incompatible.
 */

const PREFIX = "portindus.v1.";

/** Toutes les clés utilisées, pour pouvoir tout remettre à zéro d'un coup. */
export const KEYS = {
  planRows: "plan.rows",
  planCollapsed: "plan.collapsed",
  planColumns: "plan.columns",
  contributions: "execution.contributions",
  coreTeam: "projet.core",
  extendedTeam: "projet.extended",
  resources: "projet.resources",
  projectDates: "projet.dates",
  description: "projet.description",
} as const;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Entrée illisible ou stockage refusé : on repart des données d'origine.
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* navigation privée ou quota atteint : la saisie reste valable à l'écran */
  }
}

/**
 * État conservé d'une session à l'autre.
 *
 * Le rendu serveur ne connaît pas `localStorage` : on part toujours de la
 * valeur d'origine, puis on relit après montage. Sans cela, le HTML envoyé par
 * le serveur et le premier rendu du navigateur différeraient.
 *
 * `accept` filtre ce qui est relu : une entrée d'une version précédente, ou
 * corrompue à la main, ne doit pas casser l'écran.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  accept: (value: unknown) => boolean = () => true,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [value, setValue] = React.useState<T>(initial);
  /** Passé à `false` une fois la première passe d'écriture ignorée. */
  const untouched = React.useRef(true);

  React.useEffect(() => {
    const stored = read<T>(key);
    if (stored !== null && accept(stored)) setValue(stored);
    // `accept` est une fonction littérale chez les appelants : la relire à
    // chaque rendu relancerait la lecture en boucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    /*
     * La première passe est ignorée. Les effets s'exécutent dans l'ordre de
     * déclaration : au montage, celui-ci verrait encore la valeur d'origine —
     * l'état relu n'est appliqué qu'au rendu suivant. Sans ce garde-fou, ouvrir
     * une page suffirait à créer une sauvegarde, et « Réinitialiser » se
     * proposerait alors que rien n'a été modifié.
     */
    if (untouched.current) {
      untouched.current = false;
      return;
    }
    write(key, value);
  }, [key, value]);

  const reset = React.useCallback(() => {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* sans importance : l'état à l'écran fait foi */
    }
    setValue(initial);
    // `initial` vient d'une constante de module chez les appelants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, reset];
}

/** Vrai si au moins une saisie a été conservée. */
export function hasSavedWork(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Object.values(KEYS).some(
      (k) => window.localStorage.getItem(PREFIX + k) !== null,
    );
  } catch {
    return false;
  }
}

/**
 * Efface tout ce que la démonstration a conservé. Indispensable : sans porte
 * de sortie, un état devenu bancal se rechargerait indéfiniment.
 */
export function clearSavedWork(): void {
  try {
    for (const k of Object.values(KEYS)) window.localStorage.removeItem(PREFIX + k);
  } catch {
    /* rien à faire de plus */
  }
}
