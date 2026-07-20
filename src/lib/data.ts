/* -------------------------------------------------------------------------- */
/*  Mock data for the CIPA | APQP demo.                                        */
/*  Source: data_file.xlsx (projets, planning, actions, KPI) complété par les   */
/*  valeurs affichées dans les maquettes de référence.                         */
/*  Front-end uniquement : aucune API, aucune base de données.                 */
/* -------------------------------------------------------------------------- */

export const STATUS_DATE = "15/12/2026";

/* ------------------------------- Portefeuille ----------------------------- */

export type Health = "green" | "orange" | "red";

export interface Project {
  id: string;
  name: string;
  client: string;
  manager: string;
  managerInitials: string;
  phase: string;
  sop: string;
  workload: number; // heures
  planned: number; // %
  actual: number; // %
  spi: number;
  overdueActions: number;
  readiness: number; // %
  qualityLoad: number; // %
  health: Health;
  nextGate: string;
  /** Rang de la prochaine gate dans APQP_GATES (0 = G0). */
  gateIndex: number;
  /** Dérive en jours de la prochaine gate — négatif = avance. */
  driftDays: number;
  baseline: string;
  forecast: string;
  criticalOpen: number;
  /** Part de livrables approuvés, en %. */
  approved: number;
}

export const PROJECTS: Project[] = [
  {
    id: "P-DEMO-001", name: "Carter aluminium e-Drive", client: "OEM Alpha",
    manager: "Leïla Mansour", managerInitials: "LM", phase: "Process Design",
    sop: "05/07/2027", workload: 2248, planned: 48, actual: 42, spi: 0.875,
    overdueActions: 1, readiness: 58, qualityLoad: 112, health: "orange",
    nextGate: "G3 Process Freeze", gateIndex: 3, driftDays: 14,
    baseline: "05/02/2027", forecast: "19/02/2027", criticalOpen: 3, approved: 33,
  },
  {
    id: "P-DEMO-002", name: "Armature siège avant", client: "OEM Beta",
    manager: "Hatem Ben Ali", managerInitials: "HB", phase: "Validation",
    sop: "31/03/2027", workload: 1680, planned: 66, actual: 69, spi: 1.045,
    overdueActions: 0, readiness: 82, qualityLoad: 94, health: "green",
    nextGate: "G4 PPAP Approval", gateIndex: 4, driftDays: -3,
    baseline: "12/01/2027", forecast: "09/01/2027", criticalOpen: 0, approved: 78,
  },
  {
    id: "P-DEMO-003", name: "Support batterie EV", client: "OEM Gamma",
    manager: "Sarra Khelifi", managerInitials: "SK", phase: "Product Design",
    sop: "30/09/2027", workload: 2860, planned: 35, actual: 26, spi: 0.743,
    overdueActions: 5, readiness: 31, qualityLoad: 121, health: "red",
    nextGate: "G2 Design Freeze", gateIndex: 2, driftDays: 26,
    baseline: "18/03/2027", forecast: "13/04/2027", criticalOpen: 6, approved: 18,
  },
  {
    id: "P-DEMO-004", name: "Module de refroidissement", client: "OEM Alpha",
    manager: "Leïla Mansour", managerInitials: "LM", phase: "Planification",
    sop: "30/09/2027", workload: 1920, planned: 12, actual: 11, spi: 0.917,
    overdueActions: 0, readiness: 22, qualityLoad: 86, health: "green",
    nextGate: "G1 Planification produit", gateIndex: 1, driftDays: 0,
    baseline: "15/01/2027", forecast: "15/01/2027", criticalOpen: 0, approved: 8,
  },
  {
    id: "P-DEMO-005", name: "Boîtier électronique BMS", client: "OEM Delta",
    manager: "Karim Belhadj", managerInitials: "KB", phase: "Process Design",
    sop: "14/05/2027", workload: 2410, planned: 54, actual: 47, spi: 0.870,
    overdueActions: 2, readiness: 61, qualityLoad: 104, health: "orange",
    nextGate: "G3 Process Freeze", gateIndex: 3, driftDays: 9,
    baseline: "22/12/2026", forecast: "31/12/2026", criticalOpen: 2, approved: 41,
  },
  {
    id: "P-DEMO-006", name: "Traverse de choc avant", client: "OEM Beta",
    manager: "Noura Trabelsi", managerInitials: "NT", phase: "Validation",
    sop: "28/02/2027", workload: 1340, planned: 74, actual: 76, spi: 1.027,
    overdueActions: 0, readiness: 88, qualityLoad: 91, health: "green",
    nextGate: "G4 PPAP Approval", gateIndex: 4, driftDays: 0,
    baseline: "05/12/2026", forecast: "05/12/2026", criticalOpen: 0, approved: 84,
  },
  {
    id: "P-DEMO-007", name: "Carter réducteur fonte", client: "OEM Gamma",
    manager: "Youssef Jaziri", managerInitials: "YJ", phase: "Product Design",
    sop: "31/10/2027", workload: 2650, planned: 29, actual: 21, spi: 0.724,
    overdueActions: 4, readiness: 27, qualityLoad: 118, health: "red",
    nextGate: "G2 Design Freeze", gateIndex: 2, driftDays: 21,
    baseline: "26/02/2027", forecast: "19/03/2027", criticalOpen: 5, approved: 15,
  },
  {
    id: "P-DEMO-008", name: "Faisceau haute tension", client: "OEM Delta",
    manager: "Hassan Kacem", managerInitials: "HK", phase: "Process Design",
    sop: "20/08/2027", workload: 1780, planned: 45, actual: 43, spi: 0.956,
    overdueActions: 1, readiness: 54, qualityLoad: 97, health: "orange",
    nextGate: "G3 Process Freeze", gateIndex: 3, driftDays: 5,
    baseline: "10/03/2027", forecast: "15/03/2027", criticalOpen: 1, approved: 36,
  },
  {
    id: "P-DEMO-009", name: "Platine de fixation moteur", client: "OEM Alpha",
    manager: "Sofiane Haddad", managerInitials: "SH", phase: "Lancement",
    sop: "15/12/2026", workload: 1120, planned: 96, actual: 95, spi: 0.990,
    overdueActions: 0, readiness: 94, qualityLoad: 78, health: "green",
    nextGate: "G5 Feedback & amélioration", gateIndex: 5, driftDays: 0,
    baseline: "15/12/2026", forecast: "15/12/2026", criticalOpen: 0, approved: 97,
  },
  {
    id: "P-DEMO-010", name: "Réservoir fluide caloporteur", client: "OEM Beta",
    manager: "Leila Mokrani", managerInitials: "LM", phase: "Planification",
    sop: "31/01/2028", workload: 1460, planned: 8, actual: 6, spi: 0.750,
    overdueActions: 1, readiness: 14, qualityLoad: 88, health: "orange",
    nextGate: "G1 Planification produit", gateIndex: 1, driftDays: 7,
    baseline: "20/02/2027", forecast: "27/02/2027", criticalOpen: 1, approved: 5,
  },
];

/** Moyenne pondérée par la charge : un gros projet pèse plus qu'un petit. */
function weightedAvg(pick: (p: Project) => number): number {
  const total = PROJECTS.reduce((n, p) => n + p.workload, 0);
  return PROJECTS.reduce((n, p) => n + pick(p) * p.workload, 0) / total;
}

const fr1 = (n: number) => n.toFixed(1).replace(".", ",");

export const PORTFOLIO_KPIS = [
  { label: "Avancement portefeuille réel", value: `${fr1(weightedAvg((p) => p.actual))} %`, tone: "ink" as const, icon: "trend" },
  { label: "Avancement portefeuille planifié", value: `${fr1(weightedAvg((p) => p.planned))} %`, tone: "ink" as const, icon: "target" },
  { label: "SPI portefeuille", value: weightedAvg((p) => p.spi).toFixed(3).replace(".", ","), tone: "ink" as const, icon: "gauge" },
  { label: "Projets rouges", value: String(PROJECTS.filter((p) => p.health === "red").length), tone: "red" as const, icon: "flag" },
  { label: "Actions en retard", value: String(PROJECTS.reduce((n, p) => n + p.overdueActions, 0)), tone: "red" as const, icon: "clock" },
  { label: "Readiness moyenne", value: `${Math.round(weightedAvg((p) => p.readiness))} %`, tone: "amber" as const, icon: "shield" },
  { label: "Décision prioritaire", value: "Renforcer Qualité", tone: "action" as const, icon: "star" },
];

export interface CapacityRow {
  fn: string;
  load: number;
  capacity: number;
  ratio: number;
  color: string;
}

