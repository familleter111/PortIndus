/* -------------------------------------------------------------------------- */
/*  Mock data for the CIPA | APQP demo.                                        */
/*  Source: data_file.xlsx (projets, planning, actions, KPI) complété par les   */
/*  valeurs affichées dans les maquettes de référence.                         */
/*  Front-end uniquement : aucune API, aucune base de données.                 */
/* -------------------------------------------------------------------------- */

export const STATUS_DATE = "15/12/2026";

/* ------------------------------- Portefeuille ----------------------------- */

export type Health = "green" | "orange" | "red";

/* ------------------------- Référentiel des fonctions ---------------------- */

/**
 * Vocabulaire unique des fonctions. Cinq listes coexistaient — « Méthodes »
 * ici, « Process » là, « Engineering » ailleurs — et une même personne pouvait
 * relever de deux fonctions selon l'écran. Tout part désormais d'ici : capacité
 * portefeuille, charge par service, équipe projet et annuaire.
 */
export const FUNCTIONS = [
  "Direction projet",
  "R&D Produit",
  "Méthodes / Process",
  "Qualité",
  "Industrialisation",
  "Production",
  "Achats",
  "Logistique",
] as const;

export type FunctionName = (typeof FUNCTIONS)[number];

/** Couleur d'une fonction — la même dans les avatars, les barres et les puces. */
export const FUNCTION_COLOR: Record<FunctionName, string> = {
  "Direction projet": "#0E7C52",
  "R&D Produit": "#E58A00",
  "Méthodes / Process": "#3976D3",
  Qualité: "#D92D20",
  Industrialisation: "#2E7D32",
  Production: "#2C9C9C",
  Achats: "#7C3AED",
  Logistique: "#0891B2",
};

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
/** 19468 → « 19 468 h » (espace fine insécable, convention française). */
const formatHours = (n: number) => `${n.toLocaleString("fr-FR").replace(/ | /g, " ")} h`;

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
  { fn: "Méthodes / Process", load: 1950, capacity: 2000, ratio: 98, color: "#E58A00" },
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
  { fn: "Méthodes / Process", load: 0.214, capacity: 0.202 },
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

/**
 * Répartition de la charge du projet entre les fonctions. La somme des charges
 * vaut `PROJECT.workload` : le total affiché ne peut pas contredire la fiche
 * projet ni la ligne du portefeuille.
 */
export const APQP_GATES = [
  { id: "G0", label: "Plan & Définir le programme" },
  { id: "G1", label: "Planification produit" },
  { id: "G2", label: "Conception & Développement produit" },
  { id: "G3", label: "Process Freeze" },
  { id: "G4", label: "Validation produit & process" },
  { id: "G5", label: "Feedback, évaluation & amélioration" },
];

/* ------------------- Arborescence Gate → Livrable → Tâche ----------------- */

/**
 * Le référentiel se lit de haut en bas :
 *
 *   Programme ─▶ Gate / Jalon ─▶ Livrable / Lot de travail ─▶ Tâche ─▶ Sous-tâche
 *
 * Chaque tâche contribue à un livrable, chaque livrable sécurise une gate.
 * C'est ce chaînage qui permet de dire, depuis une action élémentaire, quelle
 * décision de passage elle sécurise — et inversement, ce qui bloque une gate.
 */
export type Criticality = "Critique" | "Élevée" | "Moyenne";

/** Statut saisi. « En retard » n'en fait pas partie : il se déduit de la date. */
export type DeliverableStatus = "Approuvé" | "En revue" | "En cours" | "Planifié";
export type DeliverableDisplayStatus = DeliverableStatus | "En retard";

export interface GateDeliverable {
  id: string;
  name: string;
  /** Gate sécurisée par ce livrable (id dans APQP_GATES). */
  gate: string;
  /** Fonction porteuse — sert à proposer un responsable cohérent. */
  fn: string;
  owner: string;
  criticality: Criticality;
  status: DeliverableStatus;
  progress: number;
  /** Date cible, jj/mm/aaaa. */
  dueDate: string;
}

