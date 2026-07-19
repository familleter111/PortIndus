"use client";

import * as React from "react";

import { FloatingMenu } from "@/components/planning/floating-menu";
import {
  DEP_TYPES,
  NON_WORKING,
  PLAN_WINDOW,
  STATUS_DATE,
  type DepType,
  type PlanRow,
} from "@/lib/data";

/** Row geometry — shared with the WBS table so both stay aligned. */
export const GANTT_ROW_H = 34;

/** Écart entre le bout d'une barre et son libellé, pour dégager les traits. */
const LABEL_GAP = 14;
/** Deux bandeaux : période au-dessus, graduations lisibles en dessous. */
export const GANTT_HEAD_H = 54;

const MS_DAY = 86_400_000;
const TOTAL_DAYS = PLAN_WINDOW.weeks * 7;

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTHS_SHORT = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

/* -------------------------------------------------------------------------- */
/*  Échelle de temps                                                           */
/* -------------------------------------------------------------------------- */

export type Scale = "day" | "week" | "month" | "quarter";

export const SCALES: { key: Scale; label: string }[] = [
  { key: "day", label: "Jour" },
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "quarter", label: "Trimestre" },
];

/** Largeur d'une journée selon l'échelle : c'est le seul paramètre du zoom. */
const DAY_W: Record<Scale, number> = {
  day: 22,
  week: 50 / 7,
  month: 74 / 30.44,
  quarter: 88 / 91.3,
};

function toTime(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).getTime();
}

function dayIndex(isoDate: string): number {
  return Math.round((toTime(isoDate) - toTime(PLAN_WINDOW.start)) / MS_DAY);
}

const clampDay = (i: number) => Math.min(TOTAL_DAYS, Math.max(0, i));

/** Durée en jours calendaires, bornes incluses. */
export function durationDays(start: string, end: string): number {
  return Math.max(1, dayIndex(end) - dayIndex(start) + 1);
}

/** Décale une date ISO d'un nombre de jours. */
export function shiftIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Début de la fenêtre : sert d'origine au calcul d'une date depuis un pixel. */
export const WINDOW_START = PLAN_WINDOW.start;

/** Actions déclenchables depuis le schéma lui-même. */
export type GanttRowAction =
  | "edit"
  | "duplicate"
  | "delete"
  | "toTask"
  | "toMilestone"
  | "toSummary"
  | "removeDep";

/** Extrémité d'une barre : c'est elle qui détermine le type de lien. */
type Anchor = "start" | "end";

/** Fin → Début, Début → Début, Fin → Fin, Début → Fin. */
function depTypeOf(from: Anchor, to: Anchor): DepType {
  if (from === "end" && to === "start") return "FS";
  if (from === "start" && to === "start") return "SS";
  if (from === "end" && to === "end") return "FF";
  return "SF";
}

interface LinkDraft {
  from: string;
  fromAnchor: Anchor;
  /** Origine du trait, en pixels dans le corps du Gantt. */
  x: number;
  y: number;
  cx: number;
  cy: number;
}

type DragMode = "move" | "start" | "end";

interface Drag {
  wbs: string;
  mode: DragMode;
  x0: number;
  s0: string;
  e0: string;
  delta: number;
}

/** Dates résultantes d'un glissement en cours. */
function dragDates(d: Drag): { s: string; e: string } {
  if (d.mode === "move") {
    return { s: shiftIso(d.s0, d.delta), e: shiftIso(d.e0, d.delta) };
  }
  if (d.mode === "start") {
    const s = shiftIso(d.s0, d.delta);
    return { s: dayIndex(s) > dayIndex(d.e0) ? d.e0 : s, e: d.e0 };
  }
  const e = shiftIso(d.e0, d.delta);
  return { s: d.s0, e: dayIndex(e) < dayIndex(d.s0) ? d.s0 : e };
}

/** "15/12/2026" → ISO : la date de statut pilote le trait « aujourd'hui ». */
export function statusIso(): string {
  const [d, m, y] = STATUS_DATE.split("/");
  return `${y}-${m}-${d}`;
}

/* -------------------------------------------------------------------------- */
/*  Calendrier de la fenêtre, calculé une fois                                 */
/* -------------------------------------------------------------------------- */

/** Initiales des jours, pour situer la semaine d'un coup d'œil. */
const DOW = ["D", "L", "M", "M", "J", "V", "S"];

interface Day {
  iso: string;
  num: number;
  dow: number;
  month: number;
  year: number;
  quarter: number;
  week: string;
  off: boolean;
}

const HOLIDAYS = new Set(NON_WORKING);

const DAYS: Day[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const d = new Date(toTime(PLAN_WINDOW.start) + i * MS_DAY);
  const dow = d.getUTCDay();
  // Numéro de semaine ISO 8601.
  const t = new Date(d);
  t.setUTCDate(t.getUTCDate() + 4 - (dow || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / MS_DAY + 1) / 7);
  const iso = d.toISOString().slice(0, 10);
  return {
    iso,
    num: d.getUTCDate(),
    dow,
    month: d.getUTCMonth(),
    year: d.getUTCFullYear(),
    quarter: Math.floor(d.getUTCMonth() / 3) + 1,
    week: `${t.getUTCFullYear()}-${week}`,
    off: dow === 0 || dow === 6 || HOLIDAYS.has(iso),
  };
});

