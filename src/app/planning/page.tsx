"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarRange,
  Diamond,
  Download,
  FileText,
  Filter,
  Flag,
  Gauge,
  GripVertical,
  Layers,
  LineChart,
  Minus,
  Plus,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  Dot,
} from "@/components/ui/primitives";
import {
  GanttChart,
  GANTT_HEAD_H,
  GANTT_ROW_H,
} from "@/components/planning/gantt";
import {
  AddMilestoneModal,
  AddSubtaskModal,
  AddTaskModal,
  ResourceConflictModal,
  SimulationModal,
} from "@/components/planning/planning-modals";
import { PLAN_RISKS, PLAN_ROWS, PROJECT, STATUS_DATE } from "@/lib/data";

const TABS = ["Gantt", "Charge / Capacité", "Risques", "Chemin critique"];

const STATUS_TONE: Record<string, "red" | "blue" | "slate"> = {
  "En retard": "red",
  "En cours": "blue",
  "Non démarré": "slate",
};

type ModalKey = "milestone" | "task" | "subtask" | "conflict" | "simulation" | null;

/** "2026-12-02" → "02/12/2026" */
const fr = (iso: string) => iso.split("-").reverse().join("/");

export default function PlanningPage() {
  const router = useRouter();
  const [modal, setModal] = React.useState<ModalKey>(null);
  const [selected, setSelected] = React.useState("3.5");
  const [zoom, setZoom] = React.useState(100);
  const close = () => setModal(null);

  return (
    <AppShell notifications={4}>
      <div className="flex h-full w-full flex-col overflow-hidden">
      {/* ------------------------------------------------------- En-tête */}
      <div className="flex shrink-0 items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
            Planning détaillé — Risques &amp; conflits
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Pilotage opérationnel du planning APQP
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <Button>
            <UserRound className="h-4 w-4" />
            Chef de projet
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------- Bandeau projet */}
      <div className="mt-3 grid shrink-0 grid-cols-5 gap-2.5">
        {[
          { icon: <FileText className="h-4 w-4 text-muted-foreground" />, k: "Projet", v: `${PROJECT.id} — ${PROJECT.name}`, tone: "text-foreground" },
          { icon: <Layers className="h-4 w-4 text-muted-foreground" />, k: "Phase actuelle", v: PROJECT.phase, tone: "text-[#3976D3]" },
          { icon: <CalendarRange className="h-4 w-4 text-muted-foreground" />, k: "Date de statut", v: STATUS_DATE, tone: "text-foreground" },
          { icon: <Flag className="h-4 w-4 text-[#E58A00]" />, k: "Prochaine gate", v: "G3 — Process Freeze", tone: "text-[#B45F09]" },
          { icon: <Diamond className="h-4 w-4 text-[#E58A00]" />, k: "Délai", v: "+14 jours", tone: "text-[#E58A00]" },
        ].map((i) => (
          <Card key={i.k} className="flex items-center gap-2.5 px-3.5 py-2.5">
            {i.icon}
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] text-muted-foreground">{i.k}</p>
              <p className={`truncate text-[13px] font-semibold ${i.tone}`}>{i.v}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ------------------------------------------- Onglets + barre outils */}
      <div className="mt-3 flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-border pb-1">
        <div className="flex gap-6">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`border-b-2 pb-2 text-[14px] font-medium transition-colors ${
                i === 0
                  ? "border-[#E58A00] text-[#B45F09]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2 pb-1">
          <Button className="px-2.5 py-1.5 text-[11px]" onClick={() => router.push("/projet")}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour vue projet
          </Button>
          <Button className="px-2.5 py-1.5 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Exporter
          </Button>
          <Button className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("milestone")}>
            <Diamond className="h-3.5 w-3.5" />
            Ajouter un jalon intermédiaire
          </Button>
          <Button className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("task")}>
            <Plus className="h-3.5 w-3.5" />
            Ajouter une tâche
          </Button>
          <Button className="px-2.5 py-1.5 text-[11px]" onClick={() => setModal("subtask")}>
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
        </div>
      </div>

      {/* ----------------------------------------------- Barre d'affichage */}
      <Card className="mt-2.5 flex shrink-0 flex-wrap items-end gap-6 px-4 py-2.5">
        <label className="min-w-[150px]">
          <span className="mb-1 block text-[11px] text-muted-foreground">Affichage</span>
          <select className="h-8 w-full rounded-lg border border-input bg-white px-2 text-[12px] text-foreground focus:border-[#E5A11B] focus:outline-none">
            <option>Par défaut</option>
            <option>Compact</option>
            <option>Critique uniquement</option>
          </select>
        </label>

        <label className="min-w-[170px]">
          <span className="mb-1 block text-[11px] text-muted-foreground">Filtre</span>
          <span className="relative block">
            <Filter className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <select className="h-8 w-full rounded-lg border border-input bg-white pl-7 pr-2 text-[12px] text-foreground focus:border-[#E5A11B] focus:outline-none">
              <option>Aucun filtre</option>
              <option>Tâches critiques</option>
              <option>En retard</option>
            </select>
          </span>
        </label>

        <div className="border-l border-border pl-6">
          <span className="mb-1 block text-[11px] text-muted-foreground">Synchronisation</span>
          <span className="flex items-center gap-2">
            <span className="text-[12px] text-foreground">Lignes synchronisées</span>
            <span className="flex h-5 w-9 items-center rounded-full bg-[#E58A00] px-0.5">
              <span className="ml-auto h-4 w-4 rounded-full bg-white shadow" />
            </span>
          </span>
        </div>

        <div className="border-l border-border pl-6">
          <span className="mb-1 block text-[11px] text-muted-foreground">Zoom</span>
          <span className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Dézoomer"
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min={50}
              max={200}
              step={25}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-border accent-[#E58A00]"
            />
            <button
              type="button"
              aria-label="Zoomer"
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
            </button>
            <span className="text-[12px] font-medium tabular-nums text-foreground">{zoom} %</span>
          </span>
        </div>
      </Card>

      {/* -------------------------------------------------- WBS + Gantt */}
      <div className="mt-2.5 grid min-h-0 flex-1 grid-cols-[minmax(0,62fr)_minmax(0,38fr)] gap-2.5">
        {/* Tableau WBS */}
        <Card className="min-h-0 overflow-auto scrollbar-thin">
          <table className="w-full min-w-[900px] border-collapse text-[11px]">
            <thead>
              <tr className="text-muted-foreground">
                {[
                  ["WBS", 54], ["ID", 42], ["Gate", 44], ["Tâche / jalon", 0],
                  ["Responsable", 92],
                ].map(([label, w]) => (
                  <th
                    key={label as string}
                    rowSpan={2}
                    className="border-b border-r border-border px-2 text-left align-middle font-medium"
                    style={{ width: (w as number) || undefined, height: GANTT_HEAD_H }}
                  >
                    {label}
                  </th>
                ))}
                <th
                  colSpan={4}
                  className="border-b border-r border-border text-center font-medium"
                  style={{ height: GANTT_HEAD_H / 2 }}
                >
                  Dates
                </th>
                {[
                  ["Charge (h)", 54], ["Avancement", 88], ["Critique", 50],
                  ["Prédécesseurs", 76], ["Délai (j)", 48], ["Statut", 74],
                ].map(([label, w]) => (
                  <th
                    key={label as string}
                    rowSpan={2}
                    className="border-b border-r border-border px-2 text-center align-middle font-medium last:border-r-0"
                    style={{ width: w as number }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
              <tr className="text-muted-foreground">
                {["Baseline début", "Baseline fin", "Forecast début", "Forecast fin"].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-r border-border px-1.5 text-center font-medium"
                    style={{ height: GANTT_HEAD_H / 2, width: 82 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_ROWS.map((r) => {
                const active = selected === r.wbs;
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r.wbs)}
                    className={`cursor-pointer transition-colors ${
                      active ? "bg-[#FEF6E7]" : "hover:bg-muted/50"
                    }`}
                    style={{ height: GANTT_ROW_H }}
                  >
                    <td className="relative border-b border-r border-border px-2">
                      {active ? (
                        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E58A00]" />
                      ) : null}
                      <span className="flex items-center gap-1.5">
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-border" />
                        <span className="text-muted-foreground">{r.wbs}</span>
                      </span>
                    </td>
                    <td className="border-b border-r border-border px-2 font-semibold text-foreground">
                      {r.id}
                    </td>
                    <td className="border-b border-r border-border px-2 text-center">
                      {r.gate ? (
                        <span
                          className={`inline-flex h-[19px] w-[19px] items-center justify-center rounded-full border text-[9px] font-bold ${
                            r.gateTone === "amber"
                              ? "border-[#E58A00] bg-[#FEF6E7] text-[#B45F09]"
                              : "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                          }`}
                        >
                          {r.gate}
                        </span>
                      ) : (
                        <span className="text-border">—</span>
                      )}
                    </td>
                    <td className="border-b border-r border-border px-2 text-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="leading-tight">{r.name}</span>
                        {r.milestone ? (
                          <span className="h-2.5 w-2.5 shrink-0 rotate-45 rounded-[1px] border border-[#E58A00]" />
                        ) : null}
                      </span>
                    </td>
                    <td className="border-b border-r border-border px-2 text-muted-foreground">
                      {r.owner}
                    </td>
                    <td className="whitespace-nowrap border-b border-r border-border px-1.5 text-center tabular-nums text-muted-foreground">
                      {fr(r.bStart)}
                    </td>
                    <td className="whitespace-nowrap border-b border-r border-border px-1.5 text-center tabular-nums text-muted-foreground">
                      {fr(r.bEnd)}
                    </td>
                    <td className="whitespace-nowrap border-b border-r border-border px-1.5 text-center tabular-nums text-[#E58A00]">
                      {fr(r.fStart)}
                    </td>
                    <td className="whitespace-nowrap border-b border-r border-border px-1.5 text-center tabular-nums text-[#E58A00]">
                      {fr(r.fEnd)}
                    </td>
                    <td className="border-b border-r border-border px-2 text-center tabular-nums text-foreground">
                      {r.load}
                    </td>
                    <td className="border-b border-r border-border px-2">
                      <span className="flex items-center gap-1.5">
                        <ProgressBar
                          value={r.progress}
                          color={r.progress >= 70 ? "#2E7D32" : r.progress > 0 ? "#E58A00" : "#EAECF0"}
                          className="flex-1"
                        />
                        <span className="w-8 shrink-0 text-right tabular-nums text-foreground">
                          {r.progress}%
                        </span>
                      </span>
                    </td>
                    <td className="border-b border-r border-border px-2 text-center">
                      {r.critical ? <Dot color="#D92D20" /> : <span className="text-border">—</span>}
                    </td>
                    <td className="whitespace-nowrap border-b border-r border-border px-2 text-center text-muted-foreground">
                      {r.predecessors}
                    </td>
                    <td className="border-b border-r border-border px-2 text-center font-medium text-[#D92D20]">
                      {r.delay}
                    </td>
                    <td className="border-b border-border px-2 text-center">
                      <Chip tone={STATUS_TONE[r.status]}>{r.status}</Chip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Gantt */}
        <Card className="min-h-0 overflow-hidden">
          <div className="h-full overflow-auto scrollbar-thin">
            <div style={{ width: `${zoom}%`, minWidth: "100%", height: "100%" }}>
              <GanttChart />
            </div>
          </div>
        </Card>
      </div>

      {/* --------------------------------------------------- Bandeau bas */}
      <div className="mt-2.5 grid h-[196px] shrink-0 grid-cols-[minmax(0,34fr)_minmax(0,33fr)_minmax(0,33fr)] gap-2.5">
        {/* Risques */}
        <Card className="flex min-h-0 flex-col overflow-hidden px-4 py-3">
          <p className="shrink-0 text-[14px] font-semibold text-foreground">
            Risques &amp; conflits détectés ({PLAN_RISKS.length})
          </p>
          <ul className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto scrollbar-thin">
            {PLAN_RISKS.map((r) => {
              const isConflict = r.id === "conflit";
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={isConflict ? () => setModal("conflict") : undefined}
                    className={`flex w-full items-center gap-2 rounded-md py-1 text-left ${
                      isConflict ? "cursor-pointer hover:bg-muted" : "cursor-default"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-3.5 w-3.5 shrink-0 ${
                        r.level === "Critique" ? "text-[#D92D20]" : "text-[#E58A00]"
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">
                      {r.label}
                    </span>
                    <span
                      className={`shrink-0 text-[12px] font-medium ${
                        r.level === "Critique" ? "text-[#D92D20]" : "text-[#E58A00]"
                      }`}
                    >
                      {r.level}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Button className="mx-auto mt-2 shrink-0 px-4 py-1.5 text-[12px]">
            Voir tous les risques
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        {/* Actions rapides */}
        <Card className="flex min-h-0 flex-col overflow-hidden px-4 py-3">
          <p className="shrink-0 text-[14px] font-semibold text-foreground">Actions rapides</p>
          <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-2">
            {[
              { icon: <Diamond className="h-5 w-5" />, label: "Ajuster un jalon intermédiaire", key: "milestone" as const },
              { icon: <Plus className="h-5 w-5" />, label: "Ajouter une tâche", key: "task" as const },
              { icon: <Layers className="h-5 w-5" />, label: "Ajouter une sous-tâche", key: "subtask" as const },
              { icon: <CalendarRange className="h-5 w-5" />, label: "Replanifier", key: "simulation" as const },
              { icon: <BarChart3 className="h-5 w-5" />, label: "Voir impact capacité", key: "conflict" as const },
              { icon: <Gauge className="h-5 w-5" />, label: "Simulation rapide", key: "simulation" as const },
            ].map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setModal(a.key)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border px-1 text-center transition-colors hover:border-[#E5A11B] hover:bg-[#FDF7EF]"
              >
                <span className="text-[#E58A00]">{a.icon}</span>
                <span className="text-[10px] leading-tight text-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Parcours */}
        <Card className="flex min-h-0 flex-col overflow-hidden px-4 py-3">
          <p className="shrink-0 text-[14px] font-semibold text-foreground">
            Parcours &amp; redirections
          </p>
          <ol className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto scrollbar-thin">
            {[
              { a: "Retour vue projet", t: "pour revenir à la vue projet — “Dashboard chef de projet”" },
              { a: "Piloter l'exécution", t: "ouvre “Suivi d'exécution & éléments justificatifs”" },
              { a: "Retour portefeuille", t: "ouvre “Vue globale portefeuille projets”" },
            ].map((h, i) => (
              <li key={h.a} className="flex items-start gap-2">
                <span className="mt-px flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border border-[#F0DFC4] bg-[#FDF4E7] text-[10px] font-bold text-[#B45F09]">
                  {i + 1}
                </span>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Cliquer sur <span className="font-semibold text-[#B45F09]">“{h.a}”</span> {h.t}
                </p>
              </li>
            ))}
          </ol>
          <Button
            className="mt-2 w-full shrink-0 py-1.5 text-[12px]"
            onClick={() => router.push("/execution")}
          >
            <LineChart className="h-3.5 w-3.5" />
            Piloter l&apos;exécution
          </Button>
        </Card>
      </div>

      {/* ------------------------------------------------------- Modales */}
      </div>

      <AddMilestoneModal open={modal === "milestone"} onClose={close} />
      <AddTaskModal open={modal === "task"} onClose={close} />
      <AddSubtaskModal open={modal === "subtask"} onClose={close} />
      <ResourceConflictModal open={modal === "conflict"} onClose={close} />
      <SimulationModal open={modal === "simulation"} onClose={close} />
    </AppShell>
  );
}
