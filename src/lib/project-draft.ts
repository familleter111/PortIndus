"use client";

import * as React from "react";

import { NEW_PROJECT } from "@/lib/data";

/**
 * Brouillon de la description projet.
 *
 * L'application n'a pas de serveur : « enregistrer » veut dire conserver la
 * saisie dans le navigateur, pour que l'étape 4 prévisualise bien ce que
 * l'utilisateur a écrit et non la proposition d'origine. `localStorage` et
 * non `sessionStorage` : le texte doit survivre à la fermeture de l'onglet,
 * comme le reste des saisies de la démonstration.
 */

export type AiIcon = "package" | "target" | "alert" | "calendar";

export interface AiSection {
  title: string;
  icon: AiIcon;
  lines: string[];
}

export interface AiDescription {
  basedOn: string[];
  summary: string;
  sections: AiSection[];
}

const KEY = "portindus.v1.projet.description";

/** La proposition telle que la génération l'a produite — référence immuable. */
export const GENERATED: AiDescription = NEW_PROJECT.aiDescription;

/** Copie profonde : les écrans éditent leur brouillon, jamais la constante. */
export function cloneDescription(d: AiDescription): AiDescription {
  return {
    basedOn: [...d.basedOn],
    summary: d.summary,
    sections: d.sections.map((s) => ({ ...s, lines: [...s.lines] })),
  };
}

/** Vrai si le brouillon s'écarte de la proposition générée. */
export function isEdited(d: AiDescription): boolean {
  if (d.summary !== GENERATED.summary) return true;
  if (d.sections.length !== GENERATED.sections.length) return true;
  return d.sections.some((s, i) => {
    const g = GENERATED.sections[i];
    return (
      s.title !== g.title ||
      s.icon !== g.icon ||
      s.lines.length !== g.lines.length ||
      s.lines.some((l, k) => l !== g.lines[k])
    );
  });
}

/**
 * Relit le brouillon. Tolérant : un contenu illisible ou d'une version
 * antérieure est ignoré au profit de la proposition générée, plutôt que de
 * faire planter l'écran.
 */
function read(): AiDescription | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as AiDescription).summary !== "string" ||
      !Array.isArray((parsed as AiDescription).sections)
    ) {
      return null;
    }
    return parsed as AiDescription;
  } catch {
    return null;
  }
}

/**
 * Brouillon partagé par les étapes du wizard. `sessionStorage` n'existe pas au
 * rendu serveur : on part de la proposition générée puis on relit après
 * montage, ce qui évite une divergence d'hydratation.
 */
export function useProjectDescription() {
  const [draft, setDraft] = React.useState<AiDescription>(GENERATED);

  React.useEffect(() => {
    const stored = read();
    if (stored) setDraft(stored);
  }, []);

  const save = React.useCallback((next: AiDescription) => {
    setDraft(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* navigation privée, quota : la saisie reste valable à l'écran */
    }
  }, []);

  /** Revient à la proposition générée et oublie le brouillon. */
  const reset = React.useCallback(() => {
    setDraft(GENERATED);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* sans importance : l'état à l'écran fait foi */
    }
  }, []);

  return { draft, save, reset, edited: isEdited(draft) };
}
