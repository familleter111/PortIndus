"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  MoreVertical,
  Target,
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
  DateInput,
  Dot,
  Panel,
  Select,
} from "@/components/ui/primitives";
import {
  CAPACITY_RISKS,
  NEW_PROJECT,
  NEW_PROJECT_FUNCTIONS,
  RESOURCE_ALLOCATION,
} from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export default function Etape2Page() {
  const router = useRouter();

  return (
    <AppShell role="Chef de projet" notifications={3}>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Créer un nouveau projet — Étape 2/3"
          subtitle="Définir les contraintes SOP, les ressources et le rapport charge / capacité"
        />

        <WizardSteps current={2} />

        {/* Top band */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          <Panel
            title="Paramètres de planning"
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
            className="col-span-3"
          >
            <div className="space-y-2.5">
              <FieldRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Kickoff">
                <DateInput defaultValue={NEW_PROJECT.kickoff} />
              </FieldRow>
              <FieldRow icon={<Target className="h-3.5 w-3.5" />} label="SOP cible">
                <DateInput defaultValue={NEW_PROJECT.sop} />
              </FieldRow>
              <FieldRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Calendrier">
                <Select defaultValue={NEW_PROJECT.calendar}>
                  <option>Standard 5/7</option>
                  <option>Continu 7/7</option>
                </Select>
              </FieldRow>
              <div className="flex items-center gap-2 border-t border-border pt-2.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 text-[12px] text-foreground">Durée totale estimée</span>
                <Chip tone="slate" className="text-[12px] font-semibold">
                  {NEW_PROJECT.duration}
                </Chip>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 text-[12px] text-foreground">Charge globale estimée</span>
                <Chip tone="slate" className="text-[12px] font-semibold">
                  {NEW_PROJECT.totalLoad}
                </Chip>
              </div>
            </div>
          </Panel>

          <Panel
            title="Aperçu des ressources allouées"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            className="col-span-5"
            bodyClassName="px-0"
          >
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3.5 py-1.5 font-medium">Fonction</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Capacité (h)</th>
                  <th className="py-1.5 pr-2 text-right font-medium">Charge (h)</th>
                  <th className="px-3.5 py-1.5 font-medium">Charge / Capacité</th>
                </tr>
              </thead>
              <tbody>
                {NEW_PROJECT_FUNCTIONS.map((f) => (
                  <tr key={f.fn} className="border-b border-border/60 last:border-0">
                    <td className="px-3.5 py-[7px]">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Dot color={f.color} />
                        {f.fn}
                      </span>
                    </td>
                    <td className="py-[7px] pr-2 text-right tabular-nums text-muted-foreground">
                      {formatNumber(f.capacity)} h
                    </td>
                    <td className="py-[7px] pr-2 text-right tabular-nums text-muted-foreground">
                      {formatNumber(f.load)} h
                    </td>
                    <td className="px-3.5 py-[7px]">
                      <span className="flex items-center gap-2">
                        <ProgressBar value={f.ratio} color={f.color} className="flex-1" />
                        <span
                          className="w-9 shrink-0 text-right font-semibold tabular-nums"
                          style={{ color: f.color }}
                        >
                          {f.ratio} %
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel
            title="Risques de capacité détectés"
            icon={<AlertTriangle className="h-4 w-4 text-[#D92D20]" />}
            className="col-span-4"
          >
            <ul className="space-y-2.5">
              {CAPACITY_RISKS.map((r) => (
                <li key={r.fn} className="rounded-lg border border-border bg-[#FEFAF3] p-2.5">
                  <div className="flex items-start gap-2">
                    <Dot color={r.color} className="mt-1.5" />
                    <p className="min-w-0 flex-1 text-[12px] text-foreground">
                      <span className="font-semibold">{r.fn}</span> — {r.title}
                    </p>
                    <Chip tone={r.level === "Critique" ? "red" : "amber"}>{r.level}</Chip>
                  </div>
                  <p className="ml-4 mt-1 text-[11px] text-muted-foreground">{r.impact}</p>
                  <p className="ml-4 text-[11px] text-muted-foreground">
                    Recommandation : {r.reco}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Allocation table */}
        <Panel
          title="Affectation initiale des ressources"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          className="min-h-0 flex-1"
          bodyClassName="px-0"
        >
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                {["Ressource", "Fonction", "Taux d'allocation", "Projets en parallèle", "Charge affectée (h)", "Disponibilité (h)", "Charge / Capacité", ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2.5 py-1.5 font-medium first:pl-3.5 last:pr-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCE_ALLOCATION.map((r) => (
                <tr key={r.name} className="border-b border-border/60 last:border-0">
                  <td className="py-[7px] pl-3.5 pr-2.5 font-medium text-foreground">{r.name}</td>
                  <td className="px-2.5 py-[7px]">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Dot color={r.color} />
                      {r.fn}
                    </span>
                  </td>
                  <td className="px-2.5 py-[7px] tabular-nums text-muted-foreground">{r.rate}</td>
                  <td className="px-2.5 py-[7px] text-center tabular-nums text-muted-foreground">
                    {r.parallel}
                  </td>
                  <td className="px-2.5 py-[7px] tabular-nums text-muted-foreground">
                    {formatNumber(r.load)} h
                  </td>
                  <td className="px-2.5 py-[7px] tabular-nums text-muted-foreground">
                    {formatNumber(r.available)} h
                  </td>
                  <td className="px-2.5 py-[7px]">
                    <span className="flex items-center gap-2">
                      <ProgressBar value={r.ratio} color={r.color} className="w-28" />
                      <span
                        className="w-9 shrink-0 text-right font-semibold tabular-nums"
                        style={{ color: r.color }}
                      >
                        {r.ratio} %
                      </span>
                    </span>
                  </td>
                  <td className="py-[7px] pl-2.5 pr-3.5">
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Card className="flex shrink-0 items-center gap-2 border-[#F8DEB0] bg-[#FEF6E7] px-3.5 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#E58A00]" />
          <p className="text-[12px] text-foreground">
            <span className="font-semibold">Alerte capacité :</span> la fonction Qualité dépasse sa
            capacité. La fonction Process est proche de la limite.
          </p>
        </Card>

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
            Continuer vers Prévisualisation &amp; génération
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <RouteMap
          hints={[
            {
              action: "Étape précédente",
              target: "ouvre “Créer un nouveau projet — Étape 1/3”",
              icon: <ArrowLeft className="h-4 w-4 text-[#B45F09]" />,
            },
            {
              action: "Continuer vers Prévisualisation & génération",
              target: "ouvre “Créer un nouveau projet — Étape 3/3”",
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

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-[76px] shrink-0 text-[12px] text-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