export const CAPACITY_ROWS: CapacityRow[] = [
  { fn: "Qualité", load: 2700, capacity: 2232, ratio: 121, color: "#D92D20" },
  { fn: "Méthodes", load: 1950, capacity: 2000, ratio: 98, color: "#E58A00" },
  { fn: "Achats", load: 1280, capacity: 1600, ratio: 80, color: "#2E7D32" },
  { fn: "Production", load: 2100, capacity: 2500, ratio: 84, color: "#2E7D32" },
  { fn: "Industrialisation", load: 1620, capacity: 2000, ratio: 81, color: "#2E7D32" },
  { fn: "Logistique", load: 980, capacity: 1200, ratio: 82, color: "#2E7D32" },
];

export const CAPACITY_TOTAL = { load: 10630, capacity: 11532, ratio: 92 };

/** Répartition santé, comptée sur PROJECTS : elle suit l'ajout d'un projet. */
export const HEALTH_SPLIT = (
  [
    { name: "Vert", key: "green", color: "#2E7D32" },
    { name: "Orange", key: "orange", color: "#E58A00" },
    { name: "Rouge", key: "red", color: "#D92D20" },
  ] as const
).map((h) => {
  const value = PROJECTS.filter((p) => p.health === h.key).length;
  return {
    name: h.name,
    value,
    pct: Math.round((value / PROJECTS.length) * 100),
    color: h.color,
  };
});

/* ------------------------------ Détail projet ----------------------------- */

/** Projet par défaut — celui que les écrans mono-projet ouvrent sans paramètre. */
export const PROJECT = PROJECTS[0];

export function projectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

/** Total portefeuille, recalculé : il ne peut pas diverger de PROJECTS. */
export const PORTFOLIO_TOTALS = {
  count: PROJECTS.length,
  workload: PROJECTS.reduce((n, p) => n + p.workload, 0),
  overdue: PROJECTS.reduce((n, p) => n + p.overdueActions, 0),
  critical: PROJECTS.reduce((n, p) => n + p.criticalOpen, 0),
  red: PROJECTS.filter((p) => p.health === "red").length,
  orange: PROJECTS.filter((p) => p.health === "orange").length,
  green: PROJECTS.filter((p) => p.health === "green").length,
  late: PROJECTS.filter((p) => p.driftDays > 0).length,
  avgReadiness: Math.round(
    PROJECTS.reduce((n, p) => n + p.readiness, 0) / PROJECTS.length,
  ),
  avgSpi: PROJECTS.reduce((n, p) => n + p.spi, 0) / PROJECTS.length,
  avgPlanned: Math.round(PROJECTS.reduce((n, p) => n + p.planned, 0) / PROJECTS.length),
  avgActual: Math.round(PROJECTS.reduce((n, p) => n + p.actual, 0) / PROJECTS.length),
};

/** Répartition par phase, pour la vue liste. */
export const PHASE_SPLIT = Array.from(
  PROJECTS.reduce((m, p) => m.set(p.phase, (m.get(p.phase) ?? 0) + 1), new Map<string, number>()),
).map(([phase, count]) => ({ phase, count }));

/** Bandeau de gate d'un projet donné. */
export function gateFor(p: Project) {
  return {
    next: p.nextGate,
    baseline: p.baseline,
    forecast: p.forecast,
    drift: p.driftDays === 0 ? "à l'heure" : `${p.driftDays > 0 ? "+" : ""}${p.driftDays} jours`,
    onTime: p.driftDays <= 0,
    readiness: p.readiness,
  };
}

/** Indicateurs du tableau de bord, dérivés du projet ouvert. */
export function kpisFor(p: Project) {
  return [
    { label: "Avancement réel", value: `${p.actual} %`, note: `vs plan ${p.planned} %`, tone: "ink" as const, icon: "gauge" },
    { label: "Avancement planifié", value: `${p.planned} %`, tone: "ink" as const, icon: "target" },
    { label: "SPI simplifié", value: p.spi.toFixed(3).replace(".", ","), note: p.spi < 1 ? "< 1,00" : "≥ 1,00", tone: p.spi < 1 ? ("red" as const) : ("green" as const), icon: "trend" },
    { label: "Actions en retard", value: String(p.overdueActions), tone: p.overdueActions > 0 ? ("red" as const) : ("green" as const), icon: "clock" },
    { label: "Livrables approuvés", value: `${p.approved} %`, tone: "green" as const, icon: "check" },
    { label: "Actions critiques ouvertes", value: String(p.criticalOpen), tone: p.criticalOpen > 0 ? ("red" as const) : ("green" as const), icon: "alert" },
    { label: "Santé projet", value: { green: "Vert", orange: "Orange", red: "Rouge" }[p.health], tone: { green: "green", orange: "amber", red: "red" }[p.health] as "green" | "amber" | "red", icon: "shield" },
  ];
}

export const PROJECT_GATE = {
  next: "G3 — Process Freeze",
  baseline: "05/02/2027",
  forecast: "19/02/2027",
  drift: "+14 jours",
  readiness: 58,
};

export const PROJECT_KPIS = [
  { label: "Avancement réel", value: "41 %", note: "vs plan 50,6 %", tone: "ink" as const, icon: "gauge" },
  { label: "Avancement planifié", value: "50,6 %", tone: "ink" as const, icon: "target" },
  { label: "SPI simplifié", value: "0,81", note: "< 1,00", tone: "red" as const, icon: "trend" },
  { label: "Actions en retard", value: "1", tone: "red" as const, icon: "clock" },
  { label: "Livrables approuvés", value: "33 %", tone: "green" as const, icon: "check" },
  { label: "Actions critiques ouvertes", value: "3", tone: "red" as const, icon: "alert" },
  { label: "Santé projet", value: "Orange", tone: "amber" as const, icon: "shield" },
];

/** Courbe en S — avancement planifié vs réel (le réel s'arrête à la date de statut). */
export const S_CURVE = [
  { month: "Jan", planned: 2, actual: 2 },
  { month: "Fév", planned: 6, actual: 5 },
  { month: "Mar", planned: 12, actual: 10 },
  { month: "Avr", planned: 20, actual: 16 },
  { month: "Mai", planned: 30, actual: 23 },
  { month: "Jun", planned: 42, actual: 30 },
  { month: "Jul", planned: 55, actual: 36 },
  { month: "Aoû", planned: 66, actual: 39 },
  { month: "Sep", planned: 76, actual: 40 },
  { month: "Oct", planned: 84, actual: 40.5 },
  { month: "Nov", planned: 90, actual: 41 },
  { month: "Déc", planned: 94, actual: 41 },
  { month: "Jan", planned: 97, actual: null },
  { month: "Fév", planned: 100, actual: null },
];

export const ACTION_SPLIT = [
  { name: "Terminé", value: 16, pct: 37, color: "#2E7D32" },
  { name: "En cours", value: 24, pct: 56, color: "#E58A00" },
  { name: "En retard", value: 3, pct: 7, color: "#D92D20" },
];

/**
 * Le projet n'a que trois sujets ouverts. Ils étaient auparavant éclatés en
 * trois listes — l'alerte, le risque encouru, la décision attendue — qui
 * répétaient la même information sous trois formes et pouvaient diverger.
 * Un sujet = une entrée, qui porte les trois faces.
 */
export interface ProjectIssue {
  id: string;
  title: string;
  /** Le constat chiffré. */
  detail: string;
  level: "Critique" | "Majeure";
  /** Ce qui se passe si rien n'est décidé. */
  risk: string;
  /** L'arbitrage attendu du comité. */
  decision: string;
  /** Échéance de la décision, quand elle en a une. */
  due?: string;
}

/**
 * Sujets ouverts d'un projet donné. Chaque entrée n'apparaît que si le projet
 * la porte réellement — un projet à l'heure et sans retard n'a rien à arbitrer,
 * et le panneau le dit plutôt que d'afficher les alertes d'un autre projet.
 */
export function issuesFor(p: Project): ProjectIssue[] {
  const out: ProjectIssue[] = [];

  if (p.driftDays > 0) {
    out.push({
      id: "gate",
      title: `Dérive sur ${p.nextGate}`,
      detail: `Forecast ${p.forecast} soit +${p.driftDays} jours vs baseline.`,
      level: p.driftDays >= 14 ? "Critique" : "Majeure",
      risk: "Impact sur la date PPAP au-delà de +15 jours de dérive.",
      decision: `Confirmer la date forecast de ${p.nextGate} et son impact PPAP.`,
    });
  }

  if (p.qualityLoad > 100) {
    out.push({
      id: "capacity",
      title: "Charge Qualité supérieure à la capacité",
      detail: `Charge actuelle ${p.qualityLoad} % vs capacité disponible.`,
      level: "Majeure",
      risk: "Surcharge persistante sur les quatre prochaines semaines.",
      decision: "Arbitrer la surcharge de la fonction Qualité.",
    });
  }

  if (p.overdueActions > 0) {
    out.push({
      id: "overdue",
      title: `${p.overdueActions} action${p.overdueActions > 1 ? "s" : ""} en retard`,
      detail: "PFMEA process — action critique dépassée.",
      level: p.overdueActions >= 4 ? "Critique" : "Majeure",
      risk: "Plan de rattrapage requis pour tenir la gate.",
      decision: "Valider le plan de rattrapage PFMEA.",
      due: "18/12/2026",
    });
  }

  return out;
}

