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
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle } from "@/components/shared/page-parts";
import { WizardSteps } from "@/components/shared/wizard-steps";
import { Button, Input, Panel, Select, Textarea } from "@/components/ui/primitives";
import { NEW_PROJECT } from "@/lib/data";
import {
  cloneDescription,
  useProjectDescription,
  type AiDescription,
  type AiIcon,
} from "@/lib/project-draft";
import { cn } from "@/lib/utils";

/** Icône par section de la description générée. */
const AI_SECTION_ICONS: Record<string, React.ReactNode> = {
  package: <Package className="h-3.5 w-3.5" />,
  target: <Target className="h-3.5 w-3.5" />,
  alert: <AlertTriangle className="h-3.5 w-3.5" />,
  calendar: <CalendarDays className="h-3.5 w-3.5" />,
};

/** Libellés du sélecteur d'icône, à l'ajout d'une section. */
const AI_ICON_LABELS: { value: AiIcon; label: string }[] = [
  { value: "package", label: "Périmètre" },
  { value: "target", label: "Exigences" },
  { value: "alert", label: "Risques" },
  { value: "calendar", label: "Jalons" },
];

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
            <AiDescriptionPanel />

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
/*  Description générée — lecture puis édition                                 */
/* -------------------------------------------------------------------------- */

/**
 * La description était figée : proposée par la génération, impossible à
 * corriger alors que l'étape 4 la reprend telle quelle en prévisualisation.
 * Elle passe en lecture / édition, et la saisie est conservée le temps de la
 * session pour que les étapes suivantes voient le texte retenu.
 */
