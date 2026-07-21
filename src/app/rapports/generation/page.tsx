"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ReportSteps } from "@/components/reports/report-parts";
import { PageTitle } from "@/components/shared/page-parts";
import { Button, Card, Panel } from "@/components/ui/primitives";
import { CURRENT_USER, STATUS_DATE, formatDuration, reportTemplate } from "@/lib/data";
import { buildReport, reportFacts } from "@/lib/report-content";
import { nextReportId, useReportDraft, useReportLibrary } from "@/lib/report-draft";

/**
 * Étapes de la génération. `at` est le pourcentage d'avancement auquel l'étape
 * est terminée : la barre et la liste lisent la même valeur, elles ne peuvent
 * pas se désynchroniser.
 */
const STAGES = [
  { at: 12, label: "Analyse des données projet", detail: "Collecte des projets, gates et livrables" },
  { at: 28, label: "Sélection du modèle", detail: "Structure adaptée au contexte" },
  { at: 52, label: "Construction de la structure", detail: "Organisation des sections et des contenus" },
  { at: 84, label: "Rédaction des sections clés", detail: "Génération des textes" },
  { at: 100, label: "Vérification de cohérence", detail: "Contrôles qualité et conformité APQP" },
];

/** Durée réelle de l'animation. La durée annoncée, elle, reste celle du modèle. */
const RUN_MS = 9000;
const TICK_MS = 90;

