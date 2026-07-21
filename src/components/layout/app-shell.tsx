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
  ChevronLeft,
  FolderClosed,
  Home,
  LayoutGrid,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Briefcase,
  Users,
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
  /** Sous-entrées : le parent devient un simple intitulé de groupe. */
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { label: "Accueil", icon: Home },
  { label: "Portefeuille", href: "/portefeuille", icon: Briefcase, owns: ["/portefeuille"] },
  { label: "Projets", href: "/projet", icon: FolderClosed, owns: ["/projet", "/nouveau-projet"] },
  {
    label: "Planning",
    icon: CalendarDays,
    children: [
      {
        label: "Risques & conflits",
        href: "/planning",
        icon: CalendarDays,
        // Le détail ne doit pas s'allumer quand on est sur la charge.
        owns: ["/planning"],
      },
      {
        label: "Charge par service",
        href: "/planning/charge",
        icon: LayoutGrid,
        owns: ["/planning/charge"],
      },
      {
        label: "Charge par personne",
        href: "/planning/personnes",
        icon: Users,
        owns: ["/planning/personnes"],
      },
    ],
  },
  // La confirmation de validation n'est plus un écran : elle se joue dans les
  // modales du parcours de contribution, sans quitter « Exécution ».
  { label: "Exécution", href: "/execution", icon: LineChart, owns: ["/execution"] },
  { label: "Ressources", icon: Users },
  { label: "Rapports", icon: BarChart3 },
  { label: "Paramètres", icon: Settings },
];

/** Une entrée est active si l'URL tombe dans son périmètre — le plus précis gagne. */
function isActive(item: NavItem, pathname: string): boolean {
  const own = (item.owns ?? []).some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (!own) return false;
  // « /planning » ne s'allume pas pour « /planning/charge », qui a sa propre entrée.
  const deeper = NAV.flatMap((n) => n.children ?? [])
    .flatMap((c) => c.owns ?? [])
    .filter((r) => r !== (item.owns ?? [])[0] && r.startsWith(`${(item.owns ?? [])[0]}/`));
  return !deeper.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/** Une entrée de menu : lien si elle a un écran, texte inerte sinon. */
function NavLink({
  item,
  active,
  collapsed,
  nested,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  nested?: boolean;
}) {
  const Icon = item.icon;
  const base = cn(
    "relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
    nested && !collapsed && "pl-4 text-[12px]",
  );
  const content = (
    <>
      {active ? (
        <span className="absolute -left-2.5 bottom-1.5 top-1.5 w-[3px] rounded-r-full bg-[#0E7C52]" />
      ) : null}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-[#0E7C52]")} />
      {!collapsed ? item.label : null}
    </>
  );

  if (!item.href) {
    return (
      <span
        title={`${item.label} — module non inclus dans la démonstration`}
        className={cn(base, "cursor-default text-[#98A2B3]")}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? "page" : undefined}
      data-module={item.label}
      className={cn(
        base,
        active ? "bg-[#E8FBF1] text-[#0E7C52]" : "text-[#475467] hover:bg-muted",
      )}
    >
      {content}
    </Link>
  );
}

export function AppShell({
  children,
  notifications = 6,
}: {
  children: React.ReactNode;
  notifications?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const [scenarioOpen, setScenarioOpen] = React.useState(false);
  const scenario = useScenario();
  /** The portfolio is the entry point: nothing to go back to. */
  const isHome = pathname === "/portefeuille";

  // La hauteur vient du cadre (#app-frame), pas de la fenêtre : sous réduction,
  // `h-screen` vaudrait plus que la place réellement disponible.
  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
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
                isHome ? "Double-cliquez pour ouvrir le scénario de démonstration" : "APQP"
              }
              aria-label={
                isHome ? "APQP — double-cliquez pour ouvrir le scénario" : "APQP"
              }
              className={cn("min-w-0 flex-1 text-left", isHome ? "cursor-pointer" : "cursor-default")}
            >
              {/* Logo large (2024 × 777) : à 136 px il occupe 52 px de haut et
                  tient dans la barre de 60 px. Next sert une version
                  redimensionnée, la source n'est pas envoyée telle quelle. */}
              <Image
                src="/apqp.png"
                alt="APQP"
                width={2024}
                height={777}
                priority
                className="h-auto w-[136px] select-none object-contain"
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
            // Entrée de groupe : intitulé discret, puis ses sous-entrées.
            if (item.children) {
              const GroupIcon = item.icon;
              return (
                <div key={item.label} className={cn(!collapsed && "pt-1.5")}>
                  {!collapsed ? (
                    <p className="flex items-center gap-2 px-2.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#98A2B3]">
                      <GroupIcon className="h-3.5 w-3.5" />
                      {item.label}
                    </p>
                  ) : null}
                  <div className="space-y-0.5">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        item={child}
                        active={isActive(child, pathname)}
                        collapsed={collapsed}
                        nested
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.label}
                item={item}
                active={isActive(item, pathname)}
                collapsed={collapsed}
              />
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

          <div className="ml-auto flex items-center gap-2.5">
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
                ? "text-[#0E7C52]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Bell className="h-[19px] w-[19px]" />
            {notifications > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#0E7C52] px-1 text-[9px] font-bold text-white">
                {notifications}
              </span>
            ) : null}
          </button>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8FBF1] text-[11px] font-bold text-[#0E7C52]">
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
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8FBF1]">
            <BookOpen className="h-5 w-5 text-[#0E7C52]" />
          </span>
        }
      >
        <Markdown source={scenario} />
      </Modal>
    </div>
  );
}