interface Band {
  key: string;
  label: string;
  /** Seconde ligne de graduation : la date, ou l'initiale du jour. */
  sub?: string;
  days: number;
  off?: boolean;
}

function bands(
  keyOf: (d: Day) => string,
  labelOf: (d: Day) => string,
  subOf?: (d: Day) => string,
): Band[] {
  const out: Band[] = [];
  for (const d of DAYS) {
    const key = keyOf(d);
    const last = out[out.length - 1];
    if (last && last.key === key) last.days += 1;
    // Le libellé et la sous-ligne se prennent sur le premier jour de la plage.
    else out.push({ key, label: labelOf(d), sub: subOf?.(d), days: 1, off: d.off });
  }
  return out;
}

const dm = (d: Day) => `${String(d.num).padStart(2, "0")}/${String(d.month + 1).padStart(2, "0")}`;

const MONTH_BANDS = bands((d) => `${d.year}-${d.month}`, (d) => `${MONTHS[d.month]} ${d.year}`);
const MONTH_SHORT_BANDS = bands((d) => `${d.year}-${d.month}`, (d) => MONTHS_SHORT[d.month]);
const WEEK_BANDS = bands(
  (d) => d.week,
  (d) => `S ${d.week.split("-")[1].padStart(2, "0")}`,
  dm,
);
const YEAR_BANDS = bands((d) => String(d.year), (d) => String(d.year));
const QUARTER_BANDS = bands((d) => `${d.year}-T${d.quarter}`, (d) => `T${d.quarter} ${d.year}`);
const DAY_BANDS = bands((d) => d.iso, (d) => String(d.num), (d) => DOW[d.dow]);

/** Bandeau supérieur et graduations selon l'échelle choisie. */
function headerFor(scale: Scale): { top: Band[]; ticks: Band[] } {
  switch (scale) {
    case "day": return { top: MONTH_BANDS, ticks: DAY_BANDS };
    case "week": return { top: MONTH_BANDS, ticks: WEEK_BANDS };
    case "month": return { top: YEAR_BANDS, ticks: MONTH_SHORT_BANDS };
    case "quarter": return { top: YEAR_BANDS, ticks: QUARTER_BANDS };
  }
}

/* -------------------------------------------------------------------------- */
/*  Barres et liens                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Couleur d'une barre. Le statut compte autant que l'avancement : « En retard »
 * doit sortir en rouge, comme la pastille affichée dans les menus.
 */
function barTone(row: PlanRow) {
  if (row.status === "Terminé" || row.progress >= 100)
    return { track: "#D7F5E1", fill: "#2E7D32", edge: "#93D3A8", text: "#1B5E20" };
  if (row.critical || row.status === "En retard")
    return { track: "#FCE0DE", fill: "#D92D20", edge: "#F2A9A3", text: "#B42318" };
  if (row.status === "En cours" || row.progress > 0)
    return { track: "#FCE6C8", fill: "#E58A00", edge: "#EDBE7C", text: "#B45F09" };
  // Non démarrée : un gris franc plutôt que du blanc, sinon la barre disparaît.
  return { track: "#EDEFF3", fill: "#B7BEC9", edge: "#C7CDD6", text: "#667085" };
}

/** Abscisse par défaut du segment vertical du coude, avant décalage manuel. */
function baseMid(x1: number, x2: number, enterLeft: boolean): number {
  return enterLeft ? (x2 - x1 > 34 ? x2 - 18 : x1 + 14) : Math.max(x1, x2) + 18;
}

/** Emprise horizontale approximative d'un libellé, en pixels. */
interface LabelBox {
  from: number;
  to: number;
}

/**
 * Choisit l'abscisse du coude qui traverse le moins de libellés possible.
 * Sans ça, le trait vertical tombe régulièrement en plein milieu d'un texte.
 */
function pickMid(
  x1: number,
  x2: number,
  enterLeft: boolean,
  crossed: LabelBox[],
): number {
  const fallback = baseMid(x1, x2, enterLeft);
  if (!enterLeft || x2 - x1 < 40 || crossed.length === 0) return fallback;

  const candidates = [fallback];
  // On balaie l'espace entre les deux barres par pas régulier.
  for (let t = 0.15; t <= 0.85; t += 0.1) candidates.push(x1 + (x2 - x1) * t);

  let best = fallback;
  let bestScore = Infinity;
  for (const mid of candidates) {
    const hits = crossed.filter((b) => mid >= b.from - 3 && mid <= b.to + 3).length;
    // À nombre de collisions égal, on garde le tracé le plus proche du défaut.
    const score = hits * 1000 + Math.abs(mid - fallback);
    if (score < bestScore) {
      bestScore = score;
      best = mid;
    }
  }
  return best;
}

