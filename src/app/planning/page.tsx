"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarRange,
  Diamond,
  Download,
  FileText,
  Flag,
  Gauge,
  Layers,
  LineChart,
  Pencil,
  Plus,
  Route,
  Trash2,
  UserRound,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button, Card, Chip, Modal, type ChipTone } from "@/components/ui/primitives";
import {
  GanttChart,
  SCALES,
  durationDays,
  shiftIso,
  type GanttRowAction,
  type Scale,
} from "@/components/planning/gantt";
import {
  DEFAULT_VISIBLE,
  WbsTable,
  tableWidth,
  visibleRows,
  type RowAction,
} from "@/components/planning/wbs-table";
import { ElementPopover, type Shape } from "@/components/planning/element-panel";
import {
  AddMilestoneModal,
  AddSubtaskModal,
  AddTaskModal,
  ResourceConflictModal,
  SimulationModal,
  type NewElement,
} from "@/components/planning/planning-modals";
import {
  PLAN_RISKS,
  PLAN_ROWS,
  PROJECT,
  STATUS_DATE,
  type DepType,
  type PlanRow,
} from "@/lib/data";

const TABS = ["Gantt", "Charge / Capacité", "Risques", "Chemin critique"];

const RISK_TONE: Record<string, ChipTone> = {
  Critique: "red",
  Majeur: "amber",
  Mineur: "blue",
  Faible: "slate",
};

type ModalKey = "milestone" | "task" | "subtask" | "conflict" | "simulation" | null;

