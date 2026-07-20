"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Gauge,
  Plus,
  Target,
  Trash2,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle } from "@/components/shared/page-parts";
import { WizardSteps } from "@/components/shared/wizard-steps";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  DateInput,
  Dot,
  Panel,
  Select,
} from "@/components/ui/primitives";
import { NEW_PROJECT, NEW_PROJECT_FUNCTIONS, PEOPLE_LOAD } from "@/lib/data";
import { cn, formatNumber } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Seuils                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Un seul jeu de seuils pour toute la page. Les couleurs ne sont plus portées
 * par la donnée mais déduites du ratio : impossible qu'une ligne à 108 %
 * s'affiche en vert parce qu'une couleur aurait été saisie à la main.
 */
function levelOf(ratio: number): "surcharge" | "limite" | "sain" {
  if (ratio > 100) return "surcharge";
  if (ratio >= 90) return "limite";
  return "sain";
}

const LEVEL_COLOR = {
  surcharge: "#D92D20",
  limite: "#E58A00",
  sain: "#2E7D32",
} as const;

/** Ratio charge / capacité, arrondi. Capacité nulle → pas de ratio calculable. */
function ratioOf(load: number, capacity: number): number {
  return capacity > 0 ? Math.round((load / capacity) * 100) : 0;
}

/** "01/10/2026" → "2026-10-01", le format des champs date. */
function frToIso(fr: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fr);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : fr;
}

/* -------------------------------------------------------------------------- */
/*  Champs éditables                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Cellule numérique éditable. La valeur est tenue en texte pendant la frappe
 * pour que l'on puisse effacer le champ sans qu'il se remplisse d'un zéro, et
 * n'est remontée qu'une fois analysable.
 */
