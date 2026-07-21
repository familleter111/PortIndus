"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileCheck2,
  FileText,
  Flag,
  Hourglass,
  Layers,
  MoreHorizontal,
  Paperclip,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { getInitials } from "@/lib/utils";
import { InfoStrip, PageTitle } from "@/components/shared/page-parts";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  DateInput,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
  type ChipTone,
} from "@/components/ui/primitives";
import {
  ConfirmValidationModal,
  CreateContributionModal,
  RefuseModal,
  ReviewModal,
  UpdateModal,
  type NewContribution,
  type RefusalMode,
  type ReviewDecision,
  type UpdatePayload,
} from "@/components/execution/contribution-modals";
import {
  CONTRIBUTIONS,
  CONTRIB_LEVELS,
  contribSplit,
  LEVEL_COLOR,
  EXECUTION_GATE,
  RECENT_ACTIVITY,
  STATUS_DATE,
  canSubmit,
  contribPath,
  deliverableById,
  displayStatus,
  type ContribPriority,
  type Contribution,
  type DisplayStatus,
  type StepStatus,
  type UpdateKind,
} from "@/lib/data";

/* -------------------------------------------------------------------------- */
/*  Correspondances d'affichage                                                */
/* -------------------------------------------------------------------------- */

const STATUS_TONE: Record<DisplayStatus, ChipTone> = {
  Créée: "slate",
  "En cours": "blue",
  "À valider": "amber",
  Validée: "green",
  "En retard": "red",
};

const STATUS_COLOR: Record<DisplayStatus, string> = {
  Créée: "#98A2B3",
  "En cours": "#3976D3",
  "À valider": "#E58A00",
  Validée: "#2E7D32",
  "En retard": "#D92D20",
};

const PRIORITY_TONE: Record<ContribPriority, ChipTone> = {
  Critique: "red",
  Haute: "amber",
  Moyenne: "amber",
  Basse: "slate",
};

const STEP_TONE: Record<StepStatus, string> = {
  "À faire": "#98A2B3",
  "En cours": "#E58A00",
  Terminée: "#2E7D32",
};

const STATUS_ICON: Record<DisplayStatus, React.ReactNode> = {
  Créée: <FileText className="h-4 w-4 text-muted-foreground" />,
  "En cours": <RefreshCw className="h-4 w-4 text-[#3976D3]" />,
  "À valider": <Hourglass className="h-4 w-4 text-[#E58A00]" />,
  Validée: <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />,
  "En retard": <AlertTriangle className="h-4 w-4 text-[#D92D20]" />,
};

/** Icône d'une entrée d'historique — la nature de l'événement se lit d'un coup d'œil. */
const KIND_ICON: Record<UpdateKind, { node: React.ReactNode; color: string }> = {
  create: { node: <Plus className="h-3.5 w-3.5" />, color: "#3976D3" },
  start: { node: <PlayCircle className="h-3.5 w-3.5" />, color: "#3976D3" },
  progress: { node: <RefreshCw className="h-3.5 w-3.5" />, color: "#3976D3" },
  evidence: { node: <Paperclip className="h-3.5 w-3.5" />, color: "#8B5E9F" },
  submit: { node: <Send className="h-3.5 w-3.5" />, color: "#E58A00" },
  validate: { node: <CheckCircle2 className="h-3.5 w-3.5" />, color: "#2E7D32" },
  refuse: { node: <AlertTriangle className="h-3.5 w-3.5" />, color: "#D92D20" },
};

/** Horodatage des événements créés pendant la démonstration. */
function stamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${STATUS_DATE} ${hh}:${mm}`;
}

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${(seq += 1)}`;

/* -------------------------------------------------------------------------- */
/*  Écran                                                                      */
/* -------------------------------------------------------------------------- */

type ModalKey = "create" | "update" | "review" | "validate" | "refuse" | null;