/**
 * Charge par fonction d'un projet. Les parts sont fixes — c'est la répartition
 * type d'un projet APQP — mais les heures se calculent sur `workload`, si bien
 * que le total du tableau égale toujours la charge affichée en fiche projet.
 */
const FUNCTION_SHARE: { fn: string; load: number; capacity: number }[] = [
  { fn: "Qualité", load: 0.276, capacity: 0.224 },
  { fn: "Méthodes", load: 0.214, capacity: 0.202 },
  { fn: "Achats", load: 0.138, capacity: 0.162 },
  { fn: "Production", load: 0.231, capacity: 0.251 },
  { fn: "Industrialisation", load: 0.141, capacity: 0.161 },
];

export function capacityFor(p: Project): CapacityRow[] {
  return FUNCTION_SHARE.map((s) => {
    const load = Math.round(p.workload * s.load);
    // La fonction Qualité est calée sur la surcharge connue du projet, les
    // autres sur leur part de capacité type.
    const capacity =
      s.fn === "Qualité"
        ? Math.round(load / (p.qualityLoad / 100))
        : Math.round(p.workload * s.capacity);
    const ratio = Math.round((load / capacity) * 100);
    return {
      fn: s.fn,
      load,
      capacity,
      ratio,
      color: ratio > 100 ? "#D92D20" : ratio >= 95 ? "#E58A00" : "#2E7D32",
    };
  });
}

export function capacityTotalFor(rows: CapacityRow[]) {
  const load = rows.reduce((n, r) => n + r.load, 0);
  const capacity = rows.reduce((n, r) => n + r.capacity, 0);
  return { load, capacity, ratio: Math.round((load / capacity) * 100) };
}

export const PROJECT_ISSUES: ProjectIssue[] = [
  {
    id: "gate",
    title: "Dérive sur G3 — Process Freeze",
    detail: "Forecast 19/02/2027 soit +14 jours vs baseline.",
    level: "Critique",
    risk: "Impact sur la date PPAP au-delà de +15 jours de dérive.",
    decision: "Confirmer la date forecast du Process Freeze et son impact PPAP.",
  },
  {
    id: "capacity",
    title: "Charge Qualité supérieure à la capacité",
    detail: "Charge actuelle 112 % vs capacité disponible.",
    level: "Majeure",
    risk: "Surcharge persistante sur les quatre prochaines semaines.",
    decision: "Arbitrer la surcharge de la fonction Qualité.",
  },
  {
    id: "overdue",
    title: "1 action en retard",
    detail: "PFMEA process — action critique dépassée.",
    level: "Majeure",
    risk: "Plan de rattrapage requis pour tenir la gate.",
    decision: "Valider le plan de rattrapage PFMEA.",
    due: "18/12/2026",
  },
];

/**
 * Répartition de la charge du projet entre les fonctions. La somme des charges
 * vaut `PROJECT.workload` : le total affiché ne peut pas contredire la fiche
 * projet ni la ligne du portefeuille.
 */
export const PROJECT_CAPACITY: CapacityRow[] = [
  { fn: "Qualité", load: 620, capacity: 554, ratio: 112, color: "#D92D20" },
  { fn: "Méthodes", load: 480, capacity: 500, ratio: 96, color: "#E58A00" },
  { fn: "Achats", load: 310, capacity: 400, ratio: 78, color: "#2E7D32" },
  { fn: "Production", load: 520, capacity: 620, ratio: 84, color: "#2E7D32" },
  { fn: "Industrialisation", load: 318, capacity: 400, ratio: 80, color: "#2E7D32" },
];

export const PROJECT_CAPACITY_TOTAL = {
  load: PROJECT_CAPACITY.reduce((n, r) => n + r.load, 0),
  capacity: PROJECT_CAPACITY.reduce((n, r) => n + r.capacity, 0),
  get ratio() {
    return Math.round((this.load / this.capacity) * 100);
  },
};

export const APQP_GATES = [
  { id: "G0", label: "Plan & Définir le programme" },
  { id: "G1", label: "Planification produit" },
  { id: "G2", label: "Conception & Développement produit" },
  { id: "G3", label: "Process Freeze" },
  { id: "G4", label: "Validation produit & process" },
  { id: "G5", label: "Feedback, évaluation & amélioration" },
];

export const DELIVERABLES = [
  { name: "DFMEA", status: "Approuvé", progress: 100 },
  { name: "PFMEA", status: "En cours", progress: 62 },
  { name: "Plan de contrôle", status: "En revue", progress: 48 },
  { name: "Process Flow Diagram", status: "Approuvé", progress: 100 },
];

/* ----------------------------- Suivi d'exécution -------------------------- */

/**
 * Une contribution suit toujours le même cycle :
 *
 *   Créée ──démarrer──▶ En cours ──soumettre──▶ À valider ──valider──▶ Validée
 *                          ▲                        │
 *                          └────────refuser─────────┘
 *
 * « En retard » n'est pas une étape du cycle mais une lecture de la date cible :
 * une contribution en cours dont l'échéance est dépassée s'affiche en retard.
 * C'est `isOverdue()` qui tranche, jamais une saisie manuelle — sans quoi le
 * statut et la date pourraient se contredire à l'écran.
 */
export type ContribStatus = "Créée" | "En cours" | "À valider" | "Validée";
export type ContribPriority = "Critique" | "Haute" | "Moyenne" | "Basse";
export type StepStatus = "À faire" | "En cours" | "Terminée";
export type EvidenceStatus = "En attente de validation" | "Validée" | "Refusée";

export interface ContribStep {
  n: number;
  label: string;
  status: StepStatus;
}

export interface ContribEvidence {
  id: string;
  file: string;
  size: string;
  type: string;
  addedAt: string;
  addedBy: string;
  status: EvidenceStatus;
  validatedBy?: string;
  validatedAt?: string;
  comment?: string;
}

/** Nature d'une entrée d'historique — pilote l'icône et sa couleur. */
export type UpdateKind =
  | "create"
  | "start"
  | "progress"
  | "evidence"
  | "submit"
  | "validate"
  | "refuse";

export interface ContribUpdate {
  id: string;
  kind: UpdateKind;
  author: string;
  initials: string;
  at: string;
  lines: string[];
}

export interface Contribution {
  id: string;
  title: string;
  reference: string;
  owner: string;
  ownerInitials: string;
  priority: ContribPriority;
  status: ContribStatus;
  progress: number;
  /** Date cible, au format jj/mm/aaaa. */
  dueDate: string;
  lastUpdate: string;
  expected: string;
  comment: string;
  contributors: { name: string; initials: string }[];
  steps: ContribStep[];
  evidence: ContribEvidence[];
  history: ContribUpdate[];
}

/** Libellés d'étapes par défaut : le parcours de réalisation est le même partout. */
const DEFAULT_STEPS: ContribStep[] = [
  { n: 1, label: "Vérifier les causes critiques", status: "À faire" },
  { n: 2, label: "Mettre à jour la cotation de risque", status: "À faire" },
  { n: 3, label: "Charger la preuve de revue", status: "À faire" },
  { n: 4, label: "Soumettre la mise à jour", status: "À faire" },
];

/**
 * Étapes cohérentes avec un taux d'avancement : chaque étape vaut un quart.
 * Évite d'écrire à la main des jeux d'étapes qui contrediraient la barre de
 * progression affichée juste à côté.
 */
function stepsFor(progress: number): ContribStep[] {
  const done = Math.floor(progress / 25);
  return DEFAULT_STEPS.map((s, i) => ({
    ...s,
    status: i < done ? "Terminée" : i === done && progress % 25 !== 0 ? "En cours" : "À faire",
  }));
}

