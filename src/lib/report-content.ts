/* -------------------------------------------------------------------------- */
/*  Composition d'un rapport.                                                  */
/*                                                                             */
/*  Rien n'est écrit en dur ici : chaque phrase, chaque tableau et chaque       */
/*  graphique se déduit des données du portefeuille. Changer un avancement dans */
/*  `data.ts` change le rapport — c'est ce qui permet de dire, en démonstration,*/
/*  que le document est bien construit à partir des données projet.             */
/*                                                                             */
/*  Ce que les maquettes affichent et que nous n'avons pas — évolutions « vs    */
/*  mois dernier », votes de comité, budget — n'est pas inventé : soit c'est    */
/*  remplacé par une grandeur réellement disponible, soit c'est déduit d'une    */
/*  règle explicite (les votes viennent de l'état des livrables de la fonction).*/
/* -------------------------------------------------------------------------- */

import {
  APQP_GATES,
  CAPACITY_ROWS,
  CAPACITY_TOTAL,
  GATE_DELIVERABLES,
  HEALTH_SPLIT,
  LOAD_MONTHS,
  PLAN_RISKS,
  PROJECTS,
  REPORT_PERIODS,
  SERVICE_LOAD,
  STATUS_DATE,
  capacityFor,
  deliverableStatus,
  deliverablesForGate,
  gateLabel,
  reportTemplate,
  type CapacityRow,
  type GateDeliverable,
  type Project,
  type ReportTemplateId,
  type ReportToneName,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

/* ------------------------------- Paramètres ------------------------------- */

export interface ReportParams {
  template: ReportTemplateId;
  name: string;
  /** Identifiant projet, ou `PORTFOLIO`. */
  scopeId: string;
  gate: string;
  reviewDate: string;
  period: string;
  language: string;
  confidentiality: string;
  tone: ReportToneName;
  includeKpis: boolean;
  includeRisks: boolean;
  includeComments: boolean;
  instructions: string;
}

/**
 * Paramètres cohérents avec le modèle choisi : un rapport de portefeuille n'a
 * pas de gate, un rapport de gate porte forcément sur un projet. Sans cela on
 * pourrait générer une « revue de gate » sur le portefeuille entier.
 */
export function defaultParams(template: ReportTemplateId): ReportParams {
  const spec = reportTemplate(template);
  const portfolio = spec.scope === "portefeuille";
  const project = PROJECTS[0];
  const params: ReportParams = {
    template,
    name: "",
    scopeId: portfolio ? "PORTFOLIO" : project.id,
    gate: portfolio ? "—" : `G${project.gateIndex}`,
    reviewDate: STATUS_DATE,
    period: REPORT_PERIODS[0],
    language: "Français",
    confidentiality: portfolio ? "Interne" : "Client",
    tone: portfolio ? "Professionnel" : "Orienté client",
    includeKpis: true,
    includeRisks: true,
    includeComments: true,
    instructions: "",
  };
  return { ...params, name: autoName(params) };
}

/**
 * Nom déduit du modèle et du périmètre. L'écran de configuration ne le
 * réimpose que tant que l'utilisateur ne l'a pas retouché : changer de projet
 * ne doit pas laisser en place le nom de l'ancien.
 */
export function autoName(p: ReportParams): string {
  const spec = reportTemplate(p.template);
  if (spec.scope === "portefeuille") {
    return `Portefeuille APQP — Vue direction — ${p.period.split(" (")[0]}`;
  }
  const project = PROJECTS.find((x) => x.id === p.scopeId);
  const lead = spec.id === "decision" ? "Gate review" : "Revue de gate";
  return `${lead} ${p.gate} — ${project?.name ?? "projet"}`;
}

/* --------------------------------- Outils --------------------------------- */

const pct = (n: number) => `${Math.round(n)} %`;
const one = (n: number) => n.toFixed(1).replace(".", ",");
const spiFmt = (n: number) => n.toFixed(3).replace(".", ",");

/** « 15/12/2026 » → nombre de jours depuis 1970, pour comparer des échéances. */
export function dayNumber(fr: string): number {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(fr.trim());
  if (!m) return 0;
  return Math.round(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])) / 86400000);
}

/** Écart en jours entre une date et la date de statut. */
export function daysFromStatus(fr: string): number {
  return dayNumber(fr) - dayNumber(STATUS_DATE);
}

