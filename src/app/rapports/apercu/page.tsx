"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileDown,
  History,
  Lock,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Type,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ExportModal, type ExportSettings } from "@/components/reports/export-modal";
import { ReportDocument, pageCount, pageOfSection } from "@/components/reports/report-document";
import { ReportSteps } from "@/components/reports/report-parts";
import { PageTitle } from "@/components/shared/page-parts";
import { Button, Card, Chip, Panel, Select } from "@/components/ui/primitives";
import {
  CURRENT_USER,
  REPORT_STATUS_TONE,
  formatDuration,
  reportScopeLabel,
  reportTemplate,
} from "@/lib/data";
import {
  SUGGESTIONS,
  buildReport,
  sectionText,
  type TextStyle,
} from "@/lib/report-content";
import {
  bumpVersion,
  docFromDraft,
  nextReportId,
  stamp,
  upsertReport,
  useReportDraft,
  useReportLibrary,
} from "@/lib/report-draft";

const ZOOMS = [0.6, 0.75, 0.9, 1, 1.25];

export default function ApercuRapportPage() {
  const router = useRouter();
  const { draft, setDraft, setOverride, clearOverride } = useReportDraft();
  const [library, setLibrary] = useReportLibrary();

  const [editing, setEditing] = React.useState(false);
  const [selected, setSelected] = React.useState<string>("synthese");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [zoom, setZoom] = React.useState(0.9);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [confirmRegen, setConfirmRegen] = React.useState(false);
  const [flash, setFlash] = React.useState<string | null>(null);
  const [printSettings, setPrintSettings] = React.useState<ExportSettings | null>(null);
  /* Le portail d'impression n'existe qu'après montage : `document` est absent au rendu serveur. */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const params = draft.params;
  const spec = reportTemplate(params.template);
  const report = React.useMemo(
    () => buildReport(params, draft.overrides),
    [params, draft.overrides],
  );

  const textSections = report.sections.filter((s) => s.kind === "text");
  const editedIds = Object.keys(draft.overrides);
  const totalPages = pageCount(params.template);

  // La section choisie doit exister : changer de modèle renouvelle les sections.
  React.useEffect(() => {
    if (!textSections.some((s) => s.id === selected) && textSections[0]) {
      setSelected(textSections[0].id);
    }
  }, [textSections, selected]);

  // Changer de modèle peut réduire le nombre de pages : la page affichée doit rester valide.
  React.useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  /** Sélectionne une section et se place sur la page qui la porte. */
  const selectSection = (id: string) => {
    setSelected(id);
    setEditing(true);
    setCurrentPage(pageOfSection(params.template, id));
  };

  const currentSection = report.sections.find((s) => s.id === selected);
  const currentText = currentSection?.text ?? "";
  const words = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  const note = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 4000);
  };

  /** Applique une suggestion : le texte est régénéré dans un autre style. */
  const applyStyle = (style: TextStyle) => {
    setOverride(selected, sectionText(selected, params, style));
  };

  /** Enregistre le brouillon : nouvelle version, trace dans l'historique. */
  const save = () => {
    const at = stamp();
    const version = bumpVersion(draft.version);
    const next = {
      ...draft,
      version,
      editedAt: at,
      status: "En révision" as const,
      history: [
        { version, date: at, author: CURRENT_USER.name, status: "En révision" as const },
        ...draft.history,
      ],
    };
    setDraft(next);
    setLibrary((all) => upsertReport(all, docFromDraft(next)));
    note(`Brouillon enregistré en ${version}.`);
  };

  /** Duplique le rapport : nouvel identifiant, versions repartant de zéro. */
  const duplicate = () => {
    const at = stamp();
    const copy = {
      ...docFromDraft(draft),
      id: nextReportId(library),
      name: `${params.name} (copie)`,
      version: "V1.0",
      status: "Brouillon" as const,
      generatedAt: at,
      editedAt: at,
      history: [
        { version: "V1.0", date: at, author: CURRENT_USER.name, status: "Brouillon" as const },
      ],
    };
    setLibrary((all) => upsertReport(all, copy));
    note(`Copie créée sous l'identifiant ${copy.id}.`);
  };

  /** Export : le rapport est versionné, puis remis au navigateur pour le PDF. */
  const exportPdf = (settings: ExportSettings) => {
    const at = stamp();
    const version = bumpVersion(draft.version, true);
    const next = {
      ...draft,
      version,
      editedAt: at,
      status: "Exporté PDF" as const,
      history: [
        { version, date: at, author: CURRENT_USER.name, status: "Exporté PDF" as const },
        ...draft.history,
      ],
    };
    setDraft(next);
    setLibrary((all) => upsertReport(all, docFromDraft(next)));
    setPrintSettings(settings);
    setExportOpen(false);
    note(`${settings.fileName}.pdf — ${version} enregistrée dans la bibliothèque.`);
    // Le portail d'impression doit être peint avant l'ouverture de la boîte.
    window.setTimeout(() => window.print(), 120);
  };

  const regenerate = () => {
    setDraft((d) => ({ ...d, overrides: {}, generated: false }));
    router.push("/rapports/generation");
  };

  /*
   * Le brouillon n'est relu qu'après montage : afficher quoi que ce soit avant
   * ferait clignoter le mauvais rapport — ou l'écran « rien à afficher » alors
   * qu'un rapport vient d'être généré.
   */
  if (!mounted) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p className="text-[13px] text-muted-foreground">Ouverture du rapport…</p>
        </div>
      </AppShell>
    );
  }

  if (!draft.generated) {
    return (
      <AppShell>
        <div className="flex h-full flex-col gap-3">
          <PageTitle title="Aperçu du rapport" subtitle="Aucun rapport généré pour l'instant." />
          <Card className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
            <AlertTriangle className="h-8 w-8 text-[#E58A00]" />
            <p className="max-w-[420px] text-center text-[13px] text-muted-foreground">
              Ce rapport n&apos;a pas encore été généré. Lancez la génération pour en voir
              l&apos;aperçu.
            </p>
            <Button variant="primary" onClick={() => router.push("/rapports/nouveau")}>
              <Sparkles className="h-4 w-4" />
              Configurer un rapport
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title={editing ? "Édition du rapport" : "Aperçu du rapport généré"}
          subtitle={`${draft.id} · ${spec.name}`}
          action={
            <div className="flex items-center gap-2">
              <Chip tone={REPORT_STATUS_TONE[draft.status]}>{draft.status}</Chip>
              <Chip tone="slate">{draft.version}</Chip>
            </div>
          }
        />

        <ReportSteps current={4} />

        {/* Barre d'outils du document */}
        <Card className="flex shrink-0 items-center gap-2 px-2.5 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Réduire l'aperçu"
              onClick={() => setZoom((z) => ZOOMS[Math.max(0, ZOOMS.indexOf(z) - 1)] ?? z)}
              disabled={zoom === ZOOMS[0]}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <Select
              value={String(zoom)}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-7 w-[86px] text-[11px]"
            >
              {ZOOMS.map((z) => (
                <option key={z} value={z}>
                  {Math.round(z * 100)} %
                </option>
              ))}
            </Select>
            <button
              type="button"
              aria-label="Agrandir l'aperçu"
              onClick={() =>
                setZoom((z) => ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(z) + 1)] ?? z)
              }
              disabled={zoom === ZOOMS[ZOOMS.length - 1]}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="h-4 w-px bg-border" />

          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <button
              type="button"
              aria-label="Page précédente"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md p-0.5 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Page suivante"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md p-0.5 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </span>

          <span className="h-4 w-px bg-border" />

          <span className="text-[11px] text-muted-foreground">
            {report.sections.length} sections ·{" "}
            <span className="font-medium text-foreground">{textSections.length} modifiables</span> ·{" "}
            {report.sections.length - textSections.length} verrouillées
          </span>

          <div className="ml-auto flex items-center gap-2">
            {confirmRegen ? (
              <>
                <span className="text-[11px] text-muted-foreground">
                  {editedIds.length > 0
                    ? `Perdre ${editedIds.length} section${editedIds.length > 1 ? "s" : ""} retouchée${editedIds.length > 1 ? "s" : ""} ?`
                    : "Relancer la génération ?"}
                </span>
                <Button
                  variant="primary"
                  className="h-7 px-2.5 py-1 text-[11px]"
                  onClick={regenerate}
                >
                  Régénérer
                </Button>
                <Button
                  variant="ghost"
                  className="h-7 border-border px-2.5 py-1 text-[11px]"
                  onClick={() => setConfirmRegen(false)}
                >
                  Non
                </Button>
              </>
            ) : (
              <Button
                className="h-7 px-2.5 py-1 text-[11px]"
                onClick={() => setConfirmRegen(true)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Régénérer
              </Button>
            )}

            <Button
              variant={editing ? "ghost" : "primary"}
              className={`h-7 px-2.5 py-1 text-[11px] ${editing ? "border-border" : ""}`}
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Aperçu final
                </>
              ) : (
                <>
                  <Type className="h-3.5 w-3.5" />
                  Mode édition texte
                </>
              )}
            </Button>
          </div>
        </Card>

        {flash ? (
          <Card className="flex shrink-0 items-center gap-2 border-[#BFEFD5] bg-[#F1FCF6] px-3 py-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
            <p className="text-[12px] text-foreground">{flash}</p>
          </Card>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          {/* ------------------------------------------------ Le document */}
          <div className="col-span-8 min-h-0 overflow-y-auto rounded-xl border border-border bg-muted/40 p-3 scrollbar-thin">
            <ReportDocument
              report={report}
              params={params}
              version={draft.version}
              date={draft.generatedAt}
              page={currentPage}
              zoom={zoom}
              selected={editing ? selected : undefined}
              onSelect={selectSection}
              editedIds={editedIds}
            />
          </div>

          {/* ------------------------------------------------ Panneau droit */}
          {editing ? (
            <Panel
              title="Éditeur de texte"
              icon={<Pencil className="h-4 w-4 text-[#0E7C52]" />}
              className="col-span-4"
            >
              <Select value={selected} onChange={(e) => selectSection(e.target.value)}>
                {textSections.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}. {s.title}
                  </option>
                ))}
              </Select>

              <textarea
                value={currentText}
                onChange={(e) => setOverride(selected, e.target.value)}
                rows={11}
                className="mt-2 w-full resize-none rounded-lg border border-input bg-white p-2.5 text-[12px] leading-relaxed text-foreground focus:border-[#16A46B] focus:outline-none focus:ring-1 focus:ring-[#16A46B]"
              />

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>
                  {draft.overrides[selected] !== undefined ? "Modifié à la main" : "Texte généré"}
                </span>
                <span className="tabular-nums">
                  {words} mots · {currentText.length} caractères
                </span>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-[#0E7C52]" />
                Suggestions
              </p>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s.label}
                    className="justify-start px-2 py-1.5 text-[11px]"
                    onClick={() => applyStyle(s.style)}
                  >
                    {s.label}
                  </Button>
                ))}
                <Button
                  className="justify-start px-2 py-1.5 text-[11px]"
                  disabled={draft.overrides[selected] === undefined}
                  onClick={() => clearOverride(selected)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Réinitialiser
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                Chaque suggestion réécrit la section à partir des mêmes données, dans un autre
                registre. Les chiffres cités restent ceux du portefeuille.
              </p>

              <div className="mt-2.5 border-t border-border pt-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  Historique des versions
                </p>
                <ul className="mt-1 space-y-1">
                  {draft.history.map((h, i) => (
                    <li key={`${h.version}-${h.date}`} className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          i === 0 ? "bg-[#16A46B]" : "bg-border"
                        }`}
                      />
                      <span className="w-9 shrink-0 text-[11px] font-semibold text-foreground">
                        {h.version}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                        {h.date}
                      </span>
                      <Chip tone={REPORT_STATUS_TONE[h.status]}>{h.status}</Chip>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                <Button onClick={save}>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
                <Button variant="primary" onClick={() => setExportOpen(true)}>
                  <FileDown className="h-4 w-4" />
                  Exporter
                </Button>
              </div>
            </Panel>
          ) : (
            <Panel
              title="Panneau d'actions"
              icon={<FileDown className="h-4 w-4 text-muted-foreground" />}
              className="col-span-4"
            >
              <div className="grid gap-1.5">
                <Button onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  Éditer le texte
                </Button>
                <Button variant="primary" onClick={() => setExportOpen(true)}>
                  <FileDown className="h-4 w-4" />
                  Exporter en PDF
                </Button>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button onClick={save}>
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </Button>
                  <Button onClick={duplicate}>
                    <Copy className="h-4 w-4" />
                    Dupliquer
                  </Button>
                </div>
              </div>

              <dl className="mt-2.5 space-y-1 border-t border-border pt-2">
                {[
                  { k: "Modèle", v: spec.name },
                  { k: "Périmètre", v: reportScopeLabel(params.scopeId) },
                  { k: "Période", v: params.period.split(" (")[0] },
                  { k: "Généré le", v: draft.generatedAt },
                  { k: "Temps de génération", v: formatDuration(draft.genSeconds) },
                  { k: "Auteur", v: CURRENT_USER.name },
                  { k: "Confidentialité", v: params.confidentiality },
                ].map((r) => (
                  <div key={r.k} className="flex items-baseline gap-2 text-[11px]">
                    <dt className="w-[112px] shrink-0 text-muted-foreground">{r.k}</dt>
                    <dd className="min-w-0 flex-1 truncate font-medium text-foreground">{r.v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-2.5 border-t border-border pt-2 text-[11px] font-semibold text-foreground">
                Sections du rapport
              </p>
              <ul className="mt-1 space-y-0.5">
                {report.sections.map((s, i) => {
                  const isText = s.kind === "text";
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={!isText}
                        onClick={() => selectSection(s.id)}
                        title={
                          isText
                            ? "Modifier cette section"
                            : "Section issue des données — non modifiable"
                        }
                        className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-colors ${
                          isText ? "hover:bg-muted" : "cursor-default"
                        }`}
                      >
                        <span className="w-3 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                          {i + 1}
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate text-[11px] ${
                            isText ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {s.title}
                        </span>
                        {editedIds.includes(s.id) ? (
                          <span className="shrink-0 text-[9px] font-semibold text-[#0E7C52]">
                            modifié
                          </span>
                        ) : null}
                        {isText ? (
                          <Pencil className="h-3 w-3 shrink-0 text-[#0E7C52]" />
                        ) : (
                          <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-2 rounded-lg border border-border bg-muted/60 px-2.5 py-2 text-[10px] leading-snug text-muted-foreground">
                Les indicateurs et tableaux sont construits depuis les données du portefeuille :
                ils se mettent à jour avec elles et ne peuvent pas être retouchés dans le rapport.
              </p>
            </Panel>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button onClick={() => router.push("/rapports")}>
            <ChevronLeft className="h-4 w-4" />
            Retour aux rapports
          </Button>
          <Button onClick={() => router.push("/rapports/bibliotheque")}>
            Voir la bibliothèque
          </Button>
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        report={report}
        params={params}
        version={draft.version}
        date={draft.editedAt || draft.generatedAt}
        onExport={exportPdf}
      />

      {/*
        Support d'impression : masqué à l'écran, seul visible dans le PDF.
        Voir la règle @media print dans globals.css.
      */}
      {mounted
        ? createPortal(
            <div id="print-root">
              <style>{`@page { size: A4 ${printSettings?.orientation ?? "landscape"}; margin: 10mm; }`}</style>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <div key={p} style={{ breakAfter: p < totalPages ? "page" : "auto" }}>
                  <ReportDocument
                    report={report}
                    params={params}
                    version={draft.version}
                    date={draft.editedAt || draft.generatedAt}
                    page={p}
                    zoom={1}
                    bare
                    watermark={printSettings?.watermark}
                  />
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </AppShell>
  );
}
