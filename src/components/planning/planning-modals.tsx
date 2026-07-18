"use client";

import * as React from "react";
import {
  AlertTriangle,
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
  Dot,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { RESOURCE_CONFLICT, SIMULATION } from "@/lib/data";

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                                */
/* -------------------------------------------------------------------------- */

function HintBar({ hints }: { hints: { a: string; t: string }[] }) {
  return (
    <Card className="mt-3 flex items-start gap-2.5 bg-[#F5F8FF] p-2.5">
      <Info className="mt-px h-4 w-4 shrink-0 text-[#3976D3]" />
      <div className="space-y-0.5">
        {hints.map((h) => (
          <p key={h.a} className="text-[11px] text-muted-foreground">
            Cliquer sur <span className="font-semibold text-foreground">“{h.a}”</span>
            <span className="text-[#3976D3]"> → {h.t}</span>
          </p>
        ))}
      </div>
    </Card>
  );
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
}: {
  open: boolean;
  onClose: () => void;
}) {
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
            <Input defaultValue="Revue intermédiaire PFMEA" />
          </Field>
          <Field label="Gate associée">
            <div className="relative">
              <Input defaultValue="G3" />
              <Flag className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#E58A00]" />
            </div>
          </Field>
          <Field label="Date cible">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input defaultValue="18/01/2027" className="pl-8" />
            </div>
          </Field>
          <Field label="Position dans le WBS">
            <Input defaultValue="Entre T09 et T10" />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              defaultValue="Point de revue intermédiaire avant finalisation du plan de contrôle pré-lancement"
            />
          </Field>
          <Field label="Responsable">
            <Select defaultValue="Noura Trabelsi">
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
            <Button variant="amber" onClick={onClose}>
              Ajouter le jalon
            </Button>
          </div>
        </div>
      </div>

      <HintBar
        hints={[
          { a: "Ajouter le jalon", t: "met à jour “Planning détaillé — Risques & conflits”" },
          { a: "Annuler", t: "retourne à “Planning détaillé — Risques & conflits”" },
        ]}
      />
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 9 — Ajouter une tâche                                                */
/* -------------------------------------------------------------------------- */

export function AddTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            <Input defaultValue="Mettre à jour plan de contrôle G3" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gate" required>
              <Select defaultValue="3.1">
                <option>3.1</option>
                <option>3.2</option>
                <option>4.1</option>
              </Select>
            </Field>
            <Field label="Affectation / Responsable" required>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Select defaultValue="Noura Trabelsi" className="pl-8">
                  <option>Noura Trabelsi</option>
                  <option>Youssef Jaziri</option>
                </Select>
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Charge prévue (h)" required>
              <Input defaultValue="16" />
            </Field>
            <Field label="Date de début" required>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="12/01/2027" className="pl-8" />
              </div>
            </Field>
            <Field label="Date de fin prévue" required>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="19/01/2027" className="pl-8" />
              </div>
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
              <Select defaultValue="Élevée">
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
            <ImpactRow icon={<Flag className="h-3.5 w-3.5" />} label="Gate" value="G3" tone="red" />
            <ImpactRow icon={<Clock className="h-3.5 w-3.5" />} label="Charge ajoutée" value="16 h" />
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
            <Button variant="amber" onClick={onClose}>
              Créer la tâche
            </Button>
          </div>
        </div>
      </div>

      <HintBar
        hints={[
          { a: "Créer la tâche", t: "met à jour “Planning détaillé — Risques & conflits”" },
          { a: "Annuler", t: "retourne à “Planning détaillé — Risques & conflits”" },
        ]}
      />
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 10 — Ajouter une sous-tâche                                          */
/* -------------------------------------------------------------------------- */

export function AddSubtaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            <Input defaultValue="T09 — Réaliser PFMEA process" disabled className="bg-muted" />
          </Field>
          <Field label="Libellé de la sous-tâche">
            <Input defaultValue="Vérifier causes critiques étanchéité" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Responsable">
              <Select defaultValue="Youssef Jaziri">
                <option>Youssef Jaziri</option>
                <option>Noura Trabelsi</option>
              </Select>
            </Field>
            <Field label="Date de début">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="13/01/2027" className="pl-8" />
              </div>
            </Field>
            <Field label="Date de fin prévue">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="18/01/2027" className="pl-8" />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Charge estimée (h)">
              <Input defaultValue="4" />
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
            <ImpactRow icon={<Clock className="h-3.5 w-3.5" />} label="Charge ajoutée" value="4 h" />
            <ImpactRow icon={<Users className="h-3.5 w-3.5" />} label="Impact capacité" value="+1 %" tone="red" />
            <ImpactRow
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Dérive planning"
              value="inchangée (0 jour)"
            />
            <ImpactRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Criticité" value="Non" />
          </Card>
        </div>

        <div className="col-span-12 flex items-start gap-3">
          <Card className="flex min-w-0 flex-1 items-start gap-2.5 bg-[#F5F8FF] p-2.5">
            <Info className="mt-px h-4 w-4 shrink-0 text-[#3976D3]" />
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground">
                Cliquer sur <span className="font-semibold text-foreground">“Ajouter”</span>
                <span className="text-[#3976D3]"> → met à jour “Planning détaillé — Risques & conflits”</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Cliquer sur <span className="font-semibold text-foreground">“Annuler”</span>
                <span className="text-[#3976D3]"> → retourne à “Planning détaillé — Risques & conflits”</span>
              </p>
            </div>
          </Card>
          <div className="flex shrink-0 gap-2.5">
            <Button variant="ghost" className="border-border" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="blue" onClick={onClose}>
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
  const [choice, setChoice] = React.useState("decaler");
  const c = RESOURCE_CONFLICT;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-5xl"
      title="Conflit de ressources détecté"
      subtitle="Analyser la surcharge et arbitrer les actions correctives"
      icon={
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF3F2]">
          <AlertTriangle className="h-5 w-5 text-[#D92D20]" />
        </span>
      }
    >
      <div className="grid grid-cols-12 gap-3">
        {/* Resource */}
        <Card className="col-span-3 p-3.5">
          <p className="mb-2.5 text-[12px] font-semibold text-foreground">Ressource en surcharge</p>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF4E7] text-[16px] font-bold text-[#B45F09]">
              {c.initials}
            </span>
            <p className="mt-2 text-[13px] font-semibold text-foreground">{c.resource}</p>
            <p className="text-[11px] text-muted-foreground">{c.fn}</p>
          </div>
          <dl className="mt-3 space-y-2 border-t border-border pt-2.5 text-[11px]">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <dt className="flex-1 text-muted-foreground">Capacité disponible</dt>
              <dd className="font-semibold text-foreground">{c.capacity}</dd>
            </div>
            <div className="flex items-center gap-2">
              <LineChart className="h-3.5 w-3.5 text-muted-foreground" />
              <dt className="flex-1 text-muted-foreground">Charge actuelle</dt>
              <dd className="font-semibold text-foreground">{c.load}</dd>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#D92D20]" />
              <dt className="flex-1 text-muted-foreground">Taux de charge</dt>
              <dd className="font-bold text-[#D92D20]">{c.rate}</dd>
            </div>
            <div className="flex items-start gap-2">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <dt className="flex-1 text-muted-foreground">Période</dt>
              <dd className="text-right font-semibold text-foreground">{c.period}</dd>
            </div>
          </dl>
        </Card>

        {/* Tasks in conflict */}
        <Card className="col-span-5 p-3.5">
          <p className="mb-2 text-[12px] font-semibold text-foreground">Tâches en conflit</p>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-1.5 pr-2 font-medium">Tâche / jalon</th>
                <th className="pb-1.5 pr-2 font-medium">Charge (h)</th>
                <th className="pb-1.5 pr-2 font-medium">Priorité</th>
                <th className="pb-1.5 pr-2 font-medium">Dates</th>
                <th className="pb-1.5 font-medium">Conflit</th>
              </tr>
            </thead>
            <tbody>
              {c.tasks.map((t) => (
                <tr key={t.name} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-2 text-foreground">{t.name}</td>
                  <td className="py-2 pr-2 tabular-nums text-foreground">{t.load}</td>
                  <td className="py-2 pr-2">
                    <span className="flex items-center gap-1 text-foreground">
                      <AlertTriangle className="h-3 w-3" style={{ color: t.color }} />
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-2 pr-2 tabular-nums text-muted-foreground">{t.dates}</td>
                  <td className="py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold tabular-nums" style={{ color: t.color }}>
                        {t.pct} %
                      </span>
                      <ProgressBar value={t.pct} color={t.color} className="w-12" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#F8DEB0] bg-[#FEF6E7] px-2.5 py-1.5">
            <span className="text-[13px] font-bold text-[#E58A00]">Σ</span>
            <span className="flex-1 text-[11px] text-foreground">Total des charges en conflit</span>
            <span className="text-[12px] font-bold text-[#D92D20]">{c.total}</span>
          </div>
          <p className="mt-1.5 flex items-start gap-1.5 text-[10px] text-muted-foreground">
            <Info className="mt-px h-3 w-3 shrink-0 text-[#3976D3]" />
            {c.note}
          </p>
        </Card>

        {/* Solutions */}
        <Card className="col-span-4 p-3.5">
          <p className="mb-2 text-[12px] font-semibold text-foreground">Solutions proposées</p>
          <div className="space-y-2">
            {c.solutions.map((s) => (
              <label
                key={s.id}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 transition-colors ${
                  choice === s.id ? "border-[#E5A11B] bg-[#FDF7EF]" : "border-transparent hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="solution"
                  checked={choice === s.id}
                  onChange={() => setChoice(s.id)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#B45F09]"
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
                    {s.impact}
                  </span>
                  {s.recommended ? (
                    <Chip tone="green" className="mt-1">
                      Recommandée
                    </Chip>
                  ) : null}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-2.5 space-y-1 rounded-lg bg-[#FDF4E7] p-2">
            {c.outcome.map((o) => (
              <div key={o.label} className="flex items-center gap-1.5 text-[10px]">
                {o.label.includes("Impact") ? <Clock className="h-3 w-3 text-muted-foreground" /> : null}
                {o.label.includes("Charge") ? <Gauge className="h-3 w-3 text-muted-foreground" /> : null}
                {o.label.includes("Criticité") ? <AlertTriangle className="h-3 w-3 text-muted-foreground" /> : null}
                <span className="flex-1 text-muted-foreground">{o.label}</span>
                <span
                  className={`font-semibold ${o.tone === "green" ? "text-[#2E7D32]" : "text-foreground"}`}
                >
                  {o.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="col-span-12 flex justify-end gap-2.5">
          <Button variant="ghost" className="border-border" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={onClose}>
            Appliquer la solution
          </Button>
        </div>

        <Card className="col-span-12 bg-[#FEFAF3] p-2.5">
          <div className="flex gap-6">
            <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <ClipboardList className="mt-px h-3.5 w-3.5 shrink-0 text-[#B45F09]" />
              <span>
                Cliquer sur <span className="font-semibold text-foreground">“Appliquer la solution”</span>
                <br />
                met à jour “Planning détaillé — Risques &amp; conflits”
              </span>
            </p>
            <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <ArrowRight className="mt-px h-3.5 w-3.5 shrink-0 text-[#B45F09]" />
              <span>
                Cliquer sur <span className="font-semibold text-foreground">“Annuler”</span>
                <br />
                retourne à “Planning détaillé — Risques &amp; conflits”
              </span>
            </p>
          </div>
        </Card>
      </div>
    </Modal>
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
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDF4E7]">
          <LineChart className="h-5 w-5 text-[#B45F09]" />
        </span>
      }
    >
      <Card className="mb-3 flex items-center gap-2 bg-[#FDF4E7] px-3 py-2">
        <ClipboardList className="h-4 w-4 text-[#B45F09]" />
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
        <Card className="col-span-12 border-[#F0DFC4] bg-[#FEFAF3] p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#B45F09]">
            <RefreshCw className="h-3.5 w-3.5" />
            Analyse automatique
          </p>
          <ul className="space-y-1">
            {s.analysis.map((a) => (
              <li key={a} className="flex items-start gap-2 text-[11px] text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#B45F09]" />
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

        <Card className="col-span-12 bg-[#FEFAF3] p-2.5">
          <div className="flex gap-6">
            <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <ClipboardList className="mt-px h-3.5 w-3.5 shrink-0 text-[#B45F09]" />
              <span>
                Cliquer sur{" "}
                <span className="font-semibold text-foreground">“Appliquer la replanification”</span>
                <br />
                met à jour “Planning détaillé — Risques &amp; conflits”
              </span>
            </p>
            <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <ArrowRight className="mt-px h-3.5 w-3.5 shrink-0 text-[#B45F09]" />
              <span>
                Cliquer sur <span className="font-semibold text-foreground">“Annuler”</span>
                <br />
                retourne à “Planning détaillé — Risques &amp; conflits”
              </span>
            </p>
          </div>
        </Card>
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
        { id: "T10", label: "Élaborer plan de contrôle pré-lancement", range: t10, color: "#E5A11B" },
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
          <span className="h-2 w-3.5 rounded-[2px] bg-[#E5A11B]" />
          T10
        </span>
      </div>
    </Card>
  );
}