function weighted(pick: (p: Project) => number): number {
  const total = PROJECTS.reduce((n, p) => n + p.workload, 0);
  return PROJECTS.reduce((n, p) => n + pick(p) * p.workload, 0) / total;
}

/* --------------------------------- Faits ---------------------------------- */

export interface DeliverableLine {
  d: GateDeliverable;
  status: string;
  late: boolean;
}

/** Trois issues possibles, dans le vocabulaire des revues de gate. */
export type Decision = "GO" | "GO conditionnel" | "NO GO";

/** Forme courte utilisée dans les tableaux serrés. */
export const DECISION_SHORT: Record<Decision, string> = {
  GO: "GO",
  "GO conditionnel": "GO*",
  "NO GO": "HOLD",
};

export const DECISION_COLOR: Record<Decision, string> = {
  GO: "#2E7D32",
  "GO conditionnel": "#0E7C52",
  "NO GO": "#D92D20",
};

/**
 * Décision de passage, déduite de trois critères : livrables en retard, risques
 * critiques ouverts et readiness. Elle se lit donc dans les tableaux du rapport
 * — elle ne peut pas les contredire.
 */
export function decisionOf(input: {
  readiness: number;
  late: number;
  criticalOpen: number;
  overdue: number;
}): { decision: Decision; reason: string } {
  const { readiness, late, criticalOpen, overdue } = input;
  if (readiness < 50 || (late > 0 && criticalOpen > 3)) {
    return {
      decision: "NO GO",
      reason:
        readiness < 50
          ? `La readiness (${readiness} %) reste sous le seuil de 50 % exigé pour un passage.`
          : `${late} livrable${late > 1 ? "s" : ""} en retard et ${criticalOpen} risques critiques ouverts.`,
    };
  }
  if (late > 0 || criticalOpen > 0 || overdue > 0) {
    const causes: string[] = [];
    if (late > 0) causes.push(`${late} livrable${late > 1 ? "s" : ""} en retard`);
    if (criticalOpen > 0)
      causes.push(
        `${criticalOpen} risque${criticalOpen > 1 ? "s" : ""} critique${criticalOpen > 1 ? "s" : ""} ouvert${criticalOpen > 1 ? "s" : ""}`,
      );
    if (overdue > 0) causes.push(`${overdue} action${overdue > 1 ? "s" : ""} en retard`);
    return {
      decision: "GO conditionnel",
      reason: `Passage possible sous conditions : ${causes.join(", ")}.`,
    };
  }
  return { decision: "GO", reason: "Tous les critères de passage sont satisfaits." };
}

/** Décision proposée pour un projet, sur sa prochaine gate. */
export function projectDecision(p: Project): { decision: Decision; reason: string } {
  const lines = deliverablesForGate(`G${p.gateIndex}`);
  const late = lines.filter((d) => deliverableStatus(d) === "En retard").length;
  return decisionOf({
    readiness: p.readiness,
    late,
    criticalOpen: p.criticalOpen,
    overdue: p.overdueActions,
  });
}

/**
 * Tout ce dont les pages ont besoin, calculé une fois. Textes, tableaux et
 * graphiques lisent le même objet : ils ne peuvent pas diverger.
 */
export interface ReportFacts {
  portfolio: boolean;
  project?: Project;
  gateId: string;
  gateTitle: string;
  gateName: string;
  deliverables: DeliverableLine[];
  approved: number;
  late: number;
  running: number;
  planned: number;
  actual: number;
  spi: number;
  readiness: number;
  red: number;
  overdue: number;
  criticalOpen: number;
  decision: Decision;
  decisionReason: string;
  overloaded: CapacityRow[];
  charge: CapacityRow[];
}

