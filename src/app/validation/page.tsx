"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  LayoutDashboard,
  Tag,
  Target,
  UserRound,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button, Card, Panel } from "@/components/ui/primitives";
import { VALIDATION } from "@/lib/data";

export default function ValidationPage() {
  const router = useRouter();

  return (
    <AppShell notifications={2}>
      <div className="flex h-full flex-col gap-3">
        {/* Header */}
        <div className="flex shrink-0 items-start">
          <div className="flex-1" />
          <div className="text-center">
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
              Confirmation de validation
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              La preuve a été validée et la progression du projet a été recalculée
            </p>
          </div>
          <div className="flex flex-1 justify-end">
            <Button>
              <Users className="h-4 w-4" />
              Membre de l&apos;équipe projet
            </Button>
          </div>
        </div>

        {/* Success mark */}
        <div className="flex shrink-0 flex-col items-center gap-2 py-2">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#2E7D32]">
            <CheckCircle2 className="h-9 w-9 text-[#2E7D32]" strokeWidth={2.5} />
            <Sparkle className="-left-4 top-1" />
            <Sparkle className="-right-4 top-3" />
            <Sparkle className="left-0 -top-3" />
            <Sparkle className="right-1 -bottom-2" />
          </span>
          <p className="text-[20px] font-bold text-[#2E7D32]">Mise à jour prise en compte</p>
        </div>

        {/* Context strip */}
        <Card className="shrink-0 overflow-hidden">
          <div className="flex divide-x divide-border">
            {[
              { icon: <FileText className="h-4 w-4 text-muted-foreground" />, k: "Contribution liée", v: VALIDATION.contribution },
              { icon: <Tag className="h-4 w-4 text-muted-foreground" />, k: "Référence APQP", v: VALIDATION.reference },
              { icon: <UserRound className="h-4 w-4 text-muted-foreground" />, k: "Validée par", v: VALIDATION.validatedBy },
              { icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />, k: "Date de validation", v: VALIDATION.date },
              {
                icon: (
                  <span className="flex h-6 w-5 items-center justify-center rounded bg-[#FEF3F2] text-[7px] font-bold text-[#D92D20]">
                    PDF
                  </span>
                ),
                k: "Fichier validé",
                v: VALIDATION.file,
              },
            ].map((i) => (
              <div key={i.k} className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-3">
                {i.icon}
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] text-muted-foreground">{i.k}</p>
                  <p className="truncate text-[13px] font-semibold text-foreground">{i.v}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deltas */}
        <div className="grid shrink-0 grid-cols-2 gap-3">
          <DeltaCard
            icon={<Target className="h-5 w-5 text-muted-foreground" />}
            title="Progression projet"
            before={VALIDATION.progressBefore}
            after={VALIDATION.progressAfter}
            delta={VALIDATION.progressDelta}
            beforeLabel="Avant validation"
            afterLabel="Après validation"
          />
          <DeltaCard
            icon={<Target className="h-5 w-5 text-[#E58A00]" />}
            title="Readiness G3"
            before={VALIDATION.readinessBefore}
            after={VALIDATION.readinessAfter}
            delta={VALIDATION.readinessDelta}
            beforeLabel="Avant validation"
            afterLabel="Après validation"
          />
        </div>

        {/* Effects + history */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          <Panel title="Effets de la validation" className="col-span-5">
            <ul className="space-y-2">
              {VALIDATION.effects.map((e) => (
                <li key={e} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2E7D32]" />
                  <span className="text-[12px] text-foreground">{e}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Historique de validation"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            className="col-span-7"
          >
            <div className="flex items-start gap-2.5 rounded-lg border border-[#BBF0CB] bg-[#F6FEF9] p-3">
              <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-[#2E7D32]" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[12px] font-medium tabular-nums text-foreground">
                  {VALIDATION.date}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Preuve validée par {VALIDATION.validatedBy}
                </p>
              </div>
              <span className="shrink-0 text-[12px] font-semibold text-[#2E7D32]">Version 2</span>
            </div>
          </Panel>
        </div>

        {/* Footer actions */}
        <div className="grid shrink-0 grid-cols-3 gap-3">
          <Button onClick={() => router.push("/projet")}>
            <ArrowLeft className="h-4 w-4" />
            Retour au projet
          </Button>
          <Button onClick={() => router.push("/projet")}>
            <LayoutDashboard className="h-4 w-4" />
            Voir le dashboard projet
          </Button>
          <Button variant="primary" onClick={() => router.push("/notifications")}>
            <Bell className="h-4 w-4" />
            Ouvrir les notifications
          </Button>
        </div>

        <Card className="shrink-0 p-3">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Parcours &amp; redirections</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { a: "Retour au projet", t: "ouvre “Vue projet — Dashboard chef de projet”" },
              { a: "Voir le dashboard projet", t: "ouvre “Vue projet — Dashboard chef de projet”" },
              { a: "Ouvrir les notifications", t: "ouvre “Centre de notifications”" },
            ].map((h, i) => (
              <p key={h.a} className="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground">
                <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#F0DFC4] bg-[#FDF4E7] text-[10px] font-bold text-[#B45F09]">
                  {i + 1}
                </span>
                <span>
                  Cliquer sur <span className="font-semibold text-foreground">“{h.a}”</span>
                  <br />
                  <span className="text-[#B45F09]">→ {h.t}</span>
                </span>
              </p>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

/* -------------------------------------------------------------------------- */

function DeltaCard({
  icon,
  title,
  before,
  after,
  delta,
  beforeLabel,
  afterLabel,
}: {
  icon: React.ReactNode;
  title: string;
  before: string;
  after: string;
  delta: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <Card className="flex items-center gap-4 px-5 py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <div className="mt-1.5 flex items-center gap-4">
          <div className="leading-tight">
            <p className="text-[22px] font-bold text-foreground">{before}</p>
            <p className="text-[11px] text-muted-foreground">{beforeLabel}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="leading-tight">
            <p className="text-[22px] font-bold text-[#2E7D32]">{after}</p>
            <p className="text-[11px] text-muted-foreground">{afterLabel}</p>
          </div>
          <span className="ml-auto rounded-md bg-[#ECFDF3] px-2 py-1 text-[12px] font-semibold text-[#2E7D32]">
            {delta}
          </span>
        </div>
      </div>
    </Card>
  );
}

/** Decorative dot around the success mark. */
function Sparkle({ className }: { className: string }) {
  return (
    <span className={`absolute h-1.5 w-1.5 rounded-full bg-[#2E7D32]/35 ${className}`} />
  );
}