export const CONTRIBUTIONS: Contribution[] = [
  {
    id: "CTR-0001",
    title: "Clore action étanchéité process",
    reference: "PFMEA process",
    owner: "Noura Trabelsi",
    ownerInitials: "NT",
    priority: "Critique",
    status: "Créée",
    progress: 0,
    dueDate: "09/01/2027",
    lastUpdate: "15/12/2026 14:32",
    expected: "Risque process réduit et action PFMEA clôturée",
    comment: "",
    contributors: [
      { name: "Noura Trabelsi", initials: "NT" },
      { name: "Hichem Ben Amar", initials: "HB" },
    ],
    steps: stepsFor(0),
    evidence: [],
    history: [
      {
        id: "u0",
        kind: "create",
        author: "Système",
        initials: "SY",
        at: "15/12/2026 14:32",
        lines: ["Contribution créée"],
      },
    ],
  },
  {
    id: "CTR-0002",
    title: "Valider capacité machine MOP",
    reference: "Plan de contrôle",
    owner: "Rachid Ben Amar",
    ownerInitials: "RB",
    priority: "Haute",
    status: "En cours",
    progress: 35,
    dueDate: "18/01/2027",
    lastUpdate: "15/12/2026 10:15",
    expected: "Capacité machine confirmée sur les trois postes",
    comment: "Relevés en cours sur la ligne 04.",
    contributors: [{ name: "Rachid Ben Amar", initials: "RB" }],
    steps: stepsFor(35),
    evidence: [
      {
        id: "e1",
        file: "Releves_capacite_MOP.pdf",
        size: "0.9 Mo",
        type: "Rapport",
        addedAt: "13/12/2026 09:12",
        addedBy: "Rachid Ben Amar",
        status: "En attente de validation",
      },
      {
        id: "e2",
        file: "Fiche_machine_MOP.pdf",
        size: "0.4 Mo",
        type: "Fiche",
        addedAt: "15/12/2026 10:15",
        addedBy: "Rachid Ben Amar",
        status: "En attente de validation",
      },
    ],
    history: [
      {
        id: "u1",
        kind: "progress",
        author: "Rachid Ben Amar",
        initials: "RB",
        at: "15/12/2026 10:15",
        lines: ["Avancement mis à jour à 35 %"],
      },
    ],
  },
  {
    id: "CTR-0003",
    title: "Mettre à jour AMDEC procédé",
    reference: "PFMEA process",
    owner: "Sofiane Haddad",
    ownerInitials: "SH",
    priority: "Critique",
    status: "À valider",
    progress: 80,
    dueDate: "05/01/2027",
    lastUpdate: "14/12/2026 16:42",
    expected: "Cotation de risque révisée et validée",
    comment: "En attente de la revue qualité.",
    contributors: [{ name: "Sofiane Haddad", initials: "SH" }],
    steps: stepsFor(80),
    evidence: [
      {
        id: "e3",
        file: "AMDEC_procede_v4.pdf",
        size: "2.1 Mo",
        type: "Analyse de risque",
        addedAt: "14/12/2026 16:42",
        addedBy: "Sofiane Haddad",
        status: "En attente de validation",
      },
    ],
    history: [
      {
        id: "u2",
        kind: "submit",
        author: "Sofiane Haddad",
        initials: "SH",
        at: "14/12/2026 16:42",
        lines: ["Contribution soumise pour validation"],
      },
    ],
  },
  {
    id: "CTR-0004",
    title: "Réaliser étude capabilité initiale",
    reference: "Plan de contrôle",
    owner: "Leila Mokrani",
    ownerInitials: "LM",
    priority: "Haute",
    status: "Validée",
    progress: 100,
    dueDate: "12/12/2026",
    lastUpdate: "13/12/2026 09:30",
    expected: "Cpk conforme sur les caractéristiques critiques",
    comment: "Étude conforme, clôturée.",
    contributors: [{ name: "Leila Mokrani", initials: "LM" }],
    steps: stepsFor(100),
    evidence: [
      {
        id: "e4",
        file: "Etude_capabilite_initiale.pdf",
        size: "1.4 Mo",
        type: "Rapport",
        addedAt: "11/12/2026 11:20",
        addedBy: "Leila Mokrani",
        status: "Validée",
        validatedBy: "Responsable Qualité",
        validatedAt: "13/12/2026 09:30",
        comment: "Conforme aux exigences client.",
      },
    ],
    history: [
      {
        id: "u3",
        kind: "validate",
        author: "Responsable Qualité",
        initials: "RQ",
        at: "13/12/2026 09:30",
        lines: ["Contribution validée"],
      },
    ],
  },
  {
    id: "CTR-0005",
    title: "Qualifier fournisseur joint torique",
    reference: "Plan de maîtrise",
    owner: "Hassan Kacem",
    ownerInitials: "HK",
    priority: "Moyenne",
    status: "En cours",
    progress: 60,
    dueDate: "20/01/2027",
    lastUpdate: "13/12/2026 11:05",
    expected: "Fournisseur qualifié et référencé",
    comment: "Audit fournisseur planifié.",
    contributors: [{ name: "Hassan Kacem", initials: "HK" }],
    steps: stepsFor(60),
    evidence: [
      {
        id: "e5",
        file: "Audit_fournisseur.pdf",
        size: "1.1 Mo",
        type: "Audit",
        addedAt: "13/12/2026 11:05",
        addedBy: "Hassan Kacem",
        status: "En attente de validation",
      },
    ],
    history: [
      {
        id: "u4",
        kind: "progress",
        author: "Hassan Kacem",
        initials: "HK",
        at: "13/12/2026 11:05",
        lines: ["Avancement mis à jour à 60 %"],
      },
    ],
  },
  {
    id: "CTR-0006",
    title: "Corriger défaut porosité carter",
    reference: "8D-2025-014",
    owner: "Rachid Ben Amar",
    ownerInitials: "RB",
    priority: "Critique",
    status: "En cours",
    progress: 45,
    // Échéance dépassée : la contribution ressort « En retard » à l'affichage.
    dueDate: "05/12/2026",
    lastUpdate: "12/12/2026 17:22",
    expected: "Taux de porosité ramené sous le seuil client",
    comment: "Essais de dégazage en cours.",
    contributors: [{ name: "Rachid Ben Amar", initials: "RB" }],
    steps: stepsFor(45),
    evidence: [
      {
        id: "e6",
        file: "Rapport_8D_porosite.pdf",
        size: "1.7 Mo",
        type: "Rapport 8D",
        addedAt: "12/12/2026 17:22",
        addedBy: "Rachid Ben Amar",
        status: "En attente de validation",
      },
    ],
    history: [
      {
        id: "u5",
        kind: "progress",
        author: "Rachid Ben Amar",
        initials: "RB",
        at: "12/12/2026 17:22",
        lines: ["Avancement mis à jour à 45 %"],
      },
    ],
  },
  {
    id: "CTR-0007",
    title: "Archiver rapport essai corrosion",
    reference: "Rapport essais",
    owner: "Leila Mokrani",
    ownerInitials: "LM",
    priority: "Basse",
    status: "Validée",
    progress: 100,
    dueDate: "01/12/2026",
    lastUpdate: "11/12/2026 13:20",
    expected: "Rapport archivé et référencé",
    comment: "Archivage confirmé.",
    contributors: [{ name: "Leila Mokrani", initials: "LM" }],
    steps: stepsFor(100),
    evidence: [
      {
        id: "e7",
        file: "Essai_corrosion_2026.pdf",
        size: "0.8 Mo",
        type: "Rapport",
        addedAt: "10/12/2026 08:40",
        addedBy: "Leila Mokrani",
        status: "Validée",
        validatedBy: "Responsable Qualité",
        validatedAt: "11/12/2026 13:20",
      },
    ],
    history: [
      {
        id: "u6",
        kind: "validate",
        author: "Responsable Qualité",
        initials: "RQ",
        at: "11/12/2026 13:20",
        lines: ["Contribution validée"],
      },
    ],
  },
  {
    id: "CTR-0008",
    title: "Déployer standard travail opérateur",
    reference: "Instruction de travail",
    owner: "Yassine Gharbi",
    ownerInitials: "YG",
    priority: "Moyenne",
    status: "En cours",
    progress: 20,
    dueDate: "30/01/2027",
    lastUpdate: "11/12/2026 09:10",
    expected: "Standard déployé sur les trois équipes",
    comment: "Formation des équipes en préparation.",
    contributors: [{ name: "Yassine Gharbi", initials: "YG" }],
    steps: stepsFor(20),
    evidence: [],
    history: [
      {
        id: "u7",
        kind: "start",
        author: "Yassine Gharbi",
        initials: "YG",
        at: "11/12/2026 09:10",
        lines: ["Contribution démarrée"],
      },
    ],
  },
];

/** "09/01/2027" → 20270109, comparable numériquement. */
function dateKey(fr: string): number {
  const [d, m, y] = fr.split("/");
  return Number(`${y}${m}${d}`);
}

/** Le retard est un statut d'affichage : il se déduit, il ne se saisit pas. */
export type DisplayStatus = ContribStatus | "En retard";

/**
 * Une contribution est en retard si sa date cible est passée alors qu'elle est
 * encore à la main de son responsable. Une fois soumise, la balle est dans le
 * camp du valideur : on garde « À valider », qui est l'information utile.
 */
