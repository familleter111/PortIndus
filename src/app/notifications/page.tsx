"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  FolderClosed,
  LayoutDashboard,
  MailCheck,
  MailOpen,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageTitle } from "@/components/shared/page-parts";
import { Button, Card, Chip, Panel } from "@/components/ui/primitives";
import { NOTIFICATIONS, NOTIFICATION_SUMMARY } from "@/lib/data";

const ICONS: Record<string, React.ReactNode> = {
  alert: <AlertTriangle className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  shield: <ShieldCheck className="h-4 w-4" />,
  flag: <Flag className="h-4 w-4" />,
  file: <FileText className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
};

const TONE_BG: Record<string, string> = {
  red: "bg-[#FEF3F2] text-[#D92D20]",
  amber: "bg-[#FEF6E7] text-[#E58A00]",
  green: "bg-[#ECFDF3] text-[#2E7D32]",
  blue: "bg-[#EFF6FF] text-[#3976D3]",
  slate: "bg-[#F5F6F8] text-[#667085]",
};

const TONE_DOT: Record<string, string> = {
  red: "bg-[#D92D20]",
  amber: "bg-[#E58A00]",
  green: "bg-[#2E7D32]",
  blue: "bg-[#3976D3]",
  slate: "bg-[#98A2B3]",
};

const CATEGORY_TONE: Record<string, "red" | "amber" | "green" | "blue" | "slate"> = {
  Projet: "red",
  Capacité: "amber",
  Validation: "green",
  Exécution: "slate",
  Planning: "blue",
};