export const GATE_DELIVERABLES: GateDeliverable[] = [
  /* --- G0 — Plan & Définir le programme ---------------------------------- */
  { id: "LIV-G0-1", name: "Cahier des charges client (VOC)", gate: "G0", fn: "Direction projet", owner: "Leïla Mansour", criticality: "Critique", status: "Approuvé", progress: 100, dueDate: "30/01/2026" },
  { id: "LIV-G0-2", name: "Revue de faisabilité & chiffrage", gate: "G0", fn: "Industrialisation", owner: "Karim Belhadj", criticality: "Élevée", status: "Approuvé", progress: 100, dueDate: "13/02/2026" },

  /* --- G1 — Planification produit ---------------------------------------- */
  { id: "LIV-G1-1", name: "Plan qualité projet (PQP)", gate: "G1", fn: "Qualité", owner: "Noura Trabelsi", criticality: "Critique", status: "Approuvé", progress: 100, dueDate: "10/04/2026" },
  { id: "LIV-G1-2", name: "Objectifs qualité, fiabilité & coûts", gate: "G1", fn: "Direction projet", owner: "Leïla Mansour", criticality: "Moyenne", status: "Approuvé", progress: 100, dueDate: "24/04/2026" },
  { id: "LIV-G1-3", name: "Diagramme de flux process préliminaire", gate: "G1", fn: "Méthodes / Process", owner: "Youssef Jaziri", criticality: "Élevée", status: "Approuvé", progress: 100, dueDate: "15/05/2026" },

  /* --- G2 — Conception & Développement produit ---------------------------- */
  { id: "LIV-G2-1", name: "DFMEA produit", gate: "G2", fn: "R&D Produit", owner: "Rim Bouazizi", criticality: "Critique", status: "Approuvé", progress: 100, dueDate: "04/09/2026" },
  { id: "LIV-G2-2", name: "Dossier de définition & plans cotés", gate: "G2", fn: "R&D Produit", owner: "Rim Bouazizi", criticality: "Moyenne", status: "Approuvé", progress: 100, dueDate: "25/09/2026" },
  { id: "LIV-G2-3", name: "Revue de conception (Design Review)", gate: "G2", fn: "R&D Produit", owner: "Rim Bouazizi", criticality: "Élevée", status: "Approuvé", progress: 100, dueDate: "18/09/2026" },
  // Échéance dépassée et non approuvé : s'affichera « En retard ».
  { id: "LIV-G2-4", name: "Plan de validation produit (DVP&R)", gate: "G2", fn: "R&D Produit", owner: "Rim Bouazizi", criticality: "Critique", status: "En revue", progress: 85, dueDate: "09/10/2026" },

  /* --- G3 — Process Freeze (gate en préparation) -------------------------- */
  { id: "LIV-G3-1", name: "PFMEA process", gate: "G3", fn: "Méthodes / Process", owner: "Youssef Jaziri", criticality: "Critique", status: "En cours", progress: 62, dueDate: "15/01/2027" },
  { id: "LIV-G3-2", name: "Process Flow Diagram", gate: "G3", fn: "Méthodes / Process", owner: "Youssef Jaziri", criticality: "Élevée", status: "Approuvé", progress: 100, dueDate: "27/11/2026" },
  { id: "LIV-G3-3", name: "Plan de contrôle série", gate: "G3", fn: "Qualité", owner: "Rachid Ben Amar", criticality: "Critique", status: "En revue", progress: 48, dueDate: "22/01/2027" },
  { id: "LIV-G3-4", name: "Plan de maîtrise des moyens (MSA / R&R)", gate: "G3", fn: "Qualité", owner: "Noura Trabelsi", criticality: "Élevée", status: "En cours", progress: 40, dueDate: "29/01/2027" },
  { id: "LIV-G3-5", name: "Instructions de travail poste", gate: "G3", fn: "Production", owner: "Yassine Gharbi", criticality: "Moyenne", status: "En cours", progress: 20, dueDate: "05/02/2027" },
  { id: "LIV-G3-6", name: "Moyens industriels & capacité ligne", gate: "G3", fn: "Industrialisation", owner: "Karim Belhadj", criticality: "Critique", status: "En cours", progress: 35, dueDate: "12/02/2027" },
  { id: "LIV-G3-7", name: "Qualification fournisseurs rang 1", gate: "G3", fn: "Achats", owner: "Hassan Kacem", criticality: "Élevée", status: "En cours", progress: 60, dueDate: "05/02/2027" },

  /* --- G4 — Validation produit & process ---------------------------------- */
  { id: "LIV-G4-1", name: "Rapport d'essais de validation", gate: "G4", fn: "R&D Produit", owner: "Rim Bouazizi", criticality: "Critique", status: "En cours", progress: 55, dueDate: "30/04/2027" },
  { id: "LIV-G4-2", name: "Étude capabilité Cp / Cpk", gate: "G4", fn: "Qualité", owner: "Leila Mokrani", criticality: "Élevée", status: "Planifié", progress: 0, dueDate: "21/05/2027" },
  { id: "LIV-G4-3", name: "Run @ Rate — capabilité série", gate: "G4", fn: "Industrialisation", owner: "Karim Belhadj", criticality: "Critique", status: "Planifié", progress: 0, dueDate: "28/05/2027" },
  { id: "LIV-G4-4", name: "Dossier PPAP niveau 3", gate: "G4", fn: "Qualité", owner: "Rachid Ben Amar", criticality: "Critique", status: "Planifié", progress: 0, dueDate: "11/06/2027" },

  /* --- G5 — Feedback, évaluation & amélioration --------------------------- */
  { id: "LIV-G5-1", name: "Rapport 8D & retours d'expérience", gate: "G5", fn: "Qualité", owner: "Sofiane Haddad", criticality: "Élevée", status: "En cours", progress: 30, dueDate: "12/03/2027" },
  { id: "LIV-G5-2", name: "Bilan de capitalisation projet", gate: "G5", fn: "Direction projet", owner: "Leïla Mansour", criticality: "Moyenne", status: "Planifié", progress: 0, dueDate: "24/09/2027" },
];

export function deliverableById(id: string): GateDeliverable | undefined {
  return GATE_DELIVERABLES.find((d) => d.id === id);
}

/** Libellé de la gate d'un livrable, pour l'afficher en contexte. */
export function gateLabel(gateId: string): string {
  const g = APQP_GATES.find((x) => x.id === gateId);
  return g ? `${g.id} — ${g.label}` : gateId;
}

export function deliverablesForGate(gateId: string): GateDeliverable[] {
  return GATE_DELIVERABLES.filter((d) => d.gate === gateId);
}

