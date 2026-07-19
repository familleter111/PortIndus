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
}

export const PROJECTS: Project[] = [
  {
    id: "P-DEMO-001",
    name: "Carter aluminium e-Drive",
    client: "OEM Alpha",
    manager: "Leïla Mansour",
    managerInitials: "LM",
    phase: "Process Design",
    sop: "05/07/2027",
    workload: 2248,
    planned: 48,
    actual: 42,
    spi: 0.875,
    overdueActions: 1,
    readiness: 58,
    qualityLoad: 112,
    health: "orange",
    nextGate: "G3 Process Freeze",
  },
  {
    id: "P-DEMO-002",
    name: "Armature siège avant",
    client: "OEM Beta",
    manager: "Hatem Ben Ali",
    managerInitials: "HB",
    phase: "Validation",
    sop: "31/03/2027",
    workload: 1680,
    planned: 66,
    actual: 69,
    spi: 1.045,
    overdueActions: 0,
    readiness: 82,
    qualityLoad: 94,
    health: "green",
    nextGate: "G4 PPAP Approval",
  },
  {
    id: "P-DEMO-003",
    name: "Support batterie EV",
    client: "OEM Gamma",
    manager: "Sarra Khelifi",
    managerInitials: "SK",
    phase: "Product Design",
    sop: "30/09/2027",
    workload: 2860,
    planned: 35,
    actual: 26,
    spi: 0.743,
    overdueActions: 5,
    readiness: 31,
    qualityLoad: 121,
    health: "red",
    nextGate: "G2 Design Freeze",
  },
];