/** Coude à angles arrondis, dans le sens d'arrivée demandé. */
function elbow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  enterLeft: boolean,
  mid: number,
): string {
  const r = 5;
  const endX = enterLeft ? x2 - 8 : x2 + 8;
  if (Math.abs(y2 - y1) < 1) return `M ${x1} ${y1} H ${endX}`;

  const inDir = mid > x1 ? -r : r;   // approche du coude depuis x1
  const outDir = endX > mid ? r : -r; // sortie du coude vers endX
  const vDir = y2 > y1 ? r : -r;

  return [
    `M ${x1} ${y1}`,
    `H ${mid + inDir}`,
    `Q ${mid} ${y1} ${mid} ${y1 + vDir}`,
    `V ${y2 - vDir}`,
    `Q ${mid} ${y2} ${mid + outDir} ${y2}`,
    `H ${endX}`,
  ].join(" ");
}

/* -------------------------------------------------------------------------- */

export function GanttChart({
  rows,
  selectedWbs,
  onSelect,
  scale,
  zoom,
  showBaseline,
  criticalPath,
  onChangeDepType,
  onRemoveDep,
  onReschedule,
  onRowAction,
  onCreateAt,
  onLink,
  onRename,
  onMoveLink,
}: {
  rows: PlanRow[];
  selectedWbs: string | null;
  onSelect: (wbs: string) => void;
  scale: Scale;
  zoom: number;
  showBaseline: boolean;
  criticalPath: boolean;
  onChangeDepType: (wbs: string, type: DepType) => void;
  onRemoveDep: (wbs: string) => void;
  onReschedule: (wbs: string, fStart: string, fEnd: string) => void;
  onRowAction: (wbs: string, action: GanttRowAction) => void;
  onCreateAt: (iso: string) => void;
  onLink: (from: string, to: string, type: DepType) => void;
  onRename: (wbs: string, name: string) => void;
  onMoveLink: (wbs: string, offsetDays: number) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [menu, setMenu] = React.useState<{ wbs: string; type: DepType; x: number; y: number } | null>(null);
  const [barMenu, setBarMenu] = React.useState<{ wbs: string; x: number; y: number } | null>(null);
  const [drag, setDrag] = React.useState<Drag | null>(null);
  const [linking, setLinking] = React.useState<LinkDraft | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [linkDrag, setLinkDrag] = React.useState<{
    wbs: string;
    x0: number;
    y0: number;
    base: number;
    delta: number;
    /** Tant que le seuil n'est pas franchi, le geste reste un clic. */
    moved: boolean;
  } | null>(null);
  const [activeLink, setActiveLink] = React.useState<string | null>(null);
  const [hostW, setHostW] = React.useState(0);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  // On mesure la zone disponible : le Gantt s'étire pour la remplir, jamais moins.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHostW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dayW = Math.max(DAY_W[scale] * zoom, hostW > 0 ? hostW / TOTAL_DAYS : 0);
  const totalW = TOTAL_DAYS * dayW;
  const bodyH = rows.length * GANTT_ROW_H;
  const { top, ticks } = headerFor(scale);

  const px = (iso: string) => clampDay(dayIndex(iso)) * dayW;
  const pxEnd = (iso: string) => clampDay(dayIndex(iso) + 1) * dayW;
  const todayX = px(statusIso());

  // À l'ouverture — et à chaque changement d'échelle — on cadre sur la date de statut.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = Math.max(0, todayX - el.clientWidth / 3);
  }, [todayX, scale]);

  React.useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [menu]);

  // Glissement d'une barre : on suit la souris au jour près, on valide au relâché.
  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const delta = Math.round((e.clientX - drag.x0) / dayW);
      if (delta !== drag.delta) setDrag({ ...drag, delta });
    };
    const onUp = () => {
      if (drag.delta !== 0) {
        const { s, e } = dragDates(drag);
        onReschedule(drag.wbs, s, e);
      }
      setDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, dayW, onReschedule]);

  /**
   * Glissement du coude d'un lien. Le geste démarre sur n'importe quel point du
   * trait : sous 4 px de déplacement c'est un clic, au-delà c'est un glissement.
   */
  React.useEffect(() => {
    if (!linkDrag) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - linkDrag.x0;
      const moved =
        linkDrag.moved || Math.abs(delta) > 4 || Math.abs(e.clientY - linkDrag.y0) > 4;
      if (delta !== linkDrag.delta || moved !== linkDrag.moved) {
        setLinkDrag({ ...linkDrag, delta, moved });
      }
    };
    const onUp = (e: MouseEvent) => {
      if (linkDrag.moved) {
        onMoveLink(linkDrag.wbs, linkDrag.base + linkDrag.delta / dayW);
      } else {
        // Simple clic : on sélectionne le lien et on ouvre ses options.
        setActiveLink(linkDrag.wbs);
        const l = links.find((k) => k.key === linkDrag.wbs);
        if (l) setMenu({ wbs: l.key, type: l.type, x: e.clientX, y: e.clientY });
      }
      setLinkDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  });

  const startDrag = (e: React.MouseEvent, row: PlanRow, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag({ wbs: row.wbs, mode, x0: e.clientX, s0: row.fStart, e0: row.fEnd, delta: 0 });
  };

  /** Date sous le curseur, pour créer une tâche à l'endroit cliqué. */
  const dateAt = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return shiftIso(WINDOW_START, Math.max(0, Math.floor((e.clientX - rect.left) / dayW)));
  };

  /**
   * Un lien est refusé s'il boucle sur lui-même, vise une ligne de regroupement,
   * ou recrée un cycle en remontant la chaîne des dépendances existantes.
   */
  const canLink = React.useCallback(
    (from: string, to: string) => {
      if (from === to) return false;
      const target = rows.find((r) => r.wbs === to);
      if (!target || target.summary) return false;
      let cur = rows.find((r) => r.wbs === from);
      const seen = new Set<string>();
      while (cur?.dependsOn && !seen.has(cur.wbs)) {
        seen.add(cur.wbs);
        if (cur.dependsOn === to) return false;
        cur = rows.find((r) => r.wbs === cur!.dependsOn);
      }
      return true;
    },
    [rows],
  );

  // Tracé du lien en cours : on suit le curseur jusqu'au relâché.
  React.useEffect(() => {
    if (!linking) return;
    const onMove = (e: MouseEvent) => {
      const r = bodyRef.current?.getBoundingClientRect();
      if (!r) return;
      setLinking((l) => (l ? { ...l, cx: e.clientX - r.left, cy: e.clientY - r.top } : l));
    };
    const onUp = () => setLinking(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLinking(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [linking]);

  const startLink = (e: React.MouseEvent, row: PlanRow, anchor: Anchor, atX: number, rowY: number) => {
    e.preventDefault();
    e.stopPropagation();
    const y = rowY + GANTT_ROW_H / 2;
    setLinking({ from: row.wbs, fromAnchor: anchor, x: atX, y, cx: atX, cy: y });
  };

  /** Relâché sur une barre : la moitié survolée choisit l'extrémité visée. */
  const finishLink = (e: React.MouseEvent, row: PlanRow) => {
    if (!linking) return;
    e.stopPropagation();
    if (!canLink(linking.from, row.wbs)) {
      setLinking(null);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const toAnchor: Anchor = e.clientX < r.left + r.width / 2 ? "start" : "end";
    onLink(linking.from, row.wbs, depTypeOf(linking.fromAnchor, toAnchor));
    setLinking(null);
  };

  // Coordonnées viewport : le menu est rendu dans un portail, hors de la carte.
  const openBarMenu = (e: React.MouseEvent, wbs: string) => {
    onSelect(wbs);
    setBarMenu({ wbs, x: e.clientX, y: e.clientY });
  };

  /**
   * Géométrie des libellés, calculée avant les liens : le routage des coudes
   * s'en sert pour éviter de traverser un texte.
   */
  const labels = rows.map((row) => {
    const start = px(row.fStart);
    const end = pxEnd(row.fEnd);
    const text = row.milestone
      ? `${row.name} ${row.gate ?? ""}`
      : `${row.name} ${durationDays(row.fStart, row.fEnd)} j · ${row.progress} %`;
    // ≈ 5 px par caractère à 10 px de fonte, marges du fond comprises.
    const width = text.length * 5 + 14;
    // Le libellé bascule à gauche seulement s'il déborderait vraiment.
    const after = end + LABEL_GAP + width < totalW;
    const anchor = after
      ? (row.milestone ? start + 10 : end) + LABEL_GAP
      : start - LABEL_GAP;
    return {
      text,
      after,
      anchor,
      // L'écart au bord de barre fait partie de la zone à ne pas traverser.
      from: after ? anchor - LABEL_GAP : anchor - width,
      to: after ? anchor + width : anchor + LABEL_GAP,
    };
  });

  const links = rows.flatMap((row, i) => {
    if (!row.dependsOn) return [];
    const fromIndex = rows.findIndex((r) => r.wbs === row.dependsOn);
    if (fromIndex < 0) return [];
    const from = rows[fromIndex];
    const type = row.depType ?? "FS";
    const enterLeft = type === "FS" || type === "SS";
    const x1 = type === "SS" || type === "SF" ? px(from.fStart) : pxEnd(from.fEnd);
    const x2 = enterLeft ? px(row.fStart) : pxEnd(row.fEnd);
    // Décalage stocké en jours, plus l'éventuel glissement en cours.
    const offsetDays = row.depOffset ?? 0;
    const live = linkDrag?.wbs === row.wbs ? linkDrag.delta : 0;

    // Libellés que le segment vertical traverserait, bornes comprises.
    const lo = Math.min(fromIndex, i);
    const hi = Math.max(fromIndex, i);
    const crossed = labels.slice(lo, hi + 1);
    const auto = pickMid(x1, x2, enterLeft, crossed);

    return [
      {
        key: row.wbs,
        type,
        enterLeft,
        x1,
        y1: fromIndex * GANTT_ROW_H + GANTT_ROW_H / 2,
        x2,
        y2: i * GANTT_ROW_H + GANTT_ROW_H / 2,
        mid: auto + offsetDays * dayW + live,
        offsetDays,
        critical: from.critical && row.critical,
      },
    ];
  });

  return (
    <div className="relative flex h-full min-w-0 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto scrollbar-thin">
        <div className="flex min-h-full flex-col" style={{ width: totalW }}>
          {/* ------------------------------------------------------ En-tête */}
          <div
            className="sticky top-0 z-30 border-b border-border bg-card"
            style={{ height: GANTT_HEAD_H }}
          >
            <div className="flex" style={{ height: 22 }}>
              {top.map((b) => (
                <div
                  key={b.key}
                  className="flex items-center overflow-hidden whitespace-nowrap border-r border-border pl-1.5 text-[10px] font-semibold text-foreground last:border-r-0"
                  style={{ width: b.days * dayW }}
                >
                  {b.days * dayW > 34 ? b.label : ""}
                </div>
              ))}
            </div>
            <div className="flex border-t border-border" style={{ height: GANTT_HEAD_H - 22 }}>
              {ticks.map((b) => {
                const w = b.days * dayW;
                return (
                  <div
                    key={b.key}
                    className={`flex shrink-0 flex-col items-center justify-center overflow-hidden border-r border-border/50 leading-none tabular-nums last:border-r-0 ${
                      b.off ? "bg-[#F4F5F7] text-[#98A2B3]" : "text-[#475467]"
                    }`}
                    style={{ width: w }}
                  >
                    {w > 16 ? <span className="text-[10px] font-semibold">{b.label}</span> : null}
                    {b.sub && w > 24 ? (
                      <span className="mt-[3px] text-[9px] font-medium text-[#667085]">
                        {b.sub}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --------------------------------------------------------- Corps */}
          <div ref={bodyRef} className="relative flex-1" style={{ minHeight: bodyH, width: totalW }}>
            {/* Graduations */}
            <div className="absolute inset-0 flex">
              {ticks.map((b) => (
                <div
                  key={b.key}
                  className="shrink-0 border-r border-border/40"
                  style={{ width: b.days * dayW }}
                />
              ))}
            </div>

            {/* Séparation quotidienne : uniquement quand une journée est lisible */}
            {dayW >= 12
              ? DAYS.map((d, i) => (
                  <div
                    key={`g-${d.iso}`}
                    className="absolute inset-y-0 border-r border-border/25"
                    style={{ left: i * dayW, width: dayW }}
                  />
                ))
              : null}

            {/* Jours chômés — week-ends et fériés, seulement quand c'est lisible */}
            {dayW >= 5
              ? DAYS.map((d, i) =>
                  d.off ? (
                    <div
                      key={d.iso}
                      className={`absolute inset-y-0 ${
                        HOLIDAYS.has(d.iso) ? "bg-[#FDF2F2]" : "bg-[#FAFBFC]"
                      }`}
                      style={{ left: i * dayW, width: dayW }}
                    />
                  ) : null,
                )
              : null}

            {/* Lignes alternées */}
            <div className="absolute inset-0">
              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className={
                    selectedWbs === row.wbs
                      ? "bg-[#FEF6E7]"
                      : i % 2 === 1
                        ? "bg-[#FBFCFD]/70"
                        : ""
                  }
                  style={{ height: GANTT_ROW_H }}
                />
              ))}
            </div>

            {/* Dépendances — cliquables pour changer le type ou supprimer le lien */}
            <svg className="absolute inset-0" width={totalW} height={bodyH}>
              {links.map((l) => {
                const dim = criticalPath && !l.critical;
                const color = criticalPath && l.critical ? "#D92D20" : "#98A2B3";
                const arrow = l.enterLeft
                  ? `${l.x2 - 8},${l.y2 - 3.5} ${l.x2},${l.y2} ${l.x2 - 8},${l.y2 + 3.5}`
                  : `${l.x2 + 8},${l.y2 - 3.5} ${l.x2},${l.y2} ${l.x2 + 8},${l.y2 + 3.5}`;
                const d = elbow(l.x1, l.y1, l.x2, l.y2, l.enterLeft, l.mid);
                const vTop = Math.min(l.y1, l.y2);
                const vBottom = Math.max(l.y1, l.y2);
                const dragging = linkDrag?.wbs === l.key;
                const picked = activeLink === l.key || dragging;
                const stroke = picked ? "#3976D3" : color;

                const grab = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveLink(l.key);
                  setLinkDrag({
                    wbs: l.key,
                    x0: e.clientX,
                    y0: e.clientY,
                    base: l.offsetDays,
                    delta: 0,
                    moved: false,
                  });
                };

                return (
                  <g key={l.key} className="group/link" opacity={dim ? 0.15 : 1}>
                    <circle cx={l.x1} cy={l.y1} r={2.5} fill={stroke} pointerEvents="none" />
                    <path
                      d={d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={picked ? 1.9 : 1.25}
                      strokeLinejoin="round"
                      pointerEvents="none"
                    />
                    <polygon points={arrow} fill={stroke} pointerEvents="none" />

                    {/* Toute la longueur du trait est saisissable : un clic
                        ouvre les options, un glissement décale le coude. */}
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={12}
                      className="cursor-ew-resize"
                      pointerEvents="stroke"
                      onMouseDown={grab}
                    >
                      <title>
                        {`Lien ${l.type} — glisser pour déplacer, cliquer pour les options`}
                      </title>
                    </path>

                    {/* Poignée du coude, visible dès que le lien est sélectionné */}
                    {vBottom - vTop > 6 ? (
                      <line
                        x1={l.mid}
                        y1={vTop + 3}
                        x2={l.mid}
                        y2={vBottom - 3}
                        stroke="#3976D3"
                        strokeWidth={3}
                        strokeLinecap="round"
                        pointerEvents="none"
                        className={
                          picked ? "opacity-100" : "opacity-0 group-hover/link:opacity-50"
                        }
                      />
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {/* Lien en cours de tracé */}
            {linking ? (
              <svg
                className="pointer-events-none absolute inset-0 z-30"
                width={totalW}
                height={Math.max(bodyH, linking.cy + 20)}
              >
                <line
                  x1={linking.x}
                  y1={linking.y}
                  x2={linking.cx}
                  y2={linking.cy}
                  stroke="#3976D3"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <circle cx={linking.x} cy={linking.y} r={3.5} fill="#3976D3" />
                <circle
                  cx={linking.cx}
                  cy={linking.cy}
                  r={4}
                  fill="none"
                  stroke="#3976D3"
                  strokeWidth={1.5}
                />
              </svg>
            ) : null}

            {/* Trait « aujourd'hui », pastille en tête */}
            <div className="pointer-events-none absolute inset-y-0 z-20" style={{ left: todayX }}>
              <span className="absolute -left-[3px] -top-[3px] block h-1.5 w-1.5 rounded-full bg-[#3976D3]" />
              <span className="block h-full border-l border-[#3976D3]" />
            </div>

            {/* Barres */}
            {rows.map((row, rowIndex) => {
              // Pendant un glissement, la barre suit la souris avant validation.
              const live = drag?.wbs === row.wbs ? dragDates(drag) : null;
              const fStart = live?.s ?? row.fStart;
              const fEnd = live?.e ?? row.fEnd;

              const start = px(fStart);
              const end = pxEnd(fEnd);
              const w = Math.max(6, end - start);
              const active = selectedWbs === row.wbs;
              const dim = criticalPath && !row.critical && !row.summary;
              const tone = barTone(row);
              const days = durationDays(fStart, fEnd);
              // Même décision que dans `labels`, pour que routage et rendu s'accordent.
              const labelRight = labels[rowIndex]?.after ?? true;

              return (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => {
                    setActiveLink(null);
                    onSelect(row.wbs);
                  }}
                  onDoubleClick={(e) => onCreateAt(dateAt(e))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(row.wbs);
                    }
                  }}
                  className="group relative cursor-pointer"
                  style={{ height: GANTT_ROW_H, opacity: dim ? 0.25 : 1 }}
                >
                  {row.summary ? (
                    <SummaryBar left={start} width={w} active={active} />
                  ) : row.milestone ? (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                      style={{ left: start }}
                      onMouseDown={(e) => startDrag(e, row, "move")}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openBarMenu(e, row.wbs);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditing(row.wbs);
                      }}
                    >
                      <span
                        onMouseUp={(e) => finishLink(e, row)}
                        className={`block h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] ring-2 ring-white ${
                          active ? "outline outline-2 outline-offset-1 outline-[#B45F09]" : ""
                        }`}
                        style={{ backgroundColor: row.gateTone === "blue" ? "#2563EB" : "#E58A00" }}
                      />
                    </span>
                  ) : (
                    <>
                      {showBaseline ? (
                        <span
                          className="pointer-events-none absolute bottom-[4px] block h-[3px] rounded-full bg-[#C3C9D4]"
                          style={{
                            left: px(row.bStart),
                            width: Math.max(4, pxEnd(row.bEnd) - px(row.bStart)),
                          }}
                        />
                      ) : null}
                      <span
                        className={`absolute top-[6px] block rounded-[5px] border transition-shadow ${
                          drag?.wbs === row.wbs ? "cursor-grabbing shadow-modal" : "cursor-grab"
                        } ${
                          active
                            ? "shadow-[0_0_0_2px_rgba(180,95,9,0.3)]"
                            : "group-hover:shadow-card"
                        }`}
                        style={{
                          left: start,
                          width: w,
                          height: 16,
                          backgroundColor: tone.track,
                          borderColor: active ? "#B45F09" : tone.edge,
                        }}
                        onMouseDown={(e) => startDrag(e, row, "move")}
                        onMouseUp={(e) => finishLink(e, row)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openBarMenu(e, row.wbs);
                        }}
                        // Double-clic sur la barre : on écrit directement le libellé.
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditing(row.wbs);
                        }}
                      >
                        <span
                          className="block h-full overflow-hidden rounded-[4px]"
                          style={{
                            width: `${Math.min(100, Math.max(0, row.progress))}%`,
                            backgroundColor: tone.fill,
                          }}
                        />

                        {/* Points de connexion : glisser de l'un à l'autre crée le lien */}
                        <Connector
                          side="left"
                          onMouseDown={(e) =>
                            startLink(e, row, "start", start, rowIndex * GANTT_ROW_H)
                          }
                        />
                        <Connector
                          side="right"
                          onMouseDown={(e) =>
                            startLink(e, row, "end", start + w, rowIndex * GANTT_ROW_H)
                          }
                        />

                        {/* Poignées de redimensionnement */}
                        <span
                          onMouseDown={(e) => startDrag(e, row, "start")}
                          className="absolute -left-0.5 top-0 h-full w-2 cursor-ew-resize rounded-l opacity-0 transition-opacity group-hover:opacity-100"
                          title="Décaler le début"
                        >
                          <span className="absolute left-1 top-1/2 h-2 w-[2px] -translate-y-1/2 rounded-full bg-black/25" />
                        </span>
                        <span
                          onMouseDown={(e) => startDrag(e, row, "end")}
                          className="absolute -right-0.5 top-0 h-full w-2 cursor-ew-resize rounded-r opacity-0 transition-opacity group-hover:opacity-100"
                          title="Décaler la fin"
                        >
                          <span className="absolute right-1 top-1/2 h-2 w-[2px] -translate-y-1/2 rounded-full bg-black/25" />
                        </span>
                      </span>
                    </>
                  )}

                  {editing === row.wbs ? (
                    <span
                      className={`absolute top-1/2 z-40 -translate-y-1/2 ${
                        labelRight ? "pl-2" : "-translate-x-full pr-2"
                      }`}
                      style={{ left: labelRight ? start + w : start }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        defaultValue={row.name}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={(e) => {
                          const v = e.currentTarget.value.trim();
                          if (v) onRename(row.wbs, v);
                          setEditing(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                          if (e.key === "Escape") {
                            e.currentTarget.value = row.name;
                            e.currentTarget.blur();
                          }
                        }}
                        className="h-6 w-48 rounded-md border border-[#E5A11B] bg-white px-1.5 text-[10px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E5A11B]/40"
                      />
                    </span>
                  ) : (
                    <span
                      title="Double-cliquer pour renommer"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditing(row.wbs);
                      }}
                      className={`gantt-label absolute top-1/2 z-20 -translate-y-1/2 cursor-text whitespace-nowrap rounded-[4px] px-1.5 py-[3px] text-[10px] leading-none ${
                        labelRight ? "" : "-translate-x-full"
                      }`}
                      style={{
                        left: labelRight
                          ? (row.milestone ? start + 10 : start + w) + LABEL_GAP
                          : start - LABEL_GAP,
                        // Fond opaque assorti à la ligne : c'est lui qui garantit
                        // qu'aucun trait de dépendance ne coupe le texte.
                        backgroundColor: active ? "#FEF6E7" : "#FFFFFF",
                      }}
                    >
                      {/* Le nom d'abord et en foncé : c'est ce qu'on cherche à lire. */}
                      <span className="font-semibold text-foreground">{row.name}</span>
                      {row.milestone ? (
                        <span className="ml-1 font-semibold" style={{ color: tone.text }}>
                          {row.gate}
                        </span>
                      ) : (
                        <span className="ml-1 text-muted-foreground">
                          {days} j · {row.progress} %
                        </span>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------ Menu contextuel d'une barre */}
      {barMenu ? (
        (() => {
          const row = rows.find((r) => r.wbs === barMenu.wbs);
          if (!row) return null;
          const shape = row.milestone ? "toMilestone" : row.summary ? "toSummary" : "toTask";

          const run = (a: GanttRowAction) => {
            onRowAction(barMenu.wbs, a);
            setBarMenu(null);
          };

          return (
            <FloatingMenu
              x={barMenu.x}
              y={barMenu.y}
              onClose={() => setBarMenu(null)}
              className="w-60 py-1"
            >
              <div>
                <p className="truncate px-3 pb-1 pt-0.5 text-[11px] font-semibold text-foreground">
                  {row.id} — {row.name}
                </p>

                <MenuItem label="Informations sur l'élément" onClick={() => run("edit")} />

                <MenuLabel>Forme</MenuLabel>
                <div className="grid grid-cols-3 gap-0.5 px-2 pb-1">
                  {([
                    { a: "toTask", label: "Tâche" },
                    { a: "toMilestone", label: "Jalon" },
                    { a: "toSummary", label: "Récap." },
                  ] as const).map((s) => (
                    <button
                      key={s.a}
                      type="button"
                      onClick={() => run(s.a)}
                      className={`rounded-md py-1 text-[10px] font-semibold transition-colors ${
                        shape === s.a
                          ? "bg-[#B45F09] text-white"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <MenuLabel>Liaison</MenuLabel>
                <MenuItem
                  label="Lier vers une autre tâche…"
                  hint="puis cliquer la cible"
                  onClick={() => {
                    setBarMenu(null);
                    setLinking({
                      from: row.wbs,
                      fromAnchor: "end",
                      x: pxEnd(row.fEnd),
                      y: rows.findIndex((r) => r.wbs === row.wbs) * GANTT_ROW_H + GANTT_ROW_H / 2,
                      cx: pxEnd(row.fEnd),
                      cy: rows.findIndex((r) => r.wbs === row.wbs) * GANTT_ROW_H + GANTT_ROW_H / 2,
                    });
                  }}
                />
                {row.dependsOn ? (
                  <MenuItem label="Supprimer la dépendance" danger onClick={() => run("removeDep")} />
                ) : null}

                <div className="my-1 border-t border-border" />
                <MenuItem label="Dupliquer" onClick={() => run("duplicate")} />
                <MenuItem label="Supprimer" danger onClick={() => run("delete")} />

                <p className="border-t border-border px-3 pb-0.5 pt-1.5 text-[10px] leading-snug text-muted-foreground">
                  Glisser un point de connexion d&apos;une barre à l&apos;autre crée le lien.
                  L&apos;extrémité choisie détermine le type : Fin→Début, Début→Début…
                </p>
              </div>
            </FloatingMenu>
          );
        })()
      ) : null}

      {/* Bandeau d'aide pendant un tracé de liaison */}
      {linking ? (
        <div className="pointer-events-none absolute left-1/2 top-2 z-50 -translate-x-1/2 rounded-full border border-[#C7DBF8] bg-[#EFF6FF] px-3 py-1 text-[11px] font-medium text-[#3976D3] shadow-sm">
          Relâcher sur la tâche cible pour créer le lien · Échap pour annuler
        </div>
      ) : null}

      {/* -------------------------------------------- Menu d'une dépendance */}
      {menu ? (
        <FloatingMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} className="w-56 py-1.5">
          <div>
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Type de dépendance
            </p>
            {DEP_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  onChangeDepType(menu.wbs, t.key);
                  setMenu(null);
                }}
                title={t.hint}
                className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[11px] transition-colors hover:bg-muted ${
                  menu.type === t.key ? "text-[#B45F09]" : "text-foreground"
                }`}
              >
                <span className="w-6 shrink-0 font-bold tabular-nums">{t.key}</span>
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                {menu.type === t.key ? <span className="shrink-0">✓</span> : null}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onRemoveDep(menu.wbs);
                setMenu(null);
              }}
              className="mt-1 w-full border-t border-border px-3 pb-0.5 pt-1.5 text-left text-[11px] text-[#D92D20] transition-colors hover:bg-[#FEF3F2]"
            >
              Supprimer la dépendance
            </button>
          </div>
        </FloatingMenu>
      ) : null}

      {/* ------------------------------------------------------------ Légende */}
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-border py-1.5 text-[10px] text-muted-foreground">
        <Item swatch={<Swatch track="#FDECD6" fill="#E58A00" />} label="En cours" />
        <Item swatch={<Swatch track="#FEE4E2" fill="#D92D20" />} label="Critique / en retard" />
        <Item swatch={<Swatch track="#D1FADF" fill="#2E7D32" />} label="Terminé" />
        <Item swatch={<Swatch track="#FFFFFF" fill="#D0D5DD" />} label="Non démarré" />
        <Item swatch={<span className="h-[3px] w-5 rounded-full bg-[#C3C9D4]" />} label="Baseline" />
        <Item swatch={<span className="h-2.5 w-2.5 rotate-45 rounded-[1px] bg-[#E58A00]" />} label="Jalon" />
        <Item swatch={<span className="h-3 w-3 rounded-[2px] bg-[#F7F8FA] ring-1 ring-inset ring-border" />} label="Chômé" />
        <Item swatch={<span className="h-3 w-px bg-[#3976D3]" />} label="Aujourd'hui" />
      </div>
    </div>
  );
}

/** Point de connexion d'une barre : origine d'un lien de dépendance. */
function Connector({
  side,
  onMouseDown,
}: {
  side: "left" | "right";
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <span
      onMouseDown={onMouseDown}
      title="Glisser vers une autre tâche pour créer un lien"
      className={`absolute top-1/2 z-20 block h-2.5 w-2.5 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-[#3976D3] bg-white opacity-0 transition-opacity group-hover:opacity-100 ${
        side === "left" ? "-left-3.5" : "-right-3.5"
      }`}
    />
  );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function MenuItem({
  label,
  hint,
  danger,
  onClick,
}: {
  label: string;
  hint?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-baseline gap-1.5 px-3 py-1.5 text-left text-[11px] transition-colors ${
        danger ? "text-[#D92D20] hover:bg-[#FEF3F2]" : "text-foreground hover:bg-muted"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {hint ? <span className="shrink-0 text-[9px] text-muted-foreground">{hint}</span> : null}
    </button>
  );
}

/** Barre récapitulative de phase : trait épais et embouts en pointe. */
function SummaryBar({ left, width, active }: { left: number; width: number; active: boolean }) {
  return (
    <span
      className={`absolute top-[9px] block ${
        active ? "outline outline-2 outline-offset-2 outline-[#B45F09]" : ""
      }`}
      style={{ left, width }}
    >
      <span className="block h-[6px] rounded-[2px] bg-[#344054]" />
      <span className="absolute left-0 top-[6px] block h-0 w-0 border-l-[5px] border-t-[5px] border-l-transparent border-t-[#344054]" />
      <span className="absolute right-0 top-[6px] block h-0 w-0 border-r-[5px] border-t-[5px] border-r-transparent border-t-[#344054]" />
    </span>
  );
}

function Swatch({ track, fill }: { track: string; fill: string }) {
  return (
    <span
      className="block h-2.5 w-6 overflow-hidden rounded-[3px] border border-black/10"
      style={{ backgroundColor: track }}
    >
      <span className="block h-full w-3/5 rounded-[2px]" style={{ backgroundColor: fill }} />
    </span>
  );
}

function Item({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  );
}