/**
 * Un livrable non approuvé dont l'échéance est passée est en retard. Le déduire
 * évite qu'un statut saisi contredise la date affichée juste à côté.
 */
export function deliverableStatus(d: GateDeliverable): DeliverableDisplayStatus {
  return d.status !== "Approuvé" && dateKey(d.dueDate) < dateKey(STATUS_DATE)
    ? "En retard"
    : d.status;
}

/** Livrables mis en avant sur le tableau de bord d'un projet : ceux de sa gate. */
export const DELIVERABLES = deliverablesForGate("G3").slice(0, 4);

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

/**
 * Trois niveaux d'engagement, tous rattachés à un livrable — lui-même rattaché
 * à une gate :
 *
 *   Jalon      le livrable dans son ensemble, tel qu'il sera validé en revue
 *              de gate. Pas de parent : il se rattache directement au livrable.
 *   Tâche      un lot du livrable — un livrable complet ou une partie —
 *              confié à une personne avec une échéance.
 *   Sous-tâche une action élémentaire à l'intérieur d'une tâche.
 *
 * Le niveau détermine ce qu'on peut choisir comme parent : c'est `parentLevel`
 * qui l'énonce une fois pour toutes, plutôt que chaque écran à sa façon.
 */
export type ContribLevel = "Jalon" | "Tâche" | "Sous-tâche";

export const CONTRIB_LEVELS: ContribLevel[] = ["Jalon", "Tâche", "Sous-tâche"];

/** Une couleur par niveau, partagée par tous les écrans qui l'affichent. */
export const LEVEL_COLOR: Record<ContribLevel, string> = {
  Jalon: "#8B5E9F",
  Tâche: "#3976D3",
  "Sous-tâche": "#0E7C52",
};

/** Niveau attendu du parent. `null` pour un jalon, qui n'en a pas. */
export function parentLevel(level: ContribLevel): ContribLevel | null {
  if (level === "Sous-tâche") return "Tâche";
  if (level === "Tâche") return "Jalon";
  return null;
}
export type StepStatus = "À faire" | "En cours" | "Terminée";
export type EvidenceStatus = "En attente de validation" | "Validée" | "Refusée";

export interface ContribStep {
  n: number;
  label: string;
  status: StepStatus;
}

/**
 * Étapes proposées à la création d'une contribution. Ce ne sont que des
 * valeurs de départ : la modale laisse les renommer, les réordonner, les
 * supprimer ou en ajouter.
 */
export const DEFAULT_CONTRIB_STEPS = [
  "Vérifier les causes critiques",
  "Mettre à jour la cotation de risque",
  "Charger la preuve de revue",
  "Soumettre la mise à jour",
];

