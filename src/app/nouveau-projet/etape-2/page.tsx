"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  Gauge,
  Globe2,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle } from "@/components/shared/page-parts";
import { WizardSteps } from "@/components/shared/wizard-steps";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  Field,
  Input,
  Modal,
  Panel,
  Select,
  type ChipTone,
} from "@/components/ui/primitives";
import {
  APQP_ROLES,
  CORE_TEAM,
  EXTENDED_TEAM,
  EXTERNAL_CONTACTS,
  FUNCTION_COLOR,
  HOURS_PER_ETP,
  PEOPLE_LOAD,
  personAvailable,
  type ExtendedMember,
  type TeamMember,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

const ORG_TONE: Record<string, ChipTone> = {
  Client: "blue",
  Fournisseur: "amber",
  Interne: "slate",
};

export default function Etape2Page() {
  const router = useRouter();

  // Les deux équipes sont modifiables : l'ajout se fait par modale.
  const [core, setCore] = React.useState<TeamMember[]>(CORE_TEAM);
  const [extended, setExtended] = React.useState<ExtendedMember[]>(EXTENDED_TEAM);
  const [modal, setModal] = React.useState<"core" | "extended" | null>(null);

  // Les indicateurs se déduisent des listes : aucune valeur saisie en dur.
  const totalHours = core.reduce((s, m) => s + m.hours, 0);
  const totalEtp = totalHours / HOURS_PER_ETP;
  const orgs = new Set(extended.map((m) => m.org)).size;
  const covered = APQP_ROLES.filter((r) => r.holder).length;
  const missing = APQP_ROLES.filter((r) => !r.holder);

  return (
    <AppShell notifications={8}>
      <div className="flex h-full flex-col gap-2.5">
        <PageTitle
          title="Créer un nouveau projet — Étape 2/4"
          subtitle="Constituer l'équipe projet permanente et l'équipe étendue"
        />

        <WizardSteps current={2} />

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          {/* ------------------------------------------------- Core team */}
          <Panel
            title="Équipe projet — core team"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            action={
              <Button className="px-2 py-1 text-[11px]" onClick={() => setModal("core")}>
                <UserPlus className="h-3.5 w-3.5" />
                Ajouter un membre
              </Button>
            }
            className="col-span-7"
            bodyClassName="px-0"
          >
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3.5 py-1.5 font-medium">Membre</th>
                  <th className="px-2 py-1.5 font-medium">Fonction</th>
                  <th className="px-2 py-1.5 font-medium">Rôle APQP</th>
                  <th className="px-2 py-1.5 font-medium">Allocation</th>
                  <th className="px-3.5 py-1.5 font-medium">Site</th>
                </tr>
              </thead>
              <tbody>
                {core.map((m) => (
                  <tr key={m.name} className="border-b border-border/60 last:border-0">
                    <td className="px-3.5 py-[7px]">
                      <span className="flex items-center gap-2">
                        <span
                          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.initials}
                        </span>
                        <span className="truncate font-medium text-foreground">{m.name}</span>
                      </span>
                    </td>
                    <td className="px-2 py-[7px] text-muted-foreground">{m.fn}</td>
                    <td className="px-2 py-[7px] text-muted-foreground">{m.role}</td>
                    <td className="px-2 py-[7px]">
                      <span className="flex items-center gap-1.5">
                        <ProgressBar
                          value={(m.hours / HOURS_PER_ETP) * 100}
                          color={m.color}
                          className="w-14"
                        />
                        <span
                          className="w-14 shrink-0 text-right font-semibold tabular-nums text-foreground"
                          title={`${(m.hours / HOURS_PER_ETP).toFixed(2).replace(".", ",")} ETP`}
                        >
                          {formatNumber(m.hours)} h
                        </span>
                      </span>
                    </td>
                    <td className="px-3.5 py-[7px] text-muted-foreground">{m.site}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {/* -------------------------------------------- Extended team */}
          <div className="col-span-5 flex min-h-0 flex-col gap-3">
            <Panel
              title="Extended team"
              icon={<Globe2 className="h-4 w-4 text-muted-foreground" />}
              action={
                <Button className="px-2 py-1 text-[11px]" onClick={() => setModal("extended")}>
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              }
              className="min-h-0 flex-1"
              bodyClassName="px-0"
            >
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3.5 py-1.5 font-medium">Contact</th>
                    <th className="px-2 py-1.5 font-medium">Organisation</th>
                    <th className="px-2 py-1.5 font-medium">Rôle</th>
                    <th className="px-3.5 py-1.5 font-medium">Gates</th>
                  </tr>
                </thead>
                <tbody>
                  {extended.map((m) => (
                    <tr key={m.name} className="border-b border-border/60 last:border-0">
                      <td className="px-3.5 py-[7px]">
                        <span className="flex items-center gap-1.5">
                          <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[9px] font-bold text-[#475467]">
                            {m.initials}
                          </span>
                          <span className="truncate font-medium text-foreground">{m.name}</span>
                        </span>
                      </td>
                      <td className="px-2 py-[7px]">
                        <span className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate text-muted-foreground">{m.org}</span>
                          <Chip
                            tone={ORG_TONE[m.orgType]}
                            className="mt-0.5 w-fit px-1.5 py-0 text-[9px]"
                          >
                            {m.orgType}
                          </Chip>
                        </span>
                      </td>
                      <td className="px-2 py-[7px] text-muted-foreground">{m.role}</td>
                      <td className="whitespace-nowrap px-3.5 py-[7px] tabular-nums text-muted-foreground">
                        {m.gates}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel
              title="Couverture des rôles APQP"
              icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              className="shrink-0"
            >
              <div className="flex flex-wrap gap-1.5">
                {APQP_ROLES.map((r) => (
                  <span
                    key={r.role}
                    title={r.holder ?? "Aucun titulaire désigné"}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      r.holder
                        ? "border-[#BBF0CB] bg-[#ECFDF3] text-[#2E7D32]"
                        : "border-[#FECDCA] bg-[#FEF3F2] text-[#D92D20]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        r.holder ? "bg-[#2E7D32]" : "bg-[#D92D20]"
                      }`}
                    />
                    {r.role}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* ------------------------------------------------- Indicateurs */}
        <div className="grid shrink-0 grid-cols-4 gap-2.5">
          {[
            {
              icon: <Users className="h-4 w-4 text-[#0E7C52]" />,
              k: "Membres core team",
              v: String(core.length),
            },
            {
              icon: <Gauge className="h-4 w-4 text-[#0E7C52]" />,
              k: "ETP cumulé",
              v: totalEtp.toFixed(2).replace(".", ","),
            },
            {
              icon: <Building2 className="h-4 w-4 text-[#0E7C52]" />,
              k: "Organisations impliquées",
              v: String(orgs),
            },
            {
              icon: <ShieldCheck className="h-4 w-4 text-[#0E7C52]" />,
              k: "Rôles APQP couverts",
              v: `${covered} / ${APQP_ROLES.length}`,
            },
          ].map((i) => (
            <Card key={i.k} className="flex items-center gap-2.5 px-3.5 py-2">
              {i.icon}
              <div className="min-w-0 leading-tight">
                <p className="text-[11px] text-muted-foreground">{i.k}</p>
                <p className="text-[15px] font-bold tabular-nums text-foreground">{i.v}</p>
              </div>
            </Card>
          ))}
        </div>

        {missing.length > 0 ? (
          <Card className="flex shrink-0 items-center gap-2 border-[#F8DEB0] bg-[#FEF6E7] px-3.5 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#E58A00]" />
            <p className="text-[12px] text-foreground">
              <span className="font-semibold">Rôle non pourvu :</span>{" "}
              {missing.map((r) => r.role).join(", ")}. Le projet peut être créé, mais la gate G0 ne
              pourra pas être validée tant qu&apos;un titulaire n&apos;est pas désigné.
            </p>
          </Card>
        ) : null}

        <div className="flex shrink-0 items-center gap-2.5">
          <Button onClick={() => router.push("/nouveau-projet/etape-1")}>
            <ChevronLeft className="h-4 w-4" />
            Étape précédente
          </Button>
          <Button
            variant="ghost"
            className="ml-auto border-border"
            onClick={() => router.push("/portefeuille")}
          >
            Annuler
          </Button>
          <Button variant="primary" onClick={() => router.push("/nouveau-projet/etape-3")}>
            Continuer vers Planning &amp; ressources
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>

      <AddCoreMemberModal
        open={modal === "core"}
        taken={core.map((m) => m.name)}
        onClose={() => setModal(null)}
        onAdd={(m) => {
          setCore((prev) => [...prev, m]);
          setModal(null);
        }}
      />
      <AddExtendedMemberModal
        open={modal === "extended"}
        taken={extended.map((m) => m.name)}
        onClose={() => setModal(null)}
        onAdd={(m) => {
          setExtended((prev) => [...prev, m]);
          setModal(null);
        }}
      />
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ajout de membres                                                           */
/* -------------------------------------------------------------------------- */

/** Heures proposées par défaut à l'ajout — un quart de temps plein. */
const DEFAULT_HOURS = 400;

/* -------------------------------------------------------------------------- */
/*  Choix d'une personne dans l'annuaire                                       */
/* -------------------------------------------------------------------------- */

interface PickOption {
  name: string;
  initials: string;
  color: string;
  /** Fonction ou organisation, selon l'annuaire d'où vient la personne. */
  detail: string;
  /** Complément de droite : disponibilité, type d'organisation… */
  hint?: string;
  hintTone?: "green" | "amber" | "red" | "muted";
  /** Déjà dans l'équipe : visible mais non sélectionnable. */
  taken?: boolean;
}

const HINT_COLOR: Record<string, string> = {
  green: "#0E7C52",
  amber: "#B45F09",
  red: "#B42318",
  muted: "#667085",
};

/**
 * Sélection d'une personne par recherche. Les noms étaient saisis à la main :
 * une faute de frappe créait un homonyme, et la fonction, le site ou
 * l'organisation devaient être ressaisis alors qu'ils sont connus.
 */
function PersonPicker({
  options,
  value,
  onChange,
  placeholder,
  emptyLabel,
}: {
  options: PickOption[];
  value: string | null;
  onChange: (name: string | null) => void;
  placeholder: string;
  emptyLabel: string;
}) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const shown = options.filter(
    (o) => !q || o.name.toLowerCase().includes(q) || o.detail.toLowerCase().includes(q),
  );

  return (
    <div className="rounded-lg border border-input bg-white">
      <div className="relative border-b border-border">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-8 w-full rounded-t-lg bg-transparent pl-8 pr-7 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#0E7C52]"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <ul className="max-h-[168px] overflow-y-auto scrollbar-thin">
        {shown.map((o) => {
          const on = o.name === value;
          return (
            <li key={o.name}>
              <button
                type="button"
                role="option"
                aria-selected={on}
                disabled={o.taken}
                title={o.taken ? "Déjà dans l'équipe" : undefined}
                onClick={() => onChange(on ? null : o.name)}
                className={`flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors ${
                  o.taken
                    ? "cursor-not-allowed opacity-45"
                    : on
                      ? "bg-[#E8FBF1]"
                      : "hover:bg-muted"
                }`}
              >
                <span
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: o.color }}
                >
                  {o.initials}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span
                    className={`block truncate text-[12px] ${on ? "font-semibold text-[#0E7C52]" : "font-medium text-foreground"}`}
                  >
                    {o.name}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {o.detail}
                  </span>
                </span>
                {o.taken ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground">déjà membre</span>
                ) : o.hint ? (
                  <span
                    className="shrink-0 text-[10px] font-medium tabular-nums"
                    style={{ color: HINT_COLOR[o.hintTone ?? "muted"] }}
                  >
                    {o.hint}
                  </span>
                ) : null}
                {on ? <Check className="h-3.5 w-3.5 shrink-0 text-[#0E7C52]" /> : null}
              </button>
            </li>
          );
        })}

        {shown.length === 0 ? (
          <li className="px-3 py-4 text-center text-[11px] text-muted-foreground">{emptyLabel}</li>
        ) : null}
      </ul>
    </div>
  );
}

function AddCoreMemberModal({
  open,
  taken,
  onClose,
  onAdd,
}: {
  open: boolean;
  /** Noms déjà dans la core team — proposés mais non sélectionnables. */
  taken: string[];
  onClose: () => void;
  onAdd: (m: TeamMember) => void;
}) {
  const [name, setName] = React.useState<string | null>(null);
  const [role, setRole] = React.useState("");
  const [hours, setHours] = React.useState(DEFAULT_HOURS);

  React.useEffect(() => {
    if (!open) return;
    setName(null);
    setRole("");
    setHours(DEFAULT_HOURS);
  }, [open]);

  const person = name ? PEOPLE_LOAD.find((p) => p.name === name) : undefined;

  /*
   * L'annuaire porte la disponibilité de chacun : dépasser ce solde n'est pas
   * interdit — on peut décider de replanifier — mais doit se voir au moment du
   * choix, pas à l'étape suivante.
   */
  const over = person ? hours - personAvailable(person) : 0;

  const options: PickOption[] = PEOPLE_LOAD.map((p) => ({
    name: p.name,
    initials: p.initials,
    color: p.color,
    detail: `${p.fn} · ${p.site}`,
    hint: `${formatNumber(personAvailable(p))} h dispo.`,
    hintTone:
      personAvailable(p) < 0 ? "red" : personAvailable(p) < 200 ? "amber" : "green",
    taken: taken.includes(p.name),
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-lg"
      title="Ajouter un membre à la core team"
      subtitle="Membre permanent, présent à toutes les gates du projet."
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8FBF1]">
          <UserPlus className="h-5 w-5 text-[#0E7C52]" />
        </span>
      }
    >
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-[12px] font-medium text-muted-foreground">
            Membre<span className="ml-0.5 text-[#D92D20]">*</span>
            <span className="ml-1 text-[10px]">
              — sa fonction, son site et sa couleur viennent de l&apos;annuaire
            </span>
          </p>
          <PersonPicker
            options={options}
            value={name}
            onChange={setName}
            placeholder="Rechercher une personne par nom ou fonction…"
            emptyLabel="Aucune personne ne correspond à cette recherche."
          />
        </div>

        {person ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-[11px]">
            <span className="text-muted-foreground">Fonction</span>
            <span className="font-semibold text-foreground">{person.fn}</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Site</span>
            <span className="font-semibold text-foreground">{person.site}</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Projets en cours</span>
            <span className="font-semibold tabular-nums text-foreground">
              {person.projects.length}
            </span>
          </div>
        ) : null}

        <Field label="Rôle APQP">
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex. Plan de surveillance"
          />
        </Field>

        <div>
          <div className="flex items-baseline gap-2">
            <p className="flex-1 text-[12px] font-medium text-muted-foreground">
              Charge affectée au projet
            </p>
            <span className="text-[14px] font-bold tabular-nums text-[#0E7C52]">
              {formatNumber(hours)} h
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              ≈ {(hours / HOURS_PER_ETP).toFixed(2).replace(".", ",")} ETP
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={HOURS_PER_ETP}
            step={10}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            aria-label="Charge affectée au projet, en heures"
            className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[#16A46B]"
            style={{
              background: `linear-gradient(to right, #16A46B ${(hours / HOURS_PER_ETP) * 100}%, #EFF1F4 ${(hours / HOURS_PER_ETP) * 100}%)`,
            }}
          />
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
            <span>0 h</span>
            <span>{formatNumber(HOURS_PER_ETP)} h — 1 ETP</span>
          </div>
          {person && over > 0 ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#B45F09]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {formatNumber(over)} h au-delà de la disponibilité de {person.name} —
              il faudra replanifier ou réduire.
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            disabled={!person}
            title={!person ? "Choisissez une personne dans la liste" : undefined}
            onClick={() =>
              person &&
              onAdd({
                name: person.name,
                initials: person.initials,
                fn: person.fn,
                role: role.trim() || "À définir",
                hours,
                site: person.site,
                color: person.color,
              })
            }
          >
            <UserPlus className="h-4 w-4" />
            Ajouter le membre
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Couleur d'avatar par type d'organisation, cohérente avec les puces. */
const ORG_COLOR: Record<ExtendedMember["orgType"], string> = {
  Client: "#3976D3",
  Fournisseur: "#E58A00",
  Interne: "#667085",
};
const GATE_IDS = ["G0", "G1", "G2", "G3", "G4", "G5"];

function AddExtendedMemberModal({
  open,
  taken,
  onClose,
  onAdd,
}: {
  open: boolean;
  /** Contacts déjà convoqués — proposés mais non sélectionnables. */
  taken: string[];
  onClose: () => void;
  onAdd: (m: ExtendedMember) => void;
}) {
  const [name, setName] = React.useState<string | null>(null);
  const [role, setRole] = React.useState("");
  const [gates, setGates] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setName(null);
    setRole("");
    setGates([]);
  }, [open]);

  const contact = name ? EXTERNAL_CONTACTS.find((c) => c.name === name) : undefined;

  // Le rôle proposé est celui de l'annuaire ; il reste ajustable pour ce projet.
  React.useEffect(() => {
    if (contact) setRole(contact.role);
  }, [contact]);

  const options: PickOption[] = EXTERNAL_CONTACTS.map((c) => ({
    name: c.name,
    initials: c.initials,
    color: ORG_COLOR[c.orgType],
    detail: `${c.org} · ${c.role}`,
    hint: c.orgType,
    hintTone: "muted",
    taken: taken.includes(c.name),
  }));

  const toggleGate = (g: string) =>
    setGates((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  // Un contact n'a de sens que rattaché à au moins une gate : c'est ce qui
  // détermine quand on le convoque.
  const missing = !contact || gates.length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-lg"
      title="Ajouter un contact à l'équipe étendue"
      subtitle="Contributeur sollicité sur certaines gates seulement."
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF]">
          <Globe2 className="h-5 w-5 text-[#3976D3]" />
        </span>
      }
    >
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-[12px] font-medium text-muted-foreground">
            Contact<span className="ml-0.5 text-[#D92D20]">*</span>
            <span className="ml-1 text-[10px]">
              — son organisation et son type viennent de l&apos;annuaire
            </span>
          </p>
          <PersonPicker
            options={options}
            value={name}
            onChange={setName}
            placeholder="Rechercher un contact par nom ou organisation…"
            emptyLabel="Aucun contact ne correspond à cette recherche."
          />
        </div>

        {contact ? (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-[11px]">
            <span className="text-muted-foreground">Organisation</span>
            <span className="font-semibold text-foreground">{contact.org}</span>
            <Chip tone={ORG_TONE[contact.orgType]} className="px-1.5 py-0 text-[9px]">
              {contact.orgType}
            </Chip>
          </div>
        ) : null}

        <Field label="Rôle sur ce projet">
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex. Fourniture brut aluminium"
          />
        </Field>

        <div>
          <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">
            Gates de convocation<span className="ml-0.5 text-[#D92D20]">*</span>
          </p>
          <div className="flex gap-1.5">
            {GATE_IDS.map((g) => {
              const on = gates.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleGate(g)}
                  className={`flex-1 rounded-lg border py-1.5 text-[12px] font-semibold transition-colors ${
                    on
                      ? "border-[#16A46B] bg-[#E8FBF1] text-[#0E7C52]"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            disabled={missing}
            title={
              !contact
                ? "Choisissez un contact dans la liste"
                : missing
                  ? "Sélectionnez au moins une gate de convocation"
                  : undefined
            }
            onClick={() =>
              contact &&
              onAdd({
                name: contact.name,
                initials: contact.initials,
                org: contact.org,
                orgType: contact.orgType,
                role: role.trim() || contact.role,
                // Les gates restent affichées dans l'ordre du référentiel.
                gates: GATE_IDS.filter((g) => gates.includes(g)).join(", "),
              })
            }
          >
            <Plus className="h-4 w-4" />
            Ajouter le contact
          </Button>
        </div>
      </div>
    </Modal>
  );
}