export function reportFacts(params: ReportParams): ReportFacts {
  const portfolio = params.scopeId === "PORTFOLIO";
  const project = portfolio ? undefined : PROJECTS.find((p) => p.id === params.scopeId);
  const gateId = portfolio ? "—" : params.gate;

  const deliverables: DeliverableLine[] = portfolio
    ? []
    : deliverablesForGate(gateId).map((d) => {
        const status = deliverableStatus(d);
        return { d, status, late: status === "En retard" };
      });

  const approved = deliverables.filter((l) => l.status === "Approuvé").length;
  const late = deliverables.filter((l) => l.late).length;
  const running = deliverables.length - approved - late;

  const readiness = project ? project.readiness : Math.round(weighted((p) => p.readiness));
  const criticalOpen = project
    ? project.criticalOpen
    : PROJECTS.reduce((n, p) => n + p.criticalOpen, 0);
  const overdue = project
    ? project.overdueActions
    : PROJECTS.reduce((n, p) => n + p.overdueActions, 0);

  const { decision, reason } = decisionOf({ readiness, late, criticalOpen, overdue });
  const charge = project ? capacityFor(project) : CAPACITY_ROWS;

  return {
    portfolio,
    project,
    gateId,
    gateTitle: portfolio ? "Portefeuille global" : gateLabel(gateId),
    gateName: portfolio ? "Portefeuille global" : (APQP_GATES.find((g) => g.id === gateId)?.label ?? gateId),
    deliverables,
    approved,
    late,
    running,
    planned: project ? project.planned : weighted((p) => p.planned),
    actual: project ? project.actual : weighted((p) => p.actual),
    spi: project ? project.spi : weighted((p) => p.spi),
    readiness,
    red: PROJECTS.filter((p) => p.health === "red").length,
    overdue,
    criticalOpen,
    decision,
    decisionReason: reason,
    overloaded: charge.filter((r) => r.ratio > 100),
    charge,
  };
}

/* --------------------------- Blocs : indicateurs -------------------------- */

export interface KpiTile {
  label: string;
  value: string;
  note?: string;
  tone: "ink" | "green" | "amber" | "red";
}

export function kpiBlock(f: ReportFacts): KpiTile[] {
  if (f.portfolio) {
    const soon = upcomingGates().filter((g) => g.inDays <= 30).length;
    const onTime = PROJECTS.filter((p) => p.driftDays <= 0).length;
    return [
      { label: "Projets actifs", value: String(PROJECTS.length), note: `${f.red} en santé rouge`, tone: "ink" },
      { label: "Gates à venir (≤ 30 j)", value: String(soon), note: "prochaines décisions", tone: soon > 0 ? "amber" : "ink" },
      { label: "Readiness moyenne", value: pct(f.readiness), note: "pondérée par la charge", tone: f.readiness >= 60 ? "green" : "amber" },
      { label: "Projets dans les délais", value: pct((onTime / PROJECTS.length) * 100), note: `${PROJECTS.length - onTime} en dérive`, tone: onTime === PROJECTS.length ? "green" : "amber" },
      { label: "Charge / capacité", value: `${CAPACITY_TOTAL.ratio} %`, note: `${f.overloaded.length} fonction(s) au-dessus`, tone: CAPACITY_TOTAL.ratio > 100 ? "red" : "green" },
      { label: "Risques critiques", value: String(f.criticalOpen), note: `${f.overdue} actions en retard`, tone: f.criticalOpen > 0 ? "red" : "green" },
    ];
  }
  return [
    { label: "Readiness du gate", value: pct(f.readiness), note: `seuil de passage : 50 %`, tone: f.readiness >= 60 ? "green" : "amber" },
    { label: "Livrables validés", value: `${f.approved} / ${f.deliverables.length}`, note: `${f.running} en cours`, tone: f.late > 0 ? "amber" : "green" },
    { label: "Livrables en retard", value: String(f.late), note: "échéance dépassée", tone: f.late > 0 ? "red" : "green" },
    { label: "Avancement réel", value: `${Math.round(f.actual)} %`, note: `${Math.round(f.planned)} % planifiés`, tone: f.actual >= f.planned ? "green" : "amber" },
    { label: "Risques critiques", value: String(f.criticalOpen), note: `${f.overdue} actions en retard`, tone: f.criticalOpen > 0 ? "red" : "green" },
  ];
}

/* ---------------------- Blocs : portefeuille et gates --------------------- */

export interface PortfolioRow {
  p: Project;
  decision: Decision;
  driftLabel: string;
  onTime: boolean;
}

