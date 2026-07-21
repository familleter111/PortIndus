"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Eye,
  FolderClosed,
  Gauge,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { KpiCard, PageTitle } from "@/components/shared/page-parts";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  Dot,
  Input,
  Panel,
  Select,
} from "@/components/ui/primitives";
import {
  PHASE_SPLIT,
  PORTFOLIO_PROGRESS,
  PORTFOLIO_TOTALS,
  PROJECTS,
  type Health,
  type Project,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const HEALTH_META: Record<Health, { label: string; color: string; tone: "green" | "amber" | "red" }> = {
  green: { label: "Vert", color: "#2E7D32", tone: "green" },
  orange: { label: "Orange", color: "#E58A00", tone: "amber" },
  red: { label: "Rouge", color: "#D92D20", tone: "red" },
};

/** Colonnes triables — la clé est celle du projet, pas un libellé. */
type SortKey = "id" | "sop" | "actual" | "spi" | "readiness" | "driftDays" | "workload";

const COLUMNS: { key: SortKey | null; label: string; align?: "right" }[] = [
  { key: "id", label: "Projet" },
  { key: null, label: "Client" },
  { key: null, label: "Chef de projet" },
  { key: null, label: "Phase actuelle" },
  { key: "sop", label: "SOP (prévision)" },
  { key: "workload", label: "Charge totale" },
  { key: null, label: "Planifié" },
  { key: "actual", label: "Réel" },
  { key: "spi", label: "SPI" },
  { key: null, label: "Actions en retard" },
  { key: "readiness", label: "Readiness" },
  { key: "driftDays", label: "Dérive" },
  { key: null, label: "Santé" },
  { key: null, label: "Prochaine gate" },
  { key: null, label: "" },
];

/** "05/07/2027" → 20270705, comparable numériquement. */
function dateKey(fr: string): number {
  const [d, m, y] = fr.split("/");
  return Number(`${y}${m}${d}`);
}

export default function ProjetsPage() {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [healthFilter, setHealthFilter] = React.useState("Santé");
  const [phaseFilter, setPhaseFilter] = React.useState("Phase");
  const [clientFilter, setClientFilter] = React.useState("Client");
  const [sort, setSort] = React.useState<{ key: SortKey; desc: boolean }>({
    key: "driftDays",
    desc: true,
  });

  const clients = React.useMemo(
    () => Array.from(new Set(PROJECTS.map((p) => p.client))).sort(),
    [],
  );

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const kept = PROJECTS.filter((p) => {
      if (q && !`${p.id} ${p.name} ${p.client} ${p.manager}`.toLowerCase().includes(q)) {
        return false;
      }
      if (healthFilter !== "Santé" && HEALTH_META[p.health].label !== healthFilter) return false;
      if (phaseFilter !== "Phase" && p.phase !== phaseFilter) return false;
      if (clientFilter !== "Client" && p.client !== clientFilter) return false;
      return true;
    });

    // Les dates se comparent sur leur clé numérique, pas sur la chaîne « jj/mm ».
    const value = (p: Project) => (sort.key === "sop" ? dateKey(p.sop) : p[sort.key]);
    return [...kept].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (typeof va === "string" || typeof vb === "string") {
        return sort.desc
          ? String(vb).localeCompare(String(va))
          : String(va).localeCompare(String(vb));
      }
      return sort.desc ? vb - va : va - vb;
    });
  }, [query, healthFilter, phaseFilter, clientFilter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: true }));

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Projets"
          subtitle="Vue globale de tous les projets APQP en cours"
          action={
            <Button variant="primary" onClick={() => router.push("/nouveau-projet/etape-1")}>
              <Plus className="h-4 w-4" />
              Créer un projet
            </Button>
          }
        />

        {/* Indicateurs consolidés — tous recalculés depuis la liste. */}
        <div className="grid shrink-0 grid-cols-7 gap-2.5">
          <KpiCard
            icon={<FolderClosed className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Projets actifs"
            value={PORTFOLIO_TOTALS.count}
          />
          <KpiCard
            icon={<TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Avancement moyen"
            value={PORTFOLIO_PROGRESS.actualLabel}
            note={`vs plan ${PORTFOLIO_PROGRESS.plannedLabel}`}
          />
          <KpiCard
            icon={<Gauge className="h-3.5 w-3.5 text-muted-foreground" />}
            label="SPI moyen"
            value={PORTFOLIO_TOTALS.avgSpi.toFixed(3).replace(".", ",")}
            tone={PORTFOLIO_TOTALS.avgSpi < 1 ? "red" : "green"}
          />
          <KpiCard
            icon={<CalendarClock className="h-3.5 w-3.5 text-[#E58A00]" />}
            label="Gates en dérive"
            value={PORTFOLIO_TOTALS.late}
            note={`sur ${PORTFOLIO_TOTALS.count} projets`}
            tone="amber"
          />
          <KpiCard
            icon={<Clock className="h-3.5 w-3.5 text-[#D92D20]" />}
            label="Actions en retard"
            value={PORTFOLIO_TOTALS.overdue}
            tone="red"
          />
          <KpiCard
            icon={<AlertTriangle className="h-3.5 w-3.5 text-[#D92D20]" />}
            label="Actions critiques"
            value={PORTFOLIO_TOTALS.critical}
            tone="red"
          />
          <KpiCard
            icon={<ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Readiness moyenne"
            value={`${PORTFOLIO_TOTALS.avgReadiness} %`}
            tone={PORTFOLIO_TOTALS.avgReadiness < 50 ? "red" : "amber"}
          />
        </div>

        {/* Santé + phases, sur une bande compacte */}
        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-2.5">
          <Card className="flex items-center gap-3 px-3.5 py-2">
            <span className="text-[11px] font-semibold text-foreground">Santé</span>
            <div className="flex min-w-0 flex-1 overflow-hidden rounded-full">
              {([
                ["green", PORTFOLIO_TOTALS.green],
                ["orange", PORTFOLIO_TOTALS.orange],
                ["red", PORTFOLIO_TOTALS.red],
              ] as const).map(([h, n]) =>
                n > 0 ? (
                  <span
                    key={h}
                    title={`${HEALTH_META[h].label} : ${n}`}
                    className="h-2"
                    style={{
                      width: `${(n / PORTFOLIO_TOTALS.count) * 100}%`,
                      backgroundColor: HEALTH_META[h].color,
                    }}
                  />
                ) : null,
              )}
            </div>
            {(["green", "orange", "red"] as const).map((h) => (
              <span key={h} className="flex shrink-0 items-center gap-1 text-[11px]">
                <Dot color={HEALTH_META[h].color} />
                <span className="tabular-nums font-semibold text-foreground">
                  {PORTFOLIO_TOTALS[h]}
                </span>
              </span>
            ))}
          </Card>

          <Card className="flex items-center gap-3 overflow-x-auto px-3.5 py-2 scrollbar-thin">
            <span className="shrink-0 text-[11px] font-semibold text-foreground">Phases</span>
            {PHASE_SPLIT.map((p) => (
              <span
                key={p.phase}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {p.phase}
                <span className="font-semibold text-foreground">{p.count}</span>
              </span>
            ))}
          </Card>
        </div>

        {/* Recherche & filtres */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par code, nom, client, chef de projet…"
              className="pl-8"
            />
          </span>
          <Select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            aria-label="Filtrer par santé"
            className="w-[110px] shrink-0"
          >
            {["Santé", "Vert", "Orange", "Rouge"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
          <Select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            aria-label="Filtrer par phase"
            className="w-[150px] shrink-0"
          >
            {["Phase", ...PHASE_SPLIT.map((p) => p.phase)].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
          <Select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            aria-label="Filtrer par client"
            className="w-[130px] shrink-0"
          >
            {["Client", ...clients].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {rows.length} / {PROJECTS.length} projets
          </span>
        </div>

        {/* Tableau complet */}
        <Card className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto scrollbar-thin">
            <table className="w-full min-w-[1180px] text-[11px]">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  {COLUMNS.map((c) => (
                    <th
                      key={c.label || "actions"}
                      className="whitespace-nowrap px-2.5 py-2 font-medium first:pl-3.5 last:pr-3.5"
                    >
                      {c.key ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key!)}
                          className={`flex items-center gap-1 transition-colors hover:text-foreground ${
                            sort.key === c.key ? "font-semibold text-[#0E7C52]" : ""
                          }`}
                        >
                          {c.label}
                          {sort.key === c.key ? (
                            <span aria-hidden>{sort.desc ? "↓" : "↑"}</span>
                          ) : null}
                        </button>
                      ) : (
                        c.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const health = HEALTH_META[p.health];
                  const open = () => router.push(`/projet/${p.id}`);
                  return (
                    <tr
                      key={p.id}
                      onClick={open}
                      className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-[#FCFCFD]"
                    >
                      <td className="py-2 pl-3.5 pr-2.5">
                        <span className="flex items-start gap-2">
                          <Dot color={health.color} className="mt-1" />
                          <span className="leading-tight">
                            <span className="block font-semibold text-foreground">{p.id}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {p.name}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">{p.client}</td>
                      <td className="px-2.5 py-2">
                        <span className="flex items-center gap-1.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8FBF1] text-[9px] font-bold text-[#0E7C52]">
                            {p.managerInitials}
                          </span>
                          <span className="text-foreground">{p.manager}</span>
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-[#3976D3]">{p.phase}</td>
                      <td className="whitespace-nowrap px-2.5 py-2 tabular-nums text-muted-foreground">
                        {p.sop}
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-2 tabular-nums text-muted-foreground">
                        {formatNumber(p.workload)} h
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="block tabular-nums text-foreground">{p.planned} %</span>
                        <ProgressBar value={p.planned} color="#3976D3" className="mt-1 w-14" />
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="block tabular-nums text-foreground">{p.actual} %</span>
                        <ProgressBar value={p.actual} color="#16A46B" className="mt-1 w-14" />
                      </td>
                      <td
                        className={`px-2.5 py-2 font-semibold tabular-nums ${
                          p.spi < 1 ? "text-[#D92D20]" : "text-[#2E7D32]"
                        }`}
                      >
                        {p.spi.toFixed(3).replace(".", ",")}
                      </td>
                      <td
                        className={`px-2.5 py-2 font-semibold tabular-nums ${
                          p.overdueActions > 0 ? "text-[#D92D20]" : "text-[#2E7D32]"
                        }`}
                      >
                        {p.overdueActions}
                      </td>
                      <td
                        className={`px-2.5 py-2 font-semibold tabular-nums ${
                          p.readiness < 50
                            ? "text-[#D92D20]"
                            : p.readiness < 80
                              ? "text-[#E58A00]"
                              : "text-[#2E7D32]"
                        }`}
                      >
                        {p.readiness} %
                      </td>
                      <td
                        className={`whitespace-nowrap px-2.5 py-2 font-semibold tabular-nums ${
                          p.driftDays > 0 ? "text-[#D92D20]" : "text-[#2E7D32]"
                        }`}
                      >
                        {p.driftDays > 0 ? `+${p.driftDays} j` : "à l'heure"}
                      </td>
                      <td className="px-2.5 py-2">
                        <Chip tone={health.tone}>
                          <Dot color={health.color} />
                          {health.label}
                        </Chip>
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-2 font-medium text-[#0E7C52]">
                        {p.nextGate}
                      </td>
                      <td className="py-2 pl-2.5 pr-3.5">
                        <Button
                          className="px-2 py-1 text-[11px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            open();
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Voir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-3.5 py-10 text-center text-muted-foreground">
                      Aucun projet ne correspond aux filtres.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
