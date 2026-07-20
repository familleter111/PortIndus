"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Eye,
  Flag,
  Gauge,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { KpiCard, PageTitle } from "@/components/shared/page-parts";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  Dot,
  Panel,
} from "@/components/ui/primitives";
import {
  CAPACITY_ROWS,
  CAPACITY_TOTAL,
  HEALTH_SPLIT,
  PORTFOLIO_KPIS,
  PROJECTS,
  type Health,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const KPI_ICONS: Record<string, React.ReactNode> = {
  trend: <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />,
  target: <Target className="h-3.5 w-3.5 text-muted-foreground" />,
  gauge: <Gauge className="h-3.5 w-3.5 text-muted-foreground" />,
  flag: <Flag className="h-3.5 w-3.5 text-[#D92D20]" />,
  clock: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  shield: <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />,
  users: <Users className="h-3.5 w-3.5 text-muted-foreground" />,
  star: <Star className="h-3.5 w-3.5 text-[#16A46B]" />,
};

/** Géométrie du tableau projets : deux lignes de texte + padding, et l'en-tête. */
const TABLE_ROW_H = 42;
const TABLE_HEAD_H = 31;

const HEALTH_META: Record<Health, { label: string; color: string; tone: "green" | "amber" | "red" }> = {
  green: { label: "Vert", color: "#2E7D32", tone: "green" },
  orange: { label: "Orange", color: "#E58A00", tone: "amber" },
  red: { label: "Rouge", color: "#D92D20", tone: "red" },
};

/**
 * Planned-vs-actual bars, one pair per project. Laid out with plain flexbox so
 * the project labels stay locked to their rows at any panel height.
 */
function ProgressByProject() {
  // Les cinq projets les plus en retard sur leur plan : au-delà, les barres
  // deviennent illisibles et la liste complète est sur l'écran « Projets ».
  const shown = [...PROJECTS].sort((a, b) => a.actual - a.planned - (b.actual - b.planned)).slice(0, 5);

  return (
    <div className="flex h-full flex-col justify-between pb-1">
      {shown.map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          <div className="w-[104px] shrink-0 leading-tight">
            <p className="text-[11px] font-semibold text-foreground">{p.id}</p>
            <p className="truncate text-[10px] text-muted-foreground">{p.name}</p>
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            {[
              { value: p.planned, color: "#3976D3" },
              { value: p.actual, color: "#16A46B" },
            ].map((b) => (
              <div key={b.color} className="flex items-center gap-1.5">
                <span
                  className="h-[11px] rounded-[3px]"
                  style={{ width: `${b.value}%`, backgroundColor: b.color }}
                />
                <span className="text-[10px] font-medium tabular-nums text-foreground">
                  {b.value} %
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Axis */}
      <div className="ml-[116px] flex justify-between border-t border-border pt-1 text-[10px] text-muted-foreground">
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <span key={t}>{t}%</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Recommandation de rééquilibrage, déduite du tableau juste au-dessus plutôt
 * qu'écrite en dur : la fonction en dépassement, les heures à replacer et les
 * fonctions capables de les absorber sortent tous de CAPACITY_ROWS. Si la
 * charge change, le conseil change avec elle — il ne peut pas la contredire.
 */
function CapacityAdvice() {
  const advice = React.useMemo(() => {
    const over = CAPACITY_ROWS.filter((r) => r.load > r.capacity).sort(
      (a, b) => b.ratio - a.ratio,
    );
    if (over.length === 0) return null;

    const worst = over[0];
    const excess = worst.load - worst.capacity;

    // Donneurs possibles : marge disponible, du plus large au plus étroit.
    const donors = CAPACITY_ROWS.filter((r) => r.capacity - r.load > 0)
      .map((r) => ({ fn: r.fn, spare: r.capacity - r.load }))
      .sort((a, b) => b.spare - a.spare);

    // On ne retient que les donneurs nécessaires pour couvrir le dépassement.
    const picked: typeof donors = [];
    let covered = 0;
    for (const d of donors) {
      if (covered >= excess) break;
      picked.push(d);
      covered += d.spare;
    }

    return { worst, excess, picked, covered, enough: covered >= excess };
  }, []);

  if (!advice) return null;

  return (
    <div className="mt-2 rounded-lg border border-[#BFEFD5] bg-[#F1FCF6] p-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#0E7C52]">
        <Sparkles className="h-3.5 w-3.5" />
        Recommandation
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        <span className="font-semibold text-foreground">{advice.worst.fn}</span> dépasse sa
        capacité de{" "}
        <span className="font-semibold text-[#D92D20]">
          {formatNumber(advice.excess)} h
        </span>{" "}
        ({advice.worst.ratio} %). {advice.enough ? "Le portefeuille " : "Les autres fonctions "}
        {advice.enough
          ? `garde ${formatNumber(CAPACITY_TOTAL.capacity - CAPACITY_TOTAL.load)} h de marge globale`
          : "ne couvrent que partiellement le besoin"}
        .
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {advice.picked.map((d) => (
          <li key={d.fn} className="flex items-center gap-1.5 text-[10px]">
            <ArrowRight className="h-3 w-3 shrink-0 text-[#16A46B]" />
            <span className="text-muted-foreground">
              Transférer vers {advice.worst.fn} depuis{" "}
              <span className="font-semibold text-foreground">{d.fn}</span> — marge{" "}
              <span className="tabular-nums">{formatNumber(d.spare)} h</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[10px] italic text-muted-foreground">
        Suggestion automatique — à arbitrer avec les responsables de fonction.
      </p>
    </div>
  );
}

export default function PortefeuillePage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        {/* L'assistant de création reste accessible depuis « Vue projet ». */}
        <PageTitle
          title="Vue globale portefeuille projets"
          subtitle="Pilotage consolidé APQP"
        />

        {/* KPI row — le nombre de colonnes suit la liste, il n'est pas figé. */}
        <div
          className="grid shrink-0 gap-2.5"
          style={{ gridTemplateColumns: `repeat(${PORTFOLIO_KPIS.length}, minmax(0, 1fr))` }}
        >
          {PORTFOLIO_KPIS.map((kpi) => (
            <KpiCard
              key={kpi.label}
              icon={KPI_ICONS[kpi.icon]}
              label={kpi.label}
              value={kpi.value}
              tone={kpi.tone}
            />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          <Panel title="Avancement par projet (%)" className="relative col-span-5"
            action={
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Dot color="#3976D3" /> Planifié
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Dot color="#16A46B" /> Réel
                </span>
              </div>
            }
          >
            <ProgressByProject />
          </Panel>

          <Panel title="Santé portefeuille" className="col-span-4">
            <div className="flex h-full items-center">
              <div className="relative h-full min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={HEALTH_SPLIT}
                      dataKey="value"
                      innerRadius="58%"
                      outerRadius="88%"
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={1}
                      stroke="none"
                    >
                      {HEALTH_SPLIT.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-bold leading-none text-foreground">3</span>
                  <span className="text-[11px] text-muted-foreground">projets</span>
                </div>
              </div>
              <ul className="w-[112px] shrink-0 space-y-2">
                {HEALTH_SPLIT.map((s) => (
                  <li key={s.name} className="flex items-center gap-2 text-[11px]">
                    <Dot color={s.color} />
                    <span className="text-foreground">{s.name}</span>
                    <span className="ml-auto text-muted-foreground">
                      {s.value} ({s.pct} %)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel title="Charge / Capacité par fonction" className="col-span-3" bodyClassName="px-0">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3.5 py-1.5 font-medium">Fonction</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Charge</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Capacité</th>
                  <th className="px-3.5 py-1.5 text-right font-medium">Charge / Capacité</th>
                </tr>
              </thead>
              <tbody>
                {CAPACITY_ROWS.map((r) => (
                  <tr key={r.fn} className="border-b border-border/60">
                    <td className="px-3.5 py-[5px] text-foreground">{r.fn}</td>
                    <td className="py-[5px] pr-2 text-right tabular-nums text-muted-foreground">
                      {formatNumber(r.load)} h
                    </td>
                    <td className="py-[5px] pr-2 text-right tabular-nums text-muted-foreground">
                      {formatNumber(r.capacity)} h
                    </td>
                    <td className="px-3.5 py-[5px] text-right">
                      <span
                        className="inline-block w-full rounded-[3px] py-[2px] text-center font-semibold tabular-nums"
                        style={{
                          backgroundColor: `${r.color}14`,
                          color: r.color,
                        }}
                      >
                        {r.ratio} %
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="px-3.5 py-[5px] text-foreground">Total</td>
                  <td className="py-[5px] pr-2 text-right tabular-nums text-foreground">
                    {formatNumber(CAPACITY_TOTAL.load)} h
                  </td>
                  <td className="py-[5px] pr-2 text-right tabular-nums text-foreground">
                    {formatNumber(CAPACITY_TOTAL.capacity)} h
                  </td>
                  <td className="px-3.5 py-[5px] text-right tabular-nums text-foreground">
                    {CAPACITY_TOTAL.ratio} %
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => router.push("/planning")}
              className="mt-2 flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-[#0E7C52] hover:underline"
            >
              <Eye className="h-3.5 w-3.5" />
              Voir surcharge capacité
            </button>

            <CapacityAdvice />
          </Panel>
        </div>

        {/*
          Projects table — cinq lignes visibles, le reste au défilement. La
          hauteur est calculée depuis la hauteur de ligne réelle plutôt que
          fixée à l'œil : elle reste juste si une ligne change de gabarit.
        */}
        <Card className="shrink-0 overflow-hidden">
          <div
            className="overflow-y-auto scrollbar-thin"
            style={{ maxHeight: `${TABLE_HEAD_H + 5 * TABLE_ROW_H}px` }}
          >
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-left text-muted-foreground">
                {[
                  "Projet", "Client", "Chef de projet", "Phase actuelle", "SOP (prévision)",
                  "Charge totale", "Planifié", "Réel", "SPI", "Actions en retard",
                  "Readiness", "Santé", "Prochaine gate",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2.5 py-2 font-medium first:pl-3.5 last:pr-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map((p) => {
                const health = HEALTH_META[p.health];
                return (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/projet/${p.id}`)}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-[#FCFCFD]"
                  >
                    <td className="py-2 pl-3.5 pr-2.5">
                      <span className="flex items-start gap-2">
                        <Dot color={health.color} className="mt-1" />
                        <span className="leading-tight">
                          <span className="block font-semibold text-foreground">{p.id}</span>
                          <span className="block text-[10px] text-muted-foreground">{p.name}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-2.5 py-2 text-muted-foreground">{p.client}</td>
                    <td className="px-2.5 py-2">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8FBF1] text-[9px] font-bold text-[#0E7C52]">
                          {p.managerInitials}
                        </span>
                        {p.manager}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 font-medium text-[#3976D3]">{p.phase}</td>
                    <td className="px-2.5 py-2 tabular-nums text-foreground">{p.sop}</td>
                    <td className="px-2.5 py-2 tabular-nums text-foreground">
                      {formatNumber(p.workload)} h
                    </td>
                    <td className="px-2.5 py-2">
                      <span className="block font-semibold text-foreground">{p.planned} %</span>
                      <ProgressBar value={p.planned} color="#3976D3" className="mt-1 w-16" />
                    </td>
                    <td className="px-2.5 py-2">
                      <span className="block font-semibold text-foreground">{p.actual} %</span>
                      <ProgressBar value={p.actual} color="#16A46B" className="mt-1 w-16" />
                    </td>
                    <td className={`px-2.5 py-2 font-semibold tabular-nums ${p.spi < 1 ? "text-[#D92D20]" : "text-[#2E7D32]"}`}>
                      {p.spi.toFixed(3).replace(".", ",")}
                    </td>
                    <td className={`px-2.5 py-2 text-center font-semibold tabular-nums ${p.overdueActions > 0 ? "text-[#D92D20]" : "text-[#2E7D32]"}`}>
                      {p.overdueActions}
                    </td>
                    <td className={`px-2.5 py-2 font-semibold tabular-nums ${p.readiness < 50 ? "text-[#D92D20]" : p.readiness < 80 ? "text-[#E58A00]" : "text-[#2E7D32]"}`}>
                      {p.readiness} %
                    </td>
                    <td className="px-2.5 py-2">
                      <Chip tone={health.tone}>
                        <Dot color={health.color} />
                        {health.label}
                      </Chip>
                    </td>
                    <td className="py-2 pl-2.5 pr-3.5 font-medium text-[#0E7C52]">{p.nextGate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid shrink-0 grid-cols-4 gap-2.5">
          <Button onClick={() => router.push("/projet")}>
            <Eye className="h-4 w-4" />
            Voir les projets
          </Button>
          <Button onClick={() => router.push("/planning")}>
            <Users className="h-4 w-4" />
            Analyser charge
          </Button>
          <Button onClick={() => router.push("/execution")}>
            <TrendingUp className="h-4 w-4" />
            Analyser exécution
          </Button>
          <Button onClick={() => router.push("/projet")}>
            <AlertTriangle className="h-4 w-4" />
            Afficher les projets à risque
          </Button>
        </div>

      </div>
    </AppShell>
  );
}
