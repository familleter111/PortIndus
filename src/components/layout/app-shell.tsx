"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  FolderClosed,
  Home,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Briefcase,
  Users,
  UserRound,
} from "lucide-react";

import { useScenario } from "@/components/layout/scenario-context";
import { Markdown } from "@/components/shared/markdown";
import { Modal } from "@/components/ui/primitives";
import { STATUS_DATE } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Each entry owns the routes it should light up for, so exactly one module is
 * ever active. Entries without an `href` have no screen in this demo: they stay
 * inert rather than navigating somewhere that would highlight another module.
 */
interface NavItem {
  label: string;
  icon: typeof Home;
  href?: string;
  owns?: string[];
}

const NAV: NavItem[] = [
  { label: "Accueil", icon: Home },
  { label: "Portefeuille", href: "/portefeuille", icon: Briefcase, owns: ["/portefeuille"] },
  { label: "Projets", href: "/projet", icon: FolderClosed, owns: ["/projet", "/nouveau-projet"] },
  { label: "Planning", href: "/planning", icon: CalendarDays, owns: ["/planning"] },
  { label: "Exécution", href: "/execution", icon: LineChart, owns: ["/execution", "/validation"] },
  { label: "Ressources", icon: Users },
  { label: "Rapports", icon: BarChart3 },
  { label: "Paramètres", icon: Settings },
];

export function AppShell({
  children,
  role = "Portfolio Manager",
  notifications = 6,
}: {
  children: React.ReactNode;
  role?: string;
  notifications?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const [scenarioOpen, setScenarioOpen] = React.useState(false);
  const scenario = useScenario();
  /** The portfolio is the entry point: nothing to go back to. */
  const isHome = pathname === "/portefeuille";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border transition-[width] duration-200",
          collapsed ? "w-[68px]" : "w-[200px]",
        )}
      >
        <div
          className={cn(
            "flex h-[60px] shrink-0 items-center gap-2 border-b border-border px-3",
            collapsed && "justify-center",
          )}
        >
          {!collapsed ? (
            // Le double-clic ouvre le scénario, mais uniquement sur l'accueil.
            <button
              type="button"
              onDoubleClick={isHome ? () => setScenarioOpen(true) : undefined}
              title={
                isHome
                  ? "Double-cliquez pour ouvrir le scénario de démonstration"
                  : "TTE International"
              }
              aria-label={
                isHome
                  ? "TTE International — double-cliquez pour ouvrir le scénario"
                  : "TTE International"
              }
              className={cn("min-w-0 flex-1 text-left", isHome ? "cursor-pointer" : "cursor-default")}
            >
              <Image
                src="/ttei.jpg"
                alt="TTE International — A Onetech company"
                width={300}
                height={175}
                priority
                className="h-auto w-[132px] select-none object-contain"
              />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
            aria-expanded={!collapsed}
            title={collapsed ? "Déplier le menu" : "Réduire le menu"}
            onClick={() => setCollapsed((v) => !v)}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-2.5 py-2">
          {NAV.map((item) => {
            const active = (item.owns ?? []).some(
              (route) => pathname === route || pathname.startsWith(`${route}/`),
            );
            const Icon = item.icon;
            const content = (
              <>
                {active ? (
                  <span className="absolute -left-2.5 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#E58A00]" />
                ) : null}
                <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-[#B45F09]")} />
                {!collapsed ? item.label : null}
              </>
            );
            const base =
              "relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors";

            if (!item.href) {
              return (
                <span
                  key={item.label}
                  title={`${item.label} — module non inclus dans la démonstration`}
                  className={cn(base, "cursor-default text-[#98A2B3]")}
                >
                  {content}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                aria-current={active ? "page" : undefined}
                data-module={item.label}
                className={cn(
                  base,
                  active ? "bg-[#FDF4E7] text-[#B45F09]" : "text-[#475467] hover:bg-muted",
                )}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
          className={cn(
            "flex items-center gap-2 border-t border-border px-4 py-3.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed ? "Réduire" : null}
        </button>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center gap-6 border-b border-border px-6">
          {/* Back button everywhere except the home screen. */}
          {!isHome ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              Retour
            </button>
          ) : null}

          <div className="ml-auto flex items-center gap-2.5 rounded-full px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border">
              <UserRound className="h-[17px] w-[17px] text-muted-foreground" />
            </span>
            <span className="text-[13px] font-semibold text-foreground">{role}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2.5">
            <CalendarDays className="h-[18px] w-[18px] text-muted-foreground" />
            <div className="leading-tight">
              <p className="text-[11px] text-muted-foreground">Date de statut</p>
              <p className="text-[13px] font-semibold text-foreground">{STATUS_DATE}</p>
            </div>
          </div>

          {/* No sidebar module owns the notification centre, so the bell itself
              carries the active state. */}
          <button
            type="button"
            onClick={() => router.push("/notifications")}
            aria-label="Notifications"
            className={cn(
              "relative transition-colors",
              pathname === "/notifications"
                ? "text-[#B45F09]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Bell className="h-[19px] w-[19px]" />
            {notifications > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#E58A00] px-1 text-[9px] font-bold text-white">
                {notifications}
              </span>
            ) : null}
          </button>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF4E7] text-[11px] font-bold text-[#B45F09]">
            PL
          </span>
        </header>

        {/* The page owns its height: nothing here scrolls vertically. */}
        <main className="min-h-0 flex-1 overflow-hidden px-6 py-4">{children}</main>
      </div>

      <Modal
        open={isHome && scenarioOpen}
        onClose={() => setScenarioOpen(false)}
        width="max-w-4xl"
        title="Scénario de démonstration"
        subtitle="SCENARIO.md — parcours complet de l'application"
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDF4E7]">
            <BookOpen className="h-5 w-5 text-[#B45F09]" />
          </span>
        }
      >
        <Markdown source={scenario} />
      </Modal>
    </div>
  );
}