export function displayStatus(c: Contribution): DisplayStatus {
  const pending = c.status === "Créée" || c.status === "En cours";
  return pending && dateKey(c.dueDate) < dateKey(STATUS_DATE) ? "En retard" : c.status;
}

/** Soumission autorisée seulement à 100 % et toutes les étapes terminées. */
export function canSubmit(c: Contribution): boolean {
  return c.progress >= 100 && c.steps.every((s) => s.status === "Terminée");
}

/** Contexte de la porte APQP courante, affiché en bandeau. */
export const EXECUTION_GATE = {
  projectId: "DF-MOV-001",
  projectName: "Carter aluminium e-Drive",
  gateNumber: "02",
  gateName: "Concevoir Process",
  objective: "Sécuriser la conception et fiabiliser les processus de prototypage",
};

/**
 * Le périmètre du projet dépasse les contributions listées ici : la répartition
 * porte sur les 31 contributions du projet, dont ce tableau montre un extrait.
 */
export const CONTRIB_SPLIT = [
  { label: "Créées", value: 5, color: "#98A2B3" },
  { label: "En cours", value: 7, color: "#3976D3" },
  { label: "À valider", value: 4, color: "#E58A00" },
  { label: "Validées", value: 12, color: "#2E7D32" },
  { label: "En retard", value: 3, color: "#D92D20" },
];

export const RECENT_ACTIVITY = [
  {
    id: "a1",
    kind: "progress" as UpdateKind,
    who: "Rachid Ben Amar",
    what: "a mis à jour la contribution",
    target: "Valider capacité machine MOP",
    when: "Il y a 1 heure",
  },
  {
    id: "a2",
    kind: "validate" as UpdateKind,
    who: "Leila Mokrani",
    what: "a validé la contribution",
    target: "Réaliser étude capabilité initiale",
    when: "Il y a 3 heures",
  },
  {
    id: "a3",
    kind: "submit" as UpdateKind,
    who: "Sofiane Haddad",
    what: "a soumis une contribution en validation",
    target: "Mettre à jour AMDEC procédé",
    when: "Hier à 16:42",
  },
];

/* --------------------------- Création de projet --------------------------- */

export const NEW_PROJECT = {
  code: "P-DEMO-004",
  name: "Module de refroidissement",
  client: "OEM Alpha",
  part: "Cooling plate EV",
  manager: "Leïla Mansour",
  managerInitials: "LM",
  template: "APQP Light — Nouveau produit",
  category: "Nouveau produit",
  /**
   * Description générée à partir du template APQP, de la catégorie et du client
   * sélectionnés plus haut. Structurée en sections plutôt qu'en bloc de texte :
   * chaque section correspond à ce que l'étape suivante du wizard demandera.
   */
  aiDescription: {
    /** Ce qui a servi à produire la description, affiché pour la traçabilité. */
    basedOn: ["Template APQP Light", "Catégorie Nouveau produit", "Client OEM Alpha"],
    summary:
      "Conception, développement et industrialisation d'un module de refroidissement pour véhicules électriques, intégrant une plaque froide, des canaux de fluide et des interfaces mécaniques.",
    sections: [
      {
        title: "Périmètre technique",
        icon: "package" as const,
        lines: [
          "Plaque froide brasée aluminium, canaux de fluide et interfaces mécaniques.",
          "Étanchéité circuit glycol et tenue en pression jusqu'à 3 bar.",
          "Intégration compacte sous contrainte d'encombrement batterie.",
        ],
      },
      {
        title: "Exigences client",
        icon: "target" as const,
        lines: [
          "Performance thermique : dissipation nominale conforme au cahier des charges OEM.",
          "PPAP niveau 3 attendu à la gate G4.",
          "Traçabilité pièce à pièce sur les caractéristiques critiques.",
        ],
      },
      {
        title: "Risques anticipés",
        icon: "alert" as const,
        lines: [
          "Étanchéité du circuit — historique de porosité sur pièces brasées comparables.",
          "Capacité Qualité déjà tendue sur le portefeuille (121 %).",
          "Délai d'approvisionnement outillage sur le chemin critique G3.",
        ],
      },
      {
        title: "Jalons structurants",
        icon: "calendar" as const,
        lines: [
          "G2 Design Freeze — gel de la définition produit.",
          "G3 Process Freeze — gel du process et lancement outillage.",
          "G4 PPAP Approval — validation client avant SOP.",
        ],
      },
    ],
  },
  objectives: [
    "Sécuriser les gates APQP et les livrables associés",
    "Assurer la qualité produit et la robustesse des processus",
    "Respecter la date SOP et les engagements client",
    "Structurer et maîtriser les risques produit",
  ],
  kickoff: "01/10/2026",
  sop: "30/09/2027",
  calendar: "Standard 5/7",
  duration: "12 mois",
  totalLoad: "10 920 h",
};

/* ------------------------- Équipe projet & extended ----------------------- */

export interface TeamMember {
  name: string;
  initials: string;
  fn: string;
  /** Rôle tenu dans la démarche APQP, distinct de la fonction métier. */
  role: string;
  /** Part du temps affectée au projet, en pourcentage. */
  allocation: number;
  site: string;
  color: string;
}

/** Équipe pluridisciplinaire permanente, présente à toutes les gates. */
export const CORE_TEAM: TeamMember[] = [
  { name: "Leïla Mansour", initials: "LM", fn: "Direction projet", role: "Pilotage APQP", allocation: 60, site: "Sousse", color: "#0E7C52" },
  { name: "Noura Trabelsi", initials: "NT", fn: "Qualité", role: "PFMEA & plan de contrôle", allocation: 45, site: "Sousse", color: "#D92D20" },
  { name: "Youssef Jaziri", initials: "YJ", fn: "Méthodes / Process", role: "Flux process & outillage", allocation: 50, site: "Sousse", color: "#3976D3" },
  { name: "Karim Belhadj", initials: "KB", fn: "Industrialisation", role: "Essais & capabilité", allocation: 35, site: "Sousse", color: "#2E7D32" },
  { name: "Sonia Gharbi", initials: "SG", fn: "Achats", role: "Panel fournisseurs", allocation: 20, site: "Tunis", color: "#7C3AED" },
  { name: "Mehdi Aloui", initials: "MA", fn: "Logistique", role: "Emballage & flux", allocation: 15, site: "Sousse", color: "#0891B2" },
  { name: "Rim Bouazizi", initials: "RB", fn: "R&D Produit", role: "Interface design", allocation: 25, site: "Tunis", color: "#E58A00" },
];

export interface ExtendedMember {
  name: string;
  initials: string;
  org: string;
  orgType: "Client" | "Fournisseur" | "Interne";
  role: string;
  /** Gates auxquelles le contact est convoqué. */
  gates: string;
}

/** Contributeurs sollicités ponctuellement, sur certaines gates seulement. */
export const EXTENDED_TEAM: ExtendedMember[] = [
  { name: "Thomas Berger", initials: "TB", org: "OEM Alpha", orgType: "Client", role: "SQE client", gates: "G2, G3, G4" },
  { name: "Claire Fontaine", initials: "CF", org: "OEM Alpha", orgType: "Client", role: "Acheteur programme", gates: "G0, G5" },
  { name: "Marco Rossi", initials: "MR", org: "Fonderie Lombardia", orgType: "Fournisseur", role: "Fourniture brut aluminium", gates: "G2, G3" },
  { name: "Anke Weber", initials: "AW", org: "Werkzeug GmbH", orgType: "Fournisseur", role: "Outillage d'injection", gates: "G3" },
  { name: "Hédi Chaabane", initials: "HC", org: "Usine Sousse", orgType: "Interne", role: "Responsable production", gates: "G4, G5" },
  { name: "Sami Toumi", initials: "ST", org: "Laboratoire métrologie", orgType: "Interne", role: "Moyens de mesure", gates: "G3, G4" },
];

/**
 * Rôles attendus par le référentiel APQP. Un rôle non pourvu est signalé :
 * c'est le seul écart que l'étape doit faire remonter.
 */
export const APQP_ROLES = [
  { role: "Chef de projet", holder: "Leïla Mansour" },
  { role: "Qualité", holder: "Noura Trabelsi" },
  { role: "Méthodes / Process", holder: "Youssef Jaziri" },
  { role: "Industrialisation", holder: "Karim Belhadj" },
  { role: "Achats", holder: "Sonia Gharbi" },
  { role: "Logistique", holder: "Mehdi Aloui" },
  { role: "R&D Produit", holder: "Rim Bouazizi" },
  { role: "Maintenance", holder: null },
];

export interface FunctionLoad {
  fn: string;
  capacity: number;
  load: number;
  ratio: number;
  color: string;
}

