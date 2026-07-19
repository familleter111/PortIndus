"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpToLine,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  CornerDownRight,
  Diamond,
  MoreHorizontal,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";

import { Bar as ProgressBar, Card, Chip, Dot } from "@/components/ui/primitives";
import { GANTT_HEAD_H, GANTT_ROW_H, durationDays } from "@/components/planning/gantt";
import type { PlanRow } from "@/lib/data";
import { getInitials } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Arborescence WBS                                                           */
/* -------------------------------------------------------------------------- */

/** "3.4.1" → 2. La profondeur se lit dans la numérotation, rien à stocker. */
export function depthOf(wbs: string): number {
  return wbs.split(".").length - 1;
}

export function hasChildren(all: PlanRow[], wbs: string): boolean {
  return all.some((r) => r.wbs.startsWith(`${wbs}.`));
}

/** Lignes réellement affichées : on masque la descendance des nœuds repliés. */
export function visibleRows(all: PlanRow[], collapsed: string[]): PlanRow[] {
  return all.filter((r) => !collapsed.some((c) => r.wbs.startsWith(`${c}.`)));
}

/* -------------------------------------------------------------------------- */

const STATUS_TONE: Record<string, "red" | "blue" | "slate" | "green"> = {
  "En retard": "red",
  "En cours": "blue",
  "Non démarré": "slate",
  "Terminé": "green",
};

const OWNER_COLOR: Record<string, string> = {
  "Youssef Jaziri": "#3976D3",
  "Noura Trabelsi": "#B45F09",
  "Karim Belhadj": "#2E7D32",
};

/** Pastille de statut en tête de ligne, comme dans un planificateur. */
function accentColor(r: PlanRow): string {
  if (r.summary) return "#344054";
  if (r.progress >= 100) return "#2E7D32";
  if (r.critical) return "#D92D20";
  if (r.progress > 0) return "#E58A00";
  return "#D0D5DD";
}

/** "2026-12-02" → "02/12/26" */
const fr = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

interface Column {
  key: string;
  label: string;
  /** Largeur fixe : c'est elle qui rend la place au Gantt quand on masque la colonne. */
  width: number;
  align?: "left" | "center";
  locked?: boolean;
  render: (r: PlanRow) => React.ReactNode;
}

/** Colonne d'accent + repli, toujours présente. */
export const GRIP_W = 22;

const NAME_COLUMN: Column = {
  key: "name", label: "Tâche / jalon", width: 196, locked: true,
  render: () => null, // rendu à part : il porte l'indentation et le chevron
};

