"use client";

import * as React from "react";
import { Map } from "lucide-react";

import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/* ------------------------------- Page title ------------------------------- */

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-start gap-4">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="ml-auto shrink-0">{action}</div> : null}
    </div>
  );
}

/* ------------------------------- Info strip ------------------------------- */

export function InfoStrip({
  items,
  className,
}: {
  items: { icon?: React.ReactNode; label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <Card className={cn("shrink-0 overflow-hidden", className)}>
      <div className="flex divide-x divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-2.5">
            {item.icon}
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <div className="truncate text-[13px] font-semibold text-foreground">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* --------------------------------- KPI card ------------------------------- */

const TONES = {
  ink: "text-foreground",
  red: "text-[#D92D20]",
  amber: "text-[#E58A00]",
  green: "text-[#2E7D32]",
  bronze: "text-[#B45F09]",
  blue: "text-[#3976D3]",
} as const;

export type Tone = keyof typeof TONES;

export function KpiCard({
  icon,
  label,
  value,
  note,
  tone = "ink",
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  note?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col justify-center px-3.5 py-2.5", className)}>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="truncate text-[11px] leading-tight text-muted-foreground">{label}</p>
      </div>
      <p className={cn("mt-1.5 text-[22px] font-bold leading-none", TONES[tone])}>
        {value}
      </p>
      {note ? (
        <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{note}</p>
      ) : null}
    </Card>
  );
}

/* -------------------------- Parcours & redirections ----------------------- */

export interface RouteHint {
  action: string;
  target: string;
  icon?: React.ReactNode;
}

/**
 * The "Parcours & redirections" strip present on every reference mock: it
 * documents where each call to action leads.
 */
export function RouteMap({
  hints,
  numbered = false,
  className,
}: {
  hints: RouteHint[];
  numbered?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("shrink-0 overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-3.5 pb-1.5 pt-2.5">
        <Map className="h-4 w-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">
          Parcours &amp; redirections
        </span>
      </div>
      <div className="flex divide-x divide-border px-1 pb-2.5">
        {hints.map((hint, i) => (
          <div key={hint.action} className="flex min-w-0 flex-1 items-start gap-2 px-2.5">
            <span className="mt-0.5 shrink-0">
              {numbered ? (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#F0DFC4] bg-[#FDF4E7] text-[10px] font-bold text-[#B45F09]">
                  {i + 1}
                </span>
              ) : (
                hint.icon
              )}
            </span>
            <p className="min-w-0 text-[11px] leading-snug text-muted-foreground">
              Cliquer sur <span className="font-semibold text-foreground">“{hint.action}”</span>
              <br />
              <span className="text-[#B45F09]">→ {hint.target}</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