/** Une ligne par projet, avec sa décision proposée. */
export function portfolioRows(): PortfolioRow[] {
  return PROJECTS.map((p) => ({
    p,
    decision: projectDecision(p).decision,
    driftLabel:
      p.driftDays === 0 ? "à l'heure" : `${p.driftDays > 0 ? "+" : ""}${p.driftDays} j`,
    onTime: p.driftDays <= 0,
  }));
}

export interface UpcomingGate {
  gate: string;
  gateLabel: string;
  project: Project;
  date: string;
  inDays: number;
  readiness: number;
  decision: Decision;
}

/** Les prochaines décisions de passage, de la plus proche à la plus lointaine. */
export function upcomingGates(): UpcomingGate[] {
  return PROJECTS.map((p) => ({
    gate: `G${p.gateIndex}`,
    gateLabel: APQP_GATES.find((g) => g.id === `G${p.gateIndex}`)?.label ?? p.nextGate,
    project: p,
    date: p.forecast,
    inDays: daysFromStatus(p.forecast),
    readiness: p.readiness,
    decision: projectDecision(p).decision,
  })).sort((a, b) => a.inDays - b.inDays);
}

export type GateState = "passe" | "encours" | "retard" | "avenir";

/** État de chaque gate d'un projet — la matrice de la synthèse portefeuille. */
export function gateRail(p: Project): { id: string; label: string; state: GateState }[] {
  return APQP_GATES.map((g, i) => {
    if (i < p.gateIndex) return { id: g.id, label: g.label, state: "passe" as GateState };
    if (i === p.gateIndex) {
      return {
        id: g.id,
        label: g.label,
        state: (p.driftDays > 0 ? "retard" : "encours") as GateState,
      };
    }
    return { id: g.id, label: g.label, state: "avenir" as GateState };
  });
}

/** Répartition des décisions proposées sur l'ensemble du portefeuille. */
export function decisionSplit(): { decision: Decision; count: number; note: string }[] {
  const rows = portfolioRows();
  return (["GO", "GO conditionnel", "NO GO"] as Decision[]).map((d) => ({
    decision: d,
    count: rows.filter((r) => r.decision === d).length,
    note:
      d === "GO"
        ? "Approuver et poursuivre vers la prochaine gate"
        : d === "GO conditionnel"
          ? "Approuver sous conditions, actions critiques à clore"
          : "Retenir en attente des actions correctives",
  }));
}

/** Readiness moyenne des projets arrivés à chaque gate. */
export function readinessByGate(): { gate: string; value: number; count: number }[] {
  return APQP_GATES.map((g, i) => {
    const at = PROJECTS.filter((p) => p.gateIndex === i);
    return {
      gate: g.id,
      count: at.length,
      value: at.length ? Math.round(at.reduce((n, p) => n + p.readiness, 0) / at.length) : 0,
    };
  });
}

/** Santé du portefeuille — la répartition déjà utilisée sur l'écran d'accueil. */
export function healthSplit() {
  return HEALTH_SPLIT;
}

/**
 * Charge du portefeuille mois par mois, en % de la capacité. Moyenne des
 * pilotes renseignés : c'est la même donnée que l'écran « Charge par service ».
 */
export function loadTrend(months = 12): { label: string; value: number }[] {
  const pilots = SERVICE_LOAD.flatMap((s) => s.members);
  return LOAD_MONTHS.slice(0, months).map((label, i) => {
    const values = pilots
      .map((m) => m.values[i])
      .filter((v): v is number => typeof v === "number");
    return {
      label,
      value: values.length ? Math.round(values.reduce((n, v) => n + v, 0) / values.length) : 0,
    };
  });
}

/* ------------------------- Blocs : gate d'un projet ----------------------- */

/** Les cinq critères de passage, chacun vérifié sur les données du rapport. */
export function passCriteria(f: ReportFacts): { label: string; ok: boolean; detail: string }[] {
  const production = f.charge.find((c) => c.fn === "Production" || c.fn === "Industrialisation");
  return [
    {
      label: "Livrables obligatoires validés",
      ok: f.approved === f.deliverables.length,
      detail: `${f.approved} / ${f.deliverables.length}`,
    },
    {
      label: "Aucun livrable en retard",
      ok: f.late === 0,
      detail: f.late === 0 ? "aucun" : `${f.late} en retard`,
    },
    {
      label: "Risques critiques traités",
      ok: f.criticalOpen === 0,
      detail: `${f.criticalOpen} ouvert${f.criticalOpen > 1 ? "s" : ""}`,
    },
    {
      label: "Actions bloquantes closes",
      ok: f.overdue === 0,
      detail: `${f.overdue} en retard`,
    },
    {
      label: "Capacité de production validée",
      ok: !production || production.ratio <= 100,
      detail: production ? `${production.fn} à ${production.ratio} %` : "—",
    },
  ];
}

