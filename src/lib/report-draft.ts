"use client";

import * as React from "react";

import {
  CURRENT_USER,
  PROJECTS,
  REPORT_LIBRARY,
  STATUS_DATE,
  reportTemplate,
  type ReportDoc,
  type ReportStatus,
  type ReportVersion,
} from "@/lib/data";
import { KEYS, usePersistentState } from "@/lib/persist";
import { defaultParams, type ReportParams } from "@/lib/report-content";

/**
 * Le rapport en cours de fabrication.
 *
 * Il traverse quatre écrans — modèle, paramètres, génération, édition — et
 * l'utilisateur peut recharger la page entre deux. Sans état partagé et
 * conservé, l'écran d'aperçu ne saurait pas quel rapport il prévisualise.
 */
export interface ReportDraft {
  params: ReportParams;
  /** Sections retouchées à la main. La saisie l'emporte sur la génération. */
  overrides: Record<string, string>;
  /** Passe à `true` une fois la génération jouée. */
  generated: boolean;
  id: string;
  version: string;
  generatedAt: string;
  editedAt: string;
  genSeconds: number;
  status: ReportStatus;
  /** Chaque enregistrement et chaque export laisse une trace ici. */
  history: ReportVersion[];
}

export function newDraft(): ReportDraft {
  return {
    params: defaultParams("direction"),
    overrides: {},
    generated: false,
    id: nextReportId(REPORT_LIBRARY),
    version: "V1.0",
    generatedAt: "",
    editedAt: "",
    genSeconds: 0,
    status: "Brouillon",
    history: [],
  };
}

/** Horodatage à la date de statut de la démonstration. */
export function stamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${STATUS_DATE} ${hh}:${mm}`;
}

/** Le brouillon, tel qu'il s'inscrit dans la bibliothèque. */
export function docFromDraft(draft: ReportDraft): ReportDoc {
  const spec = reportTemplate(draft.params.template);
  const project =
    draft.params.scopeId === "PORTFOLIO"
      ? undefined
      : PROJECTS.find((p) => p.id === draft.params.scopeId);
  return {
    id: draft.id,
    name: draft.params.name,
    template: spec.id,
    scopeId: draft.params.scopeId,
    client: project?.client ?? "Tous clients",
    gate: draft.params.gate,
    version: draft.version,
    status: draft.status,
    generatedAt: draft.generatedAt || stamp(),
    editedAt: draft.editedAt || stamp(),
    author: CURRENT_USER.name,
    genSeconds: draft.genSeconds,
    history: draft.history,
  };
}

/** Insère ou remplace un rapport dans la bibliothèque, le plus récent en tête. */
export function upsertReport(all: ReportDoc[], doc: ReportDoc): ReportDoc[] {
  const rest = all.filter((r) => r.id !== doc.id);
  return [doc, ...rest];
}

/** « R-2026-014 » → « R-2026-015 ». Le numéro suit la bibliothèque réelle. */
export function nextReportId(all: ReportDoc[]): string {
  const nums = all
    .map((r) => Number(r.id.split("-")[2]))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `R-${STATUS_DATE.slice(6)}-${String(next).padStart(3, "0")}`;
}

/** « V1.0 » → « V1.1 », « V1.9 » → « V2.0 ». */
export function bumpVersion(version: string, major = false): string {
  const m = /^V(\d+)\.(\d+)$/.exec(version);
  if (!m) return "V1.1";
  const [maj, min] = [Number(m[1]), Number(m[2])];
  if (major || min >= 9) return `V${maj + 1}.0`;
  return `V${maj}.${min + 1}`;
}

/**
 * Reprend un rapport de la bibliothèque dans le parcours d'édition. Les
 * paramètres sont reconstitués depuis le document : sans cela, ouvrir un
 * rapport existant afficherait le brouillon en cours à sa place.
 */
export function draftFromDoc(doc: ReportDoc): ReportDraft {
  const base = defaultParams(doc.template);
  return {
    params: {
      ...base,
      name: doc.name,
      scopeId: doc.scopeId,
      gate: doc.gate,
      confidentiality: doc.scopeId === "PORTFOLIO" ? "Interne" : "Client",
    },
    overrides: {},
    generated: true,
    id: doc.id,
    version: doc.version,
    generatedAt: doc.generatedAt,
    editedAt: doc.editedAt,
    genSeconds: doc.genSeconds,
    status: doc.status,
    history: doc.history,
  };
}

function isDraft(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ReportDraft).params === "object" &&
    typeof (value as ReportDraft).params?.template === "string"
  );
}

/** Le brouillon partagé par les quatre écrans du parcours. */
export function useReportDraft() {
  const [draft, setDraft] = usePersistentState<ReportDraft>(
    KEYS.reportDraft,
    newDraft(),
    isDraft,
  );

  const patchParams = React.useCallback(
    (patch: Partial<ReportParams>) =>
      setDraft((d) => ({ ...d, params: { ...d.params, ...patch } })),
    [setDraft],
  );

  const setOverride = React.useCallback(
    (sectionId: string, text: string) =>
      setDraft((d) => ({ ...d, overrides: { ...d.overrides, [sectionId]: text } })),
    [setDraft],
  );

  /** Revient au texte généré pour une section. */
  const clearOverride = React.useCallback(
    (sectionId: string) =>
      setDraft((d) => {
        const next = { ...d.overrides };
        delete next[sectionId];
        return { ...d, overrides: next };
      }),
    [setDraft],
  );

  return { draft, setDraft, patchParams, setOverride, clearOverride };
}

/** La bibliothèque : les rapports d'origine, plus ceux créés en démonstration. */
export function useReportLibrary() {
  return usePersistentState<ReportDoc[]>(KEYS.reportLibrary, REPORT_LIBRARY, (v) =>
    Array.isArray(v),
  );
}
