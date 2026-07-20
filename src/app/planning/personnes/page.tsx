"use client";

import * as React from "react";
import {
  AlertTriangle,
  Clock,
  Gauge,
  Layers,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle } from "@/components/shared/page-parts";
import {
  Bar as ProgressBar,
  Card,
  Chip,
  Input,
  Panel,
  Select,
  type ChipTone,
} from "@/components/ui/primitives";
import {
  PEOPLE_LOAD,
  STATUS_DATE,
  loadLevel,
  personCapacity,
  personRatio,
  type PersonLoad,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

/** Un seul jeu de seuils pour le tableau, les indicateurs et les puces. */
const LEVEL_META: Record<
  ReturnType<typeof loadLevel>,
  { label: string; color: string; tone: ChipTone }
> = {
  surcharge: { label: "Surcharge", color: "#D92D20", tone: "red" },
  limite: { label: "Proche limite", color: "#E58A00", tone: "amber" },
  sain: { label: "Sain", color: "#2E7D32", tone: "green" },
};

type SortKey = "name" | "fn" | "rate" | "projects" | "load" | "available" | "ratio";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Ressource" },
  { key: "fn", label: "Fonction" },
  { key: "rate", label: "Taux d'allocation" },
  { key: "projects", label: "Projets en parallèle" },
  { key: "load", label: "Charge affectée (h)" },
  { key: "available", label: "Disponibilité (h)" },
  { key: "ratio", label: "Charge / Capacité" },
];