/** Conditions de levée : un livrable non validé, une condition. */
export function decisionConditions(f: ReportFacts) {
  return f.deliverables
    .filter((l) => l.status !== "Approuvé")
    .sort((a, b) => dayNumber(a.d.dueDate) - dayNumber(b.d.dueDate))
    .map((l) => ({
      condition: `Finaliser ${l.d.name}`,
      action: l.d.id,
      owner: l.d.owner,
      due: l.d.dueDate,
      late: l.late,
      progress: l.d.progress,
    }));
}

/** Prochaines étapes : les échéances les plus proches, dans l'ordre. */
export function nextSteps(f: ReportFacts) {
  const steps = decisionConditions(f)
    .slice(0, 3)
    .map((c) => ({ date: c.due, label: c.condition, owner: c.owner }));
  if (f.project) {
    steps.push({
      date: f.project.forecast,
      label: `Revue de gate ${f.gateId}`,
      owner: f.project.manager,
    });
  }
  return steps;
}

/**
 * Vote de chaque fonction représentée dans la gate. Il se déduit de l'état de
 * ses propres livrables : une fonction dont tout est approuvé vote GO, une
 * fonction qui a un livrable en retard retient sa décision.
 */
export function reviewVotes(f: ReportFacts): { fn: string; decision: Decision }[] {
  const byFn = new Map<string, DeliverableLine[]>();
  for (const l of f.deliverables) {
    byFn.set(l.d.fn, [...(byFn.get(l.d.fn) ?? []), l]);
  }
  return Array.from(byFn, ([fn, lines]) => ({
    fn,
    decision: lines.some((l) => l.late)
      ? ("NO GO" as Decision)
      : lines.every((l) => l.status === "Approuvé")
        ? ("GO" as Decision)
        : ("GO conditionnel" as Decision),
  })).sort((a, b) => a.fn.localeCompare(b.fn, "fr"));
}