export default function PlanningPage() {
  const router = useRouter();

  const [rows, setRows] = React.useState<PlanRow[]>(PLAN_ROWS);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [modal, setModal] = React.useState<ModalKey>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [visibleCols, setVisibleCols] = React.useState<string[]>(DEFAULT_VISIBLE);
  const [collapsed, setCollapsed] = React.useState<string[]>([]);
  const [scale, setScale] = React.useState<Scale>("week");
  const [zoom, setZoom] = React.useState(1);
  const [showBaseline, setShowBaseline] = React.useState(true);
  const [criticalPath, setCriticalPath] = React.useState(false);

  const shownRows = React.useMemo(() => visibleRows(rows, collapsed), [rows, collapsed]);
  const selectedRow = rows.find((r) => r.wbs === selected) ?? null;
  const showPanel = panelOpen && selectedRow !== null;

  const select = (wbs: string) => {
    setSelected(wbs);
    setPanelOpen(true);
  };

  const toggleCollapse = (wbs: string) =>
    setCollapsed((c) => (c.includes(wbs) ? c.filter((k) => k !== wbs) : [...c, wbs]));

  const patch = (wbs: string, next: Partial<PlanRow>) =>
    setRows((rs) => rs.map((r) => (r.wbs === wbs ? { ...r, ...next } : r)));

  const duplicate = (wbs: string) =>
    setRows((rs) => {
      const i = rs.findIndex((r) => r.wbs === wbs);
      if (i < 0) return rs;
      const src = rs[i];
      const copy: PlanRow = {
        ...src,
        wbs: `${src.wbs}·copie`,
        id: `${src.id}-C`,
        name: `${src.name} (copie)`,
        dependsOn: undefined,
        summary: false,
      };
      return [...rs.slice(0, i + 1), copy, ...rs.slice(i + 1)];
    });

  const removeRow = (wbs: string) => {
    // La descendance part avec le parent, et les liens orphelins sont coupés.
    setRows((rs) =>
      rs
        .filter((r) => r.wbs !== wbs && !r.wbs.startsWith(`${wbs}.`))
        .map((r) => (r.dependsOn === wbs ? { ...r, dependsOn: undefined } : r)),
    );
    setSelected(null);
    setPanelOpen(false);
    setConfirmDelete(false);
  };

  /** Replanification par glissement : la dérive se recalcule sur la baseline. */
  const reschedule = (wbs: string, fStart: string, fEnd: string) =>
    setRows((rs) =>
      rs.map((r) => {
        if (r.wbs !== wbs) return r;
        const drift = durationDays(r.bEnd, fEnd) - 1;
        return { ...r, fStart, fEnd, delay: drift > 0 ? `+${drift}` : String(drift) };
      }),
    );

  /** Identifiant libre : on prend le plus grand Tnn existant et on incrémente. */
  const nextId = () => {
    const max = rows.reduce((m, r) => {
      const n = Number(/^T(\d+)/.exec(r.id)?.[1] ?? 0);
      return Math.max(m, n);
    }, 0);
    return `T${String(max + 1).padStart(2, "0")}`;
  };

  /**
   * Insère une ligne dans l'arborescence puis la sélectionne. Le groupe d'accueil
   * est déplié, sinon la ligne créée serait invisible dans le tableau et le Gantt.
   */
  const insertRow = (row: PlanRow, groupWbs: string, at?: number) => {
    setRows((rs) => {
      let index = at;
      if (index === undefined) {
        index = rs.length;
        for (let i = rs.length - 1; i >= 0; i--) {
          if (rs[i].wbs === groupWbs || rs[i].wbs.startsWith(`${groupWbs}.`)) {
            index = i + 1;
            break;
          }
        }
      }
      return [...rs.slice(0, index), row, ...rs.slice(index)];
    });
    setCollapsed((c) => c.filter((k) => !groupWbs.startsWith(k)));
    setSelected(row.wbs);
    setPanelOpen(true);
  };

  /** Prochain WBS libre sous un parent : 3 → 3.6, 3.2 → 3.2.1. */
  const nextWbs = (groupWbs: string) => {
    const depth = groupWbs.split(".").length;
    const max = rows.reduce((m, r) => {
      if (!r.wbs.startsWith(`${groupWbs}.`)) return m;
      const parts = r.wbs.split(".");
      if (parts.length !== depth + 1) return m;
      return Math.max(m, Number(parts[depth]) || 0);
    }, 0);
    return `${groupWbs}.${max + 1}`;
  };

  /** Création depuis une modale : tâche, jalon ou sous-tâche. */
  const createElement = (el: NewElement) => {
    const anchorRow = rows.find((r) => r.id === el.anchor);
    const groupWbs =
      el.kind === "subtask" && anchorRow
        ? anchorRow.wbs
        : el.kind === "milestone" && anchorRow
          ? anchorRow.wbs.split(".").slice(0, -1).join(".") || anchorRow.wbs
          : el.anchor.split(".")[0];

    const row: PlanRow = {
      wbs: nextWbs(groupWbs),
      id: nextId(),
      name: el.name,
      owner: el.owner,
      bStart: el.start,
      bEnd: el.end,
      fStart: el.start,
      fEnd: el.end,
      load: el.load,
      progress: 0,
      critical: el.critical ?? false,
      predecessors: anchorRow?.wbs ?? "—",
      delay: "0",
      status: "Non démarré",
      milestone: el.kind === "milestone",
      gate: el.kind === "milestone" ? el.gate : undefined,
      gateTone: el.kind === "milestone" ? "amber" : undefined,
      dependsOn: anchorRow?.wbs,
    };
    insertRow(row, groupWbs);
  };

  /** Double-clic dans le schéma : nouvelle tâche de 5 jours à la date visée. */
  const createAt = (iso: string) => {
    const groupWbs = (selectedRow?.wbs ?? "3").split(".")[0];
    insertRow(
      {
        wbs: nextWbs(groupWbs),
        id: nextId(),
        name: "Nouvelle tâche",
        owner: "Youssef Jaziri",
        bStart: iso,
        bEnd: shiftIso(iso, 4),
        fStart: iso,
        fEnd: shiftIso(iso, 4),
        load: 8,
        progress: 0,
        critical: false,
        predecessors: "—",
        delay: "0",
        status: "Non démarré",
      },
      groupWbs,
    );
  };

  /** Le menu du schéma retombe sur les mêmes actions que celui du tableau. */
  const onGanttAction = (wbs: string, action: GanttRowAction) => {
    switch (action) {
      case "edit":
        setSelected(wbs);
        setPanelOpen(true);
        return;
      case "toTask":
        return onRowAction(wbs, { kind: "shape", value: "task" });
      case "toMilestone":
        return onRowAction(wbs, { kind: "shape", value: "milestone" });
      case "toSummary":
        return onRowAction(wbs, { kind: "shape", value: "summary" });
      case "removeDep":
        patch(wbs, { dependsOn: undefined, depType: undefined, depOffset: undefined });
        return;
      case "duplicate":
        return onRowAction(wbs, { kind: "duplicate" });
      case "delete":
        return onRowAction(wbs, { kind: "delete" });
    }
  };

  /**
   * Le lien se stocke sur le successeur : c'est lui qui porte `dependsOn`.
   * Le décalage manuel du coude est remis à zéro, il ne vaut que pour l'ancien tracé.
   */
  const linkRows = (from: string, to: string, type: DepType) =>
    patch(to, { dependsOn: from, depType: type, depOffset: undefined });

  /**
   * Saisie d'un champ du bandeau d'édition. Le statut repasse par l'action
   * dédiée pour garder le couplage statut / avancement.
   */
  const applyField = (wbs: string, next: Partial<PlanRow>) => {
    if (next.status) {
      onRowAction(wbs, { kind: "status", value: next.status });
      return;
    }
    patch(wbs, next);
  };

  const onRowAction = (wbs: string, action: RowAction) => {
    const row = rows.find((r) => r.wbs === wbs);
    if (!row) return;

    switch (action.kind) {
      // Statut et avancement restent cohérents : terminé implique 100 %, et
      // repasser à 0 % ramène la ligne à « Non démarré ».
      case "status":
        patch(wbs, {
          status: action.value,
          progress:
            action.value === "Terminé" ? 100 : action.value === "Non démarré" ? 0 : row.progress,
        });
        return;

      case "progress":
        patch(wbs, {
          progress: action.value,
          status:
            action.value >= 100
              ? "Terminé"
              : action.value === 0
                ? "Non démarré"
                : row.status === "En retard"
                  ? "En retard"
                  : "En cours",
        });
        return;

      case "shape":
        if (action.value === "milestone") {
          patch(wbs, { milestone: true, summary: false, fEnd: row.fStart, load: 0 });
        } else if (action.value === "summary") {
          patch(wbs, { summary: true, milestone: false });
        } else {
          patch(wbs, { milestone: false, summary: false });
        }
        return;

      case "critical":
        patch(wbs, { critical: !row.critical });
        return;

      case "add": {
        const topLevel = !row.wbs.includes(".");
        const parentWbs =
          action.where === "child"
            ? row.wbs
            : row.wbs.split(".").slice(0, -1).join(".") || row.wbs;

        // Un frère de ligne de phase est une nouvelle phase, pas un « 3.6 ».
        const wbs =
          topLevel && action.where !== "child"
            ? String(
                rows.reduce(
                  (m, r) => (r.wbs.includes(".") ? m : Math.max(m, Number(r.wbs) || 0)),
                  0,
                ) + 1,
              )
            : nextWbs(parentWbs);

        const index = rows.findIndex((r) => r.wbs === row.wbs);
        // « En dessous » se place après la ligne et toute sa descendance.
        let at = index;
        if (action.where !== "above") {
          at = index + 1;
          while (at < rows.length && rows[at].wbs.startsWith(`${row.wbs}.`)) at += 1;
        }
        insertRow(
          {
            wbs,
            id: nextId(),
            name: "Nouvelle tâche",
            owner: row.owner === "—" ? "Youssef Jaziri" : row.owner,
            bStart: row.fStart,
            bEnd: shiftIso(row.fStart, 4),
            fStart: row.fStart,
            fEnd: shiftIso(row.fStart, 4),
            load: 8,
            progress: 0,
            critical: false,
            predecessors: "—",
            delay: "0",
            status: "Non démarré",
          },
          parentWbs,
          at,
        );
        return;
      }

      case "duplicate":
        duplicate(wbs);
        return;

      case "delete":
        setSelected(wbs);
        setConfirmDelete(true);
        return;
    }
  };

  return (
    <AppShell notifications={4}>
      <div className="flex h-full w-full flex-col overflow-hidden">
        {/* --------------------------------------------------------- Titre */}
        <div className="flex shrink-0 items-start gap-4">
          <div className="min-w-0">
            <h1 className="text-[23px] font-bold leading-tight tracking-tight text-foreground">
              Planning détaillé — Risques &amp; conflits
            </h1>
            <p className="text-[12px] text-muted-foreground">
              Pilotage opérationnel du planning APQP
            </p>
          </div>
          <Button className="ml-auto shrink-0 py-1.5">
            <UserRound className="h-4 w-4" />
            Chef de projet
          </Button>
        </div>

        {/* ------------------------------------------------- Bandeau projet */}
        <div className="mt-2 grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { icon: <FileText className="h-4 w-4 text-muted-foreground" />, k: "Projet", v: `${PROJECT.id} — ${PROJECT.name}`, tone: "text-foreground" },
            { icon: <Layers className="h-4 w-4 text-muted-foreground" />, k: "Phase actuelle", v: PROJECT.phase, tone: "text-[#3976D3]" },
            { icon: <CalendarRange className="h-4 w-4 text-muted-foreground" />, k: "Date de statut", v: STATUS_DATE, tone: "text-foreground" },
            { icon: <Flag className="h-4 w-4 text-[#E58A00]" />, k: "Prochaine gate", v: "G3 — Process Freeze", tone: "text-[#B45F09]" },
            { icon: <AlertTriangle className="h-4 w-4 text-[#E58A00]" />, k: "Délai", v: "+14 jours", tone: "text-[#E58A00]" },
          ].map((i) => (
            <Card key={i.k} className="flex items-center gap-2 px-2.5 py-1.5">
              {i.icon}
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] text-muted-foreground">{i.k}</p>
                <p className={`truncate text-[12px] font-semibold ${i.tone}`}>{i.v}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* ------------------------------------ Onglets + réglages de la vue */}
        <div className="mt-2 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-b border-border">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`border-b-2 pb-1.5 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "border-[#E58A00] text-[#B45F09]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5 pb-1">
            <Toggle
              on={criticalPath}
              onClick={() => setCriticalPath((v) => !v)}
              icon={<Route className="h-3.5 w-3.5" />}
              label="Chemin critique"
            />
            <Toggle
              on={showBaseline}
              onClick={() => setShowBaseline((v) => !v)}
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              label="Baseline"
            />
            <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
              {SCALES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setScale(s.key);
                    setZoom(1);
                  }}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    scale === s.key
                      ? "bg-[#B45F09] text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                disabled={zoom <= 0.5}
                aria-label="Dézoomer le Gantt"
                title="Dézoomer"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-[#B45F09] disabled:pointer-events-none disabled:opacity-40"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                title="Réinitialiser le zoom"
                className="w-9 rounded-md px-1 py-1 text-[11px] font-medium tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-[#B45F09]"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                disabled={zoom >= 4}
                aria-label="Zoomer le Gantt"
                title="Zoomer"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-[#B45F09] disabled:pointer-events-none disabled:opacity-40"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------- Barre outils */}
        <div className="mt-1.5 flex shrink-0 flex-wrap items-center gap-1.5">
          <Button className="px-2.5 py-1.5 text-[11px]" onClick={() => router.push("/projet")}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour vue projet
          </Button>
          <Button className="px-2.5 py-1.5 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Exporter
          </Button>
          <Button variant="amber" className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("milestone")}>
            <Diamond className="h-3.5 w-3.5" />
            Ajouter un jalon
          </Button>
          <Button variant="amber" className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("task")}>
            <Plus className="h-3.5 w-3.5" />
            Ajouter une tâche
          </Button>
          <Button variant="amber" className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("subtask")}>
            <Layers className="h-3.5 w-3.5" />
            Ajouter une sous-tâche
          </Button>
          <Button className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("simulation")}>
            <CalendarRange className="h-3.5 w-3.5" />
            Replanifier
          </Button>
          <Button className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("conflict")}>
            <BarChart3 className="h-3.5 w-3.5" />
            Voir impact capacité
          </Button>

          {/* Actions sur l'élément sélectionné : ajouter / modifier / supprimer */}
          {selectedRow ? (
            <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-[#EFE2CE] bg-white p-0.5 shadow-sm">
              <span className="px-1.5 text-[11px] font-semibold text-[#B45F09]">
                {selectedRow.id}
              </span>
              <span className="h-5 w-px bg-border" />
              <IconAction icon={<Plus className="h-4 w-4" />} label="Ajouter une tâche" onClick={() => setModal("task")} />
              <span className="h-5 w-px bg-border" />
              <IconAction icon={<Pencil className="h-4 w-4" />} label="Modifier l'élément" onClick={() => setPanelOpen(true)} />
              <span className="h-5 w-px bg-border" />
              <IconAction icon={<Trash2 className="h-4 w-4" />} label="Supprimer l'élément" danger onClick={() => setConfirmDelete(true)} />
            </div>
          ) : null}
        </div>

        {/* L'éditeur s'insère au-dessus : il décale le contenu au lieu de le couvrir. */}
        {showPanel && selectedRow ? (
          <ElementPopover
            key={selectedRow.id}
            row={selectedRow}
            onClose={() => setPanelOpen(false)}
            onDelete={() => setConfirmDelete(true)}
            onDuplicate={() => duplicate(selectedRow.wbs)}
            onShapeChange={(shape: Shape) =>
              onGanttAction(
                selectedRow.wbs,
                shape === "milestone"
                  ? "toMilestone"
                  : shape === "summary"
                    ? "toSummary"
                    : "toTask",
              )
            }
            onField={(next) => applyField(selectedRow.wbs, next)}
          />
        ) : null}

        {/* ---------------------------------------------- Tableau + Gantt */}
        <div
          className="mt-1.5 grid min-h-0 flex-1 gap-2 transition-[grid-template-columns] duration-200"
          style={{
            // Le tableau vaut exactement ses colonnes visibles : en masquer une
            // le rétrécit et rend la place au Gantt.
            gridTemplateColumns: `minmax(0, ${tableWidth(visibleCols)}px) minmax(240px, 1fr)`,
          }}
        >
          <WbsTable
            all={rows}
            rows={shownRows}
            selectedWbs={selected}
            onSelect={select}
            visible={visibleCols}
            onVisibleChange={setVisibleCols}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            onAddRow={() => setModal("task")}
            onRowAction={onRowAction}
          />

          <Card className="min-h-0 overflow-hidden">
            <GanttChart
              rows={shownRows}
              selectedWbs={selected}
              onSelect={select}
              scale={scale}
              zoom={zoom}
              showBaseline={showBaseline}
              criticalPath={criticalPath}
              onChangeDepType={(wbs, type: DepType) => patch(wbs, { depType: type })}
              onRemoveDep={(wbs) => patch(wbs, { dependsOn: undefined, depType: undefined, depOffset: undefined })}
              onReschedule={reschedule}
              onRowAction={onGanttAction}
              onCreateAt={createAt}
              onLink={linkRows}
              onRename={(wbs, name) => patch(wbs, { name })}
              onMoveLink={(wbs, offsetDays) => patch(wbs, { depOffset: offsetDays })}
            />
          </Card>
        </div>

        {/* ----------------------------------------------------- Bandeau bas */}
        <div className="mt-2 grid h-[136px] shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
          <Card className="flex min-h-0 flex-col overflow-hidden px-3.5 py-2">
            <p className="shrink-0 text-[13px] font-semibold text-foreground">
              Risques &amp; conflits détectés ({PLAN_RISKS.length})
            </p>
            <ul className="mt-1 min-h-0 flex-1 overflow-y-auto scrollbar-thin">
              {PLAN_RISKS.map((r) => {
                const isConflict = r.id === "conflit";
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={isConflict ? () => setModal("conflict") : undefined}
                      className={`grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-1 py-[3px] text-left ${
                        isConflict ? "cursor-pointer hover:bg-muted" : "cursor-default"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <AlertTriangle
                          className={`h-3.5 w-3.5 shrink-0 ${
                            r.level === "Critique" ? "text-[#D92D20]" : "text-[#E58A00]"
                          }`}
                        />
                        <span className="truncate text-[11px] text-foreground">{r.label}</span>
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">{r.detail}</span>
                      <Chip tone={RISK_TONE[r.level]}>{r.level}</Chip>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="flex min-h-0 flex-col overflow-hidden px-3.5 py-2">
            <p className="shrink-0 text-[13px] font-semibold text-foreground">Actions rapides</p>
            <div className="mt-1 grid min-h-0 flex-1 grid-cols-6 gap-1.5">
              {[
                { icon: <Diamond className="h-4 w-4" />, label: "Ajouter un jalon", run: () => setModal("milestone") },
                { icon: <Plus className="h-4 w-4" />, label: "Ajouter une tâche", run: () => setModal("task") },
                { icon: <Layers className="h-4 w-4" />, label: "Ajouter une sous-tâche", run: () => setModal("subtask") },
                { icon: <CalendarRange className="h-4 w-4" />, label: "Replanifier", run: () => setModal("simulation") },
                { icon: <Gauge className="h-4 w-4" />, label: "Simulation rapide", run: () => setModal("simulation") },
                { icon: <LineChart className="h-4 w-4" />, label: "Piloter l'exécution", run: () => router.push("/execution") },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.run}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border px-1 text-center transition-colors hover:border-[#E5A11B] hover:bg-[#FDF7EF]"
                >
                  <span className="text-[#E58A00]">{a.icon}</span>
                  <span className="text-[10px] leading-tight text-foreground">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ----------------------------------------------------------- Modales */}
      <AddMilestoneModal
        open={modal === "milestone"}
        onClose={() => setModal(null)}
        onCreate={createElement}
      />
      <AddTaskModal
        open={modal === "task"}
        onClose={() => setModal(null)}
        onCreate={createElement}
      />
      <AddSubtaskModal
        open={modal === "subtask"}
        onClose={() => setModal(null)}
        onCreate={createElement}
      />
      <ResourceConflictModal open={modal === "conflict"} onClose={() => setModal(null)} />
      <SimulationModal open={modal === "simulation"} onClose={() => setModal(null)} />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        width="max-w-md"
        title="Supprimer l'élément ?"
        subtitle={selectedRow ? `${selectedRow.id} — ${selectedRow.name}` : undefined}
        icon={<Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D92D20]" />}
      >
        <p className="text-[12px] text-muted-foreground">
          L&apos;élément et ses sous-tâches sont retirés du tableau WBS et du Gantt. Les
          dépendances qui pointaient vers lui sont supprimées.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setConfirmDelete(false)}>Annuler</Button>
          <Button
            className="border-[#FECDCA] bg-[#D92D20] text-white hover:bg-[#B42318]"
            onClick={() => selectedRow && removeRow(selectedRow.wbs)}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

function Toggle({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
        on
          ? "border-[#EFE2CE] bg-[#FDF4E7] text-[#B45F09]"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function IconAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-md p-1.5 transition-colors ${
        danger ? "text-[#D92D20] hover:bg-[#FEF3F2]" : "text-[#B45F09] hover:bg-[#FDF7EF]"
      }`}
    >
      {icon}
    </button>
  );
}
