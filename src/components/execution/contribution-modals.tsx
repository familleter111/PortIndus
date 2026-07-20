"use client";

import * as React from "react";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";

import {
  Button,
  Card,
  DateInput,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import {
  APQP_GATES,
  CONTRIB_LEVELS,
  GATE_DELIVERABLES,
  LEVEL_COLOR,
  contribCountFor,
  deliverableById,
  deliverableStatus,
  deliverablesForGate,
  gateLabel,
  parentLevel,
  parentOptions,
  type ContribLevel,
  type ContribPriority,
  type Contribution,
  type StepStatus,
} from "@/lib/data";

const STEP_STATUSES: StepStatus[] = ["À faire", "En cours", "Terminée"];

const STEP_TONE: Record<StepStatus, string> = {
  "À faire": "#98A2B3",
  "En cours": "#E58A00",
  Terminée: "#2E7D32",
};

/** Le nom de fichier proposé quand l'utilisateur « dépose » une preuve. */
const SAMPLE_FILE = { name: "Plan_securisation_process_v2.pdf", size: "1.2 Mo" };

/* -------------------------------------------------------------------------- */
/*  Champs partagés                                                            */
/* -------------------------------------------------------------------------- */

/** Zone de dépôt : la démo n'envoie rien, elle simule un fichier attaché. */
function DropZone({
  file,
  onPick,
  onRemove,
  hint = "PDF, PNG, JPG (max. 10 Mo)",
}: {
  file: { name: string; size: string } | null;
  onPick: () => void;
  onRemove: () => void;
  hint?: string;
}) {
  if (file) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-2">
        <span className="flex h-7 w-6 shrink-0 items-center justify-center rounded bg-[#FEF3F2] text-[8px] font-bold text-[#D92D20]">
          PDF
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[12px] font-medium text-foreground">
            {file.name}
          </span>
          <span className="block text-[10px] text-muted-foreground">{file.size}</span>
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Retirer la preuve"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-[#D92D20]"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full flex-col items-center gap-1 rounded-lg border border-dashed border-input px-3 py-4 transition-colors hover:border-[#5EDE99] hover:bg-[#F4FDF8]"
    >
      <UploadCloud className="h-5 w-5 text-muted-foreground" />
      <span className="text-[11px] font-medium text-foreground">
        Glissez-déposez vos fichiers ici ou cliquez pour parcourir
      </span>
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </button>
  );
}

/** Zone de saisie obligatoire, avec compteur — le motif revient dans 3 modales. */
function RequiredComment({
  label,
  value,
  onChange,
  placeholder,
  max,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max: number;
  rows?: number;
}) {
  return (
    <div>
      <p className="mb-1 text-[12px] font-semibold text-foreground">
        {label}
        <span className="ml-0.5 text-[#D92D20]">*</span>
      </p>
      <div className="relative">
        <Textarea
          rows={rows}
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="pointer-events-none absolute bottom-1.5 right-2.5 text-[10px] tabular-nums text-muted-foreground">
          {value.length}/{max}
        </span>
      </div>
    </div>
  );
}

/** Choix exclusif présenté en carte — utilisé par la révision et le refus. */
function RadioCard({
  checked,
  onSelect,
  icon,
  title,
  detail,
  tone,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  detail: string;
  tone: { border: string; bg: string; text: string; iconBg: string };
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
      style={{
        borderColor: checked ? tone.border : "#EAECF0",
        backgroundColor: checked ? tone.bg : "#FFFFFF",
      }}
    >
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: checked ? tone.border : "#D0D5DD" }}
      >
        {checked ? (
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone.border }} />
        ) : null}
      </span>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tone.iconBg, color: tone.text }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold" style={{ color: tone.text }}>
          {title}
        </span>
        <span className="block text-[11px] text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}

