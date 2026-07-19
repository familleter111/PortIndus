"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  Crosshair,
  Gauge,
  Layers,
  Search,
  Users,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, Chip } from "@/components/ui/primitives";
import { LOAD_KPIS, LOAD_MONTHS, SERVICE_LOAD, STATUS_DATE } from "@/lib/data";

const SCALES = ["Jour", "Mois", "Trimestre", "Année"];
const TABS = ["Projets", "Équipes et chevauchements", "Charge par service"];

const KPI_ICONS: Record<string, React.ReactNode> = {
  layers: <Layers className="h-4 w-4 text-muted-foreground" />,
  alert: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
  users: <Users className="h-4 w-4 text-muted-foreground" />,
  gauge: <Gauge className="h-4 w-4 text-muted-foreground" />,
  clock: <Clock className="h-4 w-4 text-muted-foreground" />,
};

/**
 * Couleur d'une cellule. Le chiffre reste la donnée : la teinte ne fait que
 * le doubler, et son intensité suit l'écart à la capacité.
 */
function cellStyle(v: number | null): React.CSSProperties {
  if (v === null) return {};
  if (v > 110) {
    // 111 % → rouge pâle, 220 % et au-delà → rouge plein.
    const t = Math.min(1, (v - 110) / 110);
    return {
      backgroundColor: `rgba(217, 45, 32, ${0.14 + t * 0.86})`,
      color: t > 0.35 ? "#FFFFFF" : "#B42318",
      fontWeight: 600,
    };
  }
  if (v >= 96) return { backgroundColor: "#FEF6E7", color: "#B45F09", fontWeight: 600 };
  const t = Math.min(1, v / 95);
  return { backgroundColor: `rgba(46, 125, 50, ${0.05 + t * 0.16})`, color: "#1B5E20" };
}

function peakOf(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length ? Math.max(...nums) : null;
}

function peakChip(peak: number | null) {
  if (peak === null) return null;
  if (peak > 110) return { label: "Surcharge", tone: "red" as const };
  if (peak >= 96) return { label: "Tension", tone: "amber" as const };
  return { label: "OK", tone: "green" as const };
}