export const NEW_PROJECT_FUNCTIONS: FunctionLoad[] = [
  { fn: "Qualité", capacity: 2400, load: 2590, ratio: 108, color: "#D92D20" },
  { fn: "Produit / Design", capacity: 2000, load: 1700, ratio: 85, color: "#3976D3" },
  { fn: "Process", capacity: 2200, load: 2020, ratio: 92, color: "#E58A00" },
  { fn: "Production", capacity: 1800, load: 1620, ratio: 90, color: "#2E7D32" },
  { fn: "Achats", capacity: 1200, load: 1020, ratio: 85, color: "#8B5E9F" },
  { fn: "Logistique", capacity: 800, load: 580, ratio: 73, color: "#2C9C9C" },
];

export const CAPACITY_RISKS = [
  {
    fn: "Qualité",
    title: "surcharge de 190 h",
    level: "Critique",
    impact: "Impact potentiel sur G2/G3",
    reco: "ajouter 0,2 ETP ou replanifier",
    color: "#D92D20",
  },
  {
    fn: "Process",
    title: "marge faible de 180 h",
    level: "Élevé",
    impact: "Impact potentiel sur G3",
    reco: "réduire charge ou lisser planning",
    color: "#E58A00",
  },
];

export const RESOURCE_ALLOCATION = [
  { name: "Leila Mansour", fn: "Qualité", rate: "100 %", parallel: 2, load: 1480, available: 460, ratio: 108, color: "#D92D20" },
  { name: "Antoine Dubois", fn: "Produit / Design", rate: "80 %", parallel: 2, load: 1360, available: 240, ratio: 85, color: "#3976D3" },
  { name: "Sara Benali", fn: "Process", rate: "100 %", parallel: 2, load: 1620, available: 180, ratio: 92, color: "#E58A00" },
  { name: "Marc Petit", fn: "Production", rate: "80 %", parallel: 2, load: 1280, available: 160, ratio: 90, color: "#2E7D32" },
  { name: "Julien Moreau", fn: "Achats", rate: "80 %", parallel: 1, load: 816, available: 184, ratio: 85, color: "#8B5E9F" },
  { name: "Claire Roussel", fn: "Logistique", rate: "60 %", parallel: 1, load: 416, available: 144, ratio: 73, color: "#2C9C9C" },
];

export const GENERATED_STATS = [
  { value: "6", label: "Gates APQP", icon: "flag" },
  { value: "18", label: "Tâches initiales", icon: "list" },
  { value: "6", label: "Fonctions allouées", icon: "users" },
  { value: "10", label: "Ressources", icon: "team" },
  { value: "10 920 h", label: "Estimation charge globale", icon: "clock" },
  { value: "94 %", label: "Charge / capacité", icon: "gauge" },
];

export const GENERATED_GATES = [
  { id: "G0", label: "Kickoff", date: "01/10/2026" },
  { id: "G1", label: "Feasibility", date: "15/01/2027" },
  { id: "G2", label: "Design Freeze", date: "30/04/2027" },
  { id: "G3", label: "Process Freeze", date: "30/06/2027" },
  { id: "G4", label: "PPAP Approval", date: "15/08/2027" },
  { id: "G5", label: "SOP", date: "30/09/2027" },
];

/** Mini-Gantt de prévisualisation : offset/durée en douzièmes de la période. */
export const GENERATED_PLAN = [
  { gate: "G0 Kickoff", period: "01/10/26 – 15/01/27", start: 0, span: 3.5, milestone: true },
  { gate: "G1 Feasibility", period: "15/01/27 – 30/04/27", start: 3.5, span: 3.5 },
  { gate: "G2 Design Freeze", period: "30/04/27 – 30/06/27", start: 7, span: 2 },
  { gate: "G3 Process Freeze", period: "30/06/27 – 15/08/27", start: 9, span: 1.5 },
  { gate: "G4 PPAP Approval", period: "15/08/27 – 30/09/27", start: 10.5, span: 1.5 },
  { gate: "G5 SOP", period: "30/09/27", start: 12, span: 0, milestone: true },
];

export const GENERATED_CONTENT = [
  { label: "18 tâches initiales", icon: "list" },
  { label: "6 jalons", icon: "diamond" },
  { label: "11 livrables clés", icon: "file" },
  { label: "Équipe type pré-affectée", icon: "users" },
];

/* ---------------------------- Planning détaillé --------------------------- */

export interface PlanRow {
  wbs: string;
  id: string;
  gate?: string;
  gateTone?: "amber" | "blue";
  name: string;
  owner: string;
  /** Dates ISO — l'affichage jj/mm/aaaa est dérivé, jamais dupliqué. */
  bStart: string;
  bEnd: string;
  fStart: string;
  fEnd: string;
  load: number;
  progress: number;
  critical: boolean;
  predecessors: string;
  delay: string;
  status: "En retard" | "En cours" | "Non démarré" | "Terminé";
  milestone?: boolean;
  /** Ligne de regroupement WBS : barre récapitulative dans le Gantt. */
  summary?: boolean;
  /** WBS de la tâche dont dépend celle-ci (flèche du Gantt). */
  dependsOn?: string;
  /** Type de lien : fin-début, fin-fin, début-fin, début-début. */
  depType?: DepType;
  /**
   * Décalage horizontal du coude du lien, exprimé en jours pour rester
   * cohérent quelle que soit l'échelle d'affichage.
   */
  depOffset?: number;
}

/** Les quatre types de dépendance d'un planificateur. */
export type DepType = "FS" | "FF" | "SF" | "SS";

export const DEP_TYPES: { key: DepType; label: string; hint: string }[] = [
  { key: "FS", label: "Fin → Début", hint: "La suivante démarre quand la précédente est terminée." },
  { key: "FF", label: "Fin → Fin", hint: "Les deux se terminent en même temps." },
  { key: "SF", label: "Début → Fin", hint: "La suivante se termine quand la précédente démarre." },
  { key: "SS", label: "Début → Début", hint: "Les deux démarrent en même temps." },
];

/** Jours chômés exclus du planning (fériés France sur la fenêtre). */
export const NON_WORKING = [
  "2026-12-25", "2027-01-01", "2027-04-05",
];

export const PLAN_ROWS: PlanRow[] = [
  {
    wbs: "3", id: "PH3", name: "Process Design", owner: "—",
    bStart: "2026-12-02", bEnd: "2027-01-14", fStart: "2026-12-02", fEnd: "2027-01-16",
    load: 232, progress: 32, critical: false, predecessors: "2.4", delay: "+2",
    status: "En cours", summary: true,
  },
  {
    wbs: "3.1", id: "T08", name: "Établir diagramme de flux process", owner: "Youssef Jaziri",
    bStart: "2026-12-02", bEnd: "2026-12-13", fStart: "2026-12-02", fEnd: "2026-12-13",
    load: 40, progress: 76, critical: true, predecessors: "2.4", delay: "+5", status: "En retard",
  },
  {
    wbs: "3.2", id: "T09", name: "Réaliser PFMEA process", owner: "Noura Trabelsi",
    bStart: "2026-12-12", bEnd: "2026-12-23", fStart: "2026-12-14", fEnd: "2026-12-26",
    load: 80, progress: 35, critical: true, predecessors: "3.1", delay: "+3", status: "En cours",
    dependsOn: "3.1",
  },
  {
    wbs: "3.3", id: "T10", name: "Élaborer plan de contrôle pré-lancement", owner: "Noura Trabelsi",
    bStart: "2026-12-24", bEnd: "2027-01-07", fStart: "2026-12-31", fEnd: "2027-01-14",
    load: 48, progress: 0, critical: true, predecessors: "3.2", delay: "+7", status: "Non démarré",
    dependsOn: "3.2",
  },
  {
    wbs: "3.4", id: "T11", name: "Suivre fabrication outillage", owner: "Youssef Jaziri",
    bStart: "2026-12-12", bEnd: "2027-01-06", fStart: "2026-12-15", fEnd: "2027-01-12",
    load: 64, progress: 23, critical: true, predecessors: "2.4", delay: "+4", status: "En cours",
    summary: true,
  },
  {
    wbs: "3.4.1", id: "T11a", name: "Usinage moule injection", owner: "Youssef Jaziri",
    bStart: "2026-12-12", bEnd: "2026-12-25", fStart: "2026-12-15", fEnd: "2026-12-29",
    load: 40, progress: 35, critical: true, predecessors: "2.4", delay: "+3", status: "En cours",
  },
  {
    wbs: "3.4.2", id: "T11b", name: "Essais à froid outillage", owner: "Karim Belhadj",
    bStart: "2026-12-28", bEnd: "2027-01-06", fStart: "2026-12-30", fEnd: "2027-01-12",
    load: 24, progress: 0, critical: true, predecessors: "3.4.1", delay: "+4",
    status: "Non démarré", dependsOn: "3.4.1",
  },
  {
    wbs: "3.5", id: "T12", gate: "G3", gateTone: "amber", name: "Gate G3 Process Freeze", owner: "—",
    bStart: "2027-01-14", bEnd: "2027-01-14", fStart: "2027-01-16", fEnd: "2027-01-16",
    load: 0, progress: 0, critical: false, predecessors: "3.2, 3.3, 3.4", delay: "+2",
    status: "En retard", milestone: true, dependsOn: "3.3",
  },
  {
    wbs: "4", id: "PH4", name: "Product & Process Validation", owner: "—",
    bStart: "2027-01-03", bEnd: "2027-03-05", fStart: "2027-01-20", fEnd: "2027-03-08",
    load: 144, progress: 0, critical: false, predecessors: "3.5", delay: "+14",
    status: "Non démarré", summary: true,
  },
  {
    wbs: "4.1", id: "T13", name: "Préparer production trial", owner: "Youssef Jaziri",
    bStart: "2027-01-03", bEnd: "2027-01-16", fStart: "2027-01-20", fEnd: "2027-02-02",
    load: 72, progress: 0, critical: false, predecessors: "3.5", delay: "+14", status: "Non démarré",
    dependsOn: "3.5",
  },
  {
    wbs: "4.2", id: "T14", name: "Réaliser MSA et capabilité", owner: "Noura Trabelsi",
    bStart: "2027-01-20", bEnd: "2027-02-16", fStart: "2027-01-28", fEnd: "2027-02-24",
    load: 48, progress: 0, critical: false, predecessors: "4.1", delay: "+14", status: "Non démarré",
    dependsOn: "4.1",
  },
  {
    wbs: "4.3", id: "T15", name: "Soumettre dossier PPAP", owner: "Youssef Jaziri",
    bStart: "2027-02-20", bEnd: "2027-02-26", fStart: "2027-02-24", fEnd: "2027-03-03",
    load: 24, progress: 0, critical: false, predecessors: "4.2", delay: "+14", status: "Non démarré",
    dependsOn: "4.2",
  },
  {
    wbs: "4.4", id: "T16", gate: "G4", gateTone: "blue", name: "Gate G4 PPAP Approval", owner: "—",
    bStart: "2027-03-05", bEnd: "2027-03-05", fStart: "2027-03-08", fEnd: "2027-03-08",
    load: 0, progress: 0, critical: false, predecessors: "4.3", delay: "+14", status: "Non démarré",
    milestone: true, dependsOn: "4.3",
  },
];