export const PORTFOLIO_KPIS = [
  { label: "Avancement portefeuille réel", value: "41,9 %", tone: "ink" as const, icon: "trend" },
  { label: "Avancement portefeuille planifié", value: "47,0 %", tone: "ink" as const, icon: "target" },
  { label: "SPI portefeuille", value: "0,893", tone: "ink" as const, icon: "gauge" },
  { label: "Projets rouges", value: "1", tone: "red" as const, icon: "flag" },
  { label: "Actions en retard", value: "6", tone: "red" as const, icon: "clock" },
  { label: "Readiness moyenne", value: "57 %", tone: "amber" as const, icon: "shield" },
  { label: "Charge Qualité maximale", value: "121 %", tone: "red" as const, icon: "users" },
  { label: "Décision prioritaire", value: "Renforcer Qualité", tone: "bronze" as const, icon: "star" },
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

export const HEALTH_SPLIT = [
  { name: "Vert", value: 1, pct: 33, color: "#2E7D32" },
  { name: "Orange", value: 1, pct: 33, color: "#E58A00" },
  { name: "Rouge", value: 1, pct: 33, color: "#D92D20" },
];

/* ---------------------------- Projet P-DEMO-001 --------------------------- */

export const PROJECT = PROJECTS[0];

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
  { label: "Charge Qualité", value: "112 %", note: "vs capacité", tone: "red" as const, icon: "users" },
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

export const PROJECT_ALERTS = [
  {
    title: "Dérive sur G3 — Process Freeze",
    detail: "Forecast 19/02/2027 soit +14 jours vs baseline.",
    level: "Critique",
  },
  {
    title: "Charge Qualité supérieure à la capacité",
    detail: "Charge actuelle 112 % vs capacité disponible.",
    level: "Majeure",
  },
  {
    title: "1 action en retard",
    detail: "Action critique dépassée.",
    level: "Majeure",
  },
];

export const PROJECT_DECISIONS = [
  "Valider le plan de rattrapage PFMEA avant le 18/12/2026.",
  "Arbitrer la surcharge de la fonction Qualité sur les quatre prochaines semaines.",
  "Confirmer la date forecast du Process Freeze et son impact PPAP.",
];

export const CRITICAL_ALERTS = [
  "PFMEA : plan de rattrapage requis avant le 18/12/2026.",
  "Surcharge Qualité persistante (112 %).",
  "Impact potentiel sur la date PPAP si dérive > +15 jours.",
];

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

export const CONTRIBUTION = {
  title: "Clore action étanchéité process",
  reference: "PFMEA process",
  owner: "Noura Trabelsi",
  priority: "Critique",
  progress: 60,
  state: "En retard",
  dueDate: "09/12/2026",
  comment: "Attente de validation finale du plan de sécurisation process",
  expected: "Risque process réduit et action PFMEA clôturée",
  evidence: {
    file: "Plan_securisation_process_v2.pdf",
    size: "1.8 Mo",
    type: "Plan d'action",
    addedAt: "15/12/2026 09:42",
    addedBy: "Noura Trabelsi",
    status: "En attente de validation",
  },
  contributors: [
    { name: "Noura Trabelsi", initials: "NT" },
    { name: "Hichem Ben Amar", initials: "HB" },
  ],
  steps: [
    { n: 1, label: "Vérifier les causes critiques", status: "En cours" },
    { n: 2, label: "Mettre à jour la cotation de risque", status: "Terminé" },
    { n: 3, label: "Charger la preuve de revue", status: "En cours" },
    { n: 4, label: "Soumettre la mise à jour", status: "À faire" },
  ],
};

export const MY_CONTRIBUTIONS = [
  { label: "À traiter", value: 5, tone: "ink" as const, icon: "clipboard" },
  { label: "En retard", value: 3, tone: "red" as const, icon: "clock" },
  { label: "Critiques", value: 2, tone: "red" as const, icon: "alert" },
  { label: "Avec preuve manquante", value: 4, tone: "amber" as const, icon: "file" },
];

export const UPDATE_HISTORY = [
  {
    author: "Noura Trabelsi",
    initials: "NT",
    date: "15/12/2026",
    time: "09:42",
    lines: [
      "Taux d'achèvement mis à jour : 40 % → 60 %",
      "Preuve associée ajoutée : Plan_securisation_process_v2.pdf",
    ],
  },
  {
    author: "Noura Trabelsi",
    initials: "NT",
    date: "12/12/2026",
    time: "16:35",
    lines: ["Commentaire d'exécution mis à jour", "Étape 2 marquée comme terminée"],
  },
  {
    author: "Hichem Ben Amar",
    initials: "HB",
    date: "10/12/2026",
    time: "11:18",
    lines: ["Étape 1 marquée comme en cours", "Priorité mise à jour : Majeure → Critique"],
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
  description:
    "Lancement d'un nouveau module de refroidissement destiné aux véhicules électriques. Le projet couvre la conception, le développement et l'industrialisation d'un module de refroidissement intégrant une plaque froide, des canaux de fluide et des interfaces mécaniques. L'objectif est d'assurer des performances thermiques élevées, une intégration compacte et une fiabilité conforme aux exigences OEM.",
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
  { name: "Leïla Mansour", initials: "LM", fn: "Direction projet", role: "Pilotage APQP", allocation: 60, site: "Sousse", color: "#B45F09" },
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

/* ------------------------------ Analyse preuve ---------------------------- */

export const EVIDENCE_REVIEW = {
  confidence: "87 %",
  recommendation: "Conforme sous réserve",
  gap: "commentaire de revue qualité manquant",
  consistency: "Bonne",
  comment:
    "Le document est globalement conforme. Ajouter une note de revue qualité pour finaliser la validation.",
  criteria: [
    { label: "Le document correspond à la contribution", verdict: "Conforme", ok: true },
    { label: "Le contenu est lisible et complet", verdict: "Conforme", ok: true },
    { label: "La preuve couvre bien l'action déclarée", verdict: "Partiellement conforme", ok: false },
    { label: "La version est cohérente avec l'avancement", verdict: "Conforme", ok: true },
  ],
  preview: [
    { action: "Vérifier les causes critiques", owner: "Qualité Process", due: "15/12/2026", status: "Terminé" },
    { action: "Mettre à jour la cartographie des risques", owner: "Qualité Process", due: "20/12/2026", status: "En cours" },
    { action: "Changer la gamme de mesure", owner: "Méthodes", due: "28/12/2026", status: "En cours" },
    { action: "Soumettre la mise à jour", owner: "Qualité", due: "05/01/2027", status: "À faire" },
  ],
};

/* ------------------------------- Confirmation ----------------------------- */

export const VALIDATION = {
  contribution: "Clore action étanchéité process",
  reference: "PFMEA process",
  validatedBy: "Responsable Qualité",
  date: "15/12/2026 — 10:14",
  file: "Plan_securisation_process_v2.pdf",
  progressBefore: "41 %",
  progressAfter: "43 %",
  progressDelta: "+2 pts",
  readinessBefore: "58 %",
  readinessAfter: "62 %",
  readinessDelta: "+4 pts",
  effects: [
    "La preuve est désormais conforme",
    "La contribution peut être clôturée après revue finale",
    "Le dashboard projet est mis à jour",
    "Le suivi d'exécution conserve la traçabilité",
  ],
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
