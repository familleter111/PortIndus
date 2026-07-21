"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Clock,
  Download,
  FileDown,
  FileText,
  Library,
  Pencil,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TemplateThumb } from "@/components/reports/report-parts";
import { KpiCard, PageTitle } from "@/components/shared/page-parts";
import { Button, Card, Chip, Panel } from "@/components/ui/primitives";
import {
  REPORT_STATUS_TONE,
  REPORT_TEMPLATES,
  reportScopeLabel,
  reportStats,
  reportTemplate,
  type ReportDoc,
} from "@/lib/data";
import { defaultParams } from "@/lib/report-content";
import { draftFromDoc, newDraft, useReportDraft, useReportLibrary } from "@/lib/report-draft";
import { getInitials } from "@/lib/utils";

/** Les quatre temps de la génération, tels qu'ils se jouent réellement. */
const PROCESS = [
  {
    icon: FileText,
    title: "Choix du modèle",
    detail: "Sélectionnez le rapport adapté à votre audience.",
  },
  {
    icon: Sparkles,
    title: "Génération IA",
    detail: "La structure est construite et remplie depuis vos données projet.",
  },
  {
    icon: Pencil,
    title: "Édition texte",
    detail: "Les sections rédigées se reprennent ; les chiffres restent verrouillés.",
  },
  {
    icon: FileDown,
    title: "Export PDF",
    detail: "Le rapport est versionné puis exporté, prêt à être partagé.",
  },
];

export default function RapportsPage() {
  const router = useRouter();
  const [library] = useReportLibrary();
  const { setDraft } = useReportDraft();

  const stats = React.useMemo(() => reportStats(library), [library]);
  const recent = React.useMemo(() => library.slice(0, 5), [library]);

  /** Démarre un rapport neuf sur le modèle choisi. */
  const start = (template: (typeof REPORT_TEMPLATES)[number]["id"]) => {
    setDraft({ ...newDraft(), params: defaultParams(template) });
    router.push("/rapports/nouveau");
  };

  /** Reprend un rapport existant à l'étape d'édition. */
  const open = (doc: ReportDoc) => {
    setDraft(draftFromDoc(doc));
    router.push("/rapports/apercu");
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Gestion des rapports"
          subtitle="Créez, générez, éditez et exportez vos rapports APQP."
          action={
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push("/rapports/bibliotheque")}>
                <Library className="h-4 w-4" />
                Bibliothèque
              </Button>
              <Button variant="primary" onClick={() => start("direction")}>
                <Plus className="h-4 w-4" />
                Nouveau rapport
              </Button>
            </div>
          }
        />

        <div className="grid shrink-0 grid-cols-4 gap-2.5">
          <KpiCard
            icon={<BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Rapports dans la bibliothèque"
            value={stats.total}
            note={`${stats.generated} générés par l'IA`}
          />
          <KpiCard
            icon={<FileDown className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Exports PDF"
            value={stats.exported}
            note="prêts à être partagés"
            tone="action"
          />
          <KpiCard
            icon={<Pencil className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Brouillons et révisions"
            value={stats.drafts + stats.reviewing}
            note={`${stats.drafts} brouillons · ${stats.reviewing} en révision`}
          />
          <KpiCard
            icon={<Timer className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Temps moyen de génération"
            value={stats.avgLabel}
            note="mesuré sur la bibliothèque"
          />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          <div className="col-span-9 flex min-h-0 flex-col gap-2.5">
            <Panel
              title="Choisir un modèle de rapport"
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              className="shrink-0"
            >
              <div className="grid grid-cols-3 gap-2.5">
                {REPORT_TEMPLATES.map((t) => (
                  <Card key={t.id} className="flex flex-col overflow-hidden p-2.5">
                    <TemplateThumb id={t.id} className="h-[112px]" />
                    <p className="mt-2 text-[12px] font-semibold leading-tight text-foreground">
                      {t.name}
                    </p>
                    <p className="mt-0.5 min-h-[28px] text-[11px] leading-snug text-muted-foreground">
                      {t.tagline}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Chip tone="action">{t.audience}</Chip>
                      <span className="text-[10px] text-muted-foreground">
                        {t.sections.length} sections
                      </span>
                    </div>
                    <Button className="mt-2 w-full" onClick={() => start(t.id)}>
                      Utiliser ce modèle
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </Panel>

            <Panel
              title="Rapports récents"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              action={
                <button
                  type="button"
                  onClick={() => router.push("/rapports/bibliotheque")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#0E7C52] hover:underline"
                >
                  Voir tous les rapports
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              }
              className="min-h-0 flex-1"
              bodyClassName="px-0"
            >
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Nom", "Type", "Périmètre", "Statut", "Dernière modification", "Auteur", ""].map(
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
                  {recent.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => open(r)}
                      className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-[#FCFCFD]"
                    >
                      <td className="py-2 pl-3.5 pr-2.5">
                        <span className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-[#0E7C52]" />
                          <span className="font-medium text-foreground">{r.name}</span>
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {reportTemplate(r.template).audience}
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {reportScopeLabel(r.scopeId)}
                      </td>
                      <td className="px-2.5 py-2">
                        <Chip tone={REPORT_STATUS_TONE[r.status]}>{r.status}</Chip>
                      </td>
                      <td className="px-2.5 py-2 tabular-nums text-muted-foreground">
                        {r.editedAt}
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8FBF1] text-[9px] font-bold text-[#0E7C52]">
                            {getInitials(r.author)}
                          </span>
                          {r.author}
                        </span>
                      </td>
                      <td className="py-2 pl-2.5 pr-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E7C52]">
                          {r.status === "Exporté PDF" ? (
                            <Download className="h-3.5 w-3.5" />
                          ) : (
                            <Pencil className="h-3.5 w-3.5" />
                          )}
                          Ouvrir
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Rail de droite — le parcours, expliqué une fois pour toutes. */}
          <Panel
            title="Processus de génération"
            icon={<Sparkles className="h-4 w-4 text-[#0E7C52]" />}
            className="col-span-3"
          >
            <p className="text-[11px] leading-snug text-muted-foreground">
              Le rapport est construit à partir des données du portefeuille : projets, gates,
              livrables, risques et charge. Rien n&apos;est ressaisi.
            </p>

            <ol className="mt-2.5 space-y-2.5">
              {PROCESS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <li key={p.title} className="flex gap-2.5">
                    <span className="flex flex-col items-center">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0E7C52] text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      {i < PROCESS.length - 1 ? (
                        <span className="mt-1 w-px flex-1 bg-border" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 pb-1">
                      <span className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-[#0E7C52]" />
                        <span className="text-[12px] font-semibold text-foreground">{p.title}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                        {p.detail}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-2 rounded-lg border border-[#BFEFD5] bg-[#F1FCF6] p-2.5">
              <p className="text-[11px] font-bold text-[#0E7C52]">Ce qui reste verrouillé</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Indicateurs, tableaux et graphiques sont issus des données et ne sont pas
                modifiables dans l&apos;éditeur. Seules les sections rédigées — synthèse,
                recommandations, décision — peuvent être reprises.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
