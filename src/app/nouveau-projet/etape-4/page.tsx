"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronLeft,
  Clock,
  Diamond,
  Eye,
  FileText,
  Flag,
  Gauge,
  Hash,
  ListChecks,
  Package,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle } from "@/components/shared/page-parts";
import { WizardSteps } from "@/components/shared/wizard-steps";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Dot,
  Panel,
} from "@/components/ui/primitives";
import {
  GENERATED_CONTENT,
  GENERATED_GATES,
  GENERATED_PLAN,
  GENERATED_STATS,
  NEW_PROJECT,
  NEW_PROJECT_FUNCTIONS,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const STAT_ICONS: Record<string, React.ReactNode> = {
  flag: <Flag className="h-5 w-5 text-[#E58A00]" />,
  list: <ListChecks className="h-5 w-5 text-muted-foreground" />,
  users: <Users className="h-5 w-5 text-muted-foreground" />,
  team: <Users className="h-5 w-5 text-muted-foreground" />,
  clock: <Clock className="h-5 w-5 text-muted-foreground" />,
  gauge: <Gauge className="h-5 w-5 text-muted-foreground" />,
};

const CONTENT_ICONS: Record<string, React.ReactNode> = {
  list: <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />,
  diamond: <Diamond className="h-3.5 w-3.5 text-[#16A46B]" />,
  file: <FileText className="h-3.5 w-3.5 text-muted-foreground" />,
  users: <Users className="h-3.5 w-3.5 text-muted-foreground" />,
};

const QUARTERS = ["T4 2026", "T1 2027", "T2 2027", "T3 2027", "T4 2027"];
const MONTH_TICKS = ["O", "N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O"];

export default function Etape3Page() {
  const router = useRouter();

  return (
    <AppShell notifications={3}>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Créer un nouveau projet — Étape 4/4"
          subtitle="Prévisualiser le planning APQP généré avant création du projet"
        />

        <WizardSteps current={4} />

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          {/* Summary */}
          <Panel title="Résumé du projet" className="col-span-3">
            <dl className="space-y-2 text-[12px]">
              {[
                { icon: <Hash className="h-3.5 w-3.5" />, k: "Identifiant du projet", v: NEW_PROJECT.code },
                { icon: <Users className="h-3.5 w-3.5" />, k: "Module", v: NEW_PROJECT.name },
                { icon: <Building2 className="h-3.5 w-3.5" />, k: "Client / OEM", v: NEW_PROJECT.client },
                { icon: <Package className="h-3.5 w-3.5" />, k: "Produit", v: NEW_PROJECT.part },
                { icon: <UserRound className="h-3.5 w-3.5" />, k: "Chef de projet", v: NEW_PROJECT.manager },
                { icon: <FileText className="h-3.5 w-3.5" />, k: "Type d'APQP", v: NEW_PROJECT.template },
                { icon: <CalendarDays className="h-3.5 w-3.5" />, k: "SOP cible", v: NEW_PROJECT.sop },
                { icon: <Clock className="h-3.5 w-3.5" />, k: "Durée totale estimée", v: NEW_PROJECT.duration },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-start gap-2 border-b border-dashed border-border pb-2 last:border-0 last:pb-0"
                >
                  <span className="mt-px text-muted-foreground">{row.icon}</span>
                  <dt className="min-w-0 flex-1 text-muted-foreground">{row.k}</dt>
                  <dd className="max-w-[110px] text-right font-semibold text-foreground">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          {/* Generated plan preview */}
          <Panel title="Prévisualisation du planning généré" className="col-span-6">
            <div className="flex h-full flex-col gap-2.5">
              {/* Stat tiles */}
              <div className="grid shrink-0 grid-cols-6 gap-2">
                {GENERATED_STATS.map((s) => (
                  <Card key={s.label} className="px-1.5 py-2 text-center">
                    <div className="flex justify-center">{STAT_ICONS[s.icon]}</div>
                    <p className="mt-1 text-[16px] font-bold leading-none text-foreground">{s.value}</p>
                    <p className="mt-1 text-[9px] leading-tight text-muted-foreground">{s.label}</p>
                  </Card>
                ))}
              </div>

              {/* Gate rail */}
              <div className="shrink-0">
                <p className="mb-2 text-[12px] font-semibold text-foreground">
                  Parcours APQP — Gates (dates indicatives)
                </p>
                <div className="flex items-start">
                  {GENERATED_GATES.map((g, i) => (
                    <div key={g.id} className="flex min-w-0 flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <span className={`h-[2px] flex-1 ${i === 0 ? "bg-transparent" : "bg-[#16A46B]"}`} />
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            i === GENERATED_GATES.length - 1
                              ? "border-[#0E7C52] bg-[#0E7C52]"
                              : "border-[#16A46B] bg-white"
                          }`}
                        />
                        <span
                          className={`h-[2px] flex-1 ${i === GENERATED_GATES.length - 1 ? "bg-transparent" : "bg-[#16A46B]"}`}
                        />
                      </div>
                      <p className="mt-1 text-[11px] font-bold text-foreground">{g.id}</p>
                      <p className="text-[10px] leading-tight text-muted-foreground">{g.label}</p>
                      <p className="text-[9px] tabular-nums text-muted-foreground">{g.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini gantt + generated content */}
              <div className="flex min-h-0 flex-1 gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className="mb-1.5 text-[12px] font-semibold text-foreground">
                    Aperçu du planning (mini Gantt)
                  </p>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="flex border-b border-border bg-muted/40 text-[9px] text-muted-foreground">
                      <span className="w-[108px] shrink-0 px-1.5 py-1 font-medium">Phase / Gate</span>
                      <span className="w-[96px] shrink-0 border-l border-border px-1.5 py-1 font-medium">
                        Période
                      </span>
                      <span className="flex min-w-0 flex-1 border-l border-border">
                        {QUARTERS.map((q) => (
                          <span key={q} className="flex-1 border-r border-border py-1 text-center last:border-r-0">
                            {q}
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="flex border-b border-border text-[8px] text-muted-foreground">
                      <span className="w-[204px] shrink-0" />
                      <span className="flex min-w-0 flex-1">
                        {MONTH_TICKS.map((m, i) => (
                          <span key={`${m}-${i}`} className="flex-1 py-0.5 text-center">
                            {m}
                          </span>
                        ))}
                      </span>
                    </div>
                    {GENERATED_PLAN.map((row) => (
                      <div key={row.gate} className="flex items-center border-b border-border/60 text-[9px] last:border-0">
                        <span className="w-[108px] shrink-0 truncate px-1.5 py-1 text-foreground">
                          {row.gate}
                        </span>
                        <span className="w-[96px] shrink-0 border-l border-border px-1.5 py-1 tabular-nums text-muted-foreground">
                          {row.period}
                        </span>
                        <span className="relative h-5 min-w-0 flex-1 border-l border-border">
                          {row.milestone ? (
                            <span
                              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1px] bg-[#16A46B]"
                              style={{ left: `${(row.start / 13) * 100}%` }}
                            />
                          ) : (
                            <span
                              className="absolute top-1/2 h-2 -translate-y-1/2 rounded-[2px] bg-[#16A46B]"
                              style={{
                                left: `${(row.start / 13) * 100}%`,
                                width: `${(row.span / 13) * 100}%`,
                              }}
                            />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="w-[150px] shrink-0 p-2.5">
                  <p className="mb-2 text-[11px] font-semibold text-foreground">Contenu généré</p>
                  <ul className="space-y-2">
                    {GENERATED_CONTENT.map((c) => (
                      <li key={c.label} className="flex items-start gap-1.5">
                        <span className="mt-px">{CONTENT_ICONS[c.icon]}</span>
                        <span className="text-[10px] leading-snug text-foreground">{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </Panel>

          {/* Capacity */}
          <div className="col-span-3 flex min-h-0 flex-col gap-3">
            <Panel title="Capacités, charges et charge/capacité par fonction" className="min-h-0 flex-1" bodyClassName="px-0">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3.5 py-1.5 font-medium">Fonction</th>
                    <th className="py-1.5 pr-2 text-right font-medium">Charge (h)</th>
                    <th className="px-3.5 py-1.5 font-medium">Charge / Capacité</th>
                  </tr>
                </thead>
                <tbody>
                  {NEW_PROJECT_FUNCTIONS.map((f) => (
                    <tr key={f.fn} className="border-b border-border/60 last:border-0">
                      <td className="px-3.5 py-[7px]">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Dot color={f.color} />
                          {f.fn}
                        </span>
                      </td>
                      <td className="py-[7px] pr-2 text-right tabular-nums text-muted-foreground">
                        {formatNumber(f.load)} h
                      </td>
                      <td className="px-3.5 py-[7px]">
                        <span className="flex items-center gap-1.5">
                          <ProgressBar value={f.ratio} color={f.color} className="flex-1" />
                          <span
                            className="w-9 shrink-0 text-right font-semibold tabular-nums"
                            style={{ color: f.color }}
                          >
                            {f.ratio} %
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Card className="shrink-0 border-[#FECDCA] bg-[#FEF3F2] p-3">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#D92D20]">
                <AlertTriangle className="h-4 w-4" />
                Surcharge détectée
              </p>
              <p className="mt-1.5 text-[11px] text-foreground">
                La fonction <span className="font-semibold">Qualité</span> dépasse sa capacité de 190 h.
              </p>
              <p className="text-[11px] text-foreground">
                La fonction <span className="font-semibold">Process</span> est à 92 % de sa capacité.
              </p>
              <p className="mt-2 text-[11px] font-semibold text-foreground">Recommandations :</p>
              <ul className="mt-1 space-y-0.5">
                <li className="flex items-start gap-1.5 text-[11px] text-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#D92D20]" />
                  Ajuster 0,2 ETP qualité ou replanifier certaines tâches.
                </li>
                <li className="flex items-start gap-1.5 text-[11px] text-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#D92D20]" />
                  Réduire la charge ou lisser certaines tâches Process.
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Footer actions */}
        <div className="grid shrink-0 grid-cols-4 gap-2.5">
          <Button onClick={() => router.push("/nouveau-projet/etape-3")}>
            <ChevronLeft className="h-4 w-4" />
            Étape précédente
          </Button>
          <Button onClick={() => router.push("/planning")}>
            <Eye className="h-4 w-4" />
            Voir le planning initial
          </Button>
          <Button variant="ghost" className="border-border" onClick={() => router.push("/portefeuille")}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => router.push("/projet")}>
            Générer le projet
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </AppShell>
  );
}