export default function ExecutionPage() {
  const [rows, setRows] = React.useState<Contribution[]>(CONTRIBUTIONS);
  /** `null` = vue liste ; sinon identifiant de la contribution ouverte. */
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [modal, setModal] = React.useState<ModalKey>(null);
  const [reviewComment, setReviewComment] = React.useState("");
  const [banner, setBanner] = React.useState<Banner | null>(null);

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Statut");
  const [priorityFilter, setPriorityFilter] = React.useState("Priorité");
  const [ownerFilter, setOwnerFilter] = React.useState("Responsable");
  const [levelFilter, setLevelFilter] = React.useState("Niveau");

  const current = rows.find((c) => c.id === openId) ?? null;

  const patch = (id: string, next: Partial<Contribution>) =>
    setRows((rs) => rs.map((c) => (c.id === id ? { ...c, ...next } : c)));

  /** Ajoute une entrée d'historique en tête et rafraîchit la date de mise à jour. */
  const log = (c: Contribution, kind: UpdateKind, lines: string[], author?: string) => ({
    lastUpdate: stamp(),
    history: [
      {
        id: nextId("h"),
        kind,
        author: author ?? c.owner,
        initials: author ? "RQ" : c.ownerInitials,
        at: stamp(),
        lines,
      },
      ...c.history,
    ],
  });

  /* ----------------------------------------------------- Transitions d'état */

  const start = (c: Contribution) => {
    const steps = c.steps.map((s, i) =>
      i === 0 ? { ...s, status: "Terminée" as StepStatus } : i === 1 ? { ...s, status: "En cours" as StepStatus } : s,
    );
    patch(c.id, {
      status: "En cours",
      progress: 25,
      steps,
      // Sans étape, l'historique ne doit pas en annoncer une de terminée.
      ...log(
        c,
        "start",
        c.steps.length ? ["Contribution démarrée", "Étape 1 terminée"] : ["Contribution démarrée"],
      ),
    });
    setBanner({
      tone: "blue",
      text: "La contribution est démarrée. Continuez les mises à jour jusqu'à 100 % avant soumission à validation.",
    });
  };

  const applyUpdate = (c: Contribution, p: UpdatePayload) => {
    const lines = [`Avancement mis à jour à ${p.progress} %`];
    if (p.evidence) lines.push(`Preuve « ${p.evidence.name} » ajoutée`);
    lines.push(p.comment);

    patch(c.id, {
      progress: p.progress,
      comment: p.comment,
      steps: c.steps.map((s, i) => ({ ...s, status: p.steps[i] })),
      evidence: p.evidence
        ? [
            ...c.evidence,
            {
              id: nextId("e"),
              file: p.evidence.name,
              size: p.evidence.size,
              type: "Plan d'action",
              addedAt: stamp(),
              addedBy: c.owner,
              status: "En attente de validation" as const,
            },
          ]
        : c.evidence,
      ...log(c, p.evidence ? "evidence" : "progress", lines),
    });
    setModal(null);
    setBanner(null);
  };

  const submit = (c: Contribution) => {
    patch(c.id, {
      status: "À valider",
      ...log(c, "submit", ["Contribution soumise pour validation"]),
    });
    setBanner({
      tone: "green",
      text: "La contribution a été complétée et soumise pour validation. Un réviseur doit désormais la contrôler.",
    });
  };

  const validate = (c: Contribution, justification: string) => {
    patch(c.id, {
      status: "Validée",
      progress: 100,
      evidence: c.evidence.map((e) => ({
        ...e,
        status: "Validée" as const,
        validatedBy: "Responsable Qualité",
        validatedAt: stamp(),
        comment: justification,
      })),
      ...log(c, "validate", ["Contribution validée", justification], "Responsable Qualité"),
    });
    setModal(null);
    setBanner({
      tone: "green",
      text: "Contribution validée. Elle est verrouillée et tracée pour l'audit.",
    });
  };

  const refuse = (c: Contribution, mode: RefusalMode, justification: string) => {
    const lines = [
      mode === "rework"
        ? "Contribution refusée — renvoyée en exécution"
        : "Contribution refusée — action corrective associée créée",
      justification,
    ];
    patch(c.id, {
      status: "En cours",
      steps: c.steps.map((s, i) =>
        i === c.steps.length - 1 ? { ...s, status: "En cours" as StepStatus } : s,
      ),
      ...log(c, "refuse", lines, "Responsable Qualité"),
    });
    setModal(null);
    setBanner({
      tone: "red",
      text:
        mode === "rework"
          ? "Contribution refusée : elle repasse au statut En cours pour corrections."
          : "Contribution refusée : une action corrective associée a été créée pour traiter les écarts.",
    });
  };

  const cancel = (c: Contribution) => {
    patch(c.id, {
      status: "Créée",
      progress: 0,
      steps: c.steps.map((s) => ({ ...s, status: "À faire" as StepStatus })),
      ...log(c, "refuse", ["Contribution annulée et remise à zéro"]),
    });
    setBanner(null);
  };

  const openDetail = (id: string) => {
    setOpenId(id);
    setBanner(null);
  };

  /**
   * Création : la contribution naît au statut « Créée », étapes à faire et
   * avancement à zéro — c'est le point d'entrée du cycle. On ouvre son détail
   * dans la foulée, puisque l'action suivante attendue est « Démarrer ».
   */
  const create = (n: NewContribution) => {
    const num = rows.reduce((m, c) => Math.max(m, Number(c.id.split("-")[1]) || 0), 0) + 1;
    const id = `CTR-${String(num).padStart(4, "0")}`;
    const owner = rows.find((c) => c.owner === n.owner);

    setRows((rs) => [
      {
        id,
        title: n.title,
        level: n.level,
        deliverableId: n.deliverableId,
        parentId: n.parentId,
        owner: n.owner,
        ownerInitials: owner?.ownerInitials ?? getInitials(n.owner),
        priority: n.priority,
        status: "Créée",
        progress: 0,
        dueDate: n.dueDate,
        lastUpdate: stamp(),
        expected: n.expected,
        comment: "",
        contributors: [{ name: n.owner, initials: owner?.ownerInitials ?? getInitials(n.owner) }],
        // Les étapes viennent de la modale : elles y sont pré-remplies mais
        // l'utilisateur a pu les renommer, les réordonner ou en ajouter.
        steps: n.steps.map((label, i) => ({
          n: i + 1,
          label,
          status: "À faire" as const,
        })),
        evidence: [],
        history: [
          {
            id: nextId("h"),
            kind: "create",
            author: n.owner,
            initials: owner?.ownerInitials ?? getInitials(n.owner),
            at: stamp(),
            lines: ["Contribution créée"],
          },
        ],
      },
      ...rs,
    ]);

    setModal(null);
    setOpenId(id);
    setBanner({
      tone: "green",
      text: `Contribution ${id} créée. Cliquez sur « Démarrer la contribution » pour lancer l'exécution.`,
    });
  };

  /* ------------------------------------------------------------ Filtrage */

  const owners = React.useMemo(
    () => Array.from(new Set(rows.map((c) => c.owner))).sort(),
    [rows],
  );

  const filtered = React.useMemo(
    () =>
      rows.filter((c) => {
        const q = query.trim().toLowerCase();
        // La recherche porte aussi sur le rattachement : taper « PFMEA » ou
        // « G3 » doit ramener tout ce qui sécurise ce livrable.
        const hay = `${c.title} ${c.id} ${c.level} ${c.owner} ${contribPath(c, rows).join(" ")}`;
        if (q && !hay.toLowerCase().includes(q)) return false;
        if (statusFilter !== "Statut" && displayStatus(c) !== statusFilter) return false;
        if (priorityFilter !== "Priorité" && c.priority !== priorityFilter) return false;
        if (ownerFilter !== "Responsable" && c.owner !== ownerFilter) return false;
        if (levelFilter !== "Niveau" && c.level !== levelFilter) return false;
        return true;
      }),
    [rows, query, statusFilter, priorityFilter, ownerFilter, levelFilter],
  );

  /** Compteurs des tuiles : ils portent sur tout le projet, pas sur le filtre. */
  const counts = React.useMemo((): Counts => {
    const by = (s: DisplayStatus) => rows.filter((c) => displayStatus(c) === s).length;
    return {
      "À traiter": by("Créée"),
      "En cours": by("En cours"),
      "À valider": by("À valider"),
      Validées: by("Validée"),
      "En retard": by("En retard"),
    };
  }, [rows]);

  const critical = rows.filter(
    (c) => c.priority === "Critique" && displayStatus(c) !== "Validée",
  );

  return (
    <AppShell notifications={3}>
      <div className="flex h-full flex-col gap-2.5">
        <PageTitle
          title="Suivi d'exécution & éléments justificatifs"
          subtitle="Vue globale des contributions du projet et de leur avancement"
        />

        <InfoStrip
          items={[
            {
              icon: <FileText className="h-4 w-4 text-muted-foreground" />,
              label: "Code projet",
              value: `${EXECUTION_GATE.projectId}   ${EXECUTION_GATE.projectName}`,
            },
            {
              icon: <Layers className="h-4 w-4 text-muted-foreground" />,
              label: "Porte active",
              value: (
                <span>
                  <span className="text-[#0E7C52]">{EXECUTION_GATE.gateNumber}</span>{" "}
                  <span className="text-[#E58A00]">{EXECUTION_GATE.gateName}</span>
                </span>
              ),
            },
            {
              icon: <Target className="h-4 w-4 text-muted-foreground" />,
              label: "Objectif de la porte",
              value: EXECUTION_GATE.objective,
            },
          ]}
        />

        {current ? (
          <DetailView
            c={current}
            rows={rows}
            banner={banner}
            onDismissBanner={() => setBanner(null)}
            onBack={() => {
              setOpenId(null);
              setBanner(null);
            }}
            onStart={() => start(current)}
            onUpdate={() => setModal("update")}
            onSubmit={() => submit(current)}
            onReview={() => setModal("review")}
            onCancel={() => cancel(current)}
          />
        ) : (
          <ListView
            rows={filtered}
            total={rows.length}
            counts={counts}
            critical={critical}
            owners={owners}
            query={query}
            onQuery={setQuery}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilter={setPriorityFilter}
            ownerFilter={ownerFilter}
            onOwnerFilter={setOwnerFilter}
            levelFilter={levelFilter}
            onLevelFilter={setLevelFilter}
            onOpen={openDetail}
            onCreate={() => setModal("create")}
          />
        )}
      </div>

      {/* ---------------------------------------------------------- Modales */}
      {/* Hors du bloc ci-dessous : la création part de la liste, sans élément ouvert. */}
      <CreateContributionModal
        open={modal === "create"}
        owners={owners}
        contributions={rows}
        onClose={() => setModal(null)}
        onCreate={create}
      />

      {current ? (
        <>
          <UpdateModal
            open={modal === "update"}
            contribution={current}
            onClose={() => setModal(null)}
            onSave={(p) => applyUpdate(current, p)}
          />
          <ReviewModal
            open={modal === "review"}
            contribution={current}
            onClose={() => setModal(null)}
            onContinue={(decision: ReviewDecision, comment) => {
              setReviewComment(comment);
              setModal(decision === "validate" ? "validate" : "refuse");
            }}
          />
          <ConfirmValidationModal
            open={modal === "validate"}
            contribution={current}
            reviewerComment={reviewComment}
            onBack={() => setModal("review")}
            onClose={() => setModal(null)}
            onConfirm={(justification) => validate(current, justification)}
          />
          <RefuseModal
            open={modal === "refuse"}
            contribution={current}
            reviewerComment={reviewComment}
            onBack={() => setModal("review")}
            onClose={() => setModal(null)}
            onConfirm={(mode, justification) => refuse(current, mode, justification)}
          />
        </>
      ) : null}
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bandeau d'étape                                                            */
/* -------------------------------------------------------------------------- */

interface Banner {
  tone: "blue" | "green" | "red" | "amber";
  text: string;
}

const BANNER_STYLE: Record<Banner["tone"], string> = {
  blue: "border-[#C7DBF8] bg-[#EFF6FF] text-[#3976D3]",
  green: "border-[#BBF0CB] bg-[#F1FBF4] text-[#2E7D32]",
  red: "border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20]",
  amber: "border-[#F8DEB0] bg-[#F1FCF6] text-[#0E7C52]",
};

function BannerStrip({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  const Icon = banner.tone === "green" ? CheckCircle2 : banner.tone === "red" ? AlertTriangle : FileText;
  return (
    <div
      className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 ${BANNER_STYLE[banner.tone]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1 text-[12px] font-medium">{banner.text}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer le message"
        className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Vue liste                                                                  */
/* -------------------------------------------------------------------------- */

/** Une tuile par bucket de statut ; les clés doivent couvrir `Counts`. */
type TileKey = "À traiter" | "En cours" | "À valider" | "Validées" | "En retard";
type Counts = Record<TileKey, number>;

const TILES: { label: TileKey; icon: React.ReactNode; color: string }[] = [
  { label: "À traiter", icon: <Clock className="h-5 w-5" />, color: "#E58A00" },
  { label: "En cours", icon: <RefreshCw className="h-5 w-5" />, color: "#3976D3" },
  { label: "À valider", icon: <Hourglass className="h-5 w-5" />, color: "#E58A00" },
  { label: "Validées", icon: <CheckCircle2 className="h-5 w-5" />, color: "#2E7D32" },
  { label: "En retard", icon: <AlertTriangle className="h-5 w-5" />, color: "#D92D20" },
];

function ListView({
  rows,
  total,
  counts,
  critical,
  owners,
  query,
  onQuery,
  statusFilter,
  onStatusFilter,
  priorityFilter,
  onPriorityFilter,
  ownerFilter,
  onOwnerFilter,
  levelFilter,
  onLevelFilter,
  onOpen,
  onCreate,
}: {
  rows: Contribution[];
  total: number;
  counts: Counts;
  critical: Contribution[];
  owners: string[];
  query: string;
  onQuery: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  priorityFilter: string;
  onPriorityFilter: (v: string) => void;
  ownerFilter: string;
  onOwnerFilter: (v: string) => void;
  levelFilter: string;
  onLevelFilter: (v: string) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [hintOpen, setHintOpen] = React.useState(true);
  // La répartition décrit les lignes réellement affichées : elle suit les
  // filtres du tableau et bouge quand une contribution change de statut.
  const split = React.useMemo(() => contribSplit(rows), [rows]);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-2.5">
      {/* ------------------------------------------------ Colonne principale */}
      <Panel title="Contributions du projet" className="min-h-0" bodyClassName="flex flex-col">
        {/* Recherche & filtres */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Rechercher par intitulé, gate, livrable, responsable…"
              className="pl-8"
            />
          </span>
          <Select
            value={levelFilter}
            onChange={(e) => onLevelFilter(e.target.value)}
            className="w-[118px] shrink-0"
            aria-label="Filtrer par niveau d'action"
          >
            {["Niveau", ...CONTRIB_LEVELS].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
            className="w-[112px] shrink-0"
            aria-label="Filtrer par statut"
          >
            {["Statut", "Créée", "En cours", "À valider", "Validée", "En retard"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => onPriorityFilter(e.target.value)}
            className="w-[112px] shrink-0"
            aria-label="Filtrer par priorité"
          >
            {["Priorité", "Critique", "Haute", "Moyenne", "Basse"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select
            value={ownerFilter}
            onChange={(e) => onOwnerFilter(e.target.value)}
            className="w-[140px] shrink-0"
            aria-label="Filtrer par responsable"
          >
            {["Responsable", ...owners].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Button className="shrink-0 px-2.5 py-2 text-[12px]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Plus de filtres
          </Button>
          <Button
            variant="primary"
            className="shrink-0 px-3 py-2 text-[12px]"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            Créer une contribution
          </Button>
        </div>

        {/* Tuiles de statut */}
        <div className="mt-2.5 grid shrink-0 grid-cols-5 gap-2">
          {TILES.map((t) => (
            <Card key={t.label} className="flex items-center gap-2.5 px-3 py-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${t.color}1f`, color: t.color }}
              >
                {t.icon}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[11px] text-muted-foreground">{t.label}</span>
                <span className="block text-[20px] font-bold text-foreground">
                  {counts[t.label]}
                </span>
              </span>
            </Card>
          ))}
        </div>

        {hintOpen ? (
          <div className="mt-2 shrink-0">
            <BannerStrip
              banner={{
                tone: "amber",
                text: "Étape suivante : ouvrez une contribution puis cliquez sur « Démarrer la contribution ».",
              }}
              onClose={() => setHintOpen(false)}
            />
          </div>
        ) : null}

        {/* Tableau */}
        <div className="mt-2 min-h-0 flex-1 overflow-auto rounded-lg border border-border scrollbar-thin">
          <table className="w-full min-w-[900px] border-collapse text-[11px]">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr className="text-left text-muted-foreground">
                {[
                  "Intitulé",
                  "Niveau",
                  "Gate / livrable rattaché",
                  "Responsable",
                  "Priorité",
                  "Statut",
                  "Avancement",
                  "Date cible",
                  "Preuve",
                  "Dernière mise à jour",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-border px-2 py-2 font-medium first:pl-3 last:pr-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const st = displayStatus(c);
                const overdue = st === "En retard";
                return (
                  <tr
                    key={c.id}
                    onClick={() => onOpen(c.id)}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-[#FCFCFD]"
                  >
                    <td className="py-2 pl-3 pr-2">
                      {/* Le décalage matérialise le niveau : jalon à gauche,
                          sous-tâche en retrait — l'arborescence se lit à l'œil. */}
                      <span
                        className="flex items-center gap-2"
                        style={{ paddingLeft: CONTRIB_LEVELS.indexOf(c.level) * 12 }}
                      >
                        <span className="shrink-0">{STATUS_ICON[st]}</span>
                        <span className="font-medium text-foreground">{c.title}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${LEVEL_COLOR[c.level]}14`,
                          color: LEVEL_COLOR[c.level],
                        }}
                      >
                        {c.level}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-muted-foreground">
                      {(() => {
                        const d = deliverableById(c.deliverableId);
                        if (!d) return "—";
                        return (
                          <>
                            <span className="font-semibold text-foreground">{d.gate}</span> · {d.name}
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-2 py-2 text-foreground">{c.owner}</td>
                    <td className="px-2 py-2">
                      <Chip tone={PRIORITY_TONE[c.priority]}>{c.priority}</Chip>
                    </td>
                    <td className="px-2 py-2">
                      <Chip tone={STATUS_TONE[st]}>{st}</Chip>
                    </td>
                    <td className="px-2 py-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-7 shrink-0 tabular-nums text-muted-foreground">
                          {c.progress}%
                        </span>
                        <ProgressBar
                          value={c.progress}
                          color={STATUS_COLOR[st]}
                          className="h-1.5 w-14"
                        />
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-2 py-2 tabular-nums ${
                        overdue ? "font-semibold text-[#D92D20]" : "text-muted-foreground"
                      }`}
                    >
                      {c.dueDate}
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">
                      {c.evidence.length ? (
                        <span className="flex items-center gap-1">
                          {c.evidence.length}
                          <Paperclip className="h-3 w-3" />
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-muted-foreground">
                      {c.lastUpdate}
                    </td>
                    <td className="py-2 pl-2 pr-3">
                      <span className="flex items-center gap-1">
                        <Button
                          className="px-2 py-1 text-[11px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(c.id);
                          }}
                        >
                          Ouvrir
                        </Button>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                    Aucune contribution ne correspond aux filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-2 flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
          <span>
            Affichage 1 à {rows.length} sur {total} contributions
          </span>
          <span className="ml-auto flex items-center gap-2">
            Lignes par page
            <Select className="h-7 w-[64px] py-0 text-[11px]" defaultValue="20">
              <option>20</option>
              <option>50</option>
            </Select>
          </span>
          <span className="flex items-center gap-0.5">
            {[ChevronsLeft, ChevronLeft].map((Icon, i) => (
              <Icon key={i} className="h-4 w-4 opacity-40" />
            ))}
            <span className="mx-1 flex h-6 w-6 items-center justify-center rounded-md border border-[#BFEFD5] font-semibold text-[#0E7C52]">
              1
            </span>
            {[ChevronRight, ChevronsRight].map((Icon, i) => (
              <Icon key={i} className="h-4 w-4 opacity-40" />
            ))}
          </span>
        </div>
      </Panel>

      {/* ------------------------------------------------------- Rail droit */}
      <div className="flex min-h-0 flex-col gap-2.5">
        <Panel title="Vue rapide" className="shrink-0">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Répartition par statut
            <span className="ml-1 tabular-nums text-foreground">
              — {rows.length} contribution{rows.length > 1 ? "s" : ""}
            </span>
          </p>
          <div className="flex items-center gap-3">
            <Donut data={split} />
            <ul className="min-w-0 flex-1 space-y-1">
              {split.map((s) => {
                const totalSplit = rows.length || 1;
                return (
                  <li key={s.label} className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {s.label}
                    </span>
                    <span className="tabular-nums font-semibold text-foreground">{s.value}</span>
                    <span className="w-9 text-right tabular-nums text-muted-foreground">
                      ({Math.round((s.value / totalSplit) * 100)}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-[#D92D20]" />
              Contributions critiques
            </span>
          }
          action={
            <span className="text-[11px] font-medium text-[#0E7C52]">
              Voir tout ({critical.length})
            </span>
          }
          className="shrink-0"
        >
          <ul className="space-y-1.5">
            {critical.map((c) => {
              const st = displayStatus(c);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(c.id)}
                    className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted"
                  >
                    <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">
                      {c.title}
                    </span>
                    <Chip tone={STATUS_TONE[st]}>{st}</Chip>
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                      Échéance {c.dueDate}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel
          title="Activité récente"
          action={<span className="text-[11px] font-medium text-[#3976D3]">Voir tout</span>}
          className="min-h-0 flex-1"
        >
          <ul className="space-y-2.5">
            {RECENT_ACTIVITY.map((a) => {
              const icon = KIND_ICON[a.kind];
              return (
                <li key={a.id} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${icon.color}1f`, color: icon.color }}
                  >
                    {icon.node}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[10px] text-muted-foreground">
                      {a.who} {a.what}
                    </span>
                    <span className="block truncate text-[11px] font-medium text-foreground">
                      {a.target}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{a.when}</span>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#3976D3] hover:underline"
          >
            Voir toute l&apos;activité <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Panel>
      </div>
    </div>
  );
}

/** Anneau de répartition, tracé en SVG : un seul arc par segment. */
function Donut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((n, d) => n + d.value, 0);
  const R = 34;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <span className="relative block h-[92px] w-[92px] shrink-0">
      <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
        {data.map((d) => {
          const len = (d.value / total) * C;
          const dash = <circle
            key={d.label}
            cx={46}
            cy={46}
            r={R}
            fill="none"
            stroke={d.color}
            strokeWidth={12}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
          />;
          offset += len;
          return dash;
        })}
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-[17px] font-bold text-foreground">{total}</span>
        <span className="text-[9px] text-muted-foreground">Total</span>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Vue détail                                                                 */
/* -------------------------------------------------------------------------- */

function DetailView({
  c,
  rows,
  banner,
  onDismissBanner,
  onBack,
  onStart,
  onUpdate,
  onSubmit,
  onReview,
  onCancel,
}: {
  c: Contribution;
  rows: Contribution[];
  banner: Banner | null;
  onDismissBanner: () => void;
  onBack: () => void;
  onStart: () => void;
  onUpdate: () => void;
  onSubmit: () => void;
  onReview: () => void;
  onCancel: () => void;
}) {
  const st = displayStatus(c);
  const submitReady = canSubmit(c);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* --------------------------------------------------- Barre d'actions */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-foreground transition-colors hover:text-[#0E7C52]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {c.status === "Créée" ? (
            <>
              <Button variant="primary" onClick={onStart}>
                <PlayCircle className="h-4 w-4" />
                Démarrer la contribution
              </Button>
              <Button>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            </>
          ) : null}

          {c.status === "En cours" ? (
            <>
              <Button variant="primary" onClick={onUpdate}>
                <Pencil className="h-4 w-4" />
                Mettre à jour l&apos;avancement
              </Button>
              <span className="flex flex-col items-center">
                <Button
                  disabled={!submitReady}
                  onClick={onSubmit}
                  title={
                    submitReady ? undefined : "Toutes les étapes doivent être terminées (100 %)"
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Soumettre à validation
                </Button>
                {!submitReady ? (
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    Toutes les étapes doivent être terminées (100 %)
                  </span>
                ) : null}
              </span>
            </>
          ) : null}

          {c.status === "À valider" ? (
            <>
              <Button variant="blue" onClick={onReview}>
                <ClipboardCheck className="h-4 w-4" />
                Réviser la contribution
              </Button>
              <Button>
                <FileCheck2 className="h-4 w-4" />
                Voir les mises à jour
              </Button>
            </>
          ) : null}

          {c.status === "Validée" ? (
            <Chip tone="green" className="px-3 py-1.5 text-[12px]">
              <CheckCircle2 className="h-4 w-4" />
              Contribution validée et verrouillée
            </Chip>
          ) : null}

          {c.status !== "Validée" && c.status !== "Créée" ? (
            <Button onClick={onCancel}>
              <Ban className="h-4 w-4" />
              Annuler
            </Button>
          ) : null}
          {c.status === "Créée" ? (
            <Button onClick={onBack}>
              <Ban className="h-4 w-4" />
              Annuler
            </Button>
          ) : null}

          <Button className="px-2 py-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {banner ? <BannerStrip banner={banner} onClose={onDismissBanner} /> : null}

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-2.5">
        {/* ------------------------------------------------ Colonne gauche */}
        <div className="flex min-h-0 flex-col gap-2.5 overflow-y-auto pr-0.5 scrollbar-thin">
          <Panel
            title="Détails de la contribution"
            action={
              <Chip tone={STATUS_TONE[st]}>
                Statut : {st}
              </Chip>
            }
            className="shrink-0"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Field label="Intitulé de la contribution">
                <Input defaultValue={c.title} key={`${c.id}-title`} />
              </Field>
              {/* Le rattachement se lit, il ne se ressaisit pas : il a été fixé
                  à la création et porte la gate que la contribution sécurise. */}
              <Field label="Rattachement">
                <p className="flex min-h-[34px] items-center gap-1 rounded-lg border border-border bg-muted px-2.5 text-[12px] text-muted-foreground">
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${LEVEL_COLOR[c.level]}14`,
                      color: LEVEL_COLOR[c.level],
                    }}
                  >
                    {c.level}
                  </span>
                  <span className="min-w-0 truncate">{contribPath(c).join(" › ")}</span>
                </p>
              </Field>

              <Field label="Responsable de réalisation">
                <Input defaultValue={c.owner} key={`${c.id}-owner`} />
              </Field>
              <Field label="Niveau de priorité">
                <Select defaultValue={c.priority} key={`${c.id}-prio`}>
                  {["Critique", "Haute", "Moyenne", "Basse"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </Field>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Taux d&apos;achèvement
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold tabular-nums text-foreground">
                    {c.progress}%
                  </span>
                  <ProgressBar
                    value={c.progress}
                    color={STATUS_COLOR[st]}
                    className="h-2 flex-1"
                  />
                </div>
              </div>
              <Field label="État d'avancement">
                <Input readOnly value={st} key={`${c.id}-state`} />
              </Field>

              <Field label="Date cible">
                <DateInput defaultValue={c.dueDate} key={`${c.id}-due`} />
              </Field>
              <Field label="Commentaire d'exécution">
                <Textarea
                  rows={2}
                  key={`${c.id}-comment-${c.comment}`}
                  defaultValue={c.comment}
                  placeholder="Ajouter un commentaire (optionnel)…"
                />
              </Field>

              <Field label="Résultat attendu">
                <Input defaultValue={c.expected} key={`${c.id}-expected`} />
              </Field>
              <Field label="Preuve associée">
                {c.evidence.length ? (
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-white px-2.5 py-2">
                    <span className="flex h-7 w-6 shrink-0 items-center justify-center rounded bg-[#FEF3F2] text-[8px] font-bold text-[#D92D20]">
                      PDF
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">
                      {c.evidence[c.evidence.length - 1].file}
                    </span>
                    <Chip tone="slate">PDF</Chip>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-input px-2.5 py-2 text-[12px] text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Aucune preuve associée pour le moment
                  </div>
                )}
              </Field>
            </div>

            <div className="mt-2.5">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                Contributeurs concernés
              </label>
              <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-lg border border-input px-2 py-1.5">
                {c.contributors.map((p) => (
                  <span
                    key={p.name}
                    className="flex items-center gap-1.5 rounded-md bg-muted px-1.5 py-1 text-[11px] text-foreground"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8FBF1] text-[9px] font-bold text-[#0E7C52]">
                      {p.initials}
                    </span>
                    {p.name}
                    <X className="h-3 w-3 cursor-pointer text-muted-foreground" />
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Étapes de réalisation" className="shrink-0">
            {c.steps.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-center text-[11px] text-muted-foreground">
                Aucune étape définie — le suivi se fait à l&apos;avancement.
              </p>
            ) : null}
            <ul className="overflow-hidden rounded-lg border border-border empty:border-0">
              {c.steps.map((s) => (
                <li
                  key={s.n}
                  className="flex items-center gap-2 border-b border-border px-2.5 py-2 last:border-b-0"
                >
                  <span
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: STEP_TONE[s.status] }}
                  >
                    {s.n}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">
                    {s.label}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-medium"
                    style={{ color: STEP_TONE[s.status] }}
                  >
                    {s.status === "Terminée" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: STEP_TONE[s.status] }}
                      />
                    )}
                    {s.status}
                  </span>
                  <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Traçabilité des preuves"
            action={
              <Button className="px-2 py-1 text-[11px]">
                <Plus className="h-3.5 w-3.5" />
                Ajouter une preuve
              </Button>
            }
            className="shrink-0"
            bodyClassName={c.evidence.length ? "px-0" : undefined}
          >
            {c.evidence.length ? (
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {[
                      "Preuve associée",
                      "Type",
                      "Ajoutée le",
                      "Ajoutée par",
                      "Statut",
                      "Validée par",
                      "Validée le",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-2 py-1.5 font-medium first:pl-3.5 last:pr-3.5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.evidence.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0">
                      <td className="py-2 pl-3.5 pr-2">
                        <span className="flex items-center gap-1.5">
                          <span className="flex h-6 w-5 shrink-0 items-center justify-center rounded bg-[#FEF3F2] text-[7px] font-bold text-[#D92D20]">
                            PDF
                          </span>
                          <span className="leading-tight">
                            <span className="block font-medium text-foreground">{e.file}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {e.size}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">{e.type}</td>
                      <td className="whitespace-nowrap px-2 py-2 tabular-nums text-muted-foreground">
                        {e.addedAt}
                      </td>
                      <td className="px-2 py-2 text-foreground">{e.addedBy}</td>
                      <td className="px-2 py-2">
                        <Chip tone={e.status === "Validée" ? "green" : "amber"}>{e.status}</Chip>
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">{e.validatedBy ?? "—"}</td>
                      <td className="whitespace-nowrap py-2 pl-2 pr-3.5 tabular-nums text-muted-foreground">
                        {e.validatedAt ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border py-6">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <p className="text-[12px] font-medium text-foreground">
                  Aucune preuve ajoutée pour le moment
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Les preuves associées à cette contribution apparaîtront ici.
                </p>
              </div>
            )}
          </Panel>
        </div>

        {/* -------------------------------------------------- Rail de droite */}
        <div className="flex min-h-0 flex-col gap-2.5 overflow-y-auto pr-0.5 scrollbar-thin">
          <MyContributions rows={rows} current={c} />

          <Panel
            title="Historique des mises à jour"
            action={
              c.history.length > 1 ? (
                <span className="text-[11px] font-medium text-[#3976D3]">Voir tout</span>
              ) : undefined
            }
            className="shrink-0"
          >
            {c.history.length ? (
              <ul className="space-y-2.5">
                {c.history.map((h) => {
                  const icon = KIND_ICON[h.kind];
                  return (
                    <li key={h.id} className="flex items-start gap-2">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${icon.color}1f`, color: icon.color }}
                      >
                        {icon.node}
                      </span>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-[11px] font-semibold text-foreground">{h.author}</p>
                        <p className="text-[10px] tabular-nums text-muted-foreground">{h.at}</p>
                        {h.lines.map((l) => (
                          <p key={l} className="mt-0.5 text-[10px] text-muted-foreground">
                            {l}
                          </p>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-1 py-6">
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
                <p className="text-[12px] font-medium text-foreground">
                  Aucune mise à jour ajoutée
                </p>
                <p className="text-center text-[11px] text-muted-foreground">
                  Les mises à jour de cette contribution apparaîtront ici.
                </p>
              </div>
            )}
          </Panel>

          <ImpactPanel c={c} />

        </div>
      </div>
    </div>
  );
}

/** Le parcours suit l'état réel : ce qui est fait, ce qui reste. */
function journeyFor(c: Contribution): { text: string; done: boolean; current: boolean }[] {
  const order = ["Créée", "En cours", "À valider", "Validée"];
  const at = order.indexOf(c.status);
  const steps = [
    "Cliquez sur « Démarrer la contribution » pour lancer l'exécution",
    "Suivez les étapes de réalisation et mettez à jour l'avancement",
    "Soumettez la contribution pour validation une fois à 100 %",
    "Révision par le valideur : validation ou demande de correction",
  ];
  return steps.map((text, i) => ({ text, done: i < at, current: i === at }));
}

/** Tuiles « Mes contributions » : la dernière reflète l'état de l'élément ouvert. */
function MyContributions({ rows, current }: { rows: Contribution[]; current: Contribution }) {
  const by = (s: DisplayStatus) => rows.filter((c) => displayStatus(c) === s).length;
  const st = displayStatus(current);

  const tiles = [
    { label: "À traiter", value: by("Créée"), icon: <Clock className="h-4 w-4" />, color: "#667085" },
    { label: "En retard", value: by("En retard"), icon: <AlertTriangle className="h-4 w-4" />, color: "#D92D20" },
    { label: "À valider", value: by("À valider"), icon: <Hourglass className="h-4 w-4" />, color: "#E58A00" },
    { label: "Avec risque", value: rows.filter((c) => c.priority === "Critique").length, icon: <Flag className="h-4 w-4" />, color: "#E58A00" },
    { label: st, value: 1, icon: STATUS_ICON[st], color: STATUS_COLOR[st], active: true },
  ];

  return (
    <Panel title="Mes contributions" className="shrink-0">
      <div className="grid grid-cols-5 gap-1.5">
        {tiles.map((t, i) => (
          <Card
            key={`${t.label}-${i}`}
            className={`px-1 py-2 text-center ${t.active ? "border-[#3976D3] ring-1 ring-[#3976D3]/20" : ""}`}
          >
            <span className="flex justify-center" style={{ color: t.color }}>
              {t.icon}
            </span>
            <p className="mt-1 truncate text-[9px] leading-tight text-muted-foreground">
              {t.label}
            </p>
            <p className="mt-0.5 text-[16px] font-bold leading-none text-foreground">{t.value}</p>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

/**
 * Impact de la contribution. L'effet projeté n'est pas une donnée figée : il se
 * déduit de l'avancement, et devient l'effet réel une fois la contribution
 * validée — sinon les deux colonnes se contrediraient après validation.
 */
function ImpactPanel({ c }: { c: Contribution }) {
  const validated = c.status === "Validée";
  const gateNow = 41;
  const gateAfter = Math.min(100, gateNow + Math.round(c.progress / 25));

  const rows = [
    {
      icon: <TrendingUp className="h-3.5 w-3.5 text-[#3976D3]" />,
      label: "Avancement de la porte",
      current: `${validated ? gateAfter : gateNow} %`,
      projected: `${gateAfter} %`,
    },
    {
      icon: <ClipboardList className="h-3.5 w-3.5 text-[#2E7D32]" />,
      label: "Capacité machine MOP",
      current: "35 %",
      projected: "35 %",
    },
    {
      icon: <CalendarDays className="h-3.5 w-3.5 text-[#E58A00]" />,
      label: "Respect des délais APQP",
      current: "41 jours",
      projected: "41 jours",
    },
  ];

  return (
    <Panel title="Impact de cette contribution" className="shrink-0">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pb-1 font-medium">Indicateur</th>
            <th className="pb-1 text-right font-medium">Valeur actuelle</th>
            <th />
            <th className="pb-1 text-right font-medium">
              {validated ? "Effet appliqué" : "Effet projeté (à validation)"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="py-1">
                <span className="flex items-center gap-1.5">
                  {r.icon}
                  <span className="text-foreground">{r.label}</span>
                </span>
              </td>
              <td className="py-1 text-right tabular-nums font-semibold text-foreground">
                {r.current}
              </td>
              <td className="px-1.5 text-muted-foreground">→</td>
              <td className="py-1 text-right tabular-nums font-semibold text-[#2E7D32]">
                {r.projected}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {validated ? (
        <p className="mt-2 flex items-center gap-1.5 rounded-md bg-[#F1FBF4] px-2 py-1 text-[10px] font-medium text-[#2E7D32]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Impact appliqué au projet
        </p>
      ) : null}
    </Panel>
  );
}