export default function ChargeParPersonnePage() {
  const [query, setQuery] = React.useState("");
  const [fnFilter, setFnFilter] = React.useState("Fonction");
  const [siteFilter, setSiteFilter] = React.useState("Site");
  const [levelFilter, setLevelFilter] = React.useState("Charge");
  const [sort, setSort] = React.useState<{ key: SortKey; desc: boolean }>({
    key: "ratio",
    desc: true,
  });

  const functions = React.useMemo(
    () => Array.from(new Set(PEOPLE_LOAD.map((p) => p.fn))).sort(),
    [],
  );
  const sites = React.useMemo(
    () => Array.from(new Set(PEOPLE_LOAD.map((p) => p.site))).sort(),
    [],
  );

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const kept = PEOPLE_LOAD.filter((p) => {
      if (q && !`${p.name} ${p.fn} ${p.site} ${p.projects.join(" ")}`.toLowerCase().includes(q)) {
        return false;
      }
      if (fnFilter !== "Fonction" && p.fn !== fnFilter) return false;
      if (siteFilter !== "Site" && p.site !== siteFilter) return false;
      if (levelFilter !== "Charge" && LEVEL_META[loadLevel(personRatio(p))].label !== levelFilter) {
        return false;
      }
      return true;
    });

    const value = (p: PersonLoad) =>
      sort.key === "ratio"
        ? personRatio(p)
        : sort.key === "projects"
          ? p.projects.length
          : p[sort.key];

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
  }, [query, fnFilter, siteFilter, levelFilter, sort]);

  /** Indicateurs consolidés — comptés sur l'équipe entière, pas sur le filtre. */
  const stats = React.useMemo(() => {
    const load = PEOPLE_LOAD.reduce((n, p) => n + p.load, 0);
    const capacity = PEOPLE_LOAD.reduce((n, p) => n + personCapacity(p), 0);
    const over = PEOPLE_LOAD.filter((p) => loadLevel(personRatio(p)) === "surcharge");
    const tight = PEOPLE_LOAD.filter((p) => loadLevel(personRatio(p)) === "limite");
    return {
      people: PEOPLE_LOAD.length,
      load,
      capacity,
      ratio: Math.round((load / capacity) * 100),
      over,
      tight,
      // Heures à replacer pour ramener chaque personne sous sa capacité.
      excess: over.reduce((n, p) => n + (p.load - personCapacity(p)), 0),
      // Seules les marges positives comptent : un déficit n'est pas une réserve.
      spare: PEOPLE_LOAD.reduce((n, p) => n + Math.max(0, p.available), 0),
      multi: PEOPLE_LOAD.filter((p) => p.projects.length >= 3).length,
    };
  }, []);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: true }));

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-2.5">
        <PageTitle
          title="Charge par personne"
          subtitle={`Affectation nominative sur les 12 prochains mois — au ${STATUS_DATE}`}
        />

        {/* Indicateurs */}
        <div className="grid shrink-0 grid-cols-6 gap-2.5">
          {[
            {
              icon: <Users className="h-3.5 w-3.5 text-muted-foreground" />,
              label: "Ressources suivies",
              value: String(stats.people),
              note: `${stats.multi} sur 3 projets ou plus`,
              color: "#101828",
            },
            {
              icon: <Gauge className="h-3.5 w-3.5 text-muted-foreground" />,
              label: "Charge / capacité",
              value: `${stats.ratio} %`,
              note: `${formatNumber(stats.load)} h / ${formatNumber(stats.capacity)} h`,
              color: stats.ratio > 100 ? "#D92D20" : stats.ratio >= 90 ? "#E58A00" : "#2E7D32",
            },
            {
              icon: <AlertTriangle className="h-3.5 w-3.5 text-[#D92D20]" />,
              label: "En surcharge",
              value: String(stats.over.length),
              note: stats.excess > 0 ? `${formatNumber(stats.excess)} h à replacer` : "aucun dépassement",
              color: "#D92D20",
            },
            {
              icon: <TrendingUp className="h-3.5 w-3.5 text-[#E58A00]" />,
              label: "Proche limite",
              value: String(stats.tight.length),
              note: "≥ 90 % de la capacité",
              color: "#E58A00",
            },
            {
              icon: <Clock className="h-3.5 w-3.5 text-[#2E7D32]" />,
              label: "Marge disponible",
              value: `${formatNumber(stats.spare)} h`,
              note: "cumulée sur l'équipe",
              color: "#2E7D32",
            },
            {
              icon: <Layers className="h-3.5 w-3.5 text-muted-foreground" />,
              label: "Charge affectée",
              value: `${formatNumber(stats.load)} h`,
              note: "sur 12 mois",
              color: "#101828",
            },
          ].map((k) => (
            <Card key={k.label} className="flex flex-col justify-center px-3.5 py-2.5">
              <div className="flex items-center gap-1.5">
                {k.icon}
                <p className="truncate text-[11px] leading-tight text-muted-foreground">
                  {k.label}
                </p>
              </div>
              <p
                className="mt-1.5 text-[22px] font-bold leading-none"
                style={{ color: k.color }}
              >
                {k.value}
              </p>
              <p className="mt-1 truncate text-[10px] leading-tight text-muted-foreground">
                {k.note}
              </p>
            </Card>
          ))}
        </div>

        {/* Personnes en dépassement — la lecture utile avant le tableau. */}
        {stats.over.length > 0 ? (
          <Card className="flex shrink-0 items-center gap-2 border-[#FECDCA] bg-[#FEF3F2] px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#D92D20]" />
            <p className="min-w-0 flex-1 text-[12px] text-[#B42318]">
              <span className="font-semibold">
                {stats.over.length} ressource{stats.over.length > 1 ? "s" : ""} au-delà de sa
                capacité
              </span>{" "}
              — {stats.over.map((p) => p.name).join(", ")}. Arbitrage requis avant la prochaine
              gate.
            </p>
          </Card>
        ) : null}

        {/* Recherche & filtres */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une ressource, une fonction, un projet…"
              className="pl-8"
            />
          </span>
          <Select
            value={fnFilter}
            onChange={(e) => setFnFilter(e.target.value)}
            aria-label="Filtrer par fonction"
            className="w-[160px] shrink-0"
          >
            {["Fonction", ...functions].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
          <Select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            aria-label="Filtrer par site"
            className="w-[110px] shrink-0"
          >
            {["Site", ...sites].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            aria-label="Filtrer par niveau de charge"
            className="w-[140px] shrink-0"
          >
            {["Charge", "Surcharge", "Proche limite", "Sain"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {rows.length} / {PEOPLE_LOAD.length} ressources
          </span>
        </div>

        {/* Tableau */}
        <Panel
          title="Affectation des ressources"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          className="min-h-0 flex-1"
          bodyClassName="px-0"
        >
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border text-left text-muted-foreground">
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className="whitespace-nowrap px-2.5 py-2 font-medium first:pl-3.5 last:pr-3.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={`flex items-center gap-1 transition-colors hover:text-foreground ${
                        sort.key === c.key ? "font-semibold text-[#0E7C52]" : ""
                      }`}
                    >
                      {c.label}
                      {sort.key === c.key ? <span aria-hidden>{sort.desc ? "↓" : "↑"}</span> : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const ratio = personRatio(p);
                const level = LEVEL_META[loadLevel(ratio)];
                return (
                  <tr key={p.name} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pl-3.5 pr-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.initials}
                        </span>
                        <span className="leading-tight">
                          <span className="block font-medium text-foreground">{p.name}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            {p.site}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-2.5 py-2">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.fn}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 tabular-nums text-muted-foreground">{p.rate} %</td>
                    <td className="px-2.5 py-2">
                      <span className="flex items-center gap-1.5">
                        <span className="tabular-nums font-semibold text-foreground">
                          {p.projects.length}
                        </span>
                        <span
                          className="truncate text-[10px] text-muted-foreground"
                          title={p.projects.join(", ")}
                        >
                          {p.projects.join(", ")}
                        </span>
                      </span>
                    </td>
                    <td className="px-2.5 py-2 tabular-nums text-muted-foreground">
                      {formatNumber(p.load)} h
                    </td>
                    {/* Négatif = déficit à replacer, pas une marge. */}
                    <td
                      className={`px-2.5 py-2 tabular-nums ${
                        p.available < 0
                          ? "font-semibold text-[#D92D20]"
                          : p.available === 0
                            ? "font-semibold text-[#E58A00]"
                            : "text-muted-foreground"
                      }`}
                    >
                      {p.available < 0
                        ? `− ${formatNumber(-p.available)} h`
                        : `${formatNumber(p.available)} h`}
                    </td>
                    <td className="py-2 pl-2.5 pr-3.5">
                      <span className="flex items-center gap-2">
                        <ProgressBar
                          value={Math.min(100, ratio)}
                          color={level.color}
                          className="h-1.5 w-24"
                        />
                        <span
                          className="w-11 shrink-0 text-right font-semibold tabular-nums"
                          style={{ color: level.color }}
                        >
                          {ratio} %
                        </span>
                        <Chip tone={level.tone}>{level.label}</Chip>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-3.5 py-10 text-center text-muted-foreground"
                  >
                    Aucune ressource ne correspond aux filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Panel>
      </div>
    </AppShell>
  );
}