const FILTERS = [
  { key: "all", label: `Toutes (${NOTIFICATIONS.length})`, icon: <MailOpen className="h-3.5 w-3.5" /> },
  { key: "unread", label: "Non lues (3)", icon: <span className="h-2 w-2 rounded-full bg-[#3976D3]" /> },
  { key: "alerts", label: "Alertes (2)", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { key: "Projet", label: "Projet", icon: <FolderClosed className="h-3.5 w-3.5" /> },
  { key: "Capacité", label: "Capacité", icon: <Users className="h-3.5 w-3.5" /> },
  { key: "Validation", label: "Validation", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = React.useState("all");

  const visible = NOTIFICATIONS.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return n.unread;
    if (filter === "alerts") return n.tone === "red";
    return n.category === filter;
  });

  /** Route each notification to the screen it refers to. */
  const openTarget = (id: string) => {
    if (id === "n3") return router.push("/validation");
    if (id === "n6") return router.push("/planning");
    if (id === "n2") return router.push("/planning");
    return router.push("/projet");
  };

  return (
    <AppShell notifications={3}>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Centre de notifications"
          subtitle="Suivi des alertes, validations et événements de pilotage APQP"
          action={
            <div className="flex gap-2.5">
              <Button>
                <MailCheck className="h-4 w-4" />
                Tout marquer comme lu
              </Button>
              <Button>
                <Settings className="h-4 w-4" />
                Paramètres de notification
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex shrink-0 flex-wrap gap-2.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                filter === f.key
                  ? "border-[#E5A11B] bg-white text-[#B45F09]"
                  : "border-border bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3">
          <div className="col-span-8 flex min-h-0 flex-col gap-3">
            {/* Counters */}
            <div className="grid shrink-0 grid-cols-3 gap-3">
              {[
                { icon: <MailOpen className="h-5 w-5 text-[#3976D3]" />, bg: "bg-[#EFF6FF]", label: "Notifications non lues", value: 3, tone: "text-[#3976D3]" },
                { icon: <AlertTriangle className="h-5 w-5 text-[#D92D20]" />, bg: "bg-[#FEF3F2]", label: "Alertes critiques", value: 2, tone: "text-[#D92D20]" },
                { icon: <CalendarDays className="h-5 w-5 text-[#E58A00]" />, bg: "bg-[#FEF6E7]", label: "Événements aujourd'hui", value: 5, tone: "text-[#E58A00]" },
              ].map((c) => (
                <Card key={c.label} className="flex items-center gap-3 px-4 py-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${c.bg}`}>
                    {c.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] text-muted-foreground">{c.label}</p>
                    <p className={`text-[22px] font-bold leading-none ${c.tone}`}>{c.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* List */}
            <Panel title="Notifications" className="min-h-0 flex-1" bodyClassName="px-0">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3.5 py-1.5 font-medium">&nbsp;</th>
                    <th className="py-1.5 font-medium">Catégorie</th>
                    <th className="py-1.5 font-medium">Reçu le</th>
                    <th className="px-3.5 py-1.5 font-medium">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((n) => (
                    <tr key={n.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pl-3.5 pr-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              n.unread ? TONE_DOT[n.tone] : "bg-[#98A2B3]"
                            }`}
                          />
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_BG[n.tone]}`}
                          >
                            {ICONS[n.icon]}
                          </span>
                          <span className="min-w-0 leading-tight">
                            <span className="block font-semibold text-foreground">{n.title}</span>
                            <span className="block text-[11px] text-muted-foreground">{n.detail}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <Chip tone={CATEGORY_TONE[n.category]}>{n.category}</Chip>
                      </td>
                      <td className="py-2.5 whitespace-nowrap text-muted-foreground">{n.received}</td>
                      <td className="py-2.5 pl-3 pr-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openTarget(n.id)}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#B45F09] hover:underline"
                        >
                          {n.action}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-muted-foreground">
                        Aucune notification pour ce filtre.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Side rail */}
          <div className="col-span-4 flex min-h-0 flex-col gap-3">
            <Panel title="Résumé contextuel" className="shrink-0">
              <ul className="space-y-2.5">
                {NOTIFICATION_SUMMARY.map((s) => (
                  <li key={s.label} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_BG[s.tone]}`}
                    >
                      {ICONS[s.icon]}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[12px] font-semibold text-foreground">{s.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{s.detail}</span>
                    </span>
                    <span
                      className={`shrink-0 text-[14px] font-bold ${
                        s.tone === "red"
                          ? "text-[#D92D20]"
                          : s.tone === "amber"
                            ? "text-[#E58A00]"
                            : s.tone === "green"
                              ? "text-[#2E7D32]"
                              : "text-[#3976D3]"
                      }`}
                    >
                      {s.value}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Parcours & redirections" className="min-h-0 flex-1">
              <ol className="space-y-2.5">
                {[
                  { a: "Voir le détail", c: "dans “PFMEA process en retard”", t: "ouvre “Vue projet — Dashboard chef de projet”" },
                  { a: "Ouvrir", c: "dans “Preuve validée”", t: "ouvre “Confirmation de validation”" },
                  { a: "Consulter", c: "dans “Simulation de replanification prête”", t: "ouvre “Simulation de replanification”" },
                  { a: "Ouvrir", c: "dans “Surcharge Qualité détectée”", t: "ouvre “Détail conflit de ressources”" },
                ].map((h, i) => (
                  <li key={`${h.a}-${i}`} className="flex items-start gap-2">
                    <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#F0DFC4] bg-[#FDF4E7] text-[10px] font-bold text-[#B45F09]">
                      {i + 1}
                    </span>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      Cliquer sur <span className="font-semibold text-foreground">“{h.a}”</span> {h.c}
                      <br />
                      <span className="text-[#B45F09]">→ {h.t}</span>
                    </p>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>

        {/* Footer actions */}
        <div className="grid shrink-0 grid-cols-3 gap-3">
          <Button onClick={() => router.push("/portefeuille")}>
            <ArrowLeft className="h-4 w-4" />
            Retour portefeuille
          </Button>
          <Button onClick={() => router.push("/projet")}>
            <LayoutDashboard className="h-4 w-4" />
            Voir le dashboard projet
          </Button>
          <Button variant="primary">
            <RefreshCw className="h-4 w-4" />
            Actualiser les notifications
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