/** Fenêtre visible du Gantt : 16 semaines, du lundi S35 au dimanche S50 2026. */
export const PLAN_WINDOW = { start: "2026-11-23", weeks: 19 };

export const PLAN_RISKS = [
  {
    id: "surcharge", label: "Surcharge Qualité +12 %", level: "Critique",
    detail: "Dépend de la disponibilité de l'équipe qualité.",
  },
  {
    id: "pfmea", label: "PFMEA process en retard", level: "Majeur",
    detail: "Conflit avec une validation en cours sur un autre projet.",
  },
  {
    id: "freeze", label: "Impact sur Process Freeze +14 jours", level: "Majeur",
    detail: "Risque lié à la disponibilité des outillages.",
  },
  {
    id: "conflit", label: "Conflit de charge sur Noura Trabelsi", level: "Mineur",
    detail: "Livraison attendue d'équipement de rivetage.",
  },
  {
    id: "readiness", label: "Capacité laboratoire insuffisante en déc. 2027", level: "Faible",
    detail: "Risque de saturation des équipements de mesure.",
  },
];

/* --------------------------- Charge par service --------------------------- */

/** Axe mensuel de la heatmap de charge, sur 19 mois. */
export const LOAD_MONTHS = [
  "Déc. 26", "Jan. 27", "Fév. 27", "Mar. 27", "Avr. 27", "Mai 27", "Juin 27",
  "Juil. 27", "Aoû. 27", "Sep. 27", "Oct. 27", "Nov. 27", "Déc. 27",
  "Jan. 28", "Fév. 28", "Mar. 28", "Avr. 28", "Mai 28", "Juin 28",
];

export interface LoadPilot {
  name: string;
  initials: string;
  color: string;
  projects: number;
  /** Charge mensuelle en % de capacité ; `null` = aucune activité planifiée. */
  values: (number | null)[];
  /** Clients dont le pilote porte au moins un projet — sert aux filtres. */
  clients: string[];
  /** Santé la plus dégradée parmi ses projets. */
  health: Health;
  /** Phases APQP sur lesquelles il est engagé. */
  phases: string[];
}

export interface LoadService {
  service: string;
  pilots: number;
  values: (number | null)[];
  members: LoadPilot[];
}

const n = null;

