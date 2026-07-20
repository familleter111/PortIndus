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
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { FilterSelect } from "@/components/planning/filter-select";
import { Card, Chip } from "@/components/ui/primitives";
import {
  LOAD_CLIENTS,
  LOAD_HEALTH,
  LOAD_KPIS,
  LOAD_LEVELS,
  LOAD_MONTHS,
  LOAD_PHASES,
  SERVICE_LOAD,
  STATUS_DATE,
  type LoadPilot,
} from "@/lib/data";

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
  if (v >= 96) return { backgroundColor: "#FEF6E7", color: "#0E7C52", fontWeight: 600 };
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

/* --------------------------------- Filtres -------------------------------- */

/**
 * Bandes de charge traversées par un pilote. On regarde tous les mois et pas
 * seulement le pic : un pilote qui culmine à 198 % passe aussi par des mois de
 * tension, et c'est ce qu'on veut pouvoir isoler.
 */
function levelsOf(values: (number | null)[]): string[] {
  const nums = values.filter((v): v is number => v !== null);
  if (!nums.length) return [];
  const out: string[] = [];
  if (nums.some((v) => v > 110)) out.push("over");
  if (nums.some((v) => v >= 96 && v <= 110)) out.push("tension");
  if (Math.max(...nums) <= 95) out.push("ok");
  return out;
}

type Facet = "service" | "client" | "health" | "phase" | "level";
type Selection = Record<Facet, string | null>;
type Pilot = LoadPilot & { service: string };

/** Un critère par facette : le filtrage et le décompte partagent ces règles. */
const TESTS: Record<Facet, (p: Pilot, v: string) => boolean> = {
  service: (p, v) => p.service === v,
  client: (p, v) => p.clients.includes(v),
  health: (p, v) => p.health === v,
  phase: (p, v) => p.phases.includes(v),
  level: (p, v) => levelsOf(p.values).includes(v),
};

const FACETS = Object.keys(TESTS) as Facet[];

/** `skip` laisse une facette de côté — c'est ce qui rend les décomptes justes. */
function passes(p: Pilot, sel: Selection, skip?: Facet): boolean {
  return FACETS.every((f) => {
    if (f === skip) return true;
    const v = sel[f];
    return !v || TESTS[f](p, v);
  });
}

const ALL_PILOTS: Pilot[] = SERVICE_LOAD.flatMap((s) =>
  s.members.map((m) => ({ ...m, service: s.service })),
);