/** Fonctions présentes à la revue — celles qui portent un livrable de la gate. */
export function participants(f: ReportFacts): string[] {
  return Array.from(new Set(f.deliverables.map((l) => l.d.fn))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

/** Livrables par criticité, ventilés par état. */
export function criticalitySplit(f: ReportFacts) {
  const levels = ["Critique", "Élevée", "Moyenne"] as const;
  return levels
    .map((level) => {
      const lines = f.deliverables.filter((l) => l.d.criticality === level);
      return {
        level,
        approved: lines.filter((l) => l.status === "Approuvé").length,
        running: lines.filter((l) => l.status !== "Approuvé" && !l.late).length,
        late: lines.filter((l) => l.late).length,
        total: lines.length,
      };
    })
    .filter((r) => r.total > 0);
}

/** Contribution des livrables à la gate, en part de l'avancement total. */
export function contributionSplit(f: ReportFacts) {
  const total = f.deliverables.length || 1;
  return [
    { label: "Validés", value: Math.round((f.approved / total) * 100), color: "#2E7D32" },
    { label: "En cours", value: Math.round((f.running / total) * 100), color: "#0E7C52" },
    { label: "En retard", value: Math.round((f.late / total) * 100), color: "#D92D20" },
  ].filter((s) => s.value > 0);
}

/* --------------------------- Sections rédigées ---------------------------- */

export type TextStyle = "professionnel" | "synthetique" | "client" | "executif" | "clair";

/** Le ton choisi à la configuration fixe le style de départ de la rédaction. */
export function styleOfTone(tone: ReportToneName): TextStyle {
  if (tone === "Synthétique") return "synthetique";
  if (tone === "Orienté client") return "client";
  return "professionnel";
}

export const SUGGESTIONS: { label: string; style: TextStyle }[] = [
  { label: "Raccourcir", style: "synthetique" },
  { label: "Rendre plus exécutif", style: "executif" },
  { label: "Clarifier", style: "clair" },
  { label: "Ton plus client", style: "client" },
  { label: "Reformuler", style: "professionnel" },
];

function driftLabel(days: number): string {
  if (days === 0) return "conforme au référentiel";
  return days > 0 ? `soit ${days} jours de dérive` : `soit ${-days} jours d'avance`;
}

function topLate(f: ReportFacts): DeliverableLine[] {
  return f.deliverables
    .filter((l) => l.status !== "Approuvé")
    .sort((a, b) => a.d.progress - b.d.progress)
    .slice(0, 4);
}

/* -- Synthèse / insights --------------------------------------------------- */

function synthese(f: ReportFacts, style: TextStyle, params: ReportParams): string {
  if (f.portfolio) {
    const worst = [...PROJECTS].sort((a, b) => a.spi - b.spi)[0];
    const soon = upcomingGates().filter((g) => g.inDays <= 30).length;
    const bullets = [
      `${f.red} projets en santé rouge nécessitent une attention immédiate — dont ${worst.id}, SPI ${spiFmt(worst.spi)}.`,
      f.overloaded.length
        ? `La charge dépasse la capacité sur ${f.overloaded.map((o) => o.fn).join(", ")} : arbitrage prioritaire.`
        : "Aucune fonction n'est en dépassement de capacité sur la période.",
      `${f.criticalOpen} risques critiques ouverts et ${f.overdue} actions en retard, à sécuriser avant la prochaine revue.`,
      `${soon} gates sont à décider sous 30 jours, pour une readiness moyenne de ${pct(f.readiness)}.`,
    ];
    switch (style) {
      case "synthetique":
        return bullets.slice(0, 3).map((b) => `• ${b}`).join("\n");
      case "executif":
        return `• Portefeuille à ${one(f.actual)} % réalisé pour ${one(f.planned)} % planifiés (SPI ${spiFmt(f.spi)}).\n${bullets
          .slice(0, 3)
          .map((b) => `• ${b}`)
          .join("\n")}`;
      case "clair":
        return `• L'avancement réel (${one(f.actual)} %) mesure le travail effectivement réalisé, pondéré par la charge ; le planifié (${one(f.planned)} %) ce qui aurait dû l'être au ${params.reviewDate}.\n• L'écart de ${one(f.planned - f.actual)} points donne un SPI de ${spiFmt(f.spi)} : sous 1, le portefeuille consomme plus de temps que prévu.\n${bullets.slice(0, 2).map((b) => `• ${b}`).join("\n")}`;
      case "client":
        return `• Les ${PROJECTS.length} programmes progressent conformément aux engagements, à ${one(f.actual)} % du périmètre réalisé.\n• Les points d'attention identifiés sont couverts par des plans d'actions dédiés.\n• ${soon} revues de gate sont planifiées dans les 30 prochains jours.`;
      default:
        return bullets.map((b) => `• ${b}`).join("\n");
    }
  }

  const p = f.project!;
  switch (style) {
    case "synthetique":
      return `${p.id} — ${p.name} : ${p.actual} % réalisés pour ${p.planned} % planifiés (SPI ${spiFmt(p.spi)}). Gate ${f.gateId} au ${p.forecast}, ${driftLabel(p.driftDays)}. ${f.approved}/${f.deliverables.length} livrables validés, ${f.late} en retard.`;
    case "executif":
      return `${f.gateId} — ${f.decision}. ${f.decisionReason}\n\nAvancement ${p.actual} % (SPI ${spiFmt(p.spi)}), readiness ${p.readiness} %. Décision attendue le ${params.reviewDate}.`;
    case "clair":
      return `L'avancement réel (${p.actual} %) mesure le travail effectivement réalisé ; l'avancement planifié (${p.planned} %) ce qui aurait dû l'être au ${params.reviewDate}. L'écart de ${p.planned - p.actual} points donne un SPI de ${spiFmt(p.spi)} : en dessous de 1, le projet consomme plus de temps que prévu.\n\nLa gate ${f.gateId}, positionnée au ${p.baseline} dans le référentiel, est projetée au ${p.forecast}, ${driftLabel(p.driftDays)}. Sur les ${f.deliverables.length} livrables qui la sécurisent, ${f.approved} sont validés et ${f.late} ont dépassé leur échéance.`;
    case "client":
      return `Les travaux du projet ${p.name} progressent conformément au plan de développement convenu avec ${p.client}. À date, ${p.actual} % du périmètre est réalisé et ${f.approved} des ${f.deliverables.length} livrables de la gate ${f.gateId} sont validés.\n\nLa revue est positionnée au ${p.forecast}. Les points restants font l'objet du plan d'actions présenté ci-après, sans remise en cause de la date de SOP du ${p.sop}.`;
    default:
      return `Le projet ${p.name} (${p.id}) est en phase ${p.phase} pour le client ${p.client}. L'avancement réel atteint ${p.actual} % contre ${p.planned} % planifiés, soit un SPI de ${spiFmt(p.spi)}.\n\nLa gate ${f.gateTitle} est attendue le ${p.forecast}, ${driftLabel(p.driftDays)} par rapport au référentiel du ${p.baseline}. Sur les ${f.deliverables.length} livrables de la gate, ${f.approved} sont validés, ${f.running} en cours et ${f.late} en retard.`;
  }
}

/* -- Recommandations / commentaires ---------------------------------------- */

function reco(f: ReportFacts, style: TextStyle): string {
  if (f.portfolio) {
    const over = f.overloaded[0];
    const donors = CAPACITY_ROWS.filter((r) => r.capacity - r.load > 0)
      .sort((a, b) => b.capacity - b.load - (a.capacity - a.load))
      .slice(0, 2);
    const worst = [...PROJECTS].sort((a, b) => a.spi - b.spi)[0];
    const lines = [
      over
        ? `Renforcer ${over.fn} : ${formatNumber(over.load - over.capacity)} h à replacer, disponibles sur ${donors.map((d) => `${d.fn} (${formatNumber(d.capacity - d.load)} h)`).join(" et ")}.`
        : "Maintenir la répartition de charge actuelle, aucune fonction n'étant en dépassement.",
      `Arbitrer ${worst.id} — ${worst.name} : SPI ${spiFmt(worst.spi)}, ${worst.overdueActions} actions en retard, readiness ${worst.readiness} %.`,
      `Sécuriser les ${f.overdue} actions en retard avant la prochaine revue de portefeuille.`,
      `Anticiper les ${upcomingGates().filter((g) => g.inDays <= 30).length} gates à décider sous 30 jours.`,
    ];
    if (style === "executif")
      return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
    if (style === "synthetique") return lines.slice(0, 3).map((l) => `• ${l}`).join("\n");
    return lines.map((l) => `• ${l}`).join("\n");
  }

  const late = topLate(f);
  const lines = late.map(
    (l) =>
      `${l.d.name} — ${l.d.owner} (${l.d.fn}) : ${l.d.progress} % au ${l.d.dueDate}${l.late ? ", échéance dépassée" : ""}.`,
  );
  if (lines.length === 0) {
    return "• Aucune action corrective requise : l'ensemble des livrables de la gate est validé.";
  }
  switch (style) {
    case "executif":
      return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
    case "synthetique":
      return lines.slice(0, 3).map((l) => `• ${l}`).join("\n");
    case "client":
      return `${lines.map((l) => `• ${l}`).join("\n")}\n• Un point d'avancement hebdomadaire est tenu avec les responsables concernés.`;
    default:
      return lines.map((l) => `• ${l}`).join("\n");
  }
}

/* -- Conclusion / décisions ------------------------------------------------ */

function conclusion(f: ReportFacts, style: TextStyle, params: ReportParams): string {
  if (f.portfolio) {
    const split = decisionSplit();
    const lines = [
      `Valider les plans d'actions des ${f.red} projets en santé rouge.`,
      f.overloaded.length
        ? `Arbitrer le renfort de ${f.overloaded.map((o) => o.fn).join(", ")}.`
        : "Confirmer la répartition de charge actuelle.",
      `Statuer sur les ${split.find((s) => s.decision === "GO conditionnel")?.count ?? 0} gates proposées en passage conditionnel.`,
      `Valider le calendrier des prochaines revues, à partir du ${upcomingGates()[0]?.date ?? params.reviewDate}.`,
    ];
    if (style === "synthetique") return lines.slice(0, 3).map((l) => `• ${l}`).join("\n");
    if (style === "executif") return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
    return lines.map((l) => `• ${l}`).join("\n");
  }

  const p = f.project!;
  switch (style) {
    case "synthetique":
      return `Décision proposée : ${f.decision}. ${f.decisionReason}`;
    case "executif":
      return `${f.decision} — ${f.decisionReason} Réexamen au ${params.reviewDate}.`;
    case "clair":
      return `La décision proposée est « ${f.decision} ». Elle découle de trois critères : livrables en retard (${f.late}), risques critiques ouverts (${f.criticalOpen}) et readiness (${p.readiness} %).\n\n${f.decisionReason}`;
    case "client":
      return `Nous proposons un passage en ${f.decision} pour la gate ${f.gateId}. ${f.decisionReason}\n\nLa date de SOP du ${p.sop} n'est pas remise en cause à ce stade.`;
    default:
      return `${f.decisionReason}\n\nLes conditions de levée sont suivies par ${p.manager} et réexaminées au ${params.reviewDate}. La date de SOP reste fixée au ${p.sop}.`;
  }
}

/** Texte d'une section, tel que l'IA le rédigerait dans le style demandé. */
export function sectionText(
  sectionId: string,
  params: ReportParams,
  style: TextStyle,
  facts?: ReportFacts,
): string {
  const f = facts ?? reportFacts(params);
  if (sectionId === "synthese") return synthese(f, style, params);
  if (sectionId === "reco") return reco(f, style);
  return conclusion(f, style, params);
}

/** Le texte généré arrive en paragraphes ou en listes : on rend les deux. */
export function textLines(text: string): { text: string; bullet: boolean }[] {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      const bullet = l.startsWith("•") || /^\d+\./.test(l);
      return { text: bullet ? l.replace(/^[•]\s*/, "") : l, bullet };
    });
}

