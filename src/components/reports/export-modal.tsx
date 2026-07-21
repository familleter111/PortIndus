"use client";

import * as React from "react";
import { Download, FileDown, Info } from "lucide-react";

import { ReportDocument, pageCount } from "@/components/reports/report-document";
import { Toggle } from "@/components/reports/report-parts";
import { Button, Card, Field, Input, Modal, Select } from "@/components/ui/primitives";
import type { BuiltReport, ReportParams } from "@/lib/report-content";

export interface ExportSettings {
  fileName: string;
  orientation: "portrait" | "landscape";
  quality: string;
  watermark: boolean;
  pagination: boolean;
  dateStamp: boolean;
  recipients: string;
}

/** Nom de fichier propre : accents et espaces ne survivent pas au partage. */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function defaultSettings(name: string, version: string): ExportSettings {
  return {
    fileName: `${slugify(name)}_${version}`,
    // Les tableaux de bord APQP sont conçus au format large : le paysage évite
    // les marges vides qu'imposerait un A4 portrait.
    orientation: "landscape",
    quality: "Élevée (recommandée)",
    watermark: false,
    pagination: true,
    dateStamp: true,
    recipients: "",
  };
}

/**
 * Export PDF.
 *
 * Il n'y a pas de serveur pour fabriquer le fichier : chaque page du rapport
 * est capturée dans le navigateur (`exportReportToPdf`, via html2canvas et
 * jsPDF) puis assemblée en un vrai fichier .pdf, téléchargé directement —
 * jamais la boîte d'impression du navigateur.
 */
export function ExportModal({
  open,
  onClose,
  report,
  params,
  version,
  date,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  report: BuiltReport;
  params: ReportParams;
  version: string;
  date: string;
  onExport: (settings: ExportSettings) => void;
}) {
  const [settings, setSettings] = React.useState<ExportSettings>(() =>
    defaultSettings(report.title, version),
  );
  const pages = pageCount(params.template);

  // Le nom par défaut suit le rapport tant qu'il n'a pas été retouché.
  React.useEffect(() => {
    if (open) setSettings(defaultSettings(report.title, version));
  }, [open, report.title, version]);

  const set = (patch: Partial<ExportSettings>) => setSettings((s) => ({ ...s, ...patch }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-4xl"
      title="Exporter le rapport en PDF"
      subtitle={`${report.title} — ${version} — ${pages} page${pages > 1 ? "s" : ""}`}
      icon={
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8FBF1]">
          <FileDown className="h-5 w-5 text-[#0E7C52]" />
        </span>
      }
    >
      <div className="grid grid-cols-12 gap-3">
        {/* Aperçu réduit — ce qui partira réellement. La première page si le
            modèle en produit plusieurs. */}
        <Card className="col-span-7 max-h-[420px] space-y-2 overflow-y-auto bg-muted/50 p-3 scrollbar-thin">
          <ReportDocument
            report={report}
            params={params}
            version={version}
            date={date}
            page={1}
            zoom={0.62}
            watermark={settings.watermark}
          />
          {pages > 1 ? (
            <p className="text-center text-[10px] text-muted-foreground">
              + {pages - 1} autre{pages > 2 ? "s" : ""} page{pages > 2 ? "s" : ""} à l&apos;export
            </p>
          ) : null}
        </Card>

        <div className="col-span-5 space-y-2">
          <Field label="Nom du fichier">
            <div className="flex items-center gap-1.5">
              <Input
                value={settings.fileName}
                onChange={(e) => set({ fileName: e.target.value })}
              />
              <span className="shrink-0 text-[12px] text-muted-foreground">.pdf</span>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Orientation">
              <Select
                value={settings.orientation}
                onChange={(e) =>
                  set({ orientation: e.target.value as ExportSettings["orientation"] })
                }
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Paysage</option>
              </Select>
            </Field>
            <Field label="Qualité">
              <Select value={settings.quality} onChange={(e) => set({ quality: e.target.value })}>
                <option>Élevée (recommandée)</option>
                <option>Standard</option>
                <option>Compressée</option>
              </Select>
            </Field>
          </div>

          <div className="rounded-lg border border-border px-2 py-1.5">
            <Toggle
              checked={settings.watermark}
              onChange={(v) => set({ watermark: v })}
              label="Filigrane « Confidentiel »"
            />
            <Toggle
              checked={settings.pagination}
              onChange={(v) => set({ pagination: v })}
              label="Pagination"
            />
            <Toggle
              checked={settings.dateStamp}
              onChange={(v) => set({ dateStamp: v })}
              label="Horodater le nom du fichier"
              hint="Ajoute la date d'export à la fin du nom de fichier"
            />
          </div>

          <Field label="Destinataires (partage)">
            <Input
              placeholder="Ajouter un e-mail ou un groupe…"
              value={settings.recipients}
              onChange={(e) => set({ recipients: e.target.value })}
            />
          </Field>

          <p className="flex items-start gap-1.5 rounded-lg border border-border bg-muted/60 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" />
            Le fichier PDF est fabriqué dans votre navigateur puis téléchargé directement, sans
            passer par l&apos;impression. Aucun envoi n&apos;est effectué — les destinataires sont
            enregistrés avec le rapport.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <Button variant="ghost" className="border-border" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => onExport(settings)}
              disabled={!settings.fileName.trim()}
            >
              <Download className="h-4 w-4" />
              Télécharger le PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