export default function ChargeParServicePage() {
  const router = useRouter();
  /** `undefined` = suit l'ouverture automatique, un booléen = choix explicite. */
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({
    Production: true,
  });
  const [query, setQuery] = React.useState("");
  const [sel, setSel] = React.useState<Selection>({
    service: null,
    client: null,
    health: null,
    phase: null,
    level: null,
  });

  const set = (facet: Facet) => (v: string | null) =>
    setSel((s) => ({ ...s, [facet]: v }));

  const q = query.trim().toLowerCase();
  /** Une facette qui porte sur les pilotes : elle déplie et masque les services. */
  const narrowed = Boolean(sel.client || sel.health || sel.phase || sel.level);
  const activeCount = FACETS.filter((f) => sel[f]).length + (q ? 1 : 0);

  const reset = () => {
    setQuery("");
    setSel({ service: null, client: null, health: null, phase: null, level: null });
  };

  /** Décompte des pilotes qu'une option retiendrait, filtres voisins appliqués. */
  const countOf = React.useCallback(
    (facet: Facet, value: string) =>
      ALL_PILOTS.filter((p) => passes(p, sel, facet) && TESTS[facet](p, value)).length,
    [sel],
  );

  const rows = SERVICE_LOAD.map((s) => {
    const nameHit = !q || s.service.toLowerCase().includes(q);
    const members = s.members.filter(
      (m) =>
        passes({ ...m, service: s.service }, sel) &&
        (nameHit || m.name.toLowerCase().includes(q)),
    );
    return { ...s, members, nameHit };
  }).filter(
    (s) =>
      (!sel.service || s.service === sel.service) &&
      (s.nameHit || s.members.length > 0) &&
      // Un filtre par pilote ne peut pas retenir un service sans pilote retenu.
      (!narrowed || s.members.length > 0),
  );

  const shownPilots = rows.reduce((t, s) => t + s.members.length, 0);

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
                      ? "bg-[#5EDE99] text-[#101828]"
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
                    ? "border-[#16A46B] text-[#0E7C52]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* --------------------------------------------------------- Filtres */}
        <Card
          className={`mt-2 flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-2 transition-colors ${
            activeCount ? "border-[#BFEFD5] bg-[#FFFDF9]" : ""
          }`}
        >
          <span className="relative flex h-8 min-w-[190px] max-w-[280px] flex-1 items-center">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un service, un pilote…"
              className="h-8 w-full rounded-lg border border-input bg-white pl-8 pr-7 text-[12px] text-foreground transition-shadow placeholder:text-muted-foreground focus:border-[#16A46B] focus:outline-none focus:ring-2 focus:ring-[#16A46B]/20"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="absolute right-2 text-muted-foreground transition-colors hover:text-[#0E7C52]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </span>

          <span className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden />
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

          <FilterSelect
            label="Client"
            value={sel.client}
            onChange={set("client")}
            options={LOAD_CLIENTS.map((c) => ({
              value: c,
              label: c,
              count: countOf("client", c),
            }))}
          />
          <FilterSelect
            label="Santé"
            value={sel.health}
            onChange={set("health")}
            options={LOAD_HEALTH.map((h) => ({
              value: h.value,
              label: h.label,
              dot: h.dot,
              count: countOf("health", h.value),
            }))}
          />
          <FilterSelect
            label="Phase"
            value={sel.phase}
            onChange={set("phase")}
            options={LOAD_PHASES.map((p) => ({
              value: p,
              label: p,
              count: countOf("phase", p),
            }))}
          />
          <FilterSelect
            label="Service"
            value={sel.service}
            onChange={set("service")}
            options={SERVICE_LOAD.map((s) => ({ value: s.service, label: s.service }))}
          />
          <FilterSelect
            label="Charge"
            value={sel.level}
            onChange={set("level")}
            allLabel="Toutes"
            options={LOAD_LEVELS.map((l) => ({
              value: l.value,
              label: l.label,
              short: l.short,
              dot: l.dot,
              count: countOf("level", l.value),
            }))}
          />

          {/* Rien à effacer tant que rien n'est posé : le bouton n'apparaît qu'utile. */}
          {activeCount ? (
            <button
              type="button"
              onClick={reset}
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-[#FEF6E7] hover:text-[#0E7C52]"
            >
              <X className="h-3.5 w-3.5" />
              Effacer
              <span className="rounded-full bg-[#FEF6E7] px-1.5 text-[10px] font-bold text-[#0E7C52]">
                {activeCount}
              </span>
            </button>
          ) : null}

          <span className="ml-auto shrink-0 whitespace-nowrap pl-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{rows.length}</span> service
            {rows.length > 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-foreground">{shownPilots}</span> pilote
            {shownPilots > 1 ? "s" : ""}
          </span>
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
                  // Un filtre déplie les services non touchés par l'utilisateur.
                  const expanded =
                    openMap[s.service] ?? ((narrowed || q !== "") && s.members.length > 0);
                  const peak = peakOf(s.values);
                  const chip = peakChip(peak);
                  return (
                    <React.Fragment key={s.service}>
                      <tr className="border-b border-border">
                        <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMap((o) => ({ ...o, [s.service]: !expanded }))
                            }
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
                            <span
                              className="shrink-0 text-[10px] text-muted-foreground"
                              title={
                                s.members.length < s.pilots
                                  ? `${s.members.length} pilote(s) retenu(s) sur les ${s.pilots} du service`
                                  : undefined
                              }
                            >
                              {s.members.length < s.pilots && (narrowed || q !== "")
                                ? `${s.members.length}/${s.pilots} pilotes`
                                : `${s.pilots} pilotes`}
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
                                    <span
                                      className="shrink-0 text-[10px] text-muted-foreground"
                                      title={`${m.clients.join(", ")} — ${m.phases.join(", ")}`}
                                    >
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

                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={LOAD_MONTHS.length + 2} className="px-3 py-10 text-center">
                      <p className="text-[13px] font-semibold text-foreground">
                        Aucun service ne correspond aux filtres
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Élargissez le périmètre ou repartez de la vue complète.
                      </p>
                      <button
                        type="button"
                        onClick={reset}
                        className="mt-2.5 rounded-lg border border-[#BFEFD5] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0E7C52] shadow-sm transition-colors hover:bg-[#F1FCF6]"
                      >
                        Effacer les filtres
                      </button>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Légende */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            <Legend swatch="rgba(46, 125, 50, 0.18)" label="≤ 95 % — capacité disponible" />
            <Legend swatch="#FEF6E7" label="96 à 110 % — tension" />
            <Legend swatch="rgba(217, 45, 32, 0.85)" label="> 110 % — surcharge" />
            <span className="min-w-0">
              La ligne service couvre l&apos;ensemble de ses pilotes, y compris ceux non
              détaillés. Date de statut {STATUS_DATE}.
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
