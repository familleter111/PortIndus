"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  FileText,
  Package,
  UserRound,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle, RouteMap } from "@/components/shared/page-parts";
import { WizardSteps } from "@/components/shared/wizard-steps";
import { Button, Input, Panel, Select } from "@/components/ui/primitives";
import { NEW_PROJECT } from "@/lib/data";

export default function Etape1Page() {
  const router = useRouter();

  return (
    <AppShell role="Chef de projet" notifications={8}>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Créer un nouveau projet — Étape 1/3"
          subtitle="Définir les éléments clés du projet"
        />

        <WizardSteps current={1} />

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
          {/* Left: form + summary */}
          <div className="flex min-h-0 flex-col gap-3">
            <Panel title="Informations générales" className="min-h-0 flex-1">
              <div className="space-y-2.5">
                <Row label="Code projet" required>
                  <Input defaultValue={NEW_PROJECT.code} />
                </Row>
                <Row label="Nom projet" required>
                  <Input defaultValue={NEW_PROJECT.name} />
                </Row>
                <Row label="Client" required>
                  <Select defaultValue={NEW_PROJECT.client}>
                    <option>OEM Alpha</option>
                    <option>OEM Beta</option>
                    <option>OEM Gamma</option>
                  </Select>
                </Row>
                <Row label="Produit / Pièce" required>
                  <Input defaultValue={NEW_PROJECT.part} />
                </Row>
                <Row label="Chef de projet" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#FDF4E7] text-[9px] font-bold text-[#B45F09]">
                      {NEW_PROJECT.managerInitials}
                    </span>
                    <Select defaultValue={NEW_PROJECT.manager} className="pl-9">
                      <option>Leïla Mansour</option>
                      <option>Hatem Ben Ali</option>
                      <option>Sarra Khelifi</option>
                    </Select>
                  </div>
                </Row>
                <Row label="Template" required>
                  <Select defaultValue={NEW_PROJECT.template}>
                    <option>APQP Light — Nouveau produit</option>
                    <option>APQP Full — Nouveau process</option>
                  </Select>
                </Row>
                <Row label="Catégorie projet" required>
                  <Select defaultValue={NEW_PROJECT.category}>
                    <option>Nouveau produit</option>
                    <option>Modification produit</option>
                    <option>Transfert</option>
                  </Select>
                </Row>
              </div>
            </Panel>

            <Panel title="Résumé du nouveau projet" className="shrink-0">
              <div className="flex divide-x divide-border">
                {[
                  { icon: <Building2 className="h-4 w-4 text-muted-foreground" />, k: "Client", v: NEW_PROJECT.client },
                  { icon: <Package className="h-4 w-4 text-muted-foreground" />, k: "Produit / Pièce", v: NEW_PROJECT.part },
                  { icon: <UserRound className="h-4 w-4 text-muted-foreground" />, k: "Chef de projet", v: NEW_PROJECT.manager },
                  { icon: <FileText className="h-4 w-4 text-muted-foreground" />, k: "Template", v: NEW_PROJECT.template },
                ].map((item) => (
                  <div key={item.k} className="flex min-w-0 flex-1 items-start gap-2 px-3 first:pl-0 last:pr-0">
                    {item.icon}
                    <div className="min-w-0 leading-tight">
                      <p className="text-[10px] text-muted-foreground">{item.k}</p>
                      <p className="text-[12px] font-semibold text-foreground">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Right: description + objectives */}
          <div className="flex min-h-0 flex-col gap-3">
            <Panel title="Description du projet" className="min-h-0 flex-1">
              <p className="whitespace-pre-line text-[12px] leading-relaxed text-foreground">
                {NEW_PROJECT.description}
              </p>
            </Panel>

            <Panel title="Objectifs clés" className="shrink-0">
              <ul className="space-y-2">
                {NEW_PROJECT.objectives.map((o) => (
                  <li
                    key={o}
                    className="flex items-center gap-2 border-b border-dashed border-border pb-2 last:border-0 last:pb-0"
                  >
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-[#E58A00]">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-[12px] text-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="flex shrink-0 justify-end gap-2.5">
              <Button variant="ghost" className="border-border" onClick={() => router.push("/portefeuille")}>
                Annuler
              </Button>
              <Button onClick={() => router.push("/portefeuille")}>
                <ArrowLeft className="h-4 w-4" />
                Retour portefeuille
              </Button>
              <Button variant="primary" onClick={() => router.push("/nouveau-projet/etape-2")}>
                Continuer vers Planning &amp; ressources
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <RouteMap
          hints={[
            {
              action: "Continuer vers Planning & ressources",
              target: "ouvre “Créer un nouveau projet — Étape 2/3”",
              icon: <ChevronRight className="h-4 w-4 text-[#B45F09]" />,
            },
            {
              action: "Annuler",
              target: "retourne à “Vue globale portefeuille projets”",
              icon: <XCircle className="h-4 w-4 text-[#B45F09]" />,
            },
            {
              action: "Retour portefeuille",
              target: "ouvre “Vue globale portefeuille projets”",
              icon: <ArrowLeft className="h-4 w-4 text-[#B45F09]" />,
            },
          ]}
        />
      </div>
    </AppShell>
  );
}

/** Label on the left, control on the right — the layout used by the mock. */
function Row({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[124px] shrink-0 text-[12px] text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-[#D92D20]">*</span> : null}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
