"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  FolderClosed,
  Gauge,
  Layers,
  LineChart,
  Plus,
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
  CRITICAL_ALERTS,
  DELIVERABLES,
  PROJECT,
  PROJECT_ALERTS,
  PROJECT_DECISIONS,
  PROJECT_GATE,
  PROJECT_KPIS,
  S_CURVE,
} from "@/lib/data";

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

const DELIVERABLE_TONE: Record<string, "green" | "amber" | "blue"> = {
  Approuvé: "green",
  "En cours": "amber",
  "En revue": "blue",
};

const TABS = ["Synthèse", "Planning", "Exécution", "Livrables"];

export default function ProjetPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-2.5">
        <PageTitle
          title="Vue projet — Dashboard chef de projet"
          subtitle="Pilotage détaillé du projet APQP"
          action={
            <Button>
              <UserRound className="h-4 w-4" />
              Chef de projet
            </Button>
          }
        />

        <InfoStrip
          items={[
            { icon: <Tag className="h-4 w-4 text-muted-foreground" />, label: "Code projet", value: PROJECT.id },
            { icon: <FileText className="h-4 w-4 text-muted-foreground" />, label: "Nom du projet", value: PROJECT.name },
            { icon: <Building2 className="h-4 w-4 text-muted-foreground" />, label: "Client", value: PROJECT.client },
            { icon: <Layers className="h-4 w-4 text-muted-foreground" />, label: "Phase actuelle", value: <span className="text-[#3976D3]">{PROJECT.phase}</span> },
            { icon: <Dot color="#E58A00" className="h-3 w-3" />, label: "Santé projet", value: <span className="text-[#E58A00]">Orange</span> },
            { icon: <UserRound className="h-4 w-4 text-muted-foreground" />, label: "Chef de projet", value: PROJECT.manager },
            { icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />, label: "SOP", value: PROJECT.sop },
          ]}
        />

        {/* Gate strip */}
        <Card className="shrink-0 overflow-hidden border-[#F0DFC4] bg-[#FEFAF3]">
          <div className="flex divide-x divide-[#F0DFC4]">
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <Flag className="h-4 w-4 text-[#B45F09]" />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">Prochaine gate</p>
                <p className="text-[15px] font-bold text-[#B45F09]">{PROJECT_GATE.next}</p>
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
                <p className="text-[13px] font-semibold text-[#D92D20]">{PROJECT_GATE.drift}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
              <RadialGauge value={PROJECT_GATE.readiness} />
              <div className="leading-tight">
                <p className="text-[11px] text-muted-foreground">Readiness G3</p>
                <p className="text-[15px] font-bold text-foreground">{PROJECT_GATE.readiness} %</p>
              </div>
            </div>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid shrink-0 grid-cols-8 gap-2.5">
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
                  ? "border-[#E58A00] text-[#B45F09]"
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
                  <span className="h-[2px] w-3 rounded bg-[#E58A00]" /> Réel
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
                    stroke="#E58A00"
                    strokeWidth={1.8}
                    dot={{ r: 1.8, fill: "#E58A00", strokeWidth: 0 }}
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

          <Panel title="Alertes projet" className="col-span-3">
            <ul className="space-y-2.5">
              {PROJECT_ALERTS.map((a) => (
                <li key={a.title} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D92D20]" />
                  <div className="min-w-0 flex-1 leading-snug">
                    <p className="text-[12px] font-semibold text-foreground">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-medium ${
                      a.level === "Critique" ? "text-[#D92D20]" : "text-[#E58A00]"
                    }`}
                  >
                    {a.level}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Décisions attendues" className="col-span-2">
            <ol className="space-y-2.5">
              {PROJECT_DECISIONS.map((d, i) => (
                <li key={d} className="flex items-start gap-2">
                  <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <p className="text-[11px] leading-snug text-foreground">{d}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* Band 2 */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          <Panel title="Parcours des gates APQP" className="col-span-5">
            <div className="flex h-full flex-col justify-center">
              <div className="flex items-start">
                {APQP_GATES.map((g, i) => {
                  const done = i < 3;
                  const current = i === 3;
                  return (
                    <div key={g.id} className="flex min-w-0 flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <span
                          className={`h-[2px] flex-1 ${i === 0 ? "bg-transparent" : done || current ? "bg-[#2E7D32]" : "bg-border"}`}
                        />
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                            current
                              ? "border-[#E58A00] bg-white text-[#B45F09]"
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
              <div className="mx-auto mt-3 rounded-md bg-[#FDF4E7] px-3 py-1.5 text-[11px] text-foreground">
                Forecast G3 : <span className="font-semibold">{PROJECT_GATE.forecast}</span>
                <span className="mx-2 text-border">|</span>
                Dérive : <span className="font-semibold text-[#D92D20]">{PROJECT_GATE.drift}</span>
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

          <Panel title="Alertes critiques" className="col-span-2">
            <ul className="space-y-2">
              {CRITICAL_ALERTS.map((a) => (
                <li key={a} className="flex items-start gap-2">
                  <Dot color="#D92D20" className="mt-1.5" />
                  <p className="text-[11px] leading-snug text-foreground">{a}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Parcours & redirections" className="col-span-2">
            <ol className="space-y-2">
              {[
                { a: "Ouvrir le planning", t: "ouvre “Planning détaillé — Risques & conflits”." },
                { a: "Piloter l'exécution", t: "ouvre “Suivi d'exécution & éléments justificatifs”." },
                { a: "Retour portefeuille", t: "ouvre “Vue globale portefeuille projets”." },
                { a: "Créer un projet", t: "ouvre “Créer un nouveau projet — Étape 1/3”." },
              ].map((h, i) => (
                <li key={h.a} className="flex items-start gap-2">
                  <span className="mt-px flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border border-[#F0DFC4] bg-[#FDF4E7] text-[9px] font-bold text-[#B45F09]">
                    {i + 1}
                  </span>
                  <p className="text-[10px] leading-snug text-muted-foreground">
                    Cliquer sur <span className="font-semibold text-foreground">“{h.a}”</span>
                    <br />
                    <span className="text-[#B45F09]">→ {h.t}</span>
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* Footer actions */}
        <div className="grid shrink-0 grid-cols-4 gap-2.5">
          <Button onClick={() => router.push("/planning")}>
            <CalendarDays className="h-4 w-4" />
            Ouvrir le planning
          </Button>
          <Button onClick={() => router.push("/execution")}>
            <LineChart className="h-4 w-4" />
            Piloter l&apos;exécution
          </Button>
          <Button onClick={() => router.push("/portefeuille")}>
            <FolderClosed className="h-4 w-4" />
            Retour portefeuille
          </Button>
          <Button variant="primary" onClick={() => router.push("/nouveau-projet/etape-1")}>
            <Plus className="h-4 w-4" />
            Créer un projet
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
        stroke="#E58A00"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
      />
    </svg>
  );
}