function NumCell({
  value,
  onChange,
  suffix,
  className,
  min = 0,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  className?: string;
  min?: number;
  max?: number;
}) {
  const [draft, setDraft] = React.useState(String(value));
  const [editing, setEditing] = React.useState(false);

  // Tant qu'on n'édite pas, le champ suit la valeur (recalcul, réinitialisation).
  React.useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = (raw: string) => {
    const n = Number(raw.replace(/\s/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(min, max === undefined ? n : Math.min(max, n));
    onChange(clamped);
  };

  return (
    <span className="inline-flex items-center gap-0.5">
      <input
        type="number"
        value={draft}
        min={min}
        max={max}
        onFocus={() => setEditing(true)}
        onChange={(e) => {
          setDraft(e.target.value);
          if (e.target.value !== "") commit(e.target.value);
        }}
        onBlur={(e) => {
          setEditing(false);
          commit(e.target.value === "" ? String(min) : e.target.value);
        }}
        className={cn(
          "w-16 rounded border border-transparent bg-transparent px-1 py-0.5 text-right text-[11px] tabular-nums text-foreground transition-colors hover:border-input focus:border-[#16A46B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16A46B] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className,
        )}
      />
      {suffix ? <span className="text-[11px] text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}

/** Champ texte éditable, même traitement visuel que NumCell. */
function TextCell({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11px] text-foreground transition-colors hover:border-input focus:border-[#16A46B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16A46B]",
        className,
      )}
    />
  );
}

/** Barre + pourcentage, couleur déduite du ratio. */
function RatioCell({ ratio, barClass }: { ratio: number; barClass?: string }) {
  const color = LEVEL_COLOR[levelOf(ratio)];
  return (
    <span className="flex items-center gap-2">
      <ProgressBar
        value={Math.min(100, ratio)}
        color={color}
        className={barClass ?? "flex-1"}
      />
      <span
        className="w-10 shrink-0 text-right font-semibold tabular-nums"
        style={{ color }}
      >
        {ratio} %
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Écran                                                                      */
/* -------------------------------------------------------------------------- */

interface FnRow {
  fn: string;
  capacity: number;
  load: number;
  color: string;
}

interface ResRow {
  id: string;
  name: string;
  fn: string;
  color: string;
  rate: number;
  parallel: number;
  load: number;
  available: number;
}

/** Les ressources proposées viennent de la charge nominative déjà suivie. */
const RESOURCE_SEED: ResRow[] = PEOPLE_LOAD.slice(0, 6).map((p, i) => ({
  id: `r${i}`,
  name: p.name,
  fn: p.fn,
  color: p.color,
  rate: p.rate,
  parallel: p.projects.length,
  load: p.load,
  available: p.available,
}));

export default function Etape3Page() {
  const router = useRouter();

  // Les dates sont tenues en ISO — c'est ce que renvoie `input[type=date]`, et
  // `new Date("01/10/2026")` lirait le format français comme du mois/jour.
  const [kickoff, setKickoff] = React.useState(frToIso(NEW_PROJECT.kickoff));
  const [sop, setSop] = React.useState(frToIso(NEW_PROJECT.sop));
  const [calendar, setCalendar] = React.useState(NEW_PROJECT.calendar);

  const [functions, setFunctions] = React.useState<FnRow[]>(
    NEW_PROJECT_FUNCTIONS.map((f) => ({
      fn: f.fn,
      capacity: f.capacity,
      load: f.load,
      color: f.color,
    })),
  );
  const [resources, setResources] = React.useState<ResRow[]>(RESOURCE_SEED);

  const patchFn = (i: number, next: Partial<FnRow>) =>
    setFunctions((rows) => rows.map((r, k) => (k === i ? { ...r, ...next } : r)));

  const patchRes = (id: string, next: Partial<ResRow>) =>
    setResources((rows) => rows.map((r) => (r.id === id ? { ...r, ...next } : r)));

  /* ------------------------------------------------------------- Dérivés */

  // La charge globale est la somme des fonctions, pas une valeur saisie : elle
  // ne peut pas contredire le tableau au-dessus.
  const totals = React.useMemo(() => {
    const load = functions.reduce((n, f) => n + f.load, 0);
    const capacity = functions.reduce((n, f) => n + f.capacity, 0);
    return { load, capacity, ratio: ratioOf(load, capacity) };
  }, [functions]);

  /**
   * Durée entre kickoff et SOP. Comptée en jours puis convertie : l'écart
   * d'index de mois donnerait 11 pour un projet du 01/10 au 30/09 suivant,
   * alors qu'il couvre bien douze mois.
   */
  const duration = React.useMemo(() => {
    const a = new Date(`${kickoff}T00:00:00Z`).getTime();
    const b = new Date(`${sop}T00:00:00Z`).getTime();
    if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return null;
    return Math.round((b - a) / 86_400_000 / 30.44);
  }, [kickoff, sop]);

  /** Risques déduits des ratios : la liste suit ce que l'on saisit. */
  const risks = React.useMemo(
    () =>
      functions
        .map((f) => ({ ...f, ratio: ratioOf(f.load, f.capacity) }))
        .filter((f) => f.ratio >= 90)
        .sort((a, b) => b.ratio - a.ratio)
        .map((f) => {
          const over = f.load - f.capacity;
          return over > 0
            ? {
                fn: f.fn,
                color: f.color,
                title: `surcharge de ${formatNumber(over)} h`,
                level: "Critique" as const,
                impact: "Impact potentiel sur les gates G2 / G3",
                reco: `ajouter ${(over / 1600).toFixed(1).replace(".", ",")} ETP ou replanifier`,
              }
            : {
                fn: f.fn,
                color: f.color,
                title: `marge faible de ${formatNumber(f.capacity - f.load)} h`,
                level: "Élevé" as const,
                impact: "Impact potentiel sur la gate G3",
                reco: "réduire la charge ou lisser le planning",
              };
        }),
    [functions],
  );

  const over = risks.filter((r) => r.level === "Critique");
  const tight = risks.filter((r) => r.level === "Élevé");

  const addResource = () =>
    setResources((rows) => [
      ...rows,
      {
        id: `r${Date.now()}`,
        name: "",
        fn: functions[0]?.fn ?? "Qualité",
        color: functions[0]?.color ?? "#667085",
        rate: 80,
        parallel: 1,
        load: 800,
        available: 400,
      },
    ]);

  return (
    <AppShell notifications={3}>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Créer un nouveau projet — Étape 3/4"
          subtitle="Définir les contraintes SOP, les ressources et le rapport charge / capacité"
        />

        <WizardSteps current={3} />

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          {/* --------------------------------------- Paramètres de planning */}
          <Panel
            title="Paramètres de planning"
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
            className="col-span-3"
          >
            <div className="space-y-2.5">
              <FieldRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Kickoff">
                <DateInput
                  defaultValue={NEW_PROJECT.kickoff}
                  onChange={(e) => setKickoff(e.target.value)}
                />
              </FieldRow>
              <FieldRow icon={<Target className="h-3.5 w-3.5" />} label="SOP cible">
                <DateInput
                  defaultValue={NEW_PROJECT.sop}
                  onChange={(e) => setSop(e.target.value)}
                />
              </FieldRow>
              <FieldRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Calendrier">
                <Select value={calendar} onChange={(e) => setCalendar(e.target.value)}>
                  <option>Standard 5/7</option>
                  <option>Continu 7/7</option>
                  <option>Réduit 4/7</option>
                </Select>
              </FieldRow>

              {/* Ces deux lignes se calculent : elles ne se saisissent pas. */}
              <div className="flex items-center gap-2 border-t border-border pt-2.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 text-[12px] text-foreground">Durée totale estimée</span>
                <Chip tone="slate" className="text-[12px] font-semibold">
                  {duration ? `${duration} mois` : "—"}
                </Chip>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 text-[12px] text-foreground">Charge globale estimée</span>
                <Chip tone="slate" className="text-[12px] font-semibold">
                  {formatNumber(totals.load)} h
                </Chip>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 text-[12px] text-foreground">Charge / capacité</span>
                <Chip tone={levelOf(totals.ratio) === "sain" ? "green" : levelOf(totals.ratio) === "limite" ? "amber" : "red"}>
                  {totals.ratio} %
                </Chip>
              </div>

              {duration === null ? (
                <p className="flex items-start gap-1.5 text-[10px] leading-snug text-[#D92D20]">
                  <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                  La date SOP doit être postérieure au kickoff.
                </p>
              ) : null}
            </div>
          </Panel>

          {/* ----------------------------------- Charge / capacité par fonction */}
          <Panel
            title="Aperçu des ressources allouées"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            action={
              <span className="text-[10px] text-muted-foreground">
                Capacité et charge modifiables
              </span>
            }
            className="col-span-5"
            bodyClassName="px-0"
          >
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3.5 py-1.5 font-medium">Fonction</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Capacité (h)</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Charge (h)</th>
                  <th className="px-3.5 py-1.5 font-medium">Charge / Capacité</th>
                </tr>
              </thead>
              <tbody>
                {functions.map((f, i) => {
                  const ratio = ratioOf(f.load, f.capacity);
                  return (
                    <tr key={f.fn} className="border-b border-border/60 last:border-0">
                      <td className="px-3.5 py-[6px]">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Dot color={f.color} />
                          {f.fn}
                        </span>
                      </td>
                      <td className="py-[6px] pr-2 text-right">
                        <NumCell
                          value={f.capacity}
                          onChange={(n) => patchFn(i, { capacity: n })}
                          suffix="h"
                        />
                      </td>
                      <td className="py-[6px] pr-2 text-right">
                        <NumCell
                          value={f.load}
                          onChange={(n) => patchFn(i, { load: n })}
                          suffix="h"
                        />
                      </td>
                      <td className="px-3.5 py-[6px]">
                        <RatioCell ratio={ratio} />
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-semibold">
                  <td className="px-3.5 py-[6px] text-foreground">Total</td>
                  <td className="py-[6px] pr-2 text-right tabular-nums text-foreground">
                    {formatNumber(totals.capacity)} h
                  </td>
                  <td className="py-[6px] pr-2 text-right tabular-nums text-foreground">
                    {formatNumber(totals.load)} h
                  </td>
                  <td className="px-3.5 py-[6px]">
                    <RatioCell ratio={totals.ratio} />
                  </td>
                </tr>
              </tbody>
            </table>
          </Panel>

          {/* --------------------------------------------- Risques détectés */}
          <Panel
            title="Risques de capacité détectés"
            icon={
              risks.length > 0 ? (
                <AlertTriangle className="h-4 w-4 text-[#D92D20]" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
              )
            }
            action={
              <span className="text-[11px] text-muted-foreground">
                {risks.length} détecté{risks.length > 1 ? "s" : ""}
              </span>
            }
            className="col-span-4"
          >
            {risks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-1 py-6">
                <CheckCircle2 className="h-7 w-7 text-[#2E7D32]" />
                <p className="text-[12px] font-semibold text-foreground">
                  Aucun risque de capacité
                </p>
                <p className="text-center text-[11px] text-muted-foreground">
                  Toutes les fonctions restent sous 90 % de leur capacité.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {risks.map((r) => (
                  <li
                    key={r.fn}
                    className={`rounded-lg border p-2.5 ${
                      r.level === "Critique"
                        ? "border-[#FECDCA] bg-[#FEF3F2]"
                        : "border-[#F8DEB0] bg-[#FEF9F0]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Dot color={r.color} className="mt-1.5" />
                      <p className="min-w-0 flex-1 text-[12px] text-foreground">
                        <span className="font-semibold">{r.fn}</span> — {r.title}
                      </p>
                      <Chip tone={r.level === "Critique" ? "red" : "amber"}>{r.level}</Chip>
                    </div>
                    <p className="ml-4 mt-1 text-[11px] text-muted-foreground">{r.impact}</p>
                    <p className="ml-4 text-[11px] text-muted-foreground">
                      Recommandation : {r.reco}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* ------------------------------------ Affectation des ressources */}
        <Panel
          title="Affectation initiale des ressources"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          action={
            <Button className="px-2 py-1 text-[11px]" onClick={addResource}>
              <Plus className="h-3.5 w-3.5" />
              Ajouter une ressource
            </Button>
          }
          className="min-h-0 flex-1"
          bodyClassName="px-0"
        >
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                {[
                  "Ressource",
                  "Fonction",
                  "Taux d'allocation",
                  "Projets en parallèle",
                  "Charge affectée (h)",
                  "Disponibilité (h)",
                  "Charge / Capacité",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-2.5 py-1.5 font-medium first:pl-3.5 last:pr-3.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => {
                // Capacité = charge + disponibilité : les trois colonnes ne
                // peuvent pas se contredire, quel que soit ce qu'on saisit.
                const capacity = r.load + r.available;
                const ratio = ratioOf(r.load, capacity);
                return (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-[6px] pl-3.5 pr-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        <TextCell
                          value={r.name}
                          placeholder="Nom de la ressource"
                          onChange={(v) => patchRes(r.id, { name: v })}
                          className="font-medium"
                        />
                      </span>
                    </td>
                    <td className="px-2.5 py-[6px]">
                      <Select
                        value={r.fn}
                        onChange={(e) => {
                          const fn = functions.find((f) => f.fn === e.target.value);
                          patchRes(r.id, { fn: e.target.value, color: fn?.color ?? r.color });
                        }}
                        className="h-7 w-[130px] py-0 text-[11px]"
                      >
                        {functions.map((f) => (
                          <option key={f.fn}>{f.fn}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-2.5 py-[6px]">
                      <NumCell
                        value={r.rate}
                        max={100}
                        onChange={(n) => patchRes(r.id, { rate: n })}
                        suffix="%"
                        className="w-12"
                      />
                    </td>
                    <td className="px-2.5 py-[6px] text-center">
                      <NumCell
                        value={r.parallel}
                        min={1}
                        onChange={(n) => patchRes(r.id, { parallel: n })}
                        className="w-10"
                      />
                    </td>
                    <td className="px-2.5 py-[6px]">
                      <NumCell
                        value={r.load}
                        onChange={(n) => patchRes(r.id, { load: n })}
                        suffix="h"
                      />
                    </td>
                    <td className="px-2.5 py-[6px]">
                      <NumCell
                        value={r.available}
                        min={-9999}
                        onChange={(n) => patchRes(r.id, { available: n })}
                        suffix="h"
                        className={r.available < 0 ? "font-semibold text-[#D92D20]" : undefined}
                      />
                    </td>
                    <td className="px-2.5 py-[6px]">
                      <RatioCell ratio={ratio} barClass="w-24" />
                    </td>
                    <td className="py-[6px] pl-2.5 pr-3.5">
                      <button
                        type="button"
                        aria-label={`Retirer ${r.name || "la ressource"}`}
                        onClick={() =>
                          setResources((rows) => rows.filter((x) => x.id !== r.id))
                        }
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-[#D92D20]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3.5 py-8 text-center text-muted-foreground">
                    Aucune ressource affectée. Ajoutez-en une pour estimer la charge.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Panel>

        {/* Bandeau de synthèse — le texte suit ce que disent les chiffres. */}
        <Card
          className={`flex shrink-0 items-center gap-2 px-3.5 py-2 ${
            over.length > 0
              ? "border-[#FECDCA] bg-[#FEF3F2]"
              : tight.length > 0
                ? "border-[#F8DEB0] bg-[#FEF6E7]"
                : "border-[#BFEFD5] bg-[#F1FCF6]"
          }`}
        >
          {over.length > 0 || tight.length > 0 ? (
            <AlertTriangle
              className={`h-4 w-4 shrink-0 ${over.length > 0 ? "text-[#D92D20]" : "text-[#E58A00]"}`}
            />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
          )}
          <p className="text-[12px] text-foreground">
            {over.length > 0 ? (
              <>
                <span className="font-semibold">Alerte capacité :</span>{" "}
                {over.map((r) => r.fn).join(", ")} dépasse
                {over.length > 1 ? "nt" : ""} sa capacité.
                {tight.length > 0
                  ? ` ${tight.map((r) => r.fn).join(", ")} ${tight.length > 1 ? "sont proches" : "est proche"} de la limite.`
                  : ""}
              </>
            ) : tight.length > 0 ? (
              <>
                <span className="font-semibold">Vigilance :</span>{" "}
                {tight.map((r) => r.fn).join(", ")}{" "}
                {tight.length > 1 ? "sont proches" : "est proche"} de la limite de capacité.
              </>
            ) : (
              <>
                <span className="font-semibold">Capacité tenue :</span> toutes les fonctions
                restent sous 90 % de leur capacité.
              </>
            )}
          </p>
        </Card>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button onClick={() => router.push("/nouveau-projet/etape-2")}>
            <ChevronLeft className="h-4 w-4" />
            Étape précédente
          </Button>
          <Button
            variant="ghost"
            className="ml-auto border-border"
            onClick={() => router.push("/portefeuille")}
          >
            Annuler
          </Button>
          <Button variant="primary" onClick={() => router.push("/nouveau-projet/etape-4")}>
            Continuer vers Prévisualisation &amp; génération
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-[76px] shrink-0 text-[12px] text-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