/** Au-delà, la liste devient illisible dans la modale. */
export const MAX_CONTRIB_STEPS = 8;

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
  /** Niveau d'engagement — voir `ContribLevel`. */
  level: ContribLevel;
  /** Livrable rattaché (id dans GATE_DELIVERABLES) : porte aussi la gate. */
  deliverableId: string;
  /** Contribution de niveau supérieur. `null` pour un jalon. */
  parentId: string | null;
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
    level: "Sous-tâche",
    deliverableId: "LIV-G3-1",
    parentId: "CTR-0009",
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
    level: "Sous-tâche",
    deliverableId: "LIV-G3-3",
    parentId: "CTR-0004",
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
    level: "Jalon",
    deliverableId: "LIV-G3-1",
    parentId: null,
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
    level: "Tâche",
    deliverableId: "LIV-G3-3",
    parentId: null,
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
    level: "Jalon",
    deliverableId: "LIV-G3-7",
    parentId: null,
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
    level: "Tâche",
    deliverableId: "LIV-G5-1",
    parentId: null,
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
    level: "Tâche",
    deliverableId: "LIV-G4-1",
    parentId: null,
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
    level: "Jalon",
    deliverableId: "LIV-G3-5",
    parentId: null,
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
  {
    // Maillon intermédiaire de la chaîne PFMEA :
    // CTR-0003 (jalon) ─▶ CTR-0009 (tâche) ─▶ CTR-0001 (sous-tâche).
    id: "CTR-0009",
    title: "Recoter les criticités S / O / D",
    level: "Tâche",
    deliverableId: "LIV-G3-1",
    parentId: "CTR-0003",
    owner: "Youssef Jaziri",
    ownerInitials: "YJ",
    priority: "Haute",
    status: "En cours",
    progress: 55,
    dueDate: "08/01/2027",
    lastUpdate: "14/12/2026 16:05",
    expected: "Cotations révisées sur les 12 causes à RPN > 100",
    comment: "Revue multifonctionnelle tenue le 12/12, reste 4 causes à arbitrer.",
    contributors: [
      { name: "Youssef Jaziri", initials: "YJ" },
      { name: "Noura Trabelsi", initials: "NT" },
    ],
    steps: stepsFor(55),
    evidence: [
      {
        id: "e8",
        file: "Cotation_SOD_revue_v3.xlsx",
        size: "0.6 Mo",
        type: "Analyse",
        addedAt: "14/12/2026 16:05",
        addedBy: "Youssef Jaziri",
        status: "En attente de validation",
      },
    ],
    history: [
      {
        id: "u8",
        kind: "progress",
        author: "Youssef Jaziri",
        initials: "YJ",
        at: "14/12/2026 16:05",
        lines: ["Progression portée à 55 %", "Preuve ajoutée : Cotation_SOD_revue_v3.xlsx"],
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

/* ------------------- Rattachement d'une contribution ---------------------- */

/** Le livrable auquel la contribution se rattache. */
export function contribDeliverable(c: Contribution): GateDeliverable | undefined {
  return deliverableById(c.deliverableId);
}

/**
 * Chemin lisible d'une contribution : gate ▸ livrable ▸ parent éventuel.
 * Se recalcule à partir du rattachement, pour qu'aucun écran n'affiche une
 * gate qui ne serait plus celle du livrable choisi.
 */
export function contribPath(c: Contribution, all: Contribution[] = CONTRIBUTIONS): string[] {
  const d = contribDeliverable(c);
  if (!d) return [];
  const path = [d.gate, d.name];
  const parent = c.parentId ? all.find((x) => x.id === c.parentId) : undefined;
  if (parent) path.push(parent.title);
  return path;
}

/**
 * Parents possibles : les contributions du niveau immédiatement supérieur,
 * sur le même livrable. Un jalon n'a pas de parent ; une tâche peut se
 * rattacher directement au livrable si aucun jalon n'y a encore été ouvert.
 */
export function parentOptions(
  level: ContribLevel,
  deliverableId: string,
  all: Contribution[] = CONTRIBUTIONS,
): Contribution[] {
  const above = parentLevel(level);
  if (!above) return [];
  return all.filter((c) => c.level === above && c.deliverableId === deliverableId);
}

/** Nombre de contributions ouvertes sur un livrable, tous niveaux confondus. */
export function contribCountFor(
  deliverableId: string,
  all: Contribution[] = CONTRIBUTIONS,
): number {
  return all.filter((c) => c.deliverableId === deliverableId).length;
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
 * Répartition par statut. Elle annonçait 31 contributions quand le tableau
 * voisin en listait 9, et ne bougeait pas quand on en validait une. Elle se
 * compte désormais sur les contributions réellement affichées, ce qui la fait
 * suivre les actions de l'utilisateur.
 */
export function contribSplit(all: Contribution[] = CONTRIBUTIONS) {
  return (
    [
      { label: "Créées", status: "Créée", color: "#98A2B3" },
      { label: "En cours", status: "En cours", color: "#3976D3" },
      { label: "À valider", status: "À valider", color: "#E58A00" },
      { label: "Validées", status: "Validée", color: "#2E7D32" },
      { label: "En retard", status: "En retard", color: "#D92D20" },
    ] as const
  ).map((s) => ({
    label: s.label,
    color: s.color,
    value: all.filter((c) => displayStatus(c) === s.status).length,
  }));
}

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
  /** Heures affectées au projet sur sa durée — la charge, pas un taux. */
  hours: number;
  site: string;
  color: string;
}

/** Heures d'un équivalent temps plein sur la durée du projet (12 mois). */
export const HOURS_PER_ETP = 1610;

/** Équipe pluridisciplinaire permanente, présente à toutes les gates. */

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
 * Annuaire des contacts externes et internes mobilisables sur les gates. Il
 * sert à choisir un contact plutôt qu'à retaper son nom, son organisation et
 * son rôle — trois champs qui, saisis à la main, finissaient par diverger d'un
 * projet à l'autre pour une même personne.
 */
export const EXTERNAL_CONTACTS: Omit<ExtendedMember, "gates">[] = [
  { name: "Thomas Berger", initials: "TB", org: "OEM Alpha", orgType: "Client", role: "SQE client" },
  { name: "Claire Fontaine", initials: "CF", org: "OEM Alpha", orgType: "Client", role: "Acheteur programme" },
  { name: "Dieter Vogel", initials: "DV", org: "OEM Beta", orgType: "Client", role: "Ingénieur qualité fournisseur" },
  { name: "Elena Ricci", initials: "ER", org: "OEM Gamma", orgType: "Client", role: "Chef de projet achats" },
  { name: "Marco Rossi", initials: "MR", org: "Fonderie Lombardia", orgType: "Fournisseur", role: "Fourniture brut aluminium" },
  { name: "Anke Weber", initials: "AW", org: "Werkzeug GmbH", orgType: "Fournisseur", role: "Outillage d'injection" },
  { name: "Pierre Lambert", initials: "PL", org: "Traitements Sud", orgType: "Fournisseur", role: "Traitement de surface" },
  { name: "Nadia Cherif", initials: "NC", org: "Plasturgie Kairouan", orgType: "Fournisseur", role: "Pièces plastiques techniques" },
  { name: "Hédi Chaabane", initials: "HC", org: "Usine Sousse", orgType: "Interne", role: "Responsable production" },
  { name: "Sami Toumi", initials: "ST", org: "Laboratoire métrologie", orgType: "Interne", role: "Moyens de mesure" },
  { name: "Olfa Bouzid", initials: "OB", org: "Usine Tunis", orgType: "Interne", role: "Responsable maintenance" },
  { name: "Walid Nasri", initials: "WN", org: "Direction HSE", orgType: "Interne", role: "Sécurité & environnement" },
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
  { fn: "R&D Produit", capacity: 2000, load: 1700, ratio: 85, color: "#3976D3" },
  { fn: "Méthodes / Process", capacity: 2200, load: 2020, ratio: 92, color: "#E58A00" },
  { fn: "Production", capacity: 1800, load: 1620, ratio: 90, color: "#2E7D32" },
  { fn: "Achats", capacity: 1200, load: 1020, ratio: 85, color: "#8B5E9F" },
  { fn: "Logistique", capacity: 800, load: 580, ratio: 73, color: "#2C9C9C" },
];



/* --------------------------- Charge par personne -------------------------- */

export interface PersonLoad {
  name: string;
  initials: string;
  fn: string;
  site: string;
  color: string;
  /** Taux d'affectation contractuel, en %. */
  rate: number;
  /** Projets du portefeuille sur lesquels la personne intervient. */
  projects: string[];
  /** Heures affectées sur l'horizon. */
  load: number;
  /**
   * Heures encore disponibles. Négative quand la personne est engagée au-delà
   * de sa capacité : c'est le déficit à replacer, et c'est ce qui fait passer
   * le ratio au-dessus de 100 %.
   */
  available: number;
}

/**
 * Charge nominative sur l'horizon des douze prochains mois. Les personnes sont
 * celles qui portent réellement des tâches ailleurs dans l'application — core
 * team, responsables du WBS, responsables de contributions — pour qu'un nom
 * ouvert ici se retrouve dans le planning et le suivi d'exécution.
 */
export const PEOPLE_LOAD: PersonLoad[] = [
  { name: "Noura Trabelsi", initials: "NT", fn: "Qualité", site: "Sousse", color: "#D92D20", rate: 100, projects: ["P-DEMO-001", "P-DEMO-003", "P-DEMO-006"], load: 1620, available: -60 },
  { name: "Youssef Jaziri", initials: "YJ", fn: "Méthodes / Process", site: "Sousse", color: "#3976D3", rate: 100, projects: ["P-DEMO-001", "P-DEMO-007"], load: 1580, available: 160 },
  { name: "Rachid Ben Amar", initials: "RB", fn: "Qualité", site: "Sousse", color: "#B42318", rate: 100, projects: ["P-DEMO-001", "P-DEMO-005"], load: 1740, available: -140 },
  { name: "Karim Belhadj", initials: "KB", fn: "Industrialisation", site: "Sousse", color: "#2E7D32", rate: 80, projects: ["P-DEMO-001", "P-DEMO-005"], load: 1180, available: 212 },
  { name: "Leïla Mansour", initials: "LM", fn: "Direction projet", site: "Sousse", color: "#0E7C52", rate: 100, projects: ["P-DEMO-001", "P-DEMO-004", "P-DEMO-009"], load: 1490, available: 250 },
  { name: "Sofiane Haddad", initials: "SH", fn: "Qualité", site: "Tunis", color: "#7C3AED", rate: 80, projects: ["P-DEMO-003", "P-DEMO-009"], load: 1310, available: 82 },
  { name: "Hassan Kacem", initials: "HK", fn: "Achats", site: "Tunis", color: "#8B5E9F", rate: 80, projects: ["P-DEMO-008"], load: 960, available: 432 },
  { name: "Leila Mokrani", initials: "LM", fn: "Qualité", site: "Sousse", color: "#0891B2", rate: 60, projects: ["P-DEMO-002", "P-DEMO-010"], load: 810, available: 234 },
  { name: "Yassine Gharbi", initials: "YG", fn: "Production", site: "Sousse", color: "#2C9C9C", rate: 100, projects: ["P-DEMO-002", "P-DEMO-006"], load: 1395, available: 345 },
  { name: "Sonia Gharbi", initials: "SG", fn: "Achats", site: "Tunis", color: "#E58A00", rate: 60, projects: ["P-DEMO-004", "P-DEMO-010"], load: 690, available: 354 },
  { name: "Mehdi Aloui", initials: "MA", fn: "Logistique", site: "Sousse", color: "#16A46B", rate: 60, projects: ["P-DEMO-002"], load: 640, available: 404 },
  { name: "Rim Bouazizi", initials: "RB", fn: "R&D Produit", site: "Tunis", color: "#D97706", rate: 80, projects: ["P-DEMO-004", "P-DEMO-007"], load: 1240, available: 152 },
  /*
   * Ces six-là pilotent un service dans la vue charge mais ne figuraient dans
   * aucun annuaire : impossible de les choisir dans une équipe, et leur
   * fonction n'était déduite que du service qui les portait. Leur charge suit
   * leur profil mensuel — un pilote qui dépasse la capacité a un solde négatif.
   */
  { name: "Hatem Ben Ali", initials: "HB", fn: "Direction projet", site: "Sousse", color: "#3976D3", rate: 100, projects: ["P-DEMO-002"], load: 1180, available: 430 },
  { name: "Anis Gharbi", initials: "AG", fn: "R&D Produit", site: "Tunis", color: "#0891B2", rate: 100, projects: ["P-DEMO-002"], load: 1520, available: 90 },
  { name: "Ines Chaabane", initials: "IC", fn: "Qualité", site: "Tunis", color: "#7C3AED", rate: 100, projects: ["P-DEMO-002", "P-DEMO-008"], load: 1560, available: 50 },
  { name: "Meriem Khelifi", initials: "MK", fn: "Production", site: "Sousse", color: "#475467", rate: 100, projects: ["P-DEMO-001", "P-DEMO-002"], load: 1690, available: -80 },
  { name: "Slim Toumi", initials: "ST", fn: "Production", site: "Sousse", color: "#E58A00", rate: 100, projects: ["P-DEMO-002", "P-DEMO-003"], load: 1745, available: -135 },
  { name: "Dorra Ben Amor", initials: "DA", fn: "Production", site: "Bizerte", color: "#2E7D32", rate: 80, projects: ["P-DEMO-003"], load: 1210, available: 178 },
];

/** L'annuaire fait foi pour la fonction, le site et la couleur d'une personne. */
export function personByName(name: string): PersonLoad | undefined {
  return PEOPLE_LOAD.find((p) => p.name === name);
}

/**
 * Équipe projet. La fonction, le site, les initiales et la couleur ne sont pas
 * recopiés ici : ils viennent de l'annuaire. Recopiés, ils divergeaient — une
 * même personne apparaissait avec deux couleurs et parfois deux fonctions.
 * Seuls le rôle APQP et les heures sont propres au projet.
 */
export const CORE_TEAM: TeamMember[] = (
  [
    { name: "Leïla Mansour", role: "Pilotage APQP", hours: 960 },
    { name: "Noura Trabelsi", role: "PFMEA & plan de contrôle", hours: 720 },
    { name: "Youssef Jaziri", role: "Flux process & outillage", hours: 800 },
    { name: "Karim Belhadj", role: "Essais & capabilité", hours: 560 },
    { name: "Sonia Gharbi", role: "Panel fournisseurs", hours: 320 },
    { name: "Mehdi Aloui", role: "Emballage & flux", hours: 240 },
    { name: "Rim Bouazizi", role: "Interface design", hours: 400 },
  ] as const
).map(({ name, role, hours }) => {
  const p = personByName(name);
  if (!p) throw new Error(`Membre absent de l'annuaire : ${name}`);
  return { name, role, hours, initials: p.initials, fn: p.fn, site: p.site, color: p.color };
});

/**
 * Le ratio charge/capacité se calcule : capacité = charge + disponible. Écrire
 * un ratio à la main permettrait qu'il contredise les deux colonnes voisines.
 */
export function personRatio(p: PersonLoad): number {
  return Math.round((p.load / (p.load + p.available)) * 100);
}

export function personCapacity(p: PersonLoad): number {
  return p.load + p.available;
}

/** Seuils partagés par le tableau et les indicateurs. */
export function loadLevel(ratio: number): "surcharge" | "limite" | "sain" {
  if (ratio > 100) return "surcharge";
  if (ratio >= 90) return "limite";
  return "sain";
}



/**
 * Planning généré, en phases repliables. `start` et `span` sont exprimés en
 * mois depuis le kickoff, sur une grille de douze : le Gantt se dessine à
 * partir de ces valeurs, aucune barre n'est positionnée à la main.
 */
export interface GenTask {
  id: string;
  label: string;
  owner: string;
  fn: string;
  start: number;
  span: number;
  load: number;
  /** Une tâche du chemin critique porte la date de gate. */
  critical?: boolean;
}

export interface GenPhase {
  gate: string;
  label: string;
  /** Date du jalon de fin de phase. */
  date: string;
  color: string;
  tasks: GenTask[];
}

export const GENERATED_PHASES: GenPhase[] = [
  {
    gate: "G0", label: "Kickoff & cadrage", date: "01/10/2026", color: "#3976D3",
    tasks: [
      { id: "T01", label: "Constituer l'équipe projet", owner: "Leïla Mansour", fn: "Direction projet", start: 0, span: 0.5, load: 40 },
      { id: "T02", label: "Analyser le cahier des charges client", owner: "Rim Bouazizi", fn: "R&D Produit", start: 0.3, span: 1, load: 120 },
      { id: "T03", label: "Établir le plan qualité projet", owner: "Noura Trabelsi", fn: "Qualité", start: 0.8, span: 1.2, load: 160 },
    ],
  },
  {
    gate: "G1", label: "Planification produit", date: "15/01/2027", color: "#3976D3",
    tasks: [
      { id: "T04", label: "Définir les caractéristiques spéciales", owner: "Rim Bouazizi", fn: "R&D Produit", start: 1.5, span: 1.5, load: 180 },
      { id: "T05", label: "Réaliser DFMEA produit", owner: "Noura Trabelsi", fn: "Qualité", start: 2, span: 2, load: 280, critical: true },
      { id: "T06", label: "Consulter le panel fournisseurs", owner: "Sonia Gharbi", fn: "Achats", start: 2.5, span: 2, load: 200 },
    ],
  },
  {
    gate: "G2", label: "Conception & développement", date: "30/04/2027", color: "#E58A00",
    tasks: [
      { id: "T07", label: "Figer la définition produit", owner: "Rim Bouazizi", fn: "R&D Produit", start: 4, span: 2, load: 320, critical: true },
      { id: "T08", label: "Établir le diagramme de flux process", owner: "Youssef Jaziri", fn: "Méthodes / Process", start: 4.5, span: 1.5, load: 190 },
      { id: "T09", label: "Réaliser PFMEA process", owner: "Noura Trabelsi", fn: "Qualité", start: 5, span: 2, load: 340, critical: true },
      { id: "T10", label: "Lancer la conception outillage", owner: "Karim Belhadj", fn: "Industrialisation", start: 5.5, span: 2, load: 260 },
    ],
  },
  {
    gate: "G3", label: "Process Freeze", date: "30/06/2027", color: "#D92D20",
    tasks: [
      { id: "T11", label: "Suivre la fabrication outillage", owner: "Karim Belhadj", fn: "Industrialisation", start: 7, span: 2, load: 300, critical: true },
      { id: "T12", label: "Élaborer le plan de contrôle", owner: "Noura Trabelsi", fn: "Qualité", start: 7.5, span: 1.5, load: 220 },
      { id: "T13", label: "Réaliser les essais à froid", owner: "Karim Belhadj", fn: "Industrialisation", start: 8, span: 1, load: 140 },
      { id: "T14", label: "Valider les moyens de mesure", owner: "Youssef Jaziri", fn: "Méthodes / Process", start: 8.2, span: 1, load: 130 },
    ],
  },
  {
    gate: "G4", label: "Validation produit & process", date: "15/08/2027", color: "#2E7D32",
    tasks: [
      { id: "T15", label: "Préparer la production trial", owner: "Youssef Jaziri", fn: "Méthodes / Process", start: 9, span: 1.2, load: 210, critical: true },
      { id: "T16", label: "Réaliser MSA et capabilité", owner: "Noura Trabelsi", fn: "Qualité", start: 9.5, span: 1.3, load: 240 },
      { id: "T17", label: "Constituer le dossier PPAP", owner: "Noura Trabelsi", fn: "Qualité", start: 10, span: 1, load: 180, critical: true },
    ],
  },
  {
    gate: "G5", label: "SOP & retour d'expérience", date: "30/09/2027", color: "#2E7D32",
    tasks: [
      { id: "T18", label: "Valider l'emballage et les flux", owner: "Mehdi Aloui", fn: "Logistique", start: 10.5, span: 1, load: 120 },
      { id: "T19", label: "Transférer en production série", owner: "Leïla Mansour", fn: "Direction projet", start: 11, span: 1, load: 160, critical: true },
    ],
  },
];

/** Toutes les tâches à plat — pour le tableau et les totaux. */
export const GENERATED_TASKS: (GenTask & { gate: string })[] = GENERATED_PHASES.flatMap((p) =>
  p.tasks.map((t) => ({ ...t, gate: p.gate })),
);

/** Mini-Gantt de prévisualisation : offset/durée en douzièmes de la période. */


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

const RAW_SERVICE_LOAD: { service: string; members: LoadPilot[] }[] = [
  {
    service: "Direction projet",
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
    service: "R&D Produit",
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
    service: "Qualité",
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
    // Youssef Jaziri est passé sous sa vraie fonction : il était compté ici
    // alors que l'annuaire et l'équipe projet le donnent en Méthodes / Process.
    service: "Méthodes / Process",
    members: [
      { name: "Youssef Jaziri", initials: "YJ", color: "#3976D3", projects: 6,
        clients: ["OEM Alpha"], health: "orange", phases: ["Process Design", "Validation"],
        values: [178, 155, 140, 157, 144, 116, 103, 57, 58, 46, 33, 21, n, n, n, n, n, n, n] },
    ],
  },
  {
    service: "Industrialisation",
    members: [
      { name: "Karim Belhadj", initials: "KB", color: "#2E7D32", projects: 7,
        clients: ["OEM Alpha", "OEM Gamma"], health: "red", phases: ["Process Design"],
        values: [244, 201, 172, 205, 186, 148, 139, 71, 76, 58, 41, 27, n, n, n, n, n, n, n] },
    ],
  },
  {
    service: "Production",
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
    service: "Achats",
    members: [],
  },
  {
    service: "Logistique",
    members: [],
  },
];

/**
 * La ligne d'un service est l'agrégat de ses pilotes, calculée et non saisie.
 * Elle l'était : six services sur sept tombaient juste, Production divergeait
 * sur quatorze mois — le total contredisait le détail qu'on obtenait en le
 * dépliant. Le nombre de pilotes suit la même règle : il ne peut plus annoncer
 * sept personnes et n'en montrer que deux.
 */
export const SERVICE_LOAD: LoadService[] = RAW_SERVICE_LOAD.map((s) => ({
  service: s.service,
  pilots: s.members.length,
  members: s.members,
  values: LOAD_MONTHS.map((_, i) => {
    const vals = s.members
      .map((m) => m.values[i])
      .filter((v): v is number => v !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }),
}));

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

/* --- Indicateurs de la charge, tous dérivés des mêmes tableaux ------------ */

const LOAD_PILOTS = SERVICE_LOAD.flatMap((s) => s.members);
/** Un pilote est en surcharge dès qu'un mois dépasse la capacité. */
const PILOTS_OVER = LOAD_PILOTS.filter((m) =>
  m.values.some((v) => v !== null && v > 110),
).length;
/** Nombre de couples pilote × mois au-dessus de la capacité. */
const MONTHS_OVER = LOAD_PILOTS.reduce(
  (n, m) => n + m.values.filter((v) => v !== null && v > 110).length,
  0,
);
const PEAK_SERVICE = SERVICE_LOAD.reduce(
  (best, s) => {
    const peak = Math.max(...s.values.filter((v): v is number => v !== null), 0);
    return peak > best.peak ? { peak, service: s.service } : best;
  },
  { peak: 0, service: "—" },
);

/**
 * Ces cinq tuiles annonçaient 24 projets, 9 rouges et 55 705 h alors que le
 * portefeuille en compte 10, dont 2 rouges, pour 19 468 h. Elles se calculent
 * maintenant, comme celles du portefeuille : un chiffre ne peut plus dire
 * autre chose d'une page à l'autre.
 */
export const LOAD_KPIS = [
  {
    value: String(PROJECTS.length),
    label: "Projets au planning",
    note: `${formatHours(PORTFOLIO_TOTALS.workload)} de charge`,
    icon: "layers",
  },
  {
    value: String(PORTFOLIO_TOTALS.red),
    label: "Projets à risque",
    note: "santé Rouge",
    icon: "alert",
    chip: "Arbitrage requis",
    tone: "red" as const,
  },
  {
    value: String(PILOTS_OVER),
    label: "Pilotes en surcharge",
    note: `${MONTHS_OVER} mois-pilotes au-dessus de la capacité`,
    icon: "users",
    chip: "Conflit",
    tone: "red" as const,
  },
  {
    value: `${PEAK_SERVICE.peak} %`,
    label: "Service le plus contraint",
    note: PEAK_SERVICE.service,
    icon: "gauge",
    chip: "Surcharge",
    tone: "red" as const,
  },
  {
    value: String(PORTFOLIO_TOTALS.overdue),
    label: "Actions en retard",
    note: "sur l'ensemble du portefeuille",
    icon: "clock",
    chip: "Critique",
    tone: "red" as const,
  },
];

/* ------------------------------ Conflit charge ---------------------------- */

/* --------------------- Visualisation des risques & conflits ---------------- */

/** Semaines couvertes par la vue conflits — l'horizon des deux gates à venir. */
export const CONFLICT_WEEKS = [
  "S 51", "S 52", "S 01", "S 02", "S 03", "S 04", "S 05", "S 06", "S 07", "S 08",
];

export interface ConflictLane {
  person: string;
  initials: string;
  fn: string;
  color: string;
  /** Capacité hebdomadaire de la personne, en heures. */
  weekly: number;
  /** Charge par semaine, alignée sur CONFLICT_WEEKS. */
  load: number[];
  /** Tâches à l'origine de la charge, avec la semaine de début et la durée. */
  tasks: { id: string; label: string; project: string; from: number; span: number }[];
}

/**
 * Charge hebdomadaire nominative sur l'horizon. C'est la matière première de la
 * vue conflits : un dépassement se lit là où `load[i] > weekly`, et les tâches
 * qui se chevauchent sur cette semaine en sont la cause.
 */
export const CONFLICT_LANES: ConflictLane[] = [
  {
    person: "Noura Trabelsi",
    initials: "NT",
    fn: "Qualité",
    color: "#D92D20",
    weekly: 35,
    load: [28, 30, 32, 38, 46, 44, 39, 30, 26, 24],
    tasks: [
      { id: "T09", label: "Réaliser PFMEA process", project: "P-DEMO-001", from: 2, span: 4 },
      { id: "T10", label: "Plan de contrôle pré-lancement", project: "P-DEMO-001", from: 4, span: 3 },
      { id: "T22", label: "Revue AMDEC procédé", project: "P-DEMO-003", from: 3, span: 3 },
    ],
  },
  {
    person: "Youssef Jaziri",
    initials: "YJ",
    fn: "Méthodes / Process",
    color: "#3976D3",
    weekly: 35,
    load: [30, 33, 36, 40, 42, 34, 31, 28, 27, 25],
    tasks: [
      { id: "T11", label: "Suivre fabrication outillage", project: "P-DEMO-001", from: 0, span: 5 },
      { id: "T31", label: "Usinage moule injection", project: "P-DEMO-007", from: 2, span: 4 },
    ],
  },
  {
    person: "Rachid Ben Amar",
    initials: "RB",
    fn: "Qualité",
    color: "#B42318",
    weekly: 35,
    load: [34, 38, 41, 43, 40, 37, 36, 33, 30, 29],
    tasks: [
      { id: "C06", label: "Corriger défaut porosité carter", project: "P-DEMO-001", from: 0, span: 6 },
      { id: "C02", label: "Valider capacité machine MOP", project: "P-DEMO-005", from: 1, span: 5 },
    ],
  },
  {
    person: "Karim Belhadj",
    initials: "KB",
    fn: "Industrialisation",
    color: "#2E7D32",
    weekly: 28,
    load: [18, 20, 22, 24, 26, 27, 25, 22, 20, 18],
    tasks: [
      { id: "T13", label: "Essais à froid outillage", project: "P-DEMO-001", from: 3, span: 4 },
    ],
  },
];

/**
 * Conflits d'outillage ou de moyen : deux tâches réclamant le même équipement
 * sur des périodes qui se recouvrent. Ce n'est pas une surcharge de personne,
 * et le traitement diffère — d'où une liste distincte.
 */
export const EQUIPMENT_CONFLICTS = [
  {
    id: "presse",
    resource: "Presse 800 t — ligne 04",
    weeks: "S 03 → S 05",
    a: { task: "Essais à froid outillage", project: "P-DEMO-001" },
    b: { task: "Requalification série", project: "P-DEMO-005" },
    overlap: "12 jours",
    level: "Critique" as const,
  },
  {
    id: "mmt",
    resource: "MMT — laboratoire métrologie",
    weeks: "S 04 → S 06",
    a: { task: "Réaliser MSA et capabilité", project: "P-DEMO-001" },
    b: { task: "Étude capabilité initiale", project: "P-DEMO-003" },
    overlap: "6 jours",
    level: "Majeur" as const,
  },
];

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
