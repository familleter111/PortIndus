"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ChevronLeft,
  Gauge,
  Globe2,
  Plus,
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
  type ExtendedMember,
  type TeamMember,
} from "@/lib/data";
import { getInitials } from "@/lib/utils";

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
  const totalEtp = core.reduce((s, m) => s + m.allocation, 0) / 100;
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
                        <ProgressBar value={m.allocation} color={m.color} className="w-14" />
                        <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-foreground">
                          {m.allocation} %
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
        onClose={() => setModal(null)}
        onAdd={(m) => {
          setCore((prev) => [...prev, m]);
          setModal(null);
        }}
      />
      <AddExtendedMemberModal
        open={modal === "extended"}
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

/** Palette d'avatars — la couleur suit la fonction, pas le hasard. */
const FUNCTION_COLOR: Record<string, string> = {
  "Direction projet": "#0E7C52",
  Qualité: "#D92D20",
  "Méthodes / Process": "#3976D3",
  Industrialisation: "#2E7D32",
  Achats: "#7C3AED",
  Logistique: "#0891B2",
  "R&D Produit": "#E58A00",
};

const FUNCTIONS = Object.keys(FUNCTION_COLOR);
const SITES = ["Sousse", "Tunis", "Bizerte"];

function AddCoreMemberModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (m: TeamMember) => void;
}) {
  const [name, setName] = React.useState("");
  const [fn, setFn] = React.useState(FUNCTIONS[1]);
  const [role, setRole] = React.useState("");
  const [allocation, setAllocation] = React.useState(30);
  const [site, setSite] = React.useState(SITES[0]);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setFn(FUNCTIONS[1]);
    setRole("");
    setAllocation(30);
    setSite(SITES[0]);
  }, [open]);

  // Le nom fait le membre ; le reste a un défaut raisonnable.
  const missing = !name.trim();

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
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <Field label="Nom du membre" required className="col-span-2">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Amine Chakroun"
            />
          </Field>

          <Field label="Fonction">
            <Select value={fn} onChange={(e) => setFn(e.target.value)}>
              {FUNCTIONS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          </Field>
          <Field label="Site">
            <Select value={site} onChange={(e) => setSite(e.target.value)}>
              {SITES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <Field label="Rôle APQP" className="col-span-2">
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex. Plan de surveillance"
            />
          </Field>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <p className="flex-1 text-[12px] font-medium text-muted-foreground">
              Allocation au projet
            </p>
            <span className="text-[14px] font-bold tabular-nums text-[#0E7C52]">
              {allocation} %
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={allocation}
            onChange={(e) => setAllocation(Number(e.target.value))}
            aria-label="Allocation au projet"
            className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[#16A46B]"
            style={{
              background: `linear-gradient(to right, #16A46B ${allocation}%, #EFF1F4 ${allocation}%)`,
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button onClick={onClose}>Annuler</Button>
          <Button
            variant="primary"
            disabled={missing}
            title={missing ? "Le nom du membre est obligatoire" : undefined}
            onClick={() =>
              onAdd({
                name: name.trim(),
                initials: getInitials(name.trim()),
                fn,
                role: role.trim() || "À définir",
                allocation,
                site,
                color: FUNCTION_COLOR[fn] ?? "#667085",
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

const ORG_TYPES: ExtendedMember["orgType"][] = ["Client", "Fournisseur", "Interne"];
const GATE_IDS = ["G0", "G1", "G2", "G3", "G4", "G5"];

function AddExtendedMemberModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (m: ExtendedMember) => void;
}) {
  const [name, setName] = React.useState("");
  const [org, setOrg] = React.useState("");
  const [orgType, setOrgType] = React.useState<ExtendedMember["orgType"]>("Fournisseur");
  const [role, setRole] = React.useState("");
  const [gates, setGates] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setOrg("");
    setOrgType("Fournisseur");
    setRole("");
    setGates([]);
  }, [open]);

  const toggleGate = (g: string) =>
    setGates((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  // Un contact étendu n'a de sens que rattaché à une organisation et à au moins
  // une gate : c'est ce qui détermine quand on le convoque.
  const missing = !name.trim() || !org.trim() || gates.length === 0;

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
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <Field label="Nom du contact" required className="col-span-2">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Marco Rossi"
            />
          </Field>

          <Field label="Organisation" required>
            <Input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Ex. Fonderie Lombardia"
            />
          </Field>
          <Field label="Type d'organisation">
            <Select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value as ExtendedMember["orgType"])}
            >
              {ORG_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>

          <Field label="Rôle" className="col-span-2">
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex. Fourniture brut aluminium"
            />
          </Field>
        </div>

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
              missing ? "Nom, organisation et au moins une gate sont obligatoires" : undefined
            }
            onClick={() =>
              onAdd({
                name: name.trim(),
                initials: getInitials(name.trim()),
                org: org.trim(),
                orgType,
                role: role.trim() || "À définir",
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
