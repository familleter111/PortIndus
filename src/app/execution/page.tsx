"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck2,
  FileText,
  GripVertical,
  Plus,
  Save,
  Search,
  Target,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { InfoStrip, PageTitle } from "@/components/shared/page-parts";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  Dot,
  Field,
  Input,
  Modal,
  Panel,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import {
  CONTRIBUTION,
  EVIDENCE_REVIEW,
  MY_CONTRIBUTIONS,
  PROJECT,
  UPDATE_HISTORY,
} from "@/lib/data";

const CONTRIB_ICONS: Record<string, React.ReactNode> = {
  clipboard: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
  clock: <Clock className="h-4 w-4 text-[#D92D20]" />,
  alert: <AlertTriangle className="h-4 w-4 text-[#E58A00]" />,
  file: <FileText className="h-4 w-4 text-[#E58A00]" />,
};

const STEP_TONE: Record<string, string> = {
  "En cours": "#E58A00",
  Terminé: "#2E7D32",
  "À faire": "#98A2B3",
};

export default function ExecutionPage() {
  const router = useRouter();
  const [reviewOpen, setReviewOpen] = React.useState(false);

  return (
    <AppShell role="Portfolio Manager" notifications={3}>
      <div className="flex h-full flex-col gap-2.5">
        <PageTitle
          title="Suivi d'exécution & éléments justificatifs"
          subtitle="Mise à jour de la progression du projet à partir des actions et preuves"
          action={
            <Button>
              <Users className="h-4 w-4" />
              Membre de l&apos;équipe projet
            </Button>
          }
        />

        <InfoStrip
          items={[
            {
              icon: <FileText className="h-4 w-4 text-muted-foreground" />,
              label: "Code projet",
              value: `${PROJECT.id} — ${PROJECT.name}`,
            },
            {
              icon: <Target className="h-4 w-4 text-muted-foreground" />,
              label: "Porte active",
              value: <span className="text-[#B45F09]">G3 — Process Freeze</span>,
            },
            {
              icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
              label: "Objectif de la porte",
              value: "Sécuriser les actions qui influencent la progression du projet",
            },
          ]}
        />

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          {/* ------------------------------------------------ Contribution */}
          <div className="col-span-8 flex min-h-0 flex-col gap-2.5">
            <Panel title="Détails de la contribution" className="min-h-0 flex-1">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <Field label="Intitulé de la contribution">
                  <Input defaultValue={CONTRIBUTION.title} />
                </Field>
                <Field label="Référence APQP / livrable lié">
                  <Select defaultValue={CONTRIBUTION.reference}>
                    <option>{CONTRIBUTION.reference}</option>
                    <option>DFMEA produit</option>
                    <option>Plan de contrôle</option>
                  </Select>
                </Field>

                <Field label="Responsable de réalisation">
                  <Select defaultValue={CONTRIBUTION.owner}>
                    <option>{CONTRIBUTION.owner}</option>
                    <option>Hichem Ben Amar</option>
                    <option>Youssef Jaziri</option>
                  </Select>
                </Field>
                <Field label="Niveau de priorité">
                  <Select defaultValue={CONTRIBUTION.priority}>
                    <option>Critique</option>
                    <option>Majeure</option>
                    <option>Mineure</option>
                  </Select>
                </Field>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                    Taux d&apos;achèvement
                  </label>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={CONTRIBUTION.progress}
                      color="#B45F09"
                      className="h-2 flex-1"
                    />
                    <span className="text-[12px] font-semibold tabular-nums text-foreground">
                      {CONTRIBUTION.progress} %
                    </span>
                  </div>
                </div>
                <Field label="État d'avancement">
                  <Select defaultValue={CONTRIBUTION.state}>
                    <option>En retard</option>
                    <option>En cours</option>
                    <option>Terminé</option>
                  </Select>
                </Field>

                <Field label="Date cible">
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input defaultValue={CONTRIBUTION.dueDate} className="pl-8" />
                  </div>
                </Field>
                <Field label="Commentaire d'exécution">
                  <Textarea rows={2} defaultValue={CONTRIBUTION.comment} />
                </Field>

                <Field label="Résultat attendu">
                  <Textarea rows={2} defaultValue={CONTRIBUTION.expected} />
                </Field>
                <Field label="Preuve associée">
                  <button
                    type="button"
                    onClick={() => setReviewOpen(true)}
                    className="flex w-full items-center gap-2 rounded-lg border border-input bg-white px-2.5 py-2 text-left transition-colors hover:border-[#E5A11B] hover:bg-[#FDF7EF]"
                  >
                    <span className="flex h-7 w-6 shrink-0 items-center justify-center rounded bg-[#FEF3F2] text-[8px] font-bold text-[#D92D20]">
                      PDF
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[12px] font-medium text-foreground">
                        {CONTRIBUTION.evidence.file}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        PDF • {CONTRIBUTION.evidence.size}
                      </span>
                    </span>
                    <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </button>
                </Field>
              </div>

              {/* Contributors */}
              <div className="mt-2.5">
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Contributeurs concernés
                </label>
                <div className="flex h-9 items-center gap-2 rounded-lg border border-input px-2">
                  {CONTRIBUTION.contributors.map((c) => (
                    <span
                      key={c.name}
                      className="flex items-center gap-1.5 rounded-md bg-muted px-1.5 py-1 text-[11px] text-foreground"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDF4E7] text-[9px] font-bold text-[#B45F09]">
                        {c.initials}
                      </span>
                      {c.name}
                      <X className="h-3 w-3 cursor-pointer text-muted-foreground" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="mt-2.5">
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Étapes de réalisation
                </label>
                <ul className="overflow-hidden rounded-lg border border-border">
                  {CONTRIBUTION.steps.map((s) => (
                    <li
                      key={s.n}
                      className="flex items-center gap-2 border-b border-border px-2.5 py-1.5 last:border-b-0"
                    >
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#F0DFC4] bg-[#FDF4E7] text-[9px] font-bold text-[#B45F09]">
                        {s.n}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                        {s.label}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: STEP_TONE[s.status] }}>
                        <Dot color={STEP_TONE[s.status]} />
                        {s.status}
                      </span>
                      <GripVertical className="h-3.5 w-3.5 text-border" />
                      <Trash2 className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-[#D92D20]" />
                    </li>
                  ))}
                </ul>
                <Button className="mt-2 px-2.5 py-1.5 text-[11px]">
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter une sous-étape
                </Button>
              </div>
            </Panel>

            <Panel title="Traçabilité des preuves" className="shrink-0" bodyClassName="px-0">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Preuve associée", "Type", "Ajoutée le", "Ajoutée par", "Statut de la preuve", "Validée par", "Validée le", "Commentaires"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-2 py-1.5 font-medium first:pl-3.5 last:pr-3.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pl-3.5 pr-2">
                      <span className="flex items-center gap-1.5">
                        <span className="flex h-6 w-5 shrink-0 items-center justify-center rounded bg-[#FEF3F2] text-[7px] font-bold text-[#D92D20]">
                          PDF
                        </span>
                        <span className="leading-tight">
                          <span className="block font-medium text-foreground">
                            {CONTRIBUTION.evidence.file}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {CONTRIBUTION.evidence.size}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{CONTRIBUTION.evidence.type}</td>
                    <td className="px-2 py-2 tabular-nums text-muted-foreground">
                      {CONTRIBUTION.evidence.addedAt}
                    </td>
                    <td className="px-2 py-2">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDF4E7] text-[9px] font-bold text-[#B45F09]">
                          NT
                        </span>
                        {CONTRIBUTION.evidence.addedBy}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => setReviewOpen(true)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-[#E58A00] hover:underline"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {CONTRIBUTION.evidence.status}
                      </button>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">—</td>
                    <td className="px-2 py-2 text-muted-foreground">—</td>
                    <td className="py-2 pl-2 pr-3.5 text-muted-foreground">
                      En attente validation Qualité
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
          </div>

          {/* --------------------------------------------------- Side rail */}
          <div className="col-span-4 flex min-h-0 flex-col gap-2.5">
            <Panel title="Mes contributions" className="shrink-0">
              <div className="grid grid-cols-4 gap-2">
                {MY_CONTRIBUTIONS.map((c) => (
                  <Card key={c.label} className="px-2 py-2 text-center">
                    <div className="flex justify-center">{CONTRIB_ICONS[c.icon]}</div>
                    <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{c.label}</p>
                    <p
                      className={`mt-0.5 text-[18px] font-bold leading-none ${
                        c.tone === "red" ? "text-[#D92D20]" : c.tone === "amber" ? "text-[#E58A00]" : "text-foreground"
                      }`}
                    >
                      {c.value}
                    </p>
                  </Card>
                ))}
              </div>
            </Panel>

            <Panel title="Historique des mises à jour" className="min-h-0 flex-1">
              <ul className="space-y-2.5">
                {UPDATE_HISTORY.map((h) => (
                  <li key={`${h.author}-${h.time}`} className="flex items-start gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FDF4E7] text-[9px] font-bold text-[#B45F09]">
                      {h.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-foreground">{h.author}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {h.date} • {h.time}
                      </p>
                    </div>
                    <div className="min-w-0 flex-[1.6] leading-snug">
                      {h.lines.map((l) => (
                        <p key={l} className="text-[10px] text-muted-foreground">
                          {l}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-2 ml-auto flex items-center gap-1 text-[11px] font-medium text-[#B45F09] hover:underline"
              >
                Voir tout l&apos;historique <span aria-hidden>›</span>
              </button>
            </Panel>

            <Panel title="Impact de cette contribution" className="shrink-0">
              <dl className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Progression projet avant mise à jour :</dt>
                  <dd className="font-semibold text-[#3976D3]">41 %</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-1.5">
                  <dt className="text-muted-foreground">Après validation de cette contribution :</dt>
                  <dd className="font-semibold text-[#2E7D32]">43 %</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-1.5">
                  <dt className="text-muted-foreground">Impact sur readiness G3 :</dt>
                  <dd className="font-semibold text-[#2E7D32]">+4 points</dd>
                </div>
              </dl>
            </Panel>

            <Panel title="Parcours & redirections" className="shrink-0">
              <ol className="space-y-1.5">
                {[
                  { a: "Valider la contribution", t: "met à jour “Vue projet — Dashboard chef de projet”" },
                  { a: "Voir le planning lié", t: "ouvre “Planning détaillé — Risques & conflits”" },
                  { a: "Retour projet", t: "ouvre “Vue projet — Dashboard chef de projet”" },
                  { a: "Retour portefeuille", t: "ouvre “Vue globale portefeuille projets”" },
                ].map((h, i) => (
                  <li key={h.a} className="flex items-start gap-2">
                    <span className="mt-px flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border border-[#F0DFC4] bg-[#FDF4E7] text-[9px] font-bold text-[#B45F09]">
                      {i + 1}
                    </span>
                    <p className="text-[10px] leading-snug text-muted-foreground">
                      Cliquer sur <span className="font-semibold text-foreground">“{h.a}”</span>
                      <span className="text-[#B45F09]"> → {h.t}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>

        {/* Footer actions */}
        <div className="grid shrink-0 grid-cols-4 gap-2.5">
          <Button variant="primary" onClick={() => setReviewOpen(true)}>
            <CheckCircle2 className="h-4 w-4" />
            Valider la contribution
          </Button>
          <Button>
            <Save className="h-4 w-4" />
            Enregistrer comme brouillon
          </Button>
          <Button onClick={() => router.push("/planning")}>
            <CalendarDays className="h-4 w-4" />
            Voir le planning lié
          </Button>
          <Button onClick={() => router.push("/projet")}>
            <ArrowLeft className="h-4 w-4" />
            Retour projet
          </Button>
        </div>
      </div>

      <EvidenceReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onValidate={() => {
          setReviewOpen(false);
          router.push("/validation");
        }}
      />
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image 13 — Analyse de preuve & validation                                  */
/* -------------------------------------------------------------------------- */

function EvidenceReviewModal({
  open,
  onClose,
  onValidate,
}: {
  open: boolean;
  onClose: () => void;
  onValidate: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-5xl"
      title="Analyse de preuve & validation"
      subtitle="Contrôler la conformité du document justificatif avant validation"
      icon={
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDF4E7]">
          <FileCheck2 className="h-5 w-5 text-[#B45F09]" />
        </span>
      }
    >
      <div className="grid grid-cols-12 gap-3">
        {/* Evidence detail */}
        <Card className="col-span-7 p-3.5">
          <p className="mb-2.5 text-[13px] font-semibold text-foreground">Détail de la preuve</p>
          <div className="flex gap-3">
            <dl className="min-w-0 flex-1 space-y-2 text-[11px]">
              {[
                { icon: <FileText className="h-3.5 w-3.5" />, k: "Contribution liée", v: CONTRIBUTION.title },
                { icon: <Target className="h-3.5 w-3.5" />, k: "Référence APQP", v: CONTRIBUTION.reference },
                { icon: <UserRound className="h-3.5 w-3.5" />, k: "Responsable", v: CONTRIBUTION.owner },
                { icon: <FileText className="h-3.5 w-3.5" />, k: "Fichier analysé", v: CONTRIBUTION.evidence.file, accent: true },
                { icon: <ClipboardList className="h-3.5 w-3.5" />, k: "Type", v: CONTRIBUTION.evidence.type },
                { icon: <CalendarDays className="h-3.5 w-3.5" />, k: "Ajoutée le", v: CONTRIBUTION.evidence.addedAt },
                { icon: <UserRound className="h-3.5 w-3.5" />, k: "Ajoutée par", v: CONTRIBUTION.evidence.addedBy },
              ].map((row) => (
                <div key={row.k} className="flex items-start gap-2">
                  <span className="mt-px text-muted-foreground">{row.icon}</span>
                  <dt className="w-[104px] shrink-0 text-muted-foreground">{row.k}</dt>
                  {/* Long file names have no spaces: allow them to wrap. */}
                  <dd
                    className={`min-w-0 flex-1 break-words font-medium ${
                      row.accent ? "text-[#D92D20]" : "text-foreground"
                    }`}
                  >
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Document preview */}
            <div className="w-[240px] shrink-0 rounded-lg border border-border p-2">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="flex h-5 w-4 items-center justify-center rounded bg-[#FEF3F2] text-[7px] font-bold text-[#D92D20]">
                  PDF
                </span>
                <span className="truncate text-[10px] font-medium text-foreground">
                  {CONTRIBUTION.evidence.file}
                </span>
                <Chip tone="slate" className="ml-auto">PDF</Chip>
              </div>
              <div className="rounded border border-border bg-[#FCFCFD] p-2">
                <p className="text-[8px] font-bold text-foreground">PLAN DE SÉCURISATION PROCESS</p>
                <p className="mb-1 text-[7px] text-muted-foreground">Actions &amp; Mesures</p>
                <table className="w-full text-[6px]">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-0.5 font-medium">Action</th>
                      <th className="py-0.5 font-medium">Responsable</th>
                      <th className="py-0.5 font-medium">Échéance</th>
                      <th className="py-0.5 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EVIDENCE_REVIEW.preview.map((p, i) => (
                      <tr key={p.action} className="border-b border-border/60">
                        <td className="py-0.5 pr-1 text-foreground">
                          {i + 1}. {p.action}
                        </td>
                        <td className="py-0.5 pr-1 text-muted-foreground">{p.owner}</td>
                        <td className="py-0.5 pr-1 tabular-nums text-muted-foreground">{p.due}</td>
                        <td className="py-0.5">
                          <span className="flex items-center gap-0.5" style={{ color: STEP_TONE[p.status] }}>
                            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: STEP_TONE[p.status] }} />
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Chip tone="slate">1 page</Chip>
                <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <Search className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Automatic analysis */}
        <div className="col-span-5 space-y-3">
          <Card className="p-3.5">
            <p className="mb-2 text-[13px] font-semibold text-foreground">Analyse automatique</p>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                <span className="flex-1 text-foreground">Confiance de conformité :</span>
                <span className="font-bold text-[#2E7D32]">{EVIDENCE_REVIEW.confidence}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#E58A00]">★</span>
                <span className="flex-1 text-foreground">Statut recommandé :</span>
                <span className="font-semibold text-[#E58A00]">{EVIDENCE_REVIEW.recommendation}</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#D92D20]" />
                <span className="flex-1 text-foreground">Écart détecté :</span>
                <span className="max-w-[150px] text-right font-semibold text-[#D92D20]">
                  {EVIDENCE_REVIEW.gap}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                <span className="flex-1 text-foreground">Cohérence avec l&apos;avancement :</span>
                <span className="font-semibold text-[#2E7D32]">{EVIDENCE_REVIEW.consistency}</span>
              </li>
            </ul>
          </Card>

          <div>
            <p className="mb-1.5 text-[12px] font-semibold text-foreground">
              Commentaires du validateur
            </p>
            <Textarea rows={3} defaultValue={EVIDENCE_REVIEW.comment} />
          </div>

          <Card className="p-3.5">
            <p className="mb-2 text-[12px] font-semibold text-foreground">Décision</p>
            <div className="space-y-1.5">
              {["Valider la preuve", "Demander une correction", "Rejeter"].map((d, i) => (
                <label key={d} className="flex cursor-pointer items-center gap-2 text-[11px] text-foreground">
                  <input
                    type="radio"
                    name="decision"
                    defaultChecked={i === 0}
                    className="h-3.5 w-3.5 accent-[#B45F09]"
                  />
                  {d}
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Criteria */}
        <Card className="col-span-7 p-3.5">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Critères de validation</p>
          <ul className="space-y-1.5 text-[11px]">
            {EVIDENCE_REVIEW.criteria.map((c) => (
              <li key={c.label} className="flex items-center gap-2 border-b border-border pb-1.5 last:border-0 last:pb-0">
                {c.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[#E58A00]" />
                )}
                <span className="flex-1 text-foreground">{c.label}</span>
                <span className={`font-medium ${c.ok ? "text-[#2E7D32]" : "text-[#E58A00]"}`}>
                  {c.verdict}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Footer actions */}
        <div className="col-span-12 grid grid-cols-3 gap-2.5">
          <Button onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
            Retour à la contribution
          </Button>
          <Button>
            <FileText className="h-4 w-4" />
            Demander correction
          </Button>
          <Button variant="primary" onClick={onValidate}>
            <CheckCircle2 className="h-4 w-4" />
            Valider la preuve
          </Button>
        </div>

        {/* Route hints */}
        <Card className="col-span-12 bg-[#FEFAF3] p-2.5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#2E7D32]" />, a: "Valider la preuve", t: "ouvre “Confirmation de validation”" },
              { icon: <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />, a: "Retour à la contribution", t: "retourne à “Suivi d'exécution & éléments justificatifs”" },
              { icon: <FileText className="h-3.5 w-3.5 text-[#B45F09]" />, a: "Demander correction", t: "met à jour le statut de preuve dans “Suivi d'exécution & éléments justificatifs”" },
            ].map((h) => (
              <p key={h.a} className="flex items-start gap-2 text-[10px] leading-snug text-muted-foreground">
                <span className="mt-px shrink-0">{h.icon}</span>
                <span>
                  Cliquer sur <span className="font-semibold text-foreground">“{h.a}”</span>
                  <br />
                  <span className="text-[#B45F09]">→ {h.t}</span>
                </span>
              </p>
            ))}
          </div>
        </Card>
      </div>
    </Modal>
  );
}
