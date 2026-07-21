"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Flag,
  Gauge,
  Info,
  LineChart,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  DateInput,
  Dot,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { RESOURCE_CONFLICTS, SIMULATION } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                                */
/* -------------------------------------------------------------------------- */

/** Ce qu'une modale d'ajout remonte à la page pour créer la ligne. */
export interface NewElement {
  kind: "task" | "milestone" | "subtask";
  name: string;
  owner: string;
  /** Dates ISO, telles que les rend `input[type=date]`. */
  start: string;
  end: string;
  load: number;
  /**
   * Point d'accroche : groupe WBS pour une tâche (« 3.1 »), identifiant de la
   * tâche de référence pour un jalon ou une sous-tâche (« T09 »).
   */
  anchor: string;
  gate?: string;
  critical?: boolean;
}

/** Premier identifiant de tâche cité dans un texte libre : « Entre T09 et T10 » → T09. */
function firstTaskId(text: string): string {
  return /T\d+/.exec(text)?.[0] ?? "";
}

function ImpactRow({
  icon,
  label,
  value,
  tone = "ink",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "ink" | "green" | "red" | "amber";
}) {
  const tones = {
    ink: "text-foreground",
    green: "text-[#2E7D32]",
    red: "text-[#D92D20]",
    amber: "text-[#E58A00]",
  };
  return (
    <div className="flex items-center gap-2 border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1 text-[11px] text-muted-foreground">{label}</span>
      <span className={`text-[12px] font-semibold ${tones[tone]}`}>{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 8 — Ajouter un jalon intermédiaire                                   */
/* -------------------------------------------------------------------------- */

export function AddMilestoneModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (el: NewElement) => void;
}) {
  const [name, setName] = React.useState("Revue intermédiaire PFMEA");
  const [gate, setGate] = React.useState("G3");
  const [date, setDate] = React.useState("2027-01-18");
  const [position, setPosition] = React.useState("Entre T09 et T10");
  const [owner, setOwner] = React.useState("Noura Trabelsi");

  const submit = () => {
    onCreate({
      kind: "milestone",
      name,
      owner,
      start: date,
      end: date,
      load: 0,
      anchor: firstTaskId(position),
      gate,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-3xl"
      title="Ajouter un jalon intermédiaire"
      subtitle="Créer un jalon entre deux tâches existantes"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2.5">
          <Field label="Nom du jalon">
            <Input defaultValue={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Gate associée">
            <div className="relative">
              <Input defaultValue={gate} onChange={(e) => setGate(e.target.value)} />
              <Flag className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#E58A00]" />
            </div>
          </Field>
          <Field label="Date cible">
            <DateInput defaultValue="18/01/2027" onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Position dans le WBS">
            <Input defaultValue={position} onChange={(e) => setPosition(e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              defaultValue="Point de revue intermédiaire avant finalisation du plan de contrôle pré-lancement"
            />
          </Field>
          <Field label="Responsable">
            <Select defaultValue={owner} onChange={(e) => setOwner(e.target.value)}>
              <option>Noura Trabelsi</option>
              <option>Youssef Jaziri</option>
            </Select>
          </Field>
          <Field label="Impact estimé">
            <Input defaultValue="Sécurise la validation PFMEA avant passage du Gate G3" />
          </Field>
          <Field label="Visibilité">
            <div className="relative">
              <Eye className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Select defaultValue="Visible dans le Gantt" className="pl-8">
                <option>Visible dans le Gantt</option>
                <option>Masqué</option>
              </Select>
            </div>
          </Field>
        </div>

        <div>
          <Card className="p-3.5">
            <p className="mb-2 text-[13px] font-semibold text-foreground">Aperçu d&apos;impact</p>
            <ImpactRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Date planifiée" value="18/01/2027" />
            <ImpactRow icon={<Flag className="h-3.5 w-3.5" />} label="Gate associée" value="G3 — Process Freeze" tone="amber" />
            <ImpactRow icon={<ClipboardList className="h-3.5 w-3.5" />} label="Position" value="Entre T09 et T10" />
            <ImpactRow icon={<TrendingUp className="h-3.5 w-3.5" />} label="Impact sur la dérive" value="+0 jour" tone="green" />
            <ImpactRow icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Surcharge critique" value="✓ Aucune" tone="green" />
          </Card>

          <Card className="mt-3 border-[#BBF0CB] bg-[#F6FEF9] p-3">
            <p className="flex items-start gap-2 text-[11px] leading-snug">
              <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-[#2E7D32]" />
              <span>
                <span className="font-semibold text-[#2E7D32]">
                  Aucune surcharge critique détectée
                </span>
                <br />
                <span className="text-muted-foreground">
                  Le jalon n&apos;entraîne pas de surcharge critique des ressources.
                </span>
              </span>
            </p>
          </Card>

          <div className="mt-4 flex justify-end gap-2.5">
            <Button variant="ghost" className="border-border" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="amber" onClick={submit}>
              Ajouter le jalon
            </Button>
          </div>
        </div>
      </div>

    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 9 — Ajouter une tâche                                                */
/* -------------------------------------------------------------------------- */

export function AddTaskModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (el: NewElement) => void;
}) {
  const [name, setName] = React.useState("Mettre à jour plan de contrôle G3");
  const [group, setGroup] = React.useState("3.1");
  const [owner, setOwner] = React.useState("Noura Trabelsi");
  const [load, setLoad] = React.useState("16");
  const [start, setStart] = React.useState("2027-01-12");
  const [end, setEnd] = React.useState("2027-01-19");
  const [priority, setPriority] = React.useState("Élevée");

  const submit = () => {
    onCreate({
      kind: "task",
      name,
      owner,
      start,
      end,
      load: Number(load) || 0,
      anchor: group,
      critical: priority === "Élevée",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-4xl"
      title="Ajouter une tâche"
      subtitle="Créer une nouvelle tâche dans le planning APQP"
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 space-y-2.5">
          <Field label="Nom de la tâche" required>
            <Input defaultValue={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gate" required>
              <Select defaultValue={group} onChange={(e) => setGroup(e.target.value)}>
                <option>3.1</option>
                <option>3.2</option>
                <option>4.1</option>
              </Select>
            </Field>
            <Field label="Affectation / Responsable" required>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Select
                  defaultValue={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="pl-8"
                >
                  <option>Noura Trabelsi</option>
                  <option>Youssef Jaziri</option>
                </Select>
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Charge prévue (h)" required>
              <Input defaultValue={load} onChange={(e) => setLoad(e.target.value)} />
            </Field>
            <Field label="Date de début" required>
              <DateInput defaultValue="12/01/2027" onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Date de fin prévue" required>
              <DateInput defaultValue="19/01/2027" onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prédécesseur" required>
              <Select defaultValue="T09 — Réaliser PFMEA process">
                <option>T09 — Réaliser PFMEA process</option>
                <option>T08 — Établir diagramme de flux process</option>
              </Select>
            </Field>
            <Field label="Niveau de priorité" required>
              <Select defaultValue={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>Élevée</option>
                <option>Moyenne</option>
                <option>Faible</option>
              </Select>
            </Field>
          </div>
          <Field label="Type de tâche" required>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Select defaultValue="Livrable" className="pl-8">
                <option>Livrable</option>
                <option>Analyse</option>
                <option>Revue</option>
              </Select>
            </div>
          </Field>
          <Field label="Description">
            <Textarea
              rows={4}
              defaultValue="Consolider les exigences process et intégrer les contrôles pré-lancement dans le plan de contrôle."
            />
          </Field>
        </div>

        <div className="col-span-5">
          <Card className="p-3.5">
            <p className="mb-2 text-[13px] font-semibold text-foreground">Impact estimé</p>
            <ImpactRow icon={<Flag className="h-3.5 w-3.5" />} label="Gate" value={group} tone="red" />
            <ImpactRow icon={<Clock className="h-3.5 w-3.5" />} label="Charge ajoutée" value={`${load} h`} />
            <div className="flex items-center gap-2 border-b border-border py-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="min-w-0 flex-1 text-[11px] text-muted-foreground">
                Impact capacité Qualité
              </span>
              <Chip tone="amber">+2 %</Chip>
            </div>
            <div className="flex items-center gap-2 border-b border-border py-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="min-w-0 flex-1 text-[11px] text-muted-foreground">Dérive projet</span>
              <span className="text-[11px] text-muted-foreground">Inchangée</span>
              <span className="text-[12px] font-semibold text-[#2E7D32]">0 jour</span>
            </div>
            <ImpactRow icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Criticité" value="Oui" tone="red" />
          </Card>

          <Card className="mt-3 flex items-start gap-2 bg-[#F5F8FF] p-2.5">
            <Info className="mt-px h-3.5 w-3.5 shrink-0 text-[#3976D3]" />
            <p className="text-[10px] leading-snug text-muted-foreground">
              Les impacts sont calculés selon les données actuelles du planning et des ressources.
            </p>
          </Card>

          <div className="mt-4 flex justify-end gap-2.5">
            <Button variant="ghost" className="border-border" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="amber" onClick={submit}>
              Créer la tâche
            </Button>
          </div>
        </div>
      </div>

    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 10 — Ajouter une sous-tâche                                          */
/* -------------------------------------------------------------------------- */

export function AddSubtaskModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (el: NewElement) => void;
}) {
  const parent = "T09 — Réaliser PFMEA process";
  const [name, setName] = React.useState("Vérifier causes critiques étanchéité");
  const [owner, setOwner] = React.useState("Youssef Jaziri");
  const [start, setStart] = React.useState("2027-01-13");
  const [end, setEnd] = React.useState("2027-01-18");
  const [load, setLoad] = React.useState("4");

  const submit = () => {
    onCreate({
      kind: "subtask",
      name,
      owner,
      start,
      end,
      load: Number(load) || 0,
      anchor: firstTaskId(parent),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-4xl"
      title="Ajouter une sous-tâche"
      subtitle="Créer un niveau d'exécution complémentaire sous une tâche existante"
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 space-y-2.5">
          <Field label="Tâche parente">
            <Input defaultValue={parent} disabled className="bg-muted" />
          </Field>
          <Field label="Libellé de la sous-tâche">
            <Input defaultValue={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Responsable">
              <Select defaultValue={owner} onChange={(e) => setOwner(e.target.value)}>
                <option>Youssef Jaziri</option>
                <option>Noura Trabelsi</option>
              </Select>
            </Field>
            <Field label="Date de début">
              <DateInput defaultValue="13/01/2027" onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Date de fin prévue">
              <DateInput defaultValue="18/01/2027" onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Charge estimée (h)">
              <Input defaultValue={load} onChange={(e) => setLoad(e.target.value)} />
            </Field>
            <Field label="Statut initial">
              <Select defaultValue="À faire">
                <option>À faire</option>
                <option>En cours</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priorité">
              <Select defaultValue="Moyenne">
                <option>Moyenne</option>
                <option>Élevée</option>
                <option>Faible</option>
              </Select>
            </Field>
            <Field label="Type de sous-tâche">
              <Select defaultValue="Analyse">
                <option>Analyse</option>
                <option>Revue</option>
                <option>Contrôle</option>
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              rows={3}
              defaultValue="Analyser les causes critiques liées à l'étanchéité avant la mise à jour du PFMEA process."
            />
          </Field>
        </div>

        <div className="col-span-5">
          <Card className="p-3.5">
            <p className="mb-2 text-[13px] font-semibold text-foreground">Impact estimé</p>
            <ImpactRow
              icon={<ClipboardList className="h-3.5 w-3.5" />}
              label="Tâche parente"
              value="T09 — Réaliser PFMEA process"
            />
            <ImpactRow icon={<Clock className="h-3.5 w-3.5" />} label="Charge ajoutée" value={`${load} h`} />
            <ImpactRow icon={<Users className="h-3.5 w-3.5" />} label="Impact capacité" value="+1 %" tone="red" />
            <ImpactRow
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Dérive planning"
              value="inchangée (0 jour)"
            />
            <ImpactRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Criticité" value="Non" />
          </Card>
        </div>

        <div className="col-span-12 flex items-start justify-end gap-3">
          <div className="flex shrink-0 gap-2.5">
            <Button variant="ghost" className="border-border" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="blue" onClick={submit}>
              Ajouter
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 11 — Conflit de ressources détecté                                   */
/* -------------------------------------------------------------------------- */

export function ResourceConflictModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const list = RESOURCE_CONFLICTS;
  const [index, setIndex] = React.useState(0);
  /** Une decision par personne : naviguer ne fait pas oublier ce qui est arbitre. */
  const [choices, setChoices] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    setIndex(0);
    setChoices({});
  }, [open]);

  if (list.length === 0) return null;

  const c = list[Math.min(index, list.length - 1)];
  const choice = choices[c.resource] ?? null;
  const picked = c.solutions.find((s) => s.id === choice) ?? null;
  const decided = Object.keys(choices).length;

  const go = (step: 1 | -1) => setIndex((i) => (i + step + list.length) % list.length);

  // Ce que la solution retenue change : calcule, jamais annonce d'avance.
  const after = picked ? c.load - picked.relief : c.load;
  const afterRatio = c.capacity > 0 ? Math.round((after / c.capacity) * 100) : 0;
  const solved = picked ? after <= c.capacity : false;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-5xl"
      title="Conflit de ressources detecte"
      subtitle={`${list.length} personne${list.length > 1 ? "s" : ""} engagee${
        list.length > 1 ? "s" : ""
      } au-dela de sa capacite — arbitrer les actions correctives`}
      icon={
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF3F2]">
          <AlertTriangle className="h-5 w-5 text-[#D92D20]" />
        </span>
      }
    >
      <div className="grid grid-cols-12 gap-3">
        {/* ------------------------------------------------- Navigation */}
        <div className="col-span-12 flex items-center gap-2 rounded-lg border border-border bg-muted px-2 py-1.5">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={list.length < 2}
            aria-label="Personne precedente"
            title="Personne precedente"
            className="shrink-0 rounded-md border border-border bg-white p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Les personnes en conflit, atteignables aussi d'un clic direct. */}
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-thin">
            {list.map((p, i) => {
              const on = i === index;
              const done = Boolean(choices[p.resource]);
              return (
                <button
                  key={p.resource}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                    on
                      ? "border-[#D92D20] bg-white font-semibold text-[#B42318]"
                      : "border-transparent text-muted-foreground hover:bg-white"
                  }`}
                >
                  <span
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[8px] font-bold text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.initials}
                  </span>
                  {p.resource}
                  <span className="tabular-nums text-[10px] text-[#D92D20]">{p.ratio} %</span>
                  {done ? <Check className="h-3 w-3 text-[#0E7C52]" /> : null}
                </button>
              );
            })}
          </div>

          <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
            {index + 1} / {list.length}
            {decided ? ` · ${decided} arbitre${decided > 1 ? "s" : ""}` : ""}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={list.length < 2}
            aria-label="Personne suivante"
            title="Personne suivante"
            className="shrink-0 rounded-md border border-border bg-white p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ------------------------------------------------- Ressource */}
        <Card className="col-span-3 p-3.5">
          <p className="mb-2.5 text-[12px] font-semibold text-foreground">Ressource en surcharge</p>
          <div className="flex flex-col items-center text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-bold text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.initials}
            </span>
            <p className="mt-2 text-[13px] font-semibold text-foreground">{c.resource}</p>
            <p className="text-[11px] text-muted-foreground">{c.fn}</p>
          </div>
          <dl className="mt-3 space-y-2 border-t border-border pt-2.5 text-[11px]">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <dt className="flex-1 text-muted-foreground">Capacite</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {formatNumber(c.capacity)} h
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <LineChart className="h-3.5 w-3.5 text-muted-foreground" />
              <dt className="flex-1 text-muted-foreground">Charge actuelle</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {formatNumber(c.load)} h
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#D92D20]" />
              <dt className="flex-1 text-muted-foreground">Taux de charge</dt>
              <dd className="font-bold tabular-nums text-[#D92D20]">{c.ratio} %</dd>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-3.5 w-3.5 text-[#D92D20]" />
              <dt className="flex-1 text-muted-foreground">Deficit</dt>
              <dd className="font-bold tabular-nums text-[#D92D20]">{c.deficit} h</dd>
            </div>
            <div className="flex items-start gap-2">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <dt className="flex-1 text-muted-foreground">Periode</dt>
              <dd className="text-right font-semibold text-foreground">{c.period}</dd>
            </div>
          </dl>
        </Card>

        {/* ------------------------------------------- Taches en conflit */}
        <Card className="col-span-5 p-3.5">
          <p className="mb-2 text-[12px] font-semibold text-foreground">Taches en conflit</p>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-1.5 pr-2 font-medium">Tache / jalon</th>
                <th className="pb-1.5 pr-2 font-medium">Charge (h)</th>
                <th className="pb-1.5 pr-2 font-medium">Priorite</th>
                <th className="pb-1.5 pr-2 font-medium">Dates</th>
                <th className="pb-1.5 font-medium">Part</th>
              </tr>
            </thead>
            <tbody>
              {c.tasks.map((t) => {
                // La part se calcule : elle ne peut pas contredire les heures.
                const pct = Math.round((t.load / c.conflictLoad) * 100);
                const color =
                  t.priority === "Élevée"
                    ? "#D92D20"
                    : t.priority === "Moyenne"
                      ? "#E58A00"
                      : "#98A2B3";
                return (
                  <tr key={t.name} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-2 text-foreground">{t.name}</td>
                    <td className="py-2 pr-2 tabular-nums text-foreground">{t.load} h</td>
                    <td className="py-2 pr-2">
                      <span className="flex items-center gap-1 text-foreground">
                        <AlertTriangle className="h-3 w-3" style={{ color }} />
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2 pr-2 tabular-nums text-muted-foreground">{t.dates}</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold tabular-nums" style={{ color }}>
                          {pct} %
                        </span>
                        <ProgressBar value={pct} color={color} className="w-12" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#F8DEB0] bg-[#FEF6E7] px-2.5 py-1.5">
            <span className="text-[13px] font-bold text-[#E58A00]">Σ</span>
            <span className="flex-1 text-[11px] text-foreground">Total des charges en conflit</span>
            <span className="text-[12px] font-bold tabular-nums text-[#D92D20]">
              {c.conflictLoad} h
            </span>
          </div>
          <p className="mt-1.5 flex items-start gap-1.5 text-[10px] text-muted-foreground">
            <Info className="mt-px h-3 w-3 shrink-0 text-[#3976D3]" />
            {c.note}
          </p>
        </Card>

        {/* ------------------------------------------ Solutions proposees */}
        <Card className="col-span-4 p-3.5">
          <p className="mb-2 text-[12px] font-semibold text-foreground">Solutions proposees</p>
          <div className="space-y-2">
            {c.solutions.map((s) => (
              <label
                key={s.id}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 transition-colors ${
                  choice === s.id
                    ? "border-[#16A46B] bg-[#F1FCF6]"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name={`solution-${c.resource}`}
                  checked={choice === s.id}
                  onChange={() => setChoices((m) => ({ ...m, [c.resource]: s.id }))}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#0E7C52]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                    {s.icon === "calendar" ? <CalendarDays className="h-3.5 w-3.5" /> : null}
                    {s.icon === "user" ? <UserRound className="h-3.5 w-3.5" /> : null}
                    {s.icon === "down" ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                    {s.icon === "refresh" ? <RefreshCw className="h-3.5 w-3.5" /> : null}
                    {s.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                    {s.impact} Reprend {s.relief} h.
                  </span>
                  {s.recommended ? (
                    <Chip tone="green" className="mt-1">
                      Recommandee
                    </Chip>
                  ) : null}
                </span>
              </label>
            ))}
          </div>

          {/* Le resultat decoule de la solution cochee : rien n'est ecrit d'avance. */}
          <div
            className={`mt-2.5 space-y-1 rounded-lg p-2 ${
              picked ? (solved ? "bg-[#E8FBF1]" : "bg-[#FEF6E7]") : "bg-muted"
            }`}
          >
            {picked ? (
              <>
                <OutcomeRow
                  icon={<Gauge className="h-3 w-3 text-muted-foreground" />}
                  label="Charge apres action"
                  value={`${formatNumber(after)} h — ${afterRatio} %`}
                  tone={solved ? "green" : "amber"}
                />
                <OutcomeRow
                  icon={<AlertTriangle className="h-3 w-3 text-muted-foreground" />}
                  label="Surcharge residuelle"
                  value={solved ? "aucune" : `${after - c.capacity} h`}
                  tone={solved ? "green" : "amber"}
                />
              </>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Choisissez une solution pour voir son effet sur la charge.
              </p>
            )}
          </div>
        </Card>

        {/* ------------------------------------------------------ Actions */}
        <div className="col-span-12 flex items-center gap-2.5">
          <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
            {decided === list.length
              ? "Toutes les surcharges sont arbitrees."
              : `${list.length - decided} personne${
                  list.length - decided > 1 ? "s" : ""
                } encore sans decision.`}
          </p>
          <Button variant="ghost" className="border-border" onClick={onClose}>
            Annuler
          </Button>
          {/* Tant qu'il reste quelqu'un a arbitrer, on propose d'y aller. */}
          {decided < list.length ? (
            <Button
              disabled={!picked}
              title={!picked ? "Choisissez d'abord une solution" : undefined}
              onClick={() => {
                const next = list.findIndex((p) => !choices[p.resource]);
                if (next >= 0) setIndex(next);
              }}
            >
              Suivante a arbitrer
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="primary"
            disabled={decided === 0}
            title={decided === 0 ? "Aucune decision a appliquer" : undefined}
            onClick={onClose}
          >
            Appliquer {decided > 1 ? `les ${decided} decisions` : "la decision"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Ligne du bloc de resultat, sous les solutions. */
function OutcomeRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "green" | "amber";
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      {icon}
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          tone === "green" ? "text-[#2E7D32]" : "text-[#B45F09]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 12 — Simulation de replanification                                   */
/* -------------------------------------------------------------------------- */

export function SimulationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = SIMULATION;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-5xl"
      title="Simulation de replanification"
      subtitle="Comparer les scénarios avant application au planning APQP"
      icon={
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8FBF1]">
          <LineChart className="h-5 w-5 text-[#0E7C52]" />
        </span>
      }
    >
      <Card className="mb-3 flex items-center gap-2 bg-[#E8FBF1] px-3 py-2">
        <ClipboardList className="h-4 w-4 text-[#0E7C52]" />
        <span className="text-[12px] text-foreground">
          Scénario sélectionné : <span className="font-semibold">{s.scenario}</span>
        </span>
      </Card>

      <div className="grid grid-cols-12 gap-3">
        {/* Before */}
        <Card className="col-span-4 p-3.5">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Avant</p>
          <ul className="space-y-1.5 text-[11px]">
            {s.before.map((g) => (
              <li key={g.gate} className="flex items-center gap-2 border-b border-border pb-1.5">
                <span className="flex-1 text-muted-foreground">{g.gate}</span>
                <span className="tabular-nums text-foreground">{g.date}</span>
                <span className="w-4 text-right text-muted-foreground">—</span>
              </li>
            ))}
            <li className="flex items-center gap-2 border-b border-border pb-1.5 pt-0.5">
              <span className="flex-1 text-muted-foreground">{s.beforeLoad.label}</span>
              <span className="font-bold text-[#D92D20]">{s.beforeLoad.value}</span>
              <span className="text-[#D92D20]">↑</span>
            </li>
            <li className="flex items-center gap-2 pt-0.5">
              <span className="flex-1 text-muted-foreground">Criticité</span>
              <span className="font-semibold text-[#D92D20]">{s.beforeLoad.criticality}</span>
              <Dot color="#D92D20" />
            </li>
          </ul>
        </Card>

        {/* After */}
        <Card className="col-span-4 p-3.5">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Après simulation</p>
          <ul className="space-y-1.5 text-[11px]">
            {s.after.map((g) => (
              <li key={g.gate} className="flex items-center gap-2 border-b border-border pb-1.5">
                <span className="flex-1 text-muted-foreground">{g.gate}</span>
                <span className="tabular-nums text-foreground">{g.date}</span>
                <span className="w-4 text-right text-muted-foreground">—</span>
              </li>
            ))}
            <li className="flex items-center gap-2 border-b border-border pb-1.5 pt-0.5">
              <span className="flex-1 text-muted-foreground">{s.afterLoad.label}</span>
              <span className="font-bold text-[#2E7D32]">{s.afterLoad.value}</span>
              <span className="text-[#2E7D32]">↓ {s.afterLoad.delta}</span>
            </li>
            <li className="flex items-center gap-2 pt-0.5">
              <span className="flex-1 text-muted-foreground">Criticité</span>
              <span className="font-semibold text-[#2E7D32]">{s.afterLoad.criticality}</span>
              <Dot color="#2E7D32" />
            </li>
          </ul>
        </Card>

        {/* Summary */}
        <div className="col-span-4">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Impact résumé</p>
          <div className="grid grid-cols-2 gap-2">
            {s.summary.map((item) => (
              <Card key={item.label} className="p-2.5">
                <div className="flex items-center gap-1.5">
                  {item.icon === "trend" ? <TrendingUp className="h-3.5 w-3.5 text-[#2E7D32]" /> : null}
                  {item.icon === "clock" ? <Clock className="h-3.5 w-3.5 text-[#3976D3]" /> : null}
                  {item.icon === "calendar" ? <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                  {item.icon === "shield" ? <ShieldCheck className="h-3.5 w-3.5 text-[#2E7D32]" /> : null}
                  <span className="text-[10px] leading-tight text-muted-foreground">{item.label} :</span>
                </div>
                <p
                  className={`mt-1 text-[16px] font-bold leading-none ${
                    item.tone === "green"
                      ? "text-[#2E7D32]"
                      : item.tone === "blue"
                        ? "text-[#3976D3]"
                        : "text-foreground"
                  }`}
                >
                  {item.value}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Before / after mini gantt */}
        <MiniGantt title="Avant" ticks={s.ticks} t09={[2, 40]} t10={[42, 82]} className="col-span-5" />
        <div className="col-span-2 flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>
        <MiniGantt title="Après" ticks={s.ticks} t09={[2, 40]} t10={[54, 94]} className="col-span-5" />

        {/* Analysis */}
        <Card className="col-span-12 border-[#BFEFD5] bg-[#F1FCF6] p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#0E7C52]">
            <RefreshCw className="h-3.5 w-3.5" />
            Analyse automatique
          </p>
          <ul className="space-y-1">
            {s.analysis.map((a) => (
              <li key={a} className="flex items-start gap-2 text-[11px] text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0E7C52]" />
                {a}
              </li>
            ))}
          </ul>
        </Card>

        <div className="col-span-12 flex justify-end gap-2.5">
          <Button variant="ghost" className="border-border" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={onClose}>
            Appliquer la replanification
          </Button>
        </div>

      </div>
    </Modal>
  );
}

function MiniGantt({
  title,
  ticks,
  t09,
  t10,
  className,
}: {
  title: string;
  ticks: string[];
  t09: [number, number];
  t10: [number, number];
  className?: string;
}) {
  return (
    <Card className={`p-3 ${className ?? ""}`}>
      <div className="mb-1.5 flex items-center">
        <span className="text-[12px] font-semibold text-foreground">{title}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Janv. 2027</span>
      </div>
      <div className="flex">
        <div className="w-[92px] shrink-0" />
        <div className="flex min-w-0 flex-1 justify-between text-[8px] text-muted-foreground">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      {[
        { id: "T09", label: "Réaliser PFMEA process", range: t09, color: "#D92D20" },
        { id: "T10", label: "Élaborer plan de contrôle pré-lancement", range: t10, color: "#16A46B" },
      ].map((row) => (
        <div key={row.id} className="flex items-center py-1.5">
          <div className="w-[92px] shrink-0 pr-2 leading-tight">
            <p className="text-[9px] font-semibold text-foreground">{row.id}</p>
            <p className="text-[8px] text-muted-foreground">{row.label}</p>
          </div>
          <div className="relative h-4 min-w-0 flex-1 border-l border-border">
            <span
              className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[2px]"
              style={{
                left: `${row.range[0]}%`,
                width: `${row.range[1] - row.range[0]}%`,
                backgroundColor: row.color,
              }}
            />
          </div>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-center gap-4 border-t border-border pt-1.5 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-[2px] bg-[#D92D20]" />
          T09
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-[2px] bg-[#16A46B]" />
          T10
        </span>
      </div>
    </Card>
  );
}
