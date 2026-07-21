"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Diamond,
  Eye,
  FileText,
  Flag,
  Gauge,
  ListChecks,
  Package,
  Pencil,
  Target,
  UserRound,
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
  Dot,
  Panel,
} from "@/components/ui/primitives";
import {
  GENERATED_PHASES,
  GENERATED_TASKS,
  NEW_PROJECT,
  NEW_PROJECT_FUNCTIONS,
} from "@/lib/data";
import { useProjectDescription } from "@/lib/project-draft";
import { formatNumber } from "@/lib/utils";

/** Grille du Gantt : douze mois depuis le kickoff. */
const MONTHS = ["Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep"];
const SPAN = MONTHS.length;

/** Un seul jeu de seuils, comme à l'étape 3. */
function levelOf(ratio: number): "surcharge" | "limite" | "sain" {
  if (ratio > 100) return "surcharge";
  if (ratio >= 90) return "limite";
  return "sain";
}

const LEVEL_COLOR = { surcharge: "#D92D20", limite: "#E58A00", sain: "#2E7D32" } as const;

export default function Etape4Page() {
  const router = useRouter();

  // La description peut avoir été retouchée à l'étape 1 : la prévisualisation
  // doit montrer le texte retenu, pas la proposition d'origine.
  const { draft: description, edited: descriptionEdited } = useProjectDescription();

  // Phases repliées. Toutes ouvertes au départ : on veut voir le plan entier.
  const [collapsed, setCollapsed] = React.useState<string[]>([]);
  const toggle = (gate: string) =>
    setCollapsed((c) => (c.includes(gate) ? c.filter((g) => g !== gate) : [...c, gate]));

  /* ---------------------------------------------------------- Dérivés */

  // Tout se compte depuis le plan généré : aucun chiffre n'est saisi deux fois.
  const totals = React.useMemo(() => {
    const load = GENERATED_TASKS.reduce((n, t) => n + t.load, 0);
    const capacity = NEW_PROJECT_FUNCTIONS.reduce((n, f) => n + f.capacity, 0);
    const owners = new Set(GENERATED_TASKS.map((t) => t.owner));
    const fns = new Set(GENERATED_TASKS.map((t) => t.fn));
    return {
      load,
      capacity,
      ratio: capacity > 0 ? Math.round((load / capacity) * 100) : 0,
      gates: GENERATED_PHASES.length,
      tasks: GENERATED_TASKS.length,
      owners: owners.size,
      fns: fns.size,
      critical: GENERATED_TASKS.filter((t) => t.critical).length,
    };
  }, []);

  /**
   * Charge par fonction, recalculée depuis les tâches du plan. La capacité
   * vient de l'étape 3 : le tableau confronte donc bien ce qui est planifié à
   * ce qui est disponible, au lieu de recopier deux chiffres indépendants.
   */
  const byFunction = React.useMemo(
    () =>
      NEW_PROJECT_FUNCTIONS.map((f) => {
        const load = GENERATED_TASKS.filter((t) => t.fn === f.fn).reduce(
          (n, t) => n + t.load,
          0,
        );
        const ratio = f.capacity > 0 ? Math.round((load / f.capacity) * 100) : 0;
        return { fn: f.fn, color: f.color, capacity: f.capacity, load, ratio };
      }).filter((f) => f.load > 0),
    [],
  );

  const overloaded = byFunction.filter((f) => f.ratio > 100);

  return (
    <AppShell notifications={3}>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Créer un nouveau projet — Étape 4/4"
          subtitle="Vérifier le résumé du projet et le planning généré avant génération"
        />

        <WizardSteps current={4} />

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3 overflow-y-auto pr-0.5 scrollbar-thin">
          {/* ================================================ Résumé projet */}
          <Panel
            title="Résumé du projet"
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            className="col-span-5 shrink-0"
          >
            <dl className="space-y-1.5">
              {[
                { icon: <Building2 className="h-3.5 w-3.5" />, k: "Client", v: NEW_PROJECT.client },
                { icon: <Package className="h-3.5 w-3.5" />, k: "Produit / Pièce", v: NEW_PROJECT.part },
                { icon: <UserRound className="h-3.5 w-3.5" />, k: "Chef de projet", v: NEW_PROJECT.manager },
                { icon: <FileText className="h-3.5 w-3.5" />, k: "Template", v: NEW_PROJECT.template },
                { icon: <Target className="h-3.5 w-3.5" />, k: "Catégorie", v: NEW_PROJECT.category },
                { icon: <CalendarDays className="h-3.5 w-3.5" />, k: "Kickoff", v: NEW_PROJECT.kickoff },
                { icon: <Flag className="h-3.5 w-3.5" />, k: "SOP cible", v: NEW_PROJECT.sop },
              ].map((r) => (
                <div key={r.k} className="flex items-center gap-2 text-[12px]">
                  <span className="text-muted-foreground">{r.icon}</span>
                  <dt className="w-[112px] shrink-0 text-muted-foreground">{r.k}</dt>
                  <dd className="min-w-0 flex-1 truncate font-semibold text-foreground">{r.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-2.5 border-t border-border pt-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                Description
                {descriptionEdited ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#F0DFC4] bg-[#FEF6E7] px-1.5 py-0.5 text-[9px] font-semibold text-[#B45F09]">
                    <Pencil className="h-2.5 w-2.5" />
                    Modifiée à l&apos;étape 1
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-foreground">
                {description.summary}
              </p>
            </div>
          </Panel>

          {/* Ce que la génération va produire */}
          <Panel
            title="Ce qui sera généré"
            icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
            className="col-span-3 shrink-0"
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Flag className="h-4 w-4 text-[#16A46B]" />, v: totals.gates, k: "Gates APQP" },
                { icon: <ListChecks className="h-4 w-4 text-muted-foreground" />, v: totals.tasks, k: "Tâches" },
                { icon: <Users className="h-4 w-4 text-muted-foreground" />, v: totals.owners, k: "Ressources" },
                { icon: <Diamond className="h-4 w-4 text-muted-foreground" />, v: totals.fns, k: "Fonctions" },
                { icon: <Clock className="h-4 w-4 text-muted-foreground" />, v: `${formatNumber(totals.load)} h`, k: "Charge totale" },
                { icon: <AlertTriangle className="h-4 w-4 text-[#D92D20]" />, v: totals.critical, k: "Chemin critique" },
              ].map((s) => (
                <Card key={s.k} className="px-2 py-1.5">
                  <span className="flex items-center gap-1.5">
                    {s.icon}
                    <span className="text-[16px] font-bold leading-none text-foreground">{s.v}</span>
                  </span>
                  <p className="mt-1 truncate text-[10px] text-muted-foreground">{s.k}</p>
                </Card>
              ))}
            </div>
          </Panel>

          {/* Charge / capacité — fait partie du résumé */}
          <Panel
            title="Charge / Capacité"
            icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
            action={
              <Chip
                tone={
                  levelOf(totals.ratio) === "sain"
                    ? "green"
                    : levelOf(totals.ratio) === "limite"
                      ? "amber"
                      : "red"
                }
              >
                {totals.ratio} % global
              </Chip>
            }
            className="col-span-4 shrink-0"
            bodyClassName="px-0"
          >
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3.5 py-1 font-medium">Fonction</th>
                  <th className="py-1 pr-2 text-right font-medium">Charge</th>
                  <th className="py-1 pr-2 text-right font-medium">Capacité</th>
                  <th className="px-3.5 py-1 text-right font-medium">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {byFunction.map((f) => {
                  const color = LEVEL_COLOR[levelOf(f.ratio)];
                  return (
                    <tr key={f.fn} className="border-b border-border/60 last:border-0">
                      <td className="px-3.5 py-[5px]">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Dot color={f.color} />
                          {f.fn}
                        </span>
                      </td>
                      <td className="py-[5px] pr-2 text-right tabular-nums text-muted-foreground">
                        {formatNumber(f.load)} h
                      </td>
                      <td className="py-[5px] pr-2 text-right tabular-nums text-muted-foreground">
                        {formatNumber(f.capacity)} h
                      </td>
                      <td className="px-3.5 py-[5px] text-right">
                        <span className="font-semibold tabular-nums" style={{ color }}>
                          {f.ratio} %
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {overloaded.length > 0 ? (
              <p className="mt-1.5 flex items-start gap-1.5 px-3.5 text-[10px] leading-snug text-[#D92D20]">
                <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                {overloaded.map((f) => f.fn).join(", ")} dépasse
                {overloaded.length > 1 ? "nt" : ""} la capacité prévue à l&apos;étape 3.
              </p>
            ) : null}
          </Panel>

          {/* ================================================ Planning Gantt */}
          <Panel
            title="Planning généré"
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
            action={
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) =>
                    c.length === GENERATED_PHASES.length
                      ? []
                      : GENERATED_PHASES.map((p) => p.gate),
                  )
                }
                className="text-[11px] font-medium text-[#0E7C52] hover:underline"
              >
                {collapsed.length === GENERATED_PHASES.length ? "Tout déplier" : "Tout replier"}
              </button>
            }
            className="col-span-12 shrink-0"
            bodyClassName="px-0"
          >
            {/* Échelle des mois */}
            <div className="flex border-b border-border pb-1 pl-3.5 pr-3.5">
              <span className="w-[280px] shrink-0" />
              <span className="flex min-w-0 flex-1">
                {MONTHS.map((m, i) => (
                  <span
                    key={`${m}-${i}`}
                    className="flex-1 border-l border-border/60 pl-1 text-[9px] text-muted-foreground"
                  >
                    {m}
                  </span>
                ))}
              </span>
            </div>

            {GENERATED_PHASES.map((phase) => {
              const isCollapsed = collapsed.includes(phase.gate);
              // La phase s'étend du début de sa première tâche à la fin de la
              // dernière : la barre de regroupement se calcule, elle non plus
              // n'est pas positionnée à la main.
              const from = Math.min(...phase.tasks.map((t) => t.start));
              const to = Math.max(...phase.tasks.map((t) => t.start + t.span));
              const load = phase.tasks.reduce((n, t) => n + t.load, 0);

              return (
                <div key={phase.gate} className="border-b border-border/60 last:border-0">
                  {/* Ligne de phase — cliquable pour replier */}
                  <button
                    type="button"
                    onClick={() => toggle(phase.gate)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center py-1.5 pl-3.5 pr-3.5 text-left transition-colors hover:bg-muted"
                  >
                    <span className="flex w-[280px] shrink-0 items-center gap-1.5">
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span
                        className="flex h-[18px] w-[22px] shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
                        style={{ backgroundColor: phase.color }}
                      >
                        {phase.gate}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-foreground">
                        {phase.label}
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                        {phase.tasks.length} · {formatNumber(load)} h
                      </span>
                    </span>

                    <span className="relative flex h-4 min-w-0 flex-1 items-center">
                      <span
                        className="absolute h-[7px] rounded-sm"
                        style={{
                          left: `${(from / SPAN) * 100}%`,
                          width: `${((to - from) / SPAN) * 100}%`,
                          backgroundColor: phase.color,
                        }}
                      />
                      {/* Jalon de fin de phase */}
                      <span
                        className="absolute h-2.5 w-2.5 rotate-45 rounded-[1px]"
                        style={{
                          left: `calc(${(to / SPAN) * 100}% - 5px)`,
                          backgroundColor: phase.color,
                        }}
                        title={`${phase.gate} — ${phase.date}`}
                      />
                    </span>
                  </button>

                  {/* Tâches de la phase */}
                  {!isCollapsed
                    ? phase.tasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center py-[3px] pl-3.5 pr-3.5 hover:bg-[#FCFCFD]"
                        >
                          <span className="flex w-[280px] shrink-0 items-center gap-1.5 pl-6">
                            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                              {t.id}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                              {t.label}
                            </span>
                            {t.critical ? (
                              <span
                                className="shrink-0 text-[9px] font-bold text-[#D92D20]"
                                title="Sur le chemin critique"
                              >
                                CC
                              </span>
                            ) : null}
                          </span>

                          <span className="relative flex h-3.5 min-w-0 flex-1 items-center">
                            <span
                              className="absolute h-[6px] rounded-sm"
                              style={{
                                left: `${(t.start / SPAN) * 100}%`,
                                width: `${(t.span / SPAN) * 100}%`,
                                backgroundColor: t.critical ? "#D92D20" : phase.color,
                                opacity: t.critical ? 1 : 0.5,
                              }}
                            />
                          </span>
                        </div>
                      ))
                    : null}
                </div>
              );
            })}
          </Panel>

          {/* ============================================== Tableau des tâches */}
          <Panel
            title="Tâches générées"
            icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
            action={
              <span className="text-[11px] text-muted-foreground">
                {totals.tasks} tâches · {formatNumber(totals.load)} h
              </span>
            }
            className="col-span-12 shrink-0"
            bodyClassName="px-0"
          >
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  {["Gate", "ID", "Tâche", "Responsable", "Fonction", "Début", "Durée", "Charge", "Chemin critique"].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-2.5 py-1.5 font-medium first:pl-3.5 last:pr-3.5"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {GENERATED_TASKS.map((t) => {
                  const phase = GENERATED_PHASES.find((p) => p.gate === t.gate);
                  return (
                    <tr key={t.id} className="border-b border-border/60 last:border-0">
                      <td className="py-[5px] pl-3.5 pr-2.5">
                        <span
                          className="inline-flex h-[17px] w-[22px] items-center justify-center rounded text-[9px] font-bold text-white"
                          style={{ backgroundColor: phase?.color ?? "#667085" }}
                        >
                          {t.gate}
                        </span>
                      </td>
                      <td className="px-2.5 py-[5px] font-medium tabular-nums text-muted-foreground">
                        {t.id}
                      </td>
                      <td className="px-2.5 py-[5px] text-foreground">{t.label}</td>
                      <td className="px-2.5 py-[5px] text-muted-foreground">{t.owner}</td>
                      <td className="px-2.5 py-[5px] text-muted-foreground">{t.fn}</td>
                      <td className="whitespace-nowrap px-2.5 py-[5px] tabular-nums text-muted-foreground">
                        {/* Décalage en mois depuis le kickoff, traduit en mois calendaire. */}
                        {MONTHS[Math.floor(t.start) % SPAN]}
                        {t.start >= 3 ? " 2027" : " 2026"}
                      </td>
                      <td className="whitespace-nowrap px-2.5 py-[5px] tabular-nums text-muted-foreground">
                        {t.span < 1
                          ? `${Math.round(t.span * 4)} sem.`
                          : `${t.span.toFixed(1).replace(".0", "").replace(".", ",")} mois`}
                      </td>
                      <td className="px-2.5 py-[5px]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-11 shrink-0 text-right tabular-nums text-foreground">
                            {t.load} h
                          </span>
                          <ProgressBar
                            value={(t.load / 340) * 100}
                            color={phase?.color ?? "#667085"}
                            className="w-14"
                          />
                        </span>
                      </td>
                      <td className="py-[5px] pl-2.5 pr-3.5">
                        {t.critical ? (
                          <Chip tone="red">Critique</Chip>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </div>

        {/* Bandeau de fin — l'état se déduit des ratios calculés plus haut. */}
        <Card
          className={`flex shrink-0 items-center gap-2 px-3.5 py-2 ${
            overloaded.length > 0
              ? "border-[#F8DEB0] bg-[#FEF6E7]"
              : "border-[#BFEFD5] bg-[#F1FCF6]"
          }`}
        >
          {overloaded.length > 0 ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#E58A00]" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
          )}
          <p className="min-w-0 flex-1 text-[12px] text-foreground">
            {overloaded.length > 0 ? (
              <>
                <span className="font-semibold">Prêt à générer, sous réserve :</span>{" "}
                {overloaded.map((f) => f.fn).join(", ")} dépasse
                {overloaded.length > 1 ? "nt" : ""} la capacité. Le projet peut être créé et
                arbitré ensuite depuis le planning.
              </>
            ) : (
              <>
                <span className="font-semibold">Prêt à générer :</span> {totals.gates} gates,{" "}
                {totals.tasks} tâches et {formatNumber(totals.load)} h réparties sur{" "}
                {totals.owners} ressources.
              </>
            )}
          </p>
        </Card>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button onClick={() => router.push("/nouveau-projet/etape-3")}>
            <ChevronLeft className="h-4 w-4" />
            Étape précédente
          </Button>
          <Button onClick={() => router.push("/planning")}>
            <Eye className="h-4 w-4" />
            Voir le planning initial
          </Button>
          <Button
            variant="ghost"
            className="ml-auto border-border"
            onClick={() => router.push("/portefeuille")}
          >
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
