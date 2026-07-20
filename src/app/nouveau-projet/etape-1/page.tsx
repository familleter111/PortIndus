"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  FileText,
  Package,
  RefreshCw,
  Sparkles,
  Target,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle } from "@/components/shared/page-parts";
import { WizardSteps } from "@/components/shared/wizard-steps";
import { Button, Input, Panel, Select } from "@/components/ui/primitives";
import { NEW_PROJECT } from "@/lib/data";

/** Icône par section de la description générée. */
const AI_SECTION_ICONS: Record<string, React.ReactNode> = {
  package: <Package className="h-3.5 w-3.5" />,
  target: <Target className="h-3.5 w-3.5" />,
  alert: <AlertTriangle className="h-3.5 w-3.5" />,
  calendar: <CalendarDays className="h-3.5 w-3.5" />,
};

export default function Etape1Page() {
  const router = useRouter();

  return (
    <AppShell notifications={8}>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Créer un nouveau projet — Étape 1/4"
          subtitle="Définir les éléments clés du projet"
        />

        <WizardSteps current={1} />

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
          {/* Left: form + summary */}
          <div className="flex min-h-0 flex-col gap-3">
            <Panel title="Informations générales" className="min-h-0 flex-1">
              <div className="space-y-2.5">
                <Row label="Code projet" required>
                  <Input defaultValue={NEW_PROJECT.code} />
                </Row>
                <Row label="Nom projet" required>
                  <Input defaultValue={NEW_PROJECT.name} />
                </Row>
                <Row label="Client" required>
                  <Select defaultValue={NEW_PROJECT.client}>
                    <option>OEM Alpha</option>
                    <option>OEM Beta</option>
                    <option>OEM Gamma</option>
                  </Select>
                </Row>
                <Row label="Produit / Pièce" required>
                  <Input defaultValue={NEW_PROJECT.part} />
                </Row>
                <Row label="Chef de projet" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#E8FBF1] text-[9px] font-bold text-[#0E7C52]">
                      {NEW_PROJECT.managerInitials}
                    </span>
                    <Select defaultValue={NEW_PROJECT.manager} className="pl-9">
                      <option>Leïla Mansour</option>
                      <option>Hatem Ben Ali</option>
                      <option>Sarra Khelifi</option>
                    </Select>
                  </div>
                </Row>
                <Row label="Template" required>
                  <Select defaultValue={NEW_PROJECT.template}>
                    <option>APQP Light — Nouveau produit</option>
                    <option>APQP Full — Nouveau process</option>
                  </Select>
                </Row>
                <Row label="Catégorie projet" required>
                  <Select defaultValue={NEW_PROJECT.category}>
                    <option>Nouveau produit</option>
                    <option>Modification produit</option>
                    <option>Transfert</option>
                  </Select>
                </Row>

                <Row label="Documents">
                  <DocumentUpload />
                </Row>
              </div>
            </Panel>

            <Panel title="Résumé du nouveau projet" className="shrink-0">
              <div className="flex divide-x divide-border">
                {[
                  { icon: <Building2 className="h-4 w-4 text-muted-foreground" />, k: "Client", v: NEW_PROJECT.client },
                  { icon: <Package className="h-4 w-4 text-muted-foreground" />, k: "Produit / Pièce", v: NEW_PROJECT.part },
                  { icon: <UserRound className="h-4 w-4 text-muted-foreground" />, k: "Chef de projet", v: NEW_PROJECT.manager },
                  { icon: <FileText className="h-4 w-4 text-muted-foreground" />, k: "Template", v: NEW_PROJECT.template },
                ].map((item) => (
                  <div key={item.k} className="flex min-w-0 flex-1 items-start gap-2 px-3 first:pl-0 last:pr-0">
                    {item.icon}
                    <div className="min-w-0 leading-tight">
                      <p className="text-[10px] text-muted-foreground">{item.k}</p>
                      <p className="text-[12px] font-semibold text-foreground">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Right: description + objectives */}
          <div className="flex min-h-0 flex-col gap-3">
            <Panel
              title={
                <span className="flex items-center gap-1.5">
                  Description du projet par IA
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#BFEFD5] bg-[#E8FBF1] px-1.5 py-0.5 text-[9px] font-semibold text-[#0E7C52]">
                    <Sparkles className="h-2.5 w-2.5" />
                    Générée
                  </span>
                </span>
              }
              action={
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-medium text-[#0E7C52] hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Régénérer
                </button>
              }
              className="min-h-0 flex-1"
            >
              <p className="text-[12px] leading-relaxed text-foreground">
                {NEW_PROJECT.aiDescription.summary}
              </p>

              {/* Ce sur quoi la génération s'appuie — la description n'est pas
                  sortie de nulle part, elle découle des champs de gauche. */}
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Établie à partir de :</span>
                {NEW_PROJECT.aiDescription.basedOn.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <div className="mt-3 space-y-2.5">
                {NEW_PROJECT.aiDescription.sections.map((s) => (
                  <div key={s.title}>
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <span className="text-[#0E7C52]">{AI_SECTION_ICONS[s.icon]}</span>
                      {s.title}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {s.lines.map((l) => (
                        <li key={l} className="flex items-start gap-1.5">
                          <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#16A46B]" />
                          <span className="text-[11px] leading-snug text-muted-foreground">
                            {l}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <p className="mt-3 border-t border-border pt-2 text-[10px] italic text-muted-foreground">
                Proposition automatique — relisez-la et ajustez avant de continuer.
              </p>
            </Panel>

            <Panel title="Objectifs clés" className="shrink-0">
              <ul className="space-y-2">
                {NEW_PROJECT.objectives.map((o) => (
                  <li
                    key={o}
                    className="flex items-center gap-2 border-b border-dashed border-border pb-2 last:border-0 last:pb-0"
                  >
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-[#0E7C52]">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-[12px] text-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="flex shrink-0 justify-end gap-2.5">
              <Button variant="ghost" className="border-border" onClick={() => router.push("/portefeuille")}>
                Annuler
              </Button>
              <Button onClick={() => router.push("/portefeuille")}>
                <ArrowLeft className="h-4 w-4" />
                Retour portefeuille
              </Button>
              <Button variant="primary" onClick={() => router.push("/nouveau-projet/etape-2")}>
                Continuer vers Équipe projet
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Documents joints                                                           */
/* -------------------------------------------------------------------------- */

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

/** Pastille de type : la couleur vient de l'extension réelle du fichier. */
const EXT_TONE: Record<string, { bg: string; fg: string }> = {
  pdf: { bg: "#FEF3F2", fg: "#D92D20" },
  doc: { bg: "#EFF6FF", fg: "#3976D3" },
  docx: { bg: "#EFF6FF", fg: "#3976D3" },
  xls: { bg: "#E8FBF1", fg: "#0E7C52" },
  xlsx: { bg: "#E8FBF1", fg: "#0E7C52" },
  ppt: { bg: "#FEF6E7", fg: "#E58A00" },
  pptx: { bg: "#FEF6E7", fg: "#E58A00" },
};

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** 1258291 → « 1,2 Mo ». */
function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const ko = bytes / 1024;
  if (ko < 1024) return `${Math.round(ko)} Ko`;
  return `${(ko / 1024).toFixed(1).replace(".", ",")} Mo`;
}

/**
 * Dépôt de pièces jointes. Les fichiers ne partent nulle part — l'application
 * est entièrement front-end — mais la sélection est réelle : nom, poids et type
 * sont lus depuis le fichier choisi, pas simulés.
 */
function DocumentUpload() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<{ id: string; name: string; size: number }[]>([]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).map((f) => ({
      // Nom + taille suffisent à distinguer deux sélections successives.
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
    }));
    setFiles((prev) => [...prev, ...picked]);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="sr-only"
        onChange={(e) => {
          add(e.target.files);
          // Permet de re-choisir le même fichier juste après l'avoir retiré.
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          add(e.dataTransfer.files);
        }}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-input px-2.5 py-2 text-left transition-colors hover:border-[#16A46B] hover:bg-[#F1FCF6]"
      >
        <UploadCloud className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] font-medium text-foreground">
            Glissez vos documents ou cliquez pour parcourir
          </span>
          <span className="block text-[10px] text-muted-foreground">
            PDF, Word, Excel, PowerPoint
          </span>
        </span>
      </button>

      {files.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {files.map((f) => {
            const ext = extensionOf(f.name);
            const tone = EXT_TONE[ext] ?? { bg: "#F5F6F8", fg: "#667085" };
            return (
              <li
                key={f.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-2 py-1.5"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[7px] font-bold uppercase"
                  style={{ backgroundColor: tone.bg, color: tone.fg }}
                >
                  {ext.slice(0, 4) || "?"}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[11px] font-medium text-foreground">
                    {f.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {humanSize(f.size)}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Retirer ${f.name}`}
                  onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-[#D92D20]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Label on the left, control on the right — the layout used by the mock. */
function Row({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[124px] shrink-0 text-[12px] text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-[#D92D20]">*</span> : null}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
