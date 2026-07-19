"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Globe2,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle, RouteMap } from "@/components/shared/page-parts";
import { WizardSteps } from "@/components/shared/wizard-steps";
import {
  Bar as ProgressBar,
  Button,
  Card,
  Chip,
  Panel,
  type ChipTone,
} from "@/components/ui/primitives";
import { APQP_ROLES, CORE_TEAM, EXTENDED_TEAM } from "@/lib/data";

const ORG_TONE: Record<string, ChipTone> = {
  Client: "blue",
  Fournisseur: "amber",
  Interne: "slate",
};

export default function Etape2Page() {
  const router = useRouter();

  // Les indicateurs se déduisent des listes : aucune valeur saisie en dur.
  const totalEtp = CORE_TEAM.reduce((s, m) => s + m.allocation, 0) / 100;
  const orgs = new Set(EXTENDED_TEAM.map((m) => m.org)).size;
  const covered = APQP_ROLES.filter((r) => r.holder).length;
  const missing = APQP_ROLES.filter((r) => !r.holder);

  return (
    <AppShell role="Chef de projet" notifications={8}>
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
              <Button className="px-2 py-1 text-[11px]">
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
                {CORE_TEAM.map((m) => (
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
                <Button className="px-2 py-1 text-[11px]">
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
                  {EXTENDED_TEAM.map((m) => (
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
              icon: <Users className="h-4 w-4 text-[#B45F09]" />,
              k: "Membres core team",
              v: String(CORE_TEAM.length),
            },
            {
              icon: <Gauge className="h-4 w-4 text-[#B45F09]" />,
              k: "ETP cumulé",
              v: totalEtp.toFixed(2).replace(".", ","),
            },
            {
              icon: <Building2 className="h-4 w-4 text-[#B45F09]" />,
              k: "Organisations impliquées",
              v: String(orgs),
            },
            {
              icon: <ShieldCheck className="h-4 w-4 text-[#B45F09]" />,
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

        <RouteMap
          hints={[
            {
              action: "Étape précédente",
              target: "ouvre “Créer un nouveau projet — Étape 1/4”",
              icon: <ArrowLeft className="h-4 w-4 text-[#B45F09]" />,
            },
            {
              action: "Continuer vers Planning & ressources",
              target: "ouvre “Créer un nouveau projet — Étape 3/4”",
              icon: <ChevronRight className="h-4 w-4 text-[#B45F09]" />,
            },
            {
              action: "Annuler",
              target: "retourne à “Vue globale portefeuille projets”",
              icon: <XCircle className="h-4 w-4 text-[#B45F09]" />,
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