function AiDescriptionPanel() {
  const { draft, save, reset, edited } = useProjectDescription();
  const [editing, setEditing] = React.useState(false);
  /** Tampon de saisie : « Annuler » doit pouvoir tout rendre. */
  const [form, setForm] = React.useState<AiDescription>(() => cloneDescription(draft));
  const [saved, setSaved] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  // Le brouillon est relu après montage : hors édition, on le suit.
  React.useEffect(() => {
    if (!editing) setForm(cloneDescription(draft));
  }, [draft, editing]);

  // La mention « Enregistré » s'efface d'elle-même.
  React.useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2400);
    return () => window.clearTimeout(t);
  }, [saved]);

  const blank =
    !form.summary.trim() ||
    form.sections.some((s) => !s.title.trim() || s.lines.some((l) => !l.trim()));

  const patchSection = (i: number, next: Partial<AiDescription["sections"][number]>) =>
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s, k) => (k === i ? { ...s, ...next } : s)),
    }));

  const commit = () => {
    // On enregistre le texte détouré : les espaces de saisie ne sont pas du contenu.
    save({
      ...form,
      summary: form.summary.trim(),
      sections: form.sections.map((s) => ({
        ...s,
        title: s.title.trim(),
        lines: s.lines.map((l) => l.trim()),
      })),
    });
    setEditing(false);
    setSaved(true);
  };

  return (
    <Panel
      title={
        <span className="flex items-center gap-1.5">
          Description du projet par IA
          {edited ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#F0DFC4] bg-[#FEF6E7] px-1.5 py-0.5 text-[9px] font-semibold text-[#B45F09]">
              <Pencil className="h-2.5 w-2.5" />
              Modifiée
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#BFEFD5] bg-[#E8FBF1] px-1.5 py-0.5 text-[9px] font-semibold text-[#0E7C52]">
              <Sparkles className="h-2.5 w-2.5" />
              Générée
            </span>
          )}
          {saved ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0E7C52]">
              <Check className="h-3 w-3" />
              Enregistré
            </span>
          ) : null}
        </span>
      }
      action={
        editing ? (
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setForm(cloneDescription(draft));
                setEditing(false);
              }}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={commit}
              disabled={blank}
              title={
                blank ? "Un champ est vide : complétez-le ou supprimez la ligne" : undefined
              }
              className="flex items-center gap-1 rounded-md bg-[#0E7C52] px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#0B6543] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              Enregistrer
            </button>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {/* Sans service de génération, « Régénérer » rétablit la proposition
                d'origine — et le dit, plutôt que de faire croire à un appel. */}
            {confirmReset ? (
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                Remplacer vos modifications ?
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                  }}
                  className="rounded-md bg-[#D92D20] px-1.5 py-0.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#B42318]"
                >
                  Remplacer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-md px-1 py-0.5 text-[10px] font-medium hover:bg-muted"
                >
                  Non
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => (edited ? setConfirmReset(true) : undefined)}
                disabled={!edited}
                title={
                  edited
                    ? "Rétablir la proposition générée"
                    : "La description est déjà celle qui a été générée"
                }
                className="flex items-center gap-1 text-[11px] font-medium text-[#0E7C52] transition-opacity hover:underline disabled:cursor-default disabled:opacity-40 disabled:hover:no-underline"
              >
                <RefreshCw className="h-3 w-3" />
                Régénérer
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Pencil className="h-3 w-3" />
              Modifier
            </button>
          </span>
        )
      }
      className="min-h-0 flex-1"
    >
      {editing ? (
        <Textarea
          rows={3}
          value={form.summary}
          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
          aria-label="Résumé du projet"
          placeholder="Résumé du projet…"
          className={cn("text-[12px]", !form.summary.trim() && BLANK_FIELD)}
        />
      ) : (
        <p className="text-[12px] leading-relaxed text-foreground">{draft.summary}</p>
      )}

      {/* Ce sur quoi la génération s'appuie — la description n'est pas
          sortie de nulle part, elle découle des champs de gauche. */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span className="text-[10px] text-muted-foreground">Établie à partir de :</span>
        {draft.basedOn.map((b) => (
          <span
            key={b}
            className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-2.5">
        {(editing ? form : draft).sections.map((s, i) => (
          <div key={i}>
            {editing ? (
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-[#0E7C52]">{AI_SECTION_ICONS[s.icon]}</span>
                <Input
                  value={s.title}
                  onChange={(e) => patchSection(i, { title: e.target.value })}
                  aria-label={`Titre de la section ${i + 1}`}
                  placeholder="Titre de la section…"
                  className={cn(
                    "h-7 flex-1 text-[11px] font-bold",
                    !s.title.trim() && BLANK_FIELD,
                  )}
                />
                <IconButton
                  label={`Supprimer la section « ${s.title || i + 1} »`}
                  danger
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      sections: f.sections.filter((_, k) => k !== i),
                    }))
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                <span className="text-[#0E7C52]">{AI_SECTION_ICONS[s.icon]}</span>
                {s.title}
              </p>
            )}

            <ul className="mt-1 space-y-0.5">
              {s.lines.map((l, k) =>
                editing ? (
                  <li key={k} className="flex items-center gap-1.5">
                    <span className="ml-1 h-1 w-1 shrink-0 rounded-full bg-[#16A46B]" />
                    <Input
                      value={l}
                      onChange={(e) =>
                        patchSection(i, {
                          lines: s.lines.map((x, q) => (q === k ? e.target.value : x)),
                        })
                      }
                      aria-label={`${s.title} — ligne ${k + 1}`}
                      placeholder="Contenu de la ligne…"
                      className={cn("h-7 flex-1 text-[11px]", !l.trim() && BLANK_FIELD)}
                    />
                    <IconButton
                      label={`Supprimer la ligne ${k + 1}`}
                      danger
                      onClick={() =>
                        patchSection(i, { lines: s.lines.filter((_, q) => q !== k) })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </li>
                ) : (
                  <li key={k} className="flex items-start gap-1.5">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#16A46B]" />
                    <span className="text-[11px] leading-snug text-muted-foreground">{l}</span>
                  </li>
                ),
              )}
            </ul>

            {editing ? (
              <button
                type="button"
                onClick={() => patchSection(i, { lines: [...s.lines, ""] })}
                className="ml-3 mt-1 flex items-center gap-1 text-[10px] font-medium text-[#0E7C52] hover:underline"
              >
                <Plus className="h-3 w-3" />
                Ajouter une ligne
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {editing ? (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5">
          <Select
            value=""
            aria-label="Ajouter une section"
            onChange={(e) => {
              const icon = e.target.value as AiIcon;
              if (!icon) return;
              setForm((f) => ({
                ...f,
                sections: [...f.sections, { title: "", icon, lines: [""] }],
              }));
            }}
            className="h-7 w-auto text-[11px]"
          >
            <option value="">+ Ajouter une section…</option>
            {AI_ICON_LABELS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          {blank ? (
            <span className="text-[10px] font-medium text-[#B42318]">
              Un champ est vide : complétez-le ou supprimez la ligne.
            </span>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 border-t border-border pt-2 text-[10px] italic text-muted-foreground">
          {edited
            ? "Description ajustée manuellement — elle sera reprise à la prévisualisation."
            : "Proposition automatique — relisez-la et ajustez avant de continuer."}
        </p>
      )}
    </Panel>
  );
}

/** Encadré rouge d'un champ vide, repris à l'identique dans tout le panneau. */
const BLANK_FIELD = "border-[#F2A9A3] bg-[#FEF6F5]";

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "shrink-0 rounded-md p-1 text-muted-foreground transition-colors",
        danger ? "hover:bg-[#FEF3F2] hover:text-[#D92D20]" : "hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
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