export default function ChargeParServicePage() {
  const router = useRouter();
  const [open, setOpen] = React.useState<string[]>(["Production"]);
  const [query, setQuery] = React.useState("");

  const toggle = (s: string) =>
    setOpen((o) => (o.includes(s) ? o.filter((k) => k !== s) : [...o, s]));

  const rows = SERVICE_LOAD.filter(
    (s) =>
      !query ||
      s.service.toLowerCase().includes(query.toLowerCase()) ||
      s.members.some((m) => m.name.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <AppShell notifications={5}>
      <div className="flex h-full w-full flex-col overflow-hidden">
        {/* ---------------------------------------------------------- Titre */}
        <div className="flex shrink-0 flex-wrap items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[23px] font-bold leading-tight tracking-tight text-foreground">
                Planning global
              </h1>
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                I09
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Les 24 projets du portefeuille sur un axe unique — jalons, dérives et chevauchement
              des équipes.
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
              {SCALES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    s === "Mois"
                      ? "bg-[#B45F09] text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Crosshair className="h-3.5 w-3.5 text-muted-foreground" />
              Aller à la date de statut
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------- Onglets */}
        <div className="mt-2 flex shrink-0 gap-5 border-b border-border">
          {TABS.map((tab) => {
            const active = tab === "Charge par service";
            return (
              <button
                key={tab}
                type="button"
                onClick={tab === "Projets" ? () => router.push("/planning") : undefined}
                className={`border-b-2 pb-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "border-[#E58A00] text-[#B45F09]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* --------------------------------------------------------- Filtres */}
        <Card className="mt-2 flex shrink-0 flex-wrap items-center gap-2 px-3 py-2">
          <span className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet, un code, un produit…"
              className="h-8 w-full rounded-lg border border-input bg-white pl-8 pr-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-[#E5A11B] focus:outline-none"
            />
          </span>
          {[
            { k: "Client", v: "Tous" },
            { k: "Santé", v: "Tous" },
            { k: "Phase", v: "Tous" },
            { k: "Service", v: "Tous" },
          ].map((f) => (
            <label
              key={f.k}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-input px-2 text-[12px]"
            >
              <span className="text-muted-foreground">{f.k}</span>
              <select className="bg-transparent text-[12px] font-medium text-foreground focus:outline-none">
                <option>{f.v}</option>
              </select>
            </label>
          ))}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="flex items-center gap-1.5 px-1 text-[12px] text-muted-foreground transition-colors hover:text-[#B45F09]"
          >
            <X className="h-3.5 w-3.5" />
            Effacer
          </button>
        </Card>

        {/* ----------------------------------------------------------- KPI */}
        <div className="mt-2 grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
          {LOAD_KPIS.map((k) => (
            <Card key={k.label} className="px-3 py-2">
              <div className="flex items-start gap-2">
                {KPI_ICONS[k.icon]}
                {k.chip ? (
                  <Chip tone={k.tone} className="ml-auto">
                    {k.chip}
                  </Chip>
                ) : null}
              </div>
              <p className="mt-1 text-[22px] font-bold leading-none text-foreground">{k.value}</p>
              <p className="mt-1 text-[12px] font-medium text-foreground">{k.label}</p>
              <p className="truncate text-[11px] text-muted-foreground" title={k.note}>
                {k.note}
              </p>
            </Card>
          ))}
        </div>

        {/* -------------------------------------------------------- Heatmap */}
        <Card className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto scrollbar-thin">
            <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 z-20 bg-card">
                <tr className="text-muted-foreground">
                  <th className="sticky left-0 z-30 min-w-[210px] border-b border-r border-border bg-card px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide">
                    Service / pilote
                  </th>
                  {LOAD_MONTHS.map((m) => (
                    <th
                      key={m}
                      className="border-b border-border px-1 py-2 text-center text-[10px] font-semibold uppercase"
                      style={{ minWidth: 46 }}
                    >
                      {m}
                    </th>
                  ))}
                  <th className="border-b border-l border-border px-3 py-2 text-center text-[10px] font-semibold uppercase">
                    Pic
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const expanded = open.includes(s.service);
                  const peak = peakOf(s.values);
                  const chip = peakChip(peak);
                  return (
                    <React.Fragment key={s.service}>
                      <tr className="border-b border-border">
                        <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-1.5">
                          <button
                            type="button"
                            onClick={() => toggle(s.service)}
                            disabled={s.members.length === 0}
                            className="flex w-full items-center gap-1.5 text-left disabled:cursor-default"
                          >
                            {s.members.length ? (
                              expanded ? (
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              )
                            ) : (
                              <span className="w-3.5 shrink-0" />
                            )}
                            <span className="flex-1 font-semibold text-foreground">{s.service}</span>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {s.pilots} pilotes
                            </span>
                          </button>
                        </td>
                        {s.values.map((v, i) => (
                          <td
                            key={`${s.service}-${i}`}
                            title={v === null ? "Aucune activité planifiée" : `${LOAD_MONTHS[i]} — ${v} % de la capacité`}
                            className="cursor-pointer border-b border-white/70 text-center tabular-nums"
                            style={cellStyle(v)}
                          >
                            {v === null ? <span className="text-border">·</span> : `${v} %`}
                          </td>
                        ))}
                        <td className="whitespace-nowrap border-l border-border px-3 py-1.5 text-center">
                          {peak === null ? (
                            <span className="text-border">—</span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <span className="font-bold tabular-nums text-foreground">{peak} %</span>
                              {chip ? <Chip tone={chip.tone}>{chip.label}</Chip> : null}
                            </span>
                          )}
                        </td>
                      </tr>

                      {expanded
                        ? s.members.map((m) => {
                            const mPeak = peakOf(m.values);
                            const mChip = peakChip(mPeak);
                            return (
                              <tr key={m.name} className="border-b border-border bg-[#FBFCFD]">
                                <td className="sticky left-0 z-10 border-r border-border bg-[#FBFCFD] py-1.5 pl-8 pr-3">
                                  <span className="flex items-center gap-1.5">
                                    <span
                                      className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                      style={{ backgroundColor: m.color }}
                                    >
                                      {m.initials}
                                    </span>
                                    <span className="flex-1 truncate text-foreground">{m.name}</span>
                                    <span className="shrink-0 text-[10px] text-muted-foreground">
                                      {m.projects} proj.
                                    </span>
                                  </span>
                                </td>
                                {m.values.map((v, i) => (
                                  <td
                                    key={`${m.name}-${i}`}
                                    title={v === null ? "Aucune activité planifiée" : `${m.name} — ${LOAD_MONTHS[i]} : ${v} %`}
                                    className="cursor-pointer border-b border-white/70 text-center tabular-nums"
                                    style={cellStyle(v)}
                                  >
                                    {v === null ? <span className="text-border">·</span> : `${v} %`}
                                  </td>
                                ))}
                                <td className="whitespace-nowrap border-l border-border px-3 py-1.5 text-center">
                                  {mPeak === null ? (
                                    <span className="text-border">—</span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-1.5">
                                      <span className="font-bold tabular-nums text-foreground">
                                        {mPeak} %
                                      </span>
                                      {mChip ? <Chip tone={mChip.tone}>{mChip.label}</Chip> : null}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Légende */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            <Legend swatch="rgba(46, 125, 50, 0.18)" label="≤ 95 % — capacité disponible" />
            <Legend swatch="#FEF6E7" label="96 à 110 % — tension" />
            <Legend swatch="rgba(217, 45, 32, 0.85)" label="> 110 % — surcharge" />
            <span className="min-w-0">
              Chaque cellule affiche le pourcentage : la couleur ne fait que doubler le chiffre.
              Date de statut {STATUS_DATE}.
            </span>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-[3px] border border-black/10"
        style={{ backgroundColor: swatch }}
      />
      {label}
    </span>
  );
}
