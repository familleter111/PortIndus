"use client";

import * as React from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Flag,
  FolderClosed,
  Gauge,
  Layers,
  LineChart,
  ShieldCheck,
  Tag,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/app-shell";
import { InfoStrip, KpiCard, PageTitle } from "@/components/shared/page-parts";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  Dot,
  Panel,
} from "@/components/ui/primitives";
import {
  ACTION_SPLIT,
  APQP_GATES,
  DELIVERABLES,
  S_CURVE,
  capacityFor,
  capacityTotalFor,
  gateFor,
  issuesFor,
  kpisFor,
  projectById,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const KPI_ICONS: Record<string, React.ReactNode> = {
  gauge: <Gauge className="h-3.5 w-3.5 text-muted-foreground" />,
  target: <Target className="h-3.5 w-3.5 text-muted-foreground" />,
  trend: <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />,
  clock: <Clock className="h-3.5 w-3.5 text-[#D92D20]" />,
  check: <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D32]" />,
  alert: <AlertTriangle className="h-3.5 w-3.5 text-[#E58A00]" />,
  users: <Users className="h-3.5 w-3.5 text-muted-foreground" />,
  shield: <ShieldCheck className="h-3.5 w-3.5 text-[#E58A00]" />,
};

const HEALTH_META = {
  green: { label: "Vert", color: "#2E7D32" },
  orange: { label: "Orange", color: "#E58A00" },
  red: { label: "Rouge", color: "#D92D20" },
} as const;

const DELIVERABLE_TONE: Record<string, "green" | "amber" | "blue"> = {
  Approuvé: "green",
  "En cours": "amber",
  "En revue": "blue",
};

const TABS = ["Synthèse", "Planning", "Exécution", "Livrables"];