export const SERVICE_LOAD: LoadService[] = [
  {
    service: "Programme", pilots: 7,
    values: [42, 29, 31, 35, 55, 30, 32, 12, 34, n, 23, 26, 16, 7, n, 3, 9, 14, 1],
    members: [
      { name: "Leïla Mansour", initials: "LM", color: "#0E7C52", projects: 9,
        clients: ["OEM Alpha", "OEM Gamma"], health: "orange",
        phases: ["Product Design", "Process Design"],
        values: [58, 31, 44, 40, 72, 33, 41, 12, 47, n, 30, 35, 22, 9, n, 4, 12, 19, 1] },
      { name: "Hatem Ben Ali", initials: "HB", color: "#3976D3", projects: 5,
        clients: ["OEM Beta"], health: "green", phases: ["Validation"],
        values: [26, 27, 18, 30, 38, 27, 23, 12, 21, n, 16, 17, 10, 5, n, 2, 6, 9, 1] },
    ],
  },
  {
    service: "Engineering", pilots: 4,
    values: [161, 88, 74, 101, 47, 35, 54, 41, 7, n, n, n, n, n, n, n, n, n, n],
    members: [
      { name: "Rim Bouazizi", initials: "RB", color: "#E58A00", projects: 6,
        clients: ["OEM Alpha", "OEM Gamma"], health: "red",
        phases: ["Product Design", "Process Design"],
        values: [188, 96, 81, 118, 52, 38, 61, 44, 8, n, n, n, n, n, n, n, n, n, n] },
      { name: "Anis Gharbi", initials: "AG", color: "#0891B2", projects: 4,
        clients: ["OEM Beta"], health: "green", phases: ["Product Design"],
        values: [134, 80, 67, 84, 42, 32, 47, 38, 6, n, n, n, n, n, n, n, n, n, n] },
    ],
  },
  {
    service: "Qualité", pilots: 5,
    values: [144, 119, 143, 162, 138, 126, 106, 88, 50, 87, 96, 41, 20, 12, 19, 20, 30, 2, n],
    members: [
      { name: "Noura Trabelsi", initials: "NT", color: "#D92D20", projects: 8,
        clients: ["OEM Alpha", "OEM Beta", "OEM Gamma"], health: "red",
        phases: ["Process Design", "Validation"],
        values: [176, 141, 174, 198, 163, 149, 121, 96, 55, 99, 112, 47, 22, 13, 21, 23, 34, 2, n] },
      { name: "Ines Chaabane", initials: "IC", color: "#7C3AED", projects: 5,
        clients: ["OEM Beta"], health: "orange", phases: ["Validation"],
        values: [112, 97, 112, 126, 113, 103, 91, 80, 45, 75, 80, 35, 18, 11, 17, 17, 26, 2, n] },
    ],
  },
  {
    service: "Industrialisation", pilots: 4,
    values: [211, 178, 156, 181, 165, 132, 121, 64, 67, 52, 37, 24, n, n, n, n, n, n, n],
    members: [
      { name: "Karim Belhadj", initials: "KB", color: "#2E7D32", projects: 7,
        clients: ["OEM Alpha", "OEM Gamma"], health: "red", phases: ["Process Design"],
        values: [244, 201, 172, 205, 186, 148, 139, 71, 76, 58, 41, 27, n, n, n, n, n, n, n] },
      { name: "Youssef Jaziri", initials: "YJ", color: "#3976D3", projects: 6,
        clients: ["OEM Alpha"], health: "orange", phases: ["Process Design", "Validation"],
        values: [178, 155, 140, 157, 144, 116, 103, 57, 58, 46, 33, 21, n, n, n, n, n, n, n] },
    ],
  },
  {
    service: "Production", pilots: 3,
    values: [47, 55, 86, 46, 23, 79, 11, 32, 103, 13, 19, n, 25, 28, 12, n, n, n, n],
    members: [
      { name: "Meriem Khelifi", initials: "MK", color: "#475467", projects: 7,
        clients: ["OEM Alpha", "OEM Beta"], health: "orange", phases: ["Validation"],
        values: [77, n, n, 42, 37, n, 12, 96, 169, 15, n, n, 76, n, n, n, n, n, n] },
      { name: "Slim Toumi", initials: "ST", color: "#E58A00", projects: 8,
        clients: ["OEM Beta", "OEM Gamma"], health: "red",
        phases: ["Process Design", "Validation"],
        values: [20, 147, 53, 97, 17, 109, 22, n, 140, 23, 57, n, n, n, n, n, n, n, n] },
      { name: "Dorra Ben Amor", initials: "DA", color: "#2E7D32", projects: 6,
        clients: ["OEM Gamma"], health: "green", phases: ["Product Design"],
        values: [43, 19, 206, n, 13, 127, n, n, n, n, n, n, n, n, 85, 36, n, n, n] },
    ],
  },
  {
    service: "Achats", pilots: 3,
    values: [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
    members: [],
  },
  {
    service: "Logistique", pilots: 2,
    values: [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
    members: [],
  },
];

/**
 * Référentiels des filtres de la page charge. Le `dot` est la pastille de
 * couleur affichée devant l'option dans le menu déroulant.
 */
export const LOAD_CLIENTS = ["OEM Alpha", "OEM Beta", "OEM Gamma"];
export const LOAD_PHASES = ["Product Design", "Process Design", "Validation"];
export const LOAD_HEALTH: { value: Health; label: string; dot: string }[] = [
  { value: "green", label: "Vert", dot: "#2E7D32" },
  { value: "orange", label: "Ambre", dot: "#E58A00" },
  { value: "red", label: "Rouge", dot: "#D92D20" },
];
/**
 * Niveaux de charge — mêmes seuils que la heatmap. Le critère porte sur les
 * mois traversés, pas sur le seul pic : aucun pilote ne culmine entre 96 et
 * 110 %, mais plusieurs y passent, et c'est cette tension-là qu'on cherche.
 */
export const LOAD_LEVELS: { value: string; label: string; short: string; dot: string }[] = [
  { value: "over", label: "Un mois au-delà de 110 %", short: "Surcharge", dot: "#D92D20" },
  { value: "tension", label: "Un mois de 96 à 110 %", short: "Tension", dot: "#E58A00" },
  { value: "ok", label: "Jamais au-delà de 95 %", short: "Sous capacité", dot: "#2E7D32" },
];

export const LOAD_KPIS = [
  { value: "24", label: "Projets au planning", note: "55 705 h de charge", icon: "layers" },
  { value: "9", label: "Projets à risque", note: "santé Rouge", icon: "alert", chip: "Arbitrage requis", tone: "red" as const },
  { value: "21", label: "Pilotes en surcharge", note: "75 mois-pilotes au-dessus de la capacité", icon: "users", chip: "Conflit", tone: "red" as const },
  { value: "211 %", label: "Service le plus contraint", note: "Industrialisation", icon: "gauge", chip: "Surcharge", tone: "red" as const },
  { value: "12", label: "Actions en retard", note: "sur le périmètre filtré", icon: "clock", chip: "Critique", tone: "red" as const },
];

/* ------------------------------ Conflit charge ---------------------------- */

export const RESOURCE_CONFLICT = {
  resource: "Noura Trabelsi",
  fn: "Qualité",
  initials: "NT",
  capacity: "140 h",
  load: "176 h",
  rate: "126 %",
  period: "S03 à S05 — Janvier 2027",
  tasks: [
    { name: "T09 — Réaliser PFMEA process", load: "80 h", priority: "Élevée", dates: "S03–S04 11–24/01/2027", pct: 57, color: "#D92D20" },
    { name: "T10 — Élaborer plan de contrôle pré-lancement", load: "64 h", priority: "Moyenne", dates: "S04–S05 25/01–07/02/2027", pct: 46, color: "#E58A00" },
    { name: "Revue intermédiaire PFMEA", load: "32 h", priority: "Moyenne", dates: "S05 01–07/02/2027", pct: 23, color: "#98A2B3" },
  ],
  total: "176 h (126 %)",
  note: "La charge dépasse la capacité de 36 h sur la période S03 à S05.",
  solutions: [
    { id: "decaler", label: "Décaler T10 de 3 jours", impact: "Impact : soulage la charge sur S04–S05.", recommended: true, icon: "calendar" },
    { id: "ajouter", label: "Affecter une ressource supplémentaire", impact: "Impact : réduit la surcharge de 36 h.", icon: "user" },
    { id: "reduire", label: "Réduire la charge de T09", impact: "Impact : diminue la charge de 16 h.", icon: "down" },
    { id: "auto", label: "Répartition automatique", impact: "Impact : optimise automatiquement la répartition des tâches.", icon: "refresh" },
  ],
  outcome: [
    { label: "Impact sur G3", value: "+0 j", tone: "ink" as const },
    { label: "Charge / capacité après action", value: "98 %", tone: "green" as const },
    { label: "Criticité résiduelle", value: "Faible", tone: "green" as const },
  ],
};

/* ---------------------------- Simulation replanif ------------------------- */

export const SIMULATION = {
  scenario: "Décaler T10 de 3 jours",
  before: [
    { gate: "G2 Design Freeze", date: "30/04/2027" },
    { gate: "G3 Process Freeze", date: "05/02/2027" },
    { gate: "G4 PPAP Approval", date: "09/04/2027" },
  ],
  after: [
    { gate: "G2 Design Freeze", date: "30/04/2027" },
    { gate: "G3 Process Freeze", date: "05/02/2027" },
    { gate: "G4 PPAP Approval", date: "09/04/2027" },
  ],
  beforeLoad: { label: "Charge / capacité Qualité", value: "112 %", criticality: "Élevée" },
  afterLoad: { label: "Charge / capacité Qualité", value: "98 %", delta: "-14 %", criticality: "Faible" },
  summary: [
    { label: "Gain de charge", value: "-14 %", icon: "trend", tone: "green" as const },
    { label: "Heures réaffectées", value: "36 h", icon: "clock", tone: "blue" as const },
    { label: "Dérive planning", value: "0 jour", icon: "calendar", tone: "ink" as const },
    { label: "Risque résiduel", value: "Faible", icon: "shield", tone: "green" as const },
  ],
  analysis: [
    "La surcharge sur Noura Trabelsi est résorbée.",
    "Aucun impact sur la date G3.",
    "Le scénario améliore le rapport charge/capacité de la fonction Qualité.",
  ],
  ticks: ["08/01", "11/01", "14/01", "17/01", "20/01", "23/01", "26/01", "29/01"],
};

/* ------------------------------ Notifications ----------------------------- */

export interface Notification {
  id: string;
  title: string;
  detail: string;
  category: "Projet" | "Capacité" | "Validation" | "Exécution" | "Planning";
  received: string;
  action: string;
  unread: boolean;
  tone: "red" | "amber" | "green" | "blue" | "slate";
  icon: "alert" | "users" | "shield" | "flag" | "file" | "clock";
}

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "PFMEA process en retard", detail: "Action critique en retard de 3 jours.", category: "Projet", received: "Il y a 10 min", action: "Voir le détail", unread: true, tone: "red", icon: "alert" },
  { id: "n2", title: "Surcharge Qualité détectée", detail: "Charge prévue à 112 % sur les 4 prochaines semaines.", category: "Capacité", received: "Il y a 18 min", action: "Ouvrir", unread: true, tone: "amber", icon: "users" },
  { id: "n3", title: "Preuve validée", detail: "Plan_securisation_process_v2.pdf a été validé.", category: "Validation", received: "Il y a 27 min", action: "Ouvrir", unread: false, tone: "green", icon: "shield" },
  { id: "n4", title: "Gate G3 — Process Freeze", detail: "Dérive confirmée : +14 jours.", category: "Projet", received: "Il y a 1 h", action: "Voir le détail", unread: true, tone: "red", icon: "flag" },
  { id: "n5", title: "Nouvelle contribution mise à jour", detail: "Clore action étanchéité process — avancement passé à 60 %.", category: "Exécution", received: "Il y a 2 h", action: "Ouvrir", unread: false, tone: "slate", icon: "file" },
  { id: "n6", title: "Simulation de replanification prête", detail: "Le scénario 'Décaler T10 de 3 jours' peut être appliqué.", category: "Planning", received: "Il y a 3 h", action: "Consulter", unread: false, tone: "amber", icon: "clock" },
];

export const NOTIFICATION_SUMMARY = [
  { label: "Dernière validation", detail: "Preuve validée par Responsable Qualité", value: "10:14", tone: "green" as const, icon: "shield" },
  { label: "Dernière alerte capacité", detail: "Surcharge Qualité détectée", value: "112 %", tone: "amber" as const, icon: "users" },
  { label: "Prochaine gate", detail: "G3 Process Freeze", value: "G3", tone: "red" as const, icon: "flag" },
  { label: "Dernier événement projet", detail: "Contribution mise à jour", value: "60 %", tone: "blue" as const, icon: "file" },
];