/** Rappel chiffré de l'état de la contribution, affiché avant chaque décision. */
function DecisionSummary({ c, className }: { c: Contribution; className?: string }) {
  const done = c.steps.filter((s) => s.status === "Terminée").length;
  return (
    <div className={`grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 ${className ?? ""}`}>
      {[
        {
          icon: <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />,
          label: "Avancement",
          value: `${c.progress} %`,
        },
        {
          icon: <FileText className="h-4 w-4 text-[#3976D3]" />,
          label: "Preuves associées",
          value: `${c.evidence.length} preuve${c.evidence.length > 1 ? "s" : ""}`,
        },
        {
          icon: <ClipboardCheck className="h-4 w-4 text-[#8B5E9F]" />,
          label: "Étapes terminées",
          value: `${done} / ${c.steps.length}`,
        },
      ].map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="shrink-0">{s.icon}</span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[10px] text-muted-foreground">{s.label}</span>
            <span className="block text-[12px] font-bold text-foreground">{s.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  0 — Créer une contribution                                                 */
/* -------------------------------------------------------------------------- */

export interface NewContribution {
  title: string;
  level: ContribLevel;
  deliverableId: string;
  parentId: string | null;
  owner: string;
  priority: ContribPriority;
  /** Format jj/mm/aaaa, comme le reste des dates du modèle. */
  dueDate: string;
  expected: string;
}

/** "2027-01-09" → "09/01/2027" : l'inverse de ce que fait `DateInput`. */
function isoToFr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** Ce que chaque niveau engage — le texte qui aide à choisir. */
const LEVEL_HINT: Record<ContribLevel, { detail: string; example: string }> = {
  Jalon: {
    detail: "Le livrable dans son ensemble, tel qu'il sera validé en revue de gate.",
    example: "Ex. Mettre à jour AMDEC procédé",
  },
  Tâche: {
    detail: "Un lot du livrable, confié à une personne avec une échéance.",
    example: "Ex. Recoter les criticités S / O / D",
  },
  "Sous-tâche": {
    detail: "Une action élémentaire à l'intérieur d'une tâche.",
    example: "Ex. Clore action étanchéité process",
  },
};

const DELIVERABLE_DOT: Record<string, string> = {
  Approuvé: "#2E7D32",
  "En revue": "#3976D3",
  "En cours": "#E58A00",
  Planifié: "#98A2B3",
  "En retard": "#D92D20",
};

export function CreateContributionModal({
  open,
  owners,
  contributions,
  onClose,
  onCreate,
}: {
  open: boolean;
  owners: string[];
  /** Sert à proposer les parents possibles du niveau choisi. */
  contributions: Contribution[];
  onClose: () => void;
  onCreate: (c: NewContribution) => void;
}) {
  // Par défaut, le premier livrable encore ouvert : c'est là que les
  // contributions se créent, pas sur une gate déjà franchie.
  const firstOpen =
    GATE_DELIVERABLES.find((d) => d.status !== "Approuvé") ?? GATE_DELIVERABLES[0];

  const DEFAULTS: NewContribution = React.useMemo(
    () => ({
      title: "",
      level: "Tâche",
      deliverableId: firstOpen?.id ?? "",
      parentId: null,
      owner: owners[0] ?? "",
      priority: "Moyenne",
      dueDate: "",
      expected: "",
    }),
    [owners, firstOpen],
  );

  const [form, setForm] = React.useState<NewContribution>(DEFAULTS);

  React.useEffect(() => {
    if (open) setForm(DEFAULTS);
  }, [open, DEFAULTS]);

  const set = <K extends keyof NewContribution>(key: K, value: NewContribution[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const deliverable = deliverableById(form.deliverableId);
  const above = parentLevel(form.level);
  const parents = React.useMemo(
    () => parentOptions(form.level, form.deliverableId, contributions),
    [form.level, form.deliverableId, contributions],
  );

  /**
   * Changer de niveau ou de livrable invalide le parent retenu : le remettre à
   * zéro évite de rattacher une sous-tâche à une tâche d'un autre livrable.
   */
  const pickLevel = (level: ContribLevel) =>
    setForm((f) => ({ ...f, level, parentId: null }));
  const pickDeliverable = (deliverableId: string) =>
    setForm((f) => ({ ...f, deliverableId, parentId: null }));

  // Le rattachement fait partie de ce qui est obligatoire : une sous-tâche sans
  // tâche parente n'a pas de place dans l'arborescence.
  const needsParent = form.level === "Sous-tâche";
  const missing =
    !form.title.trim() || !form.dueDate || !form.deliverableId || (needsParent && !form.parentId);

  const missingLabel = !form.title.trim()
    ? "L'intitulé est obligatoire"
    : !form.dueDate
      ? "La date cible est obligatoire"
      : needsParent && !form.parentId
        ? "Une sous-tâche doit être rattachée à une tâche"
        : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title="Créer une contribution"
      subtitle="La contribution est créée au statut « Créée » : vous la démarrerez ensuite."
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8FBF1]">
          <Plus className="h-5 w-5 text-[#2E7D32]" />
        </span>
      }
    >
      <div className="space-y-3">
        {/* ------------------------------------------------ Niveau d'action */}
        <div>
          <p className="mb-1 text-[12px] font-semibold text-foreground">
            Niveau d&apos;action
            <span className="ml-0.5 text-[#D92D20]">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CONTRIB_LEVELS.map((lvl, i) => {
              const on = form.level === lvl;
              const tone = LEVEL_COLOR[lvl];
              return (
                <button
                  key={lvl}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pickLevel(lvl)}
                  className="rounded-xl border p-2.5 text-left transition-colors"
                  style={{
                    borderColor: on ? tone : "#EAECF0",
                    backgroundColor: on ? `${tone}0F` : "#FFFFFF",
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: on ? tone : "#98A2B3" }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: on ? tone : "#101828" }}
                    >
                      {lvl}
                    </span>
                  </span>
                  <span className="mt-1 block text-[10px] leading-snug text-muted-foreground">
                    {LEVEL_HINT[lvl].detail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {/* -------------------------------------- Livrable rattaché à une gate */}
          <Field label="Livrable rattaché (par gate)" required className="col-span-2">
            <Select
              value={form.deliverableId}
              onChange={(e) => pickDeliverable(e.target.value)}
            >
              {APQP_GATES.map((g) => {
                const items = deliverablesForGate(g.id);
                if (items.length === 0) return null;
                return (
                  <optgroup key={g.id} label={`${g.id} — ${g.label}`}>
                    {items.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} · {deliverableStatus(d)} · {d.progress} %
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </Select>
          </Field>

          {/* Ce que le livrable choisi engage réellement — évite de choisir à l'aveugle. */}
          {deliverable ? (
            <Card className="col-span-2 bg-muted p-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {gateLabel(deliverable.gate)}
                  </span>
                  <ChevronRight className="mx-0.5 inline h-3 w-3 align-[-1px]" />
                  <span className="font-semibold text-foreground">{deliverable.name}</span>
                </p>
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: DELIVERABLE_DOT[deliverableStatus(deliverable)] ?? "#98A2B3",
                    }}
                  />
                  {deliverableStatus(deliverable)}
                </span>
              </div>
              <div className="mt-1 grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                <span>
                  Criticité{" "}
                  <span className="font-semibold text-foreground">{deliverable.criticality}</span>
                </span>
                <span>
                  Responsable{" "}
                  <span className="font-semibold text-foreground">{deliverable.owner}</span>
                </span>
                <span>
                  Échéance{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {deliverable.dueDate}
                  </span>
                </span>
                <span>
                  Contributions{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {contribCountFor(deliverable.id, contributions)}
                  </span>
                </span>
              </div>
            </Card>
          ) : null}

          {/* ------------------------------------------------ Rattachement parent */}
          {above ? (
            <Field
              label={`Rattacher à ${above === "Jalon" ? "un jalon" : "une tâche"} de ce livrable`}
              required={needsParent}
              className="col-span-2"
            >
              <Select
                value={form.parentId ?? ""}
                disabled={parents.length === 0}
                onChange={(e) => set("parentId", e.target.value || null)}
              >
                {needsParent ? (
                  <option value="">
                    {parents.length === 0
                      ? "Aucune tâche ouverte sur ce livrable"
                      : "Choisir la tâche parente…"}
                  </option>
                ) : (
                  <option value="">Le livrable dans son ensemble</option>
                )}
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} · {p.title} — {p.progress} %
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {needsParent
                  ? parents.length === 0
                    ? "Créez d'abord une tâche sur ce livrable : une sous-tâche s'y rattache toujours."
                    : "Une sous-tâche est une action élémentaire à l'intérieur d'une tâche."
                  : "Sans jalon parent, la tâche se rattache directement au livrable."}
              </p>
            </Field>
          ) : null}

          <Field label="Intitulé de la contribution" required className="col-span-2">
            <Input
              autoFocus
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={LEVEL_HINT[form.level].example}
            />
          </Field>

          <Field label="Responsable de réalisation">
            <Select value={form.owner} onChange={(e) => set("owner", e.target.value)}>
              {owners.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Niveau de priorité">
            <Select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value as ContribPriority)}
            >
              {(["Critique", "Haute", "Moyenne", "Basse"] as ContribPriority[]).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>

          <Field label="Date cible" required>
            <DateInput onChange={(e) => set("dueDate", isoToFr(e.target.value))} />
          </Field>
          <Field label="Résultat attendu">
            <Input
              value={form.expected}
              onChange={(e) => set("expected", e.target.value)}
              placeholder="Ce qui doit être obtenu…"
            />
          </Field>
        </div>

        <Card className="bg-muted p-3">
          <p className="text-[11px] font-semibold text-foreground">
            Étapes de réalisation créées automatiquement
          </p>
          <ol className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
            {[
              "Vérifier les causes critiques",
              "Mettre à jour la cotation de risque",
              "Charger la preuve de revue",
              "Soumettre la mise à jour",
            ].map((s, i) => (
              <li key={s} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#98A2B3] text-[8px] font-bold text-white">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </Card>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          {/* Le chemin complet, tel qu'il sera enregistré. */}
          <p className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
            {deliverable ? (
              <>
                {deliverable.gate}
                <ChevronRight className="mx-0.5 inline h-2.5 w-2.5 align-[-1px]" />
                {deliverable.name}
                {form.parentId ? (
                  <>
                    <ChevronRight className="mx-0.5 inline h-2.5 w-2.5 align-[-1px]" />
                    {parents.find((p) => p.id === form.parentId)?.title}
                  </>
                ) : null}
                <ChevronRight className="mx-0.5 inline h-2.5 w-2.5 align-[-1px]" />
                <span className="font-semibold" style={{ color: LEVEL_COLOR[form.level] }}>
                  {form.title.trim() || `Nouvelle ${form.level.toLowerCase()}`}
                </span>
              </>
            ) : null}
          </p>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            disabled={missing}
            title={missingLabel}
            onClick={() => onCreate({ ...form, title: form.title.trim() })}
          >
            <Plus className="h-4 w-4" />
            Créer la contribution
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  1 — Enregistrer une mise à jour                                            */
/* -------------------------------------------------------------------------- */

export interface UpdatePayload {
  progress: number;
  steps: StepStatus[];
  comment: string;
  evidence: { name: string; size: string } | null;
}

export function UpdateModal({
  open,
  contribution,
  onClose,
  onSave,
}: {
  open: boolean;
  contribution: Contribution;
  onClose: () => void;
  onSave: (payload: UpdatePayload) => void;
}) {
  const before = contribution.progress;
  const [progress, setProgress] = React.useState(before);
  const [steps, setSteps] = React.useState<StepStatus[]>(() =>
    contribution.steps.map((s) => s.status),
  );
  const [comment, setComment] = React.useState("");
  const [file, setFile] = React.useState<{ name: string; size: string } | null>(null);

  // Réinitialise à chaque ouverture : la modale repart de l'état courant.
  React.useEffect(() => {
    if (!open) return;
    setProgress(contribution.progress);
    setSteps(contribution.steps.map((s) => s.status));
    setComment("");
    setFile(null);
  }, [open, contribution]);

  const setStep = (i: number, value: StepStatus) =>
    setSteps((prev) => prev.map((s, k) => (k === i ? value : s)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title="Enregistrer une mise à jour"
      subtitle="Mettez à jour la progression, les étapes et les preuves de cette contribution."
    >
      <div className="space-y-4">
        {/* ------------------------------------------------- Progression */}
        <div>
          <div className="flex items-baseline gap-2">
            <p className="flex-1 text-[12px] font-semibold text-foreground">
              Progression de la contribution
              <span className="ml-0.5 text-[#D92D20]">*</span>
            </p>
            <span className="text-[18px] font-bold tabular-nums text-[#E58A00]">
              {progress} %
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            aria-label="Progression de la contribution"
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[#E58A00]"
            style={{
              background: `linear-gradient(to right, #E58A00 ${progress}%, #EFF1F4 ${progress}%)`,
            }}
          />
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
            {[0, 25, 50, 75, 100].map((t) => (
              <span key={t}>{t}%</span>
            ))}
          </div>
          {progress !== before ? (
            <p className="mt-1 text-[11px] font-medium text-[#E58A00]">
              Progression mise à jour de {before} % à {progress} %
            </p>
          ) : null}
        </div>

        {/* ------------------------------------------------------- Étapes */}
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-foreground">
            Étapes de réalisation
          </p>
          <div className="grid grid-cols-4 gap-2">
            {contribution.steps.map((s, i) => (
              <div key={s.n} className="relative">
                <span
                  className="pointer-events-none absolute left-2 top-1/2 z-10 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: STEP_TONE[steps[i]] }}
                >
                  {s.n}
                </span>
                <Select
                  value={steps[i]}
                  aria-label={`Étape ${s.n} — ${s.label}`}
                  onChange={(e) => setStep(i, e.target.value as StepStatus)}
                  className="pl-7 text-[11px] font-medium"
                  style={{ color: STEP_TONE[steps[i]] }}
                >
                  {STEP_STATUSES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>

        <RequiredComment
          label="Commentaire d'exécution"
          value={comment}
          onChange={setComment}
          max={500}
          placeholder="Décrivez ce qui a avancé depuis la dernière mise à jour…"
        />

        {/* ------------------------------------------------------- Preuve */}
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-foreground">Preuve associée</p>
          <DropZone
            file={file}
            onPick={() => setFile(SAMPLE_FILE)}
            onRemove={() => setFile(null)}
          />
        </div>

        {/* ------------------------------------------- Mentions (décoratif) */}
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-foreground">
            Contributeurs à mentionner{" "}
            <span className="font-normal text-muted-foreground">(optionnel)</span>
          </p>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Select className="pl-8" defaultValue="">
              <option value="">Rechercher un membre de l&apos;équipe…</option>
              {contribution.contributors.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </Select>
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            disabled={!comment.trim()}
            title={!comment.trim() ? "Le commentaire d'exécution est obligatoire" : undefined}
            onClick={() => onSave({ progress, steps, comment: comment.trim(), evidence: file })}
          >
            <Upload className="h-4 w-4" />
            Enregistrer la mise à jour
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  2 — Réviser la contribution (aiguillage valider / refuser)                 */
/* -------------------------------------------------------------------------- */

export type ReviewDecision = "validate" | "refuse";

export function ReviewModal({
  open,
  contribution,
  onClose,
  onContinue,
}: {
  open: boolean;
  contribution: Contribution;
  onClose: () => void;
  onContinue: (decision: ReviewDecision, comment: string) => void;
}) {
  const [decision, setDecision] = React.useState<ReviewDecision | null>(null);
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setDecision(null);
    setComment("");
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-xl"
      title="Réviser la contribution"
      subtitle={contribution.title}
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF]">
          <ClipboardCheck className="h-5 w-5 text-[#3976D3]" />
        </span>
      }
    >
      <div className="space-y-3">
        <p className="text-[12px] text-muted-foreground">
          Sélectionnez une décision de révision pour cette contribution.
        </p>

        <div role="radiogroup" aria-label="Décision de révision" className="space-y-2">
          <RadioCard
            checked={decision === "validate"}
            onSelect={() => setDecision("validate")}
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Valider"
            detail="Approuver cette contribution et la marquer comme validée"
            tone={{ border: "#2E7D32", bg: "#F4FDF7", text: "#2E7D32", iconBg: "#DCF5E4" }}
          />
          <RadioCard
            checked={decision === "refuse"}
            onSelect={() => setDecision("refuse")}
            icon={<ShieldAlert className="h-5 w-5" />}
            title="Refuser"
            detail="Rejeter la contribution et demander des corrections"
            tone={{ border: "#D92D20", bg: "#FEF6F5", text: "#D92D20", iconBg: "#FDE3E0" }}
          />
        </div>

        <RequiredComment
          label="Commentaire du réviseur"
          value={comment}
          onChange={setComment}
          max={1000}
          placeholder="Ajoutez vos notes ou instructions pour le contributeur…"
        />

        <DecisionSummary c={contribution} />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="blue"
            disabled={!decision || !comment.trim()}
            title={
              !decision
                ? "Choisissez une décision"
                : !comment.trim()
                  ? "Le commentaire du réviseur est obligatoire"
                  : undefined
            }
            onClick={() => decision && onContinue(decision, comment.trim())}
          >
            Continuer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  3 — Confirmer la validation                                                */
/* -------------------------------------------------------------------------- */

export function ConfirmValidationModal({
  open,
  contribution,
  reviewerComment,
  onBack,
  onClose,
  onConfirm,
}: {
  open: boolean;
  contribution: Contribution;
  reviewerComment: string;
  onBack: () => void;
  onClose: () => void;
  onConfirm: (justification: string) => void;
}) {
  const [justification, setJustification] = React.useState(reviewerComment);
  const [file, setFile] = React.useState<{ name: string; size: string } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setJustification(reviewerComment);
    setFile(null);
  }, [open, reviewerComment]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-3xl"
      title="Confirmer la validation"
      subtitle={`${contribution.id} — ${contribution.title}`}
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCF5E4]">
          <ShieldCheck className="h-5 w-5 text-[#2E7D32]" />
        </span>
      }
    >
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-lg border border-[#C7DBF8] bg-[#EFF6FF] px-3 py-2">
          <FileText className="mt-px h-4 w-4 shrink-0 text-[#3976D3]" />
          <p className="text-[12px] text-[#3976D3]">
            Fournissez des preuves et une justification pour valider cette contribution.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-3">
          <div className="space-y-3">
            <RequiredComment
              label="Preuves et justification"
              value={justification}
              onChange={setJustification}
              max={1000}
              rows={5}
              placeholder="Justifiez la validation de cette contribution…"
            />
            <div>
              <p className="mb-1.5 text-[12px] font-semibold text-foreground">
                Documents justificatifs
              </p>
              <DropZone
                file={file}
                onPick={() => setFile({ name: "Compte_rendu_validation.pdf", size: "256 Ko" })}
                onRemove={() => setFile(null)}
                hint="Formats acceptés : PDF, PNG, JPG (max. 10 Mo)"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Card className="space-y-1.5 p-3">
              {[
                `${contribution.progress} % d'avancement`,
                `${contribution.steps.filter((s) => s.status === "Terminée").length} étapes terminées`,
                `${contribution.evidence.length} preuve${contribution.evidence.length > 1 ? "s" : ""} associée${contribution.evidence.length > 1 ? "s" : ""}`,
              ].map((line) => (
                <p key={line} className="flex items-center gap-2 text-[11px] text-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                  {line}
                </p>
              ))}
            </Card>

            <Card className="border-[#BBF0CB] bg-[#F4FDF7] p-3">
              <p className="flex items-center gap-2 text-[12px] font-bold text-[#2E7D32]">
                <ShieldCheck className="h-4 w-4" />
                Validation finale
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                En confirmant, cette contribution sera verrouillée et tracée pour l&apos;audit.
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#BBF0CB] bg-white px-2 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                <CheckCircle2 className="h-3 w-3" />
                Traçabilité et conformité assurées
              </span>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button onClick={onBack}>Retour</Button>
          <Button
            className="border-transparent bg-[#2E7D32] text-white shadow-sm hover:bg-[#276B2A]"
            disabled={!justification.trim()}
            title={!justification.trim() ? "La justification est obligatoire" : undefined}
            onClick={() => onConfirm(justification.trim())}
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirmer la validation
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  4 — Refuser la contribution                                                */
/* -------------------------------------------------------------------------- */

export type RefusalMode = "rework" | "capa";

export function RefuseModal({
  open,
  contribution,
  reviewerComment,
  onBack,
  onClose,
  onConfirm,
}: {
  open: boolean;
  contribution: Contribution;
  reviewerComment: string;
  onBack: () => void;
  onClose: () => void;
  onConfirm: (mode: RefusalMode, justification: string) => void;
}) {
  const [mode, setMode] = React.useState<RefusalMode>("rework");
  const [justification, setJustification] = React.useState(reviewerComment);
  const [file, setFile] = React.useState<{ name: string; size: string } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setMode("rework");
    setJustification(reviewerComment);
    setFile(null);
  }, [open, reviewerComment]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title="Refuser la contribution"
      subtitle={`${contribution.id} — ${contribution.title}`}
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDE3E0]">
          <ShieldAlert className="h-5 w-5 text-[#D92D20]" />
        </span>
      }
    >
      <div className="space-y-3">
        <p className="text-[12px] font-medium text-foreground">
          Choisissez comment vous souhaitez gérer ce refus.
        </p>

        <div role="radiogroup" aria-label="Traitement du refus" className="space-y-2">
          <RadioCard
            checked={mode === "rework"}
            onSelect={() => setMode("rework")}
            icon={<RefreshCw className="h-5 w-5" />}
            title="Renvoyer en exécution"
            detail="Remettre la contribution au statut En cours pour corrections."
            tone={{ border: "#E58A00", bg: "#FFFBF4", text: "#0E7C52", iconBg: "#D6F5E5" }}
          />
          <RadioCard
            checked={mode === "capa"}
            onSelect={() => setMode("capa")}
            icon={<Plus className="h-5 w-5" />}
            title="Créer une action associée"
            detail="Créer une nouvelle action corrective liée pour traiter les écarts identifiés."
            tone={{ border: "#3976D3", bg: "#F5F9FF", text: "#3976D3", iconBg: "#DCEAFD" }}
          />
        </div>

        <RequiredComment
          label="Preuves et justification"
          value={justification}
          onChange={setJustification}
          max={1000}
          placeholder="Expliquez ce qui manque ou ce qui doit être corrigé…"
        />

        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-foreground">
            Documents justificatifs{" "}
            <span className="font-normal text-muted-foreground">(optionnel)</span>
          </p>
          <DropZone
            file={file}
            onPick={() => setFile({ name: "Notes_de_revue.pdf", size: "180 Ko" })}
            onRemove={() => setFile(null)}
            hint="JPG, PNG, PDF, DOCX (max. 10 Mo)"
          />
        </div>

        <DecisionSummary c={contribution} />

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button onClick={onBack}>Retour</Button>
          <Button
            className="border-transparent bg-[#D92D20] text-white shadow-sm hover:bg-[#B42318]"
            disabled={!justification.trim()}
            title={!justification.trim() ? "La justification est obligatoire" : undefined}
            onClick={() => onConfirm(mode, justification.trim())}
          >
            <ShieldAlert className="h-4 w-4" />
            Confirmer le refus
          </Button>
        </div>
      </div>
    </Modal>
  );
}