/* ------------------------------ Rapport composé --------------------------- */

export interface BuiltSection {
  id: string;
  title: string;
  kind: "text" | "data";
  text?: string;
}

export interface BuiltReport {
  title: string;
  subtitle: string;
  facts: ReportFacts;
  sections: BuiltSection[];
  pages: number;
}

/**
 * Assemble le document. `overrides` porte les sections retouchées à la main :
 * le texte de l'utilisateur l'emporte toujours sur celui de la génération.
 */
export function buildReport(
  params: ReportParams,
  overrides: Record<string, string> = {},
): BuiltReport {
  const spec = reportTemplate(params.template);
  const f = reportFacts(params);
  const style = styleOfTone(params.tone);

  const sections: BuiltSection[] = [];
  for (const s of spec.sections) {
    // Les options de la configuration retirent réellement des sections.
    if (s.block === "kpis" && !params.includeKpis) continue;
    if (s.block === "risques" && !params.includeRisks) continue;
    if (s.id === "reco" && !params.includeComments) continue;

    sections.push({
      id: s.id,
      title: s.title,
      kind: s.kind,
      text: s.kind === "text" ? (overrides[s.id] ?? sectionText(s.id, params, style, f)) : undefined,
    });
  }

  return {
    title: params.name,
    subtitle: f.portfolio
      ? `Pilotage global des projets — ${params.period.split(" (")[0]}`
      : `${f.project?.client} · ${f.gateTitle}`,
    facts: f,
    sections,
    pages: spec.pages,
  };
}

/** Une section est-elle présente dans le rapport composé ? */
export function hasSection(report: BuiltReport, id: string): boolean {
  return report.sections.some((s) => s.id === id);
}

/** Texte d'une section, ou chaîne vide si elle a été retirée. */
export function textOf(report: BuiltReport, id: string): string {
  return report.sections.find((s) => s.id === id)?.text ?? "";
}

/** Risques du portefeuille, dans l'ordre de criticité. */
export function topRisks() {
  const rank: Record<string, number> = { Critique: 0, Majeur: 1, Mineur: 2, Faible: 3 };
  return [...PLAN_RISKS].sort((a, b) => (rank[a.level] ?? 9) - (rank[b.level] ?? 9));
}

/** Gates proposées pour un projet : celles du référentiel qui ont des livrables. */
export function gatesForProject(): typeof APQP_GATES {
  return APQP_GATES.filter((g) => GATE_DELIVERABLES.some((d) => d.gate === g.id));
}