export default function GenerationPage() {
  const router = useRouter();
  const { draft, setDraft } = useReportDraft();
  const [library] = useReportLibrary();
  const [progress, setProgress] = React.useState(0);
  const done = progress >= 100;

  const spec = reportTemplate(draft.params.template);
  /* Durée annoncée : le milieu de la fourchette du modèle. */
  const announced = Math.round((spec.estimate[0] + spec.estimate[1]) / 2);

  const report = React.useMemo(
    () => buildReport(draft.params, draft.overrides),
    [draft.params, draft.overrides],
  );
  const facts = React.useMemo(() => reportFacts(draft.params), [draft.params]);

  /* L'animation avance seule ; elle ne dépend d'aucun état extérieur. */
  React.useEffect(() => {
    setProgress(0);
    const step = (100 * TICK_MS) / RUN_MS;
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + step));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  /*
   * Le rapport n'est marqué comme généré qu'une fois l'animation terminée :
   * l'écran d'aperçu ne doit pas pouvoir s'ouvrir sur un document à moitié
   * composé si l'utilisateur navigue à la main.
   */
  React.useEffect(() => {
    if (!done || draft.generated) return;
    const now = new Date();
    const stamp = `${STATUS_DATE} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    setDraft((d) => ({
      ...d,
      generated: true,
      id: d.id || nextReportId(library),
      generatedAt: stamp,
      editedAt: stamp,
      genSeconds: announced,
      status: "Généré",
      version: "V1.0",
      history: [
        { version: "V1.0", date: stamp, author: CURRENT_USER.name, status: "Généré" },
      ],
    }));
  }, [done, draft.generated, setDraft, library, announced]);

  const remaining = Math.max(0, Math.round(announced * (1 - progress / 100)));
  const currentIndex = STAGES.findIndex((s) => progress < s.at);
  const current = currentIndex === -1 ? STAGES.length - 1 : currentIndex;

  /* Journal : une ligne par étape franchie, la plus récente en tête. */
  const activity = STAGES.slice(0, current + (done ? 1 : 0))
    .map((s, i) => ({
      label: s.label,
      detail:
        i === 0
          ? `${report.sections.length} sections identifiées`
          : i === 1
            ? spec.name
            : i === 2
              ? `${report.sections.filter((x) => x.kind === "data").length} blocs de données assemblés`
              : i === 3
                ? `${report.sections.filter((x) => x.kind === "text").length} sections rédigées`
                : `Décision proposée : ${facts.decision}`,
      icon: [BarChart3, FileText, CalendarClock, Sparkles, ShieldCheck][i],
    }))
    .reverse();

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Génération du rapport"
          subtitle={draft.params.name}
        />

        <ReportSteps current={3} />

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          {/* -------------------------------------------- Avancement */}
          <Card className="col-span-5 flex flex-col items-center justify-center px-6 py-4">
            <div className="relative flex h-[132px] w-[132px] items-center justify-center">
              {/* Anneau d'avancement — un dégradé conique piloté par le pourcentage. */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#16A46B ${progress * 3.6}deg, #EAECF0 ${progress * 3.6}deg)`,
                }}
              />
              <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white">
                {done ? (
                  <CheckCircle2 className="h-8 w-8 text-[#2E7D32]" />
                ) : (
                  <Sparkles className="h-7 w-7 text-[#0E7C52]" />
                )}
                <span className="mt-1 text-[22px] font-bold leading-none text-foreground tabular-nums">
                  {Math.round(progress)} %
                </span>
              </div>
            </div>

            <p className="mt-3 text-center text-[15px] font-bold text-foreground">
              {done ? "Votre rapport est prêt" : "L'IA prépare votre rapport"}
            </p>
            <p className="mt-1 max-w-[300px] text-center text-[11px] leading-snug text-muted-foreground">
              {done
                ? `${report.sections.length} sections composées à partir des données du portefeuille. Les textes restent modifiables, les chiffres non.`
                : "Les données projet sont analysées, les sections structurées puis rédigées, avant contrôle de cohérence APQP."}
            </p>

            <div className="mt-3 flex w-full max-w-[320px] items-center gap-2">
              <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#EAECF0]">
                <span
                  className="block h-full rounded-full bg-[#16A46B] transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
                {done ? formatDuration(announced) : formatDuration(remaining)}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {done ? "Temps de génération" : "Temps estimé restant"}
            </p>

            <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-[10px] leading-snug text-muted-foreground">
              <Info className="mt-px h-3 w-3 shrink-0" />
              Démonstration : la génération est rejouée en accéléré. La durée affichée est celle
              annoncée par le modèle.
            </p>
          </Card>

          {/* -------------------------------------------- Étapes */}
          <Panel
            title="Étapes de génération"
            icon={<Loader2 className={`h-4 w-4 text-muted-foreground ${done ? "" : "animate-spin"}`} />}
            className="col-span-4"
          >
            <ol className="space-y-2.5">
              {STAGES.map((s, i) => {
                const finished = progress >= s.at;
                const running = !finished && i === current;
                return (
                  <li key={s.label} className="flex gap-2.5">
                    <span className="flex flex-col items-center">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          finished
                            ? "bg-[#E8FBF1] text-[#0E7C52]"
                            : running
                              ? "bg-[#0E7C52] text-white"
                              : "border border-border bg-white text-muted-foreground"
                        }`}
                      >
                        {finished ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : running ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span className="text-[10px] font-bold">{i + 1}</span>
                        )}
                      </span>
                      {i < STAGES.length - 1 ? (
                        <span className="mt-1 w-px flex-1 bg-border" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 pb-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={`min-w-0 flex-1 truncate text-[12px] font-semibold ${
                            finished || running ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] font-medium ${
                            finished
                              ? "text-[#2E7D32]"
                              : running
                                ? "text-[#0E7C52]"
                                : "text-muted-foreground"
                          }`}
                        >
                          {finished ? "Terminé" : running ? "En cours" : "À venir"}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {s.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Panel>

          {/* -------------------------------------------- Journal */}
          <Panel
            title="Activité en temps réel"
            icon={<Sparkles className="h-4 w-4 text-[#0E7C52]" />}
            action={
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#0E7C52]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A46B]" />
                {done ? "Terminé" : "En direct"}
              </span>
            }
            className="col-span-3"
          >
            {activity.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Démarrage de la génération…</p>
            ) : (
              <ul className="space-y-2">
                {activity.map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.label} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E8FBF1]">
                        <Icon className="h-3.5 w-3.5 text-[#0E7C52]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold leading-tight text-foreground">
                          {a.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                          {a.detail}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <p className="min-w-0 flex-1 text-[11px] text-muted-foreground">
            Cette génération est réalisée à partir des données projet, des modèles APQP et des
            règles de mise en forme.
          </p>
          <Button onClick={() => router.push("/rapports/nouveau")}>
            <X className="h-4 w-4" />
            {done ? "Modifier les paramètres" : "Annuler la génération"}
          </Button>
          <Button
            variant="primary"
            disabled={!done}
            onClick={() => router.push("/rapports/apercu")}
          >
            Ouvrir le rapport
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