export const COLUMNS: Column[] = [
  NAME_COLUMN,
  { key: "wbs", label: "WBS", width: 52, render: (r) => <span className="tabular-nums text-muted-foreground">{r.wbs}</span> },
  { key: "id", label: "ID", width: 46, render: (r) => <span className="font-semibold text-foreground">{r.id}</span> },
  {
    key: "owner", label: "Responsable", width: 114,
    render: (r) =>
      r.owner === "—" ? (
        <span className="text-border">—</span>
      ) : (
        <span className="flex items-center gap-1.5">
          <span
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: OWNER_COLOR[r.owner] ?? "#667085" }}
          >
            {getInitials(r.owner)}
          </span>
          <span className="truncate text-muted-foreground">{r.owner}</span>
        </span>
      ),
  },
  {
    key: "schedule", label: "Échéancier", width: 128, align: "center",
    render: (r) => (
      <span className="whitespace-nowrap tabular-nums text-muted-foreground">
        {fr(r.fStart)} <span className="text-border">→</span> {fr(r.fEnd)}
      </span>
    ),
  },
  {
    key: "duration", label: "Durée", width: 64, align: "center",
    render: (r) => (
      <span className="tabular-nums font-medium text-foreground">
        {durationDays(r.fStart, r.fEnd)} j
      </span>
    ),
  },
  {
    key: "progress", label: "Avancement", width: 104,
    render: (r) => (
      <span className="flex items-center gap-1.5">
        <ProgressBar
          value={r.progress}
          color={r.progress >= 70 ? "#2E7D32" : r.progress > 0 ? "#E58A00" : "#EAECF0"}
          className="flex-1"
        />
        <span className="w-7 shrink-0 text-right tabular-nums text-foreground">{r.progress}%</span>
      </span>
    ),
  },
  { key: "status", label: "Statut", width: 96, align: "center", render: (r) => <Chip tone={STATUS_TONE[r.status]}>{r.status}</Chip> },
  { key: "delay", label: "Dérive", width: 52, align: "center", render: (r) => <span className="font-medium tabular-nums text-[#D92D20]">{r.delay} j</span> },
  { key: "load", label: "Charge", width: 56, align: "center", render: (r) => <span className="tabular-nums text-foreground">{r.load} h</span> },
  {
    key: "gate", label: "Gate", width: 46, align: "center",
    render: (r) =>
      r.gate ? (
        <span
          className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[9px] font-bold ${
            r.gateTone === "amber"
              ? "border-[#E58A00] bg-[#FEF6E7] text-[#B45F09]"
              : "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
          }`}
        >
          {r.gate}
        </span>
      ) : (
        <span className="text-border">—</span>
      ),
  },
  { key: "bStart", label: "Baseline début", width: 74, align: "center", render: (r) => <span className="tabular-nums text-muted-foreground">{fr(r.bStart)}</span> },
  { key: "bEnd", label: "Baseline fin", width: 74, align: "center", render: (r) => <span className="tabular-nums text-muted-foreground">{fr(r.bEnd)}</span> },
  { key: "predecessors", label: "Précurseurs", width: 68, align: "center", render: (r) => <span className="whitespace-nowrap text-muted-foreground">{r.predecessors}</span> },
  { key: "critical", label: "Critique", width: 52, align: "center", render: (r) => (r.critical ? <Dot color="#D92D20" /> : <span className="text-border">—</span>) },
];

export const DEFAULT_VISIBLE = ["name", "owner", "schedule", "duration", "progress", "status"];

/** Largeur exacte du tableau : le Gantt récupère tout le reste. */
export function tableWidth(visible: string[]): number {
  return COLUMNS.reduce((w, c) => (visible.includes(c.key) ? w + c.width : w), GRIP_W);
}

/* -------------------------------------------------------------------------- */

export function WbsTable({
  all,
  rows,
  selectedWbs,
  onSelect,
  visible,
  onVisibleChange,
  collapsed,
  onToggleCollapse,
  onAddRow,
  onRowAction,
}: {
  all: PlanRow[];
  rows: PlanRow[];
  selectedWbs: string | null;
  onSelect: (wbs: string) => void;
  visible: string[];
  onVisibleChange: (next: string[]) => void;
  collapsed: string[];
  onToggleCollapse: (wbs: string) => void;
  onAddRow: () => void;
  onRowAction: (wbs: string, action: RowAction) => void;
}) {
  const [configOpen, setConfigOpen] = React.useState(false);
  const [rowMenu, setRowMenu] = React.useState<string | null>(null);
  const configRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!configOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!configRef.current?.contains(e.target as Node)) setConfigOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [configOpen]);

  const toggle = (key: string) =>
    onVisibleChange(
      visible.includes(key) ? visible.filter((k) => k !== key) : [...visible, key],
    );

  // L'ordre d'affichage suit COLUMNS, jamais l'ordre des clics dans le sélecteur.
  const shown = COLUMNS.filter((c) => visible.includes(c.key));
  const totalDays = rows.reduce((s, r) => (r.summary ? s : s + durationDays(r.fStart, r.fEnd)), 0);
  const totalLoad = rows.reduce((s, r) => (r.summary ? s : s + r.load), 0);

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-auto scrollbar-thin">
        <table className="w-full table-fixed border-collapse text-[11px]">
          <colgroup>
            <col style={{ width: GRIP_W }} />
            {shown.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>

          <thead className="sticky top-0 z-20 bg-card">
            <tr className="text-muted-foreground">
              <th
                className="border-b border-border bg-card px-0 align-middle"
                style={{ height: GANTT_HEAD_H }}
              >
                <div ref={configRef} className="relative flex justify-center">
                  <button
                    type="button"
                    onClick={() => setConfigOpen((o) => !o)}
                    aria-expanded={configOpen}
                    aria-label="Configurer les colonnes affichées"
                    title="Configurer les colonnes affichées"
                    className={`rounded p-1 transition-colors hover:bg-muted hover:text-[#B45F09] ${
                      configOpen ? "bg-muted text-[#B45F09]" : "text-muted-foreground"
                    }`}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>

                  {configOpen ? (
                    <div className="absolute left-0 top-full z-40 mt-1 w-52 rounded-lg border border-border bg-white py-1.5 text-left shadow-modal">
                      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Configurer les colonnes
                      </p>
                      <ul className="max-h-72 overflow-y-auto scrollbar-thin">
                        {COLUMNS.map((c) => {
                          const on = visible.includes(c.key);
                          return (
                            <li key={c.key}>
                              <label
                                className={`flex items-center gap-2 px-3 py-[5px] text-[11px] transition-colors hover:bg-muted ${
                                  c.locked ? "cursor-not-allowed opacity-45" : "cursor-pointer"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={on}
                                  disabled={c.locked}
                                  onChange={() => toggle(c.key)}
                                  className="h-3.5 w-3.5 shrink-0 rounded border-input accent-[#B45F09]"
                                />
                                <span className={on ? "text-foreground" : "text-muted-foreground"}>
                                  {c.label}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                      <button
                        type="button"
                        onClick={() => onVisibleChange(DEFAULT_VISIBLE)}
                        className="mt-1 w-full border-t border-border px-3 pb-0.5 pt-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:text-[#B45F09]"
                      >
                        Réinitialiser l&apos;affichage
                      </button>
                    </div>
                  ) : null}
                </div>
              </th>

              {shown.map((c) => (
                <th
                  key={c.key}
                  className="group border-b border-border bg-card px-2 align-middle font-medium"
                  style={{ height: GANTT_HEAD_H }}
                >
                  <span
                    className={`relative flex items-center ${
                      c.align === "center" ? "justify-center" : ""
                    }`}
                  >
                    <span className="min-w-0 truncate pr-3" title={c.label}>
                      {c.label}
                    </span>
                    {c.locked ? null : (
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        aria-label={`Masquer la colonne ${c.label}`}
                        title={`Masquer la colonne ${c.label}`}
                        className="absolute -right-1 top-1/2 -translate-y-1/2 text-[#D0D5DD] transition-colors hover:text-[#B45F09]"
                      >
                        <EyeGlyph />
                      </button>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => {
              const active = selectedWbs === r.wbs;
              const depth = depthOf(r.wbs);
              const expandable = hasChildren(all, r.wbs);
              const isCollapsed = collapsed.includes(r.wbs);

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.wbs)}
                  className={`group/row cursor-pointer border-b border-border transition-colors ${
                    active
                      ? "bg-[#FEF6E7]"
                      : i % 2 === 1
                        ? "bg-[#FBFCFD] hover:bg-muted/60"
                        : "hover:bg-muted/60"
                  }`}
                  style={{ height: GANTT_ROW_H }}
                >
                  <td className="px-0">
                    <span
                      className="mx-auto block h-[16px] w-[3px] rounded-full"
                      style={{ backgroundColor: accentColor(r) }}
                    />
                  </td>

                  {shown.map((c) =>
                    c.key === "name" ? (
                      <td key={c.key} className="relative px-1">
                        <span
                          className="flex items-center gap-1"
                          style={{ paddingLeft: depth * 12 }}
                        >
                          {expandable ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCollapse(r.wbs);
                              }}
                              aria-label={isCollapsed ? "Déplier" : "Replier"}
                              className="shrink-0 rounded text-muted-foreground transition-colors hover:text-[#B45F09]"
                            >
                              {isCollapsed ? (
                                <ChevronRight className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="w-3.5 shrink-0" />
                          )}
                          {r.milestone ? (
                            <span
                              className="h-2 w-2 shrink-0 rotate-45 rounded-[1px]"
                              style={{
                                backgroundColor: r.gateTone === "blue" ? "#2563EB" : "#E58A00",
                              }}
                            />
                          ) : null}
                          <span
                            className={`truncate ${
                              r.summary ? "font-semibold text-foreground" : "text-foreground"
                            }`}
                            title={r.name}
                          >
                            {r.name}
                          </span>
                        </span>

                        {/* Menu rapide de la ligne */}
                        <button
                          type="button"
                          aria-label="Actions sur la ligne"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowMenu(rowMenu === r.wbs ? null : r.wbs);
                          }}
                          className={`absolute right-0 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-opacity hover:bg-muted hover:text-[#B45F09] ${
                            rowMenu === r.wbs
                              ? "opacity-100"
                              : "opacity-0 focus:opacity-100 group-hover/row:opacity-100"
                          }`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {rowMenu === r.wbs ? (
                          <RowMenu
                            row={r}
                            onClose={() => setRowMenu(null)}
                            onAction={(a) => {
                              onRowAction(r.wbs, a);
                              setRowMenu(null);
                            }}
                          />
                        ) : null}
                      </td>
                    ) : (
                      <td
                        key={c.key}
                        className={`overflow-hidden px-2 ${
                          c.align === "center" ? "text-center" : ""
                        }`}
                      >
                        {c.render(r)}
                      </td>
                    ),
                  )}
                </tr>
              );
            })}

            <tr style={{ height: GANTT_ROW_H }}>
              <td colSpan={shown.length + 1} className="px-2">
                <button
                  type="button"
                  onClick={onAddRow}
                  className="flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-[#B45F09]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter une ligne
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total, à la manière du « Grand Total » d'un planificateur */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-[#FBFCFD] px-2.5 py-1.5 text-[11px]">
        <span className="font-semibold text-foreground">Total</span>
        <span className="ml-auto tabular-nums text-muted-foreground">
          {rows.length} lignes · {totalDays} j · {totalLoad} h
        </span>
      </div>
    </Card>
  );
}