export default function ProjetPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const PROJECT = projectById(decodeURIComponent(params.id));
  if (!PROJECT) notFound();

  // Tout le tableau de bord découle du projet ouvert : rien n'est figé sur un
  // projet en particulier.
  const PROJECT_GATE = gateFor(PROJECT);
  const PROJECT_KPIS = kpisFor(PROJECT);
  const PROJECT_ISSUES = issuesFor(PROJECT);
  const PROJECT_CAPACITY = capacityFor(PROJECT);
  const PROJECT_CAPACITY_TOTAL = capacityTotalFor(PROJECT_CAPACITY);

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-2.5">
        <PageTitle
          title="Vue projet — Dashboard chef de projet"
          subtitle="Pilotage détaillé du projet APQP"
        />

        <InfoStrip
          items={[
            { icon: <Tag className="h-4 w-4 text-muted-foreground" />, label: "Code projet", value: PROJECT.id },
            { icon: <FileText className="h-4 w-4 text-muted-foreground" />, label: "Nom du projet", value: PROJECT.name },
            { icon: <Building2 className="h-4 w-4 text-muted-foreground" />, label: "Client", value: PROJECT.client },
            { icon: <Layers className="h-4 w-4 text-muted-foreground" />, label: "Phase actuelle", value: <span className="text-[#3976D3]">{PROJECT.phase}</span> },
            // La santé suit le projet ouvert : « Orange » en dur affichait la
            // mauvaise couleur sur un projet vert ou rouge.
            {
              icon: <Dot color={HEALTH_META[PROJECT.health].color} className="h-3 w-3" />,
              label: "Santé projet",
              value: (
                <span style={{ color: HEALTH_META[PROJECT.health].color }}>
                  {HEALTH_META[PROJECT.health].label}
                </span>
              ),
            },
            { icon: <UserRound className="h-4 w-4 text-muted-foreground" />, label: "Chef de projet", value: PROJECT.manager },
            { icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />, label: "SOP", value: PROJECT.sop },
          ]}
        />

        {/* Gate strip */}
        <Card className="shrink-0 overflow-hidden border-[#BFEFD5] bg-[#F1FCF6]">
          <div className="flex divide-x divide-[#BFEFD5]">
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <Flag className="h-4 w-4 text-[#0E7C52]" />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">Prochaine gate</p>
                <p className="text-[15px] font-bold text-[#0E7C52]">{PROJECT_GATE.next}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">Baseline</p>
                <p className="text-[13px] font-semibold text-foreground">{PROJECT_GATE.baseline}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">Forecast</p>
                <p className="text-[13px] font-semibold text-foreground">{PROJECT_GATE.forecast}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">Dérive</p>
                <p className={`text-[13px] font-semibold ${PROJECT_GATE.onTime ? "text-[#2E7D32]" : "text-[#D92D20]"}`}>
                  {PROJECT_GATE.drift}
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <RadialGauge value={PROJECT_GATE.readiness} />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">
                  Readiness {APQP_GATES[PROJECT.gateIndex]?.id ?? ""}
                </p>
                <p className="text-[15px] font-bold text-foreground">{PROJECT_GATE.readiness} %</p>
              </div>
            </div>
          </div>
        </Card>

        {/* KPIs — le nombre de colonnes suit la liste, il n'est pas figé. */}
        <div
          className="grid shrink-0 gap-2.5"
          style={{ gridTemplateColumns: `repeat(${PROJECT_KPIS.length}, minmax(0, 1fr))` }}
        >
          {PROJECT_KPIS.map((kpi) => (
            <KpiCard
              key={kpi.label}
              icon={KPI_ICONS[kpi.icon]}
              label={kpi.label}
              value={kpi.value}
              note={kpi.note}
              tone={kpi.tone}
            />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-5 border-b border-border">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`flex items-center gap-1.5 border-b-2 pb-2 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "border-[#16A46B] text-[#0E7C52]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {i === 0 ? <CalendarDays className="h-3.5 w-3.5" /> : null}
              {i === 1 ? <FolderClosed className="h-3.5 w-3.5" /> : null}
              {i === 2 ? <LineChart className="h-3.5 w-3.5" /> : null}
              {i === 3 ? <FileText className="h-3.5 w-3.5" /> : null}
              {tab}
            </button>
          ))}
        </div>

        {/* Band 1 */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          <Panel
            title="Planifié vs Réel (courbe en S)"
            className="col-span-4"
            action={
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-[2px] w-3 rounded bg-[#3976D3]" /> Planifié
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-[2px] w-3 rounded bg-[#16A46B]" /> Réel
                </span>
              </div>
            }
          >
            <div className="h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={S_CURVE} margin={{ top: 6, right: 30, bottom: 0, left: -14 }}>
                  <CartesianGrid stroke="#F2F4F7" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: "#667085" }}
                    axisLine={{ stroke: "#EAECF0" }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(v) => `${v} %`}
                    tick={{ fontSize: 9, fill: "#667085" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke="#3976D3"
                    strokeWidth={1.8}
                    strokeDasharray="4 3"
                    dot={{ r: 1.8, fill: "#3976D3", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#16A46B"
                    strokeWidth={1.8}
                    dot={{ r: 1.8, fill: "#16A46B", strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Statut des actions" className="col-span-3">
            <div className="flex h-full items-center">
              <div className="relative h-full min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ACTION_SPLIT}
                      dataKey="value"
                      innerRadius="60%"
                      outerRadius="88%"
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={1}
                      stroke="none"
                    >
                      {ACTION_SPLIT.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[20px] font-bold leading-none text-foreground">43</span>
                  <span className="text-[10px] text-muted-foreground">actions</span>
                </div>
              </div>
              <ul className="w-[104px] shrink-0 space-y-2">
                {ACTION_SPLIT.map((s) => (
                  <li key={s.name} className="flex items-center gap-1.5 text-[11px]">
                    <Dot color={s.color} />
                    <span className="text-foreground">{s.name}</span>
                    <span className="ml-auto whitespace-nowrap text-muted-foreground">
                      {s.value} ({s.pct} %)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/*
            Un sujet par ligne : le constat, ce qu'il fait courir, et la décision
            attendue. Les trois panneaux précédents découpaient ces trois faces
            en trois listes séparées, qui redisaient les mêmes trois problèmes.
          */}
          <Panel
            title="Alertes & décisions attendues"
            action={
              <span className="text-[11px] text-muted-foreground">
                {PROJECT_ISSUES.length} sujet{PROJECT_ISSUES.length > 1 ? "s" : ""} ouvert
                {PROJECT_ISSUES.length > 1 ? "s" : ""}
              </span>
            }
            className="col-span-5"
          >
            {PROJECT_ISSUES.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-1 py-6">
                <CheckCircle2 className="h-7 w-7 text-[#2E7D32]" />
                <p className="text-[12px] font-semibold text-foreground">
                  Aucun sujet ouvert
                </p>
                <p className="text-center text-[11px] text-muted-foreground">
                  Le projet est à l&apos;heure, sans action en retard ni surcharge.
                </p>
              </div>
            ) : null}

            <ul className="space-y-2">
              {PROJECT_ISSUES.map((issue) => {
                const critical = issue.level === "Critique";
                return (
                  <li
                    key={issue.id}
                    className="rounded-lg border border-border px-2.5 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                          critical ? "text-[#D92D20]" : "text-[#E58A00]"
                        }`}
                      />
                      <div className="min-w-0 flex-1 leading-snug">
                        <p className="text-[12px] font-semibold text-foreground">
                          {issue.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{issue.detail}</p>
                      </div>
                      <Chip tone={critical ? "red" : "amber"}>{issue.level}</Chip>
                    </div>

                    <p className="mt-1 pl-[22px] text-[10px] leading-snug text-muted-foreground">
                      <span className="font-medium text-[#D92D20]">Risque</span> —{" "}
                      {issue.risk}
                    </p>

                    <p className="mt-1 flex items-start gap-1.5 pl-[22px] text-[11px] leading-snug">
                      <ArrowRight className="mt-px h-3 w-3 shrink-0 text-[#16A46B]" />
                      <span className="text-foreground">
                        <span className="font-semibold">Décision attendue :</span>{" "}
                        {issue.decision}
                        {issue.due ? (
                          <span className="font-semibold text-[#0E7C52]">
                            {" "}
                            avant le {issue.due}
                          </span>
                        ) : null}
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        {/* Band 2 */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          <Panel title="Parcours des gates APQP" className="col-span-5">
            <div className="flex h-full flex-col justify-center">
              <div className="flex items-start">
                {APQP_GATES.map((g, i) => {
                  const done = i < PROJECT.gateIndex;
                  const current = i === PROJECT.gateIndex;
                  return (
                    <div key={g.id} className="flex min-w-0 flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <span
                          className={`h-[2px] flex-1 ${i === 0 ? "bg-transparent" : done || current ? "bg-[#2E7D32]" : "bg-border"}`}
                        />
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                            current
                              ? "border-[#16A46B] bg-white text-[#0E7C52]"
                              : done
                                ? "border-[#2E7D32] bg-white text-[#2E7D32]"
                                : "border-border bg-white text-muted-foreground"
                          }`}
                        >
                          {g.id}
                        </span>
                        <span
                          className={`h-[2px] flex-1 ${i === APQP_GATES.length - 1 ? "bg-transparent" : done ? "bg-[#2E7D32]" : "bg-border"}`}
                        />
                      </div>
                      <p className="mt-1.5 px-1 text-center text-[9px] leading-tight text-muted-foreground">
                        {g.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mx-auto mt-3 rounded-md bg-[#E8FBF1] px-3 py-1.5 text-[11px] text-foreground">
                Forecast {APQP_GATES[PROJECT.gateIndex]?.id ?? ""} :{" "}
                <span className="font-semibold">{PROJECT_GATE.forecast}</span>
                <span className="mx-2 text-border">|</span>
                Dérive :{" "}
                <span className={`font-semibold ${PROJECT_GATE.onTime ? "text-[#2E7D32]" : "text-[#D92D20]"}`}>
                  {PROJECT_GATE.drift}
                </span>
              </div>
            </div>
          </Panel>

          <Panel title="Livrables clés" className="col-span-3" bodyClassName="px-0">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-3.5 pb-1.5 font-medium">&nbsp;</th>
                  <th className="pb-1.5 font-medium">Statut</th>
                  <th className="px-3.5 pb-1.5 font-medium">Avancement</th>
                </tr>
              </thead>
              <tbody>
                {DELIVERABLES.map((d) => (
                  <tr key={d.name}>
                    <td className="px-3.5 py-[7px] font-medium text-foreground">{d.name}</td>
                    <td className="py-[7px]">
                      <Chip tone={DELIVERABLE_TONE[d.status]}>{d.status}</Chip>
                    </td>
                    <td className="px-3.5 py-[7px]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-8 text-right tabular-nums text-foreground">
                          {d.progress} %
                        </span>
                        <ProgressBar
                          value={d.progress}
                          color={d.progress === 100 ? "#2E7D32" : "#E58A00"}
                          className="w-14"
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {/* Même lecture que le portefeuille, mais chiffrée sur ce projet :
              c'est elle qui explique l'alerte « Charge Qualité » ci-dessus. */}
          <Panel
            title="Charge / Capacité par fonction"
            action={
              <span className="text-[11px] text-muted-foreground">{PROJECT.id}</span>
            }
            className="col-span-4"
            bodyClassName="px-0"
          >
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
                {PROJECT_CAPACITY.map((r) => (
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
                        style={{ backgroundColor: `${r.color}14`, color: r.color }}
                      >
                        {r.ratio} %
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="px-3.5 py-[5px] text-foreground">Total</td>
                  <td className="py-[5px] pr-2 text-right tabular-nums text-foreground">
                    {formatNumber(PROJECT_CAPACITY_TOTAL.load)} h
                  </td>
                  <td className="py-[5px] pr-2 text-right tabular-nums text-foreground">
                    {formatNumber(PROJECT_CAPACITY_TOTAL.capacity)} h
                  </td>
                  <td className="px-3.5 py-[5px] text-right tabular-nums text-foreground">
                    {PROJECT_CAPACITY_TOTAL.ratio} %
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => router.push("/planning/charge")}
              className="mt-2 flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-[#0E7C52] hover:underline"
            >
              <Eye className="h-3.5 w-3.5" />
              Voir la charge par service
            </button>
          </Panel>
        </div>

        {/* Footer actions — la création de projet n'est pas ici : elle a un
            point d'entrée unique, la liste des projets. */}
        <div className="grid shrink-0 grid-cols-3 gap-2.5">
          <Button onClick={() => router.push("/planning")}>
            <CalendarDays className="h-4 w-4" />
            Ouvrir le planning
          </Button>
          <Button onClick={() => router.push("/execution")}>
            <LineChart className="h-4 w-4" />
            Piloter l&apos;exécution
          </Button>
          <Button onClick={() => router.push("/projet")}>
            <FolderClosed className="h-4 w-4" />
            Retour aux projets
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

/** Small donut used for the gate readiness indicator. */
function RadialGauge({ value }: { value: number }) {
  const r = 13;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 -rotate-90">
      <circle cx="16" cy="16" r={r} fill="none" stroke="#F2F4F7" strokeWidth="5" />
      <circle
        cx="16"
        cy="16"
        r={r}
        fill="none"
        stroke="#16A46B"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
      />
    </svg>
  );
}