export type RowAction =
  | { kind: "status"; value: PlanRow["status"] }
  | { kind: "progress"; value: number }
  | { kind: "shape"; value: "task" | "milestone" | "summary" }
  | { kind: "critical" }
  | { kind: "add"; where: "above" | "below" | "child" }
  | { kind: "duplicate" }
  | { kind: "delete" };

const STATUSES: PlanRow["status"][] = ["Non démarré", "En cours", "En retard", "Terminé"];

const STATUS_DOT: Record<string, string> = {
  "Non démarré": "#D0D5DD",
  "En cours": "#E58A00",
  "En retard": "#D92D20",
  "Terminé": "#2E7D32",
};

/** Menu contextuel d'une ligne, façon planificateur. */
function RowMenu({
  row,
  onClose,
  onAction,
}: {
  row: PlanRow;
  onClose: () => void;
  onAction: (a: RowAction) => void;
}) {
  const shape = row.milestone ? "milestone" : row.summary ? "summary" : "task";

  return (
    <>
      <span
        className="fixed inset-0 z-40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden
      />
      <div
        className="absolute right-0 top-full z-50 mt-0.5 max-h-[19rem] w-56 overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-modal scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <Section>Statut</Section>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onAction({ kind: "status", value: s })}
            className="flex w-full items-center gap-2 px-3 py-[5px] text-left text-[11px] text-foreground transition-colors hover:bg-muted"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_DOT[s] }}
            />
            <span className="flex-1">{s}</span>
            {row.status === s ? <Check className="h-3 w-3 shrink-0 text-[#B45F09]" /> : null}
          </button>
        ))}

        <Section>Avancement</Section>
        <div className="flex gap-0.5 px-2 pb-1">
          {[0, 25, 50, 75, 100].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onAction({ kind: "progress", value: p })}
              className={`flex-1 rounded-md py-1 text-[10px] font-semibold tabular-nums transition-colors ${
                row.progress === p
                  ? "bg-[#B45F09] text-white"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <Section>Forme</Section>
        <div className="grid grid-cols-3 gap-0.5 px-2 pb-1">
          {([
            { v: "task", label: "Tâche" },
            { v: "milestone", label: "Jalon" },
            { v: "summary", label: "Récap." },
          ] as const).map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => onAction({ kind: "shape", value: s.v })}
              className={`rounded-md py-1 text-[10px] font-semibold transition-colors ${
                shape === s.v
                  ? "bg-[#E58A00] text-white"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Section>Insérer</Section>
        <Row
          icon={<ArrowUpToLine className="h-3.5 w-3.5" />}
          label="Une ligne au-dessus"
          onClick={() => onAction({ kind: "add", where: "above" })}
        />
        <Row
          icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
          label="Une ligne en dessous"
          onClick={() => onAction({ kind: "add", where: "below" })}
        />
        <Row
          icon={<CornerDownRight className="h-3.5 w-3.5" />}
          label="Une sous-tâche"
          onClick={() => onAction({ kind: "add", where: "child" })}
        />

        <div className="my-1 border-t border-border" />
        <Row
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label={row.critical ? "Retirer du chemin critique" : "Marquer critique"}
          onClick={() => onAction({ kind: "critical" })}
        />
        <Row
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label={row.progress >= 100 ? "Rouvrir l'élément" : "Marquer terminé"}
          onClick={() => onAction({ kind: "status", value: "Terminé" })}
        />
        <Row
          icon={<Diamond className="h-3.5 w-3.5" />}
          label={row.milestone ? "Reconvertir en tâche" : "Définir comme jalon"}
          onClick={() => onAction({ kind: "shape", value: row.milestone ? "task" : "milestone" })}
        />
        <Row
          icon={<Copy className="h-3.5 w-3.5" />}
          label="Dupliquer"
          onClick={() => onAction({ kind: "duplicate" })}
        />
        <Row
          icon={<Trash2 className="h-3.5 w-3.5" />}
          label="Supprimer"
          danger
          onClick={() => onAction({ kind: "delete" })}
        />
      </div>
    </>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function Row({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-[5px] text-left text-[11px] transition-colors ${
        danger ? "text-[#D92D20] hover:bg-[#FEF3F2]" : "text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/** Œil compact : moins encombrant que l'icône Lucide dans un en-tête à 11 px. */
function EyeGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
