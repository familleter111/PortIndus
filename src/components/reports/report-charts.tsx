"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { GateState } from "@/lib/report-content";

/*
 * Les graphiques du rapport sont dessinés à la main, en SVG et en flexbox.
 *
 * La page part à l'impression : une bibliothèque qui mesure son conteneur au
 * montage se retrouverait à zéro dans le rendu d'impression, et les tailles
 * fixes utilisées ici traversent sans dommage la mise à l'échelle de l'aperçu.
 */

export const REPORT_INK = "#101828";
export const REPORT_GREEN = "#2E7D32";
export const REPORT_ACTION = "#0E7C52";
export const REPORT_LIGHT = "#5EDE99";
export const REPORT_RED = "#D92D20";
export const REPORT_GREY = "#D0D5DD";

/* --------------------------------- Cadres --------------------------------- */

/** Bandeau de titre numéroté, comme sur les planches de revue. */
export function SectionBar({
  n,
  title,
  action,
}: {
  n?: number;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-t-[6px] bg-[#101828] px-2.5 py-1.5">
      <span className="text-[9px] font-bold uppercase tracking-wide text-white">
        {n ? `${n}. ` : ""}
        {title}
      </span>
      {action ? <span className="ml-auto">{action}</span> : null}
    </div>
  );
}

/** Panneau du rapport : bandeau sombre optionnel, contenu encadré. */
export function Block({
  n,
  title,
  className,
  bodyClassName,
  action,
  children,
}: {
  n?: number;
  title?: string;
  className?: string;
  bodyClassName?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-[6px] border border-[#E4E7EC] bg-white",
        className,
      )}
    >
      {title ? <SectionBar n={n} title={title} action={action} /> : null}
      <div className={cn("min-h-0 flex-1 p-2", bodyClassName)}>{children}</div>
    </div>
  );
}

/** Panneau à titre clair, sans bandeau sombre. */
export function LightBlock({
  title,
  className,
  bodyClassName,
  action,
  children,
}: {
  title: string;
  className?: string;
  bodyClassName?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-[6px] border border-[#E4E7EC] bg-white",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-2.5 pb-1 pt-2">
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#101828]">
          {title}
        </span>
        {action ? <span className="ml-auto">{action}</span> : null}
      </div>
      <div className={cn("min-h-0 flex-1 px-2.5 pb-2", bodyClassName)}>{children}</div>
    </div>
  );
}

/* ---------------------------------- KPI ----------------------------------- */

export function KpiCell({
  label,
  value,
  note,
  tone = "ink",
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  tone?: "ink" | "green" | "amber" | "red";
}) {
  const color =
    tone === "red"
      ? REPORT_RED
      : tone === "green"
        ? REPORT_GREEN
        : tone === "amber"
          ? "#B45F09"
          : REPORT_INK;
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-2 py-1.5 text-center">
      <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-[#667085]">
        {label}
      </p>
      <p className="mt-0.5 text-[20px] font-bold leading-none" style={{ color }}>
        {value}
      </p>
      {note ? <p className="mt-0.5 text-[7.5px] text-[#98A2B3]">{note}</p> : null}
    </div>
  );
}

/* --------------------------------- Anneau --------------------------------- */

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/** Anneau proportionnel. Les parts nulles ne sont pas dessinées. */
export function Donut({
  segments,
  size = 96,
  thickness = 13,
  center,
  sub,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
  sub?: string;
}) {
  const total = segments.reduce((n, s) => n + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EAECF0"
          strokeWidth={thickness}
        />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return s.value > 0 ? el : null;
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[17px] font-bold leading-none text-[#101828]">{center}</span>
        {sub ? <span className="mt-0.5 text-[7px] text-[#667085]">{sub}</span> : null}
      </div>
    </div>
  );
}

/** Légende d'un anneau : pastille, libellé, valeur. */
export function DonutLegend({
  segments,
  suffix = "",
  className,
}: {
  segments: (DonutSegment & { note?: string })[];
  suffix?: string;
  className?: string;
}) {
  return (
    <ul className={cn("min-w-0 space-y-1", className)}>
      {segments.map((s) => (
        <li key={s.label} className="flex items-center gap-1.5 text-[8.5px]">
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ backgroundColor: s.color }}
          />
          <span className="min-w-0 flex-1 truncate text-[#344054]">{s.label}</span>
          <span className="shrink-0 font-semibold tabular-nums text-[#101828]">
            {s.value}
            {suffix}
          </span>
          {s.note ? <span className="shrink-0 text-[#98A2B3]">{s.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------- Barres ---------------------------------- */

export interface BarItem {
  label: string;
  value: number;
  color?: string;
  sub?: string;
}

/** Barres verticales avec valeur au-dessus, comme sur les planches de revue. */
export function VBars({
  items,
  max,
  height = 96,
  suffix = " %",
  reference,
}: {
  items: BarItem[];
  max?: number;
  height?: number;
  suffix?: string;
  /** Trait horizontal de référence — la capacité, par exemple. */
  reference?: number;
}) {
  const top = max ?? Math.max(100, ...items.map((i) => i.value)) * 1.15;
  return (
    <div>
      <div className="relative flex items-end gap-1.5" style={{ height }}>
        {reference !== undefined ? (
          <span
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[#98A2B3]"
            style={{ bottom: `${(reference / top) * 100}%` }}
          />
        ) : null}
        {items.map((i) => (
          <div key={i.label} className="flex min-w-0 flex-1 flex-col items-center justify-end">
            <span className="mb-0.5 text-[8px] font-bold tabular-nums text-[#101828]">
              {i.value}
              {suffix}
            </span>
            <span
              className="w-full max-w-[26px] rounded-t-[2px]"
              style={{
                height: `${Math.max(2, (i.value / top) * (height - 16))}px`,
                backgroundColor: i.color ?? REPORT_INK,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5 border-t border-[#EAECF0] pt-1">
        {items.map((i) => (
          <span
            key={i.label}
            className="min-w-0 flex-1 truncate text-center text-[7.5px] leading-tight text-[#667085]"
            title={i.label}
          >
            {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Barres empilées horizontales — répartition par criticité. */
export function StackedBars({
  rows,
  parts,
}: {
  rows: { label: string; values: number[]; total: number }[];
  parts: { label: string; color: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-1.5">
          <span className="w-[52px] shrink-0 truncate text-[8px] text-[#344054]">{r.label}</span>
          <span className="flex h-[13px] min-w-0 flex-1 overflow-hidden rounded-[2px] bg-[#F2F4F7]">
            {r.values.map((v, i) =>
              v > 0 ? (
                <span
                  key={parts[i].label}
                  className="flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ width: `${(v / max) * 100}%`, backgroundColor: parts[i].color }}
                >
                  {v}
                </span>
              ) : null,
            )}
          </span>
          <span className="w-[14px] shrink-0 text-right text-[8px] font-bold tabular-nums text-[#101828]">
            {r.total}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-center gap-2.5 pt-0.5">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1 text-[7.5px] text-[#667085]">
            <span
              className="h-[6px] w-[6px] rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Barre d'avancement fine, utilisée dans les tableaux de livrables. */
export function MiniBar({ value, color }: { value: number; color?: string }) {
  return (
    <span className="inline-block h-[5px] w-full overflow-hidden rounded-full bg-[#EAECF0] align-middle">
      <span
        className="block h-full rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color ?? (value >= 100 ? REPORT_GREEN : REPORT_ACTION),
        }}
      />
    </span>
  );
}

/* ------------------------------- Courbe ----------------------------------- */

/**
 * Charge dans le temps, avec la capacité en repère. La zone au-dessus de 100 %
 * est ombrée : c'est la surcharge, le seul endroit où l'œil doit s'arrêter.
 */
export function LoadTrend({
  points,
  width = 300,
  height = 108,
  cap = 100,
}: {
  points: { label: string; value: number }[];
  width?: number;
  height?: number;
  cap?: number;
}) {
  const pad = { l: 20, r: 4, t: 6, b: 14 };
  const max = Math.max(150, ...points.map((p) => p.value));
  const x = (i: number) =>
    pad.l + (i * (width - pad.l - pad.r)) / Math.max(1, points.length - 1);
  const y = (v: number) => pad.t + (1 - v / max) * (height - pad.t - pad.b);

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  // Le polygone de surcharge : la courbe, refermée sur la ligne de capacité.
  const over = `${points.map((p, i) => `${x(i)},${y(Math.max(cap, p.value))}`).join(" ")} ${x(points.length - 1)},${y(cap)} ${x(0)},${y(cap)}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {[0, 50, 100, 150].filter((t) => t <= max).map((t) => (
        <g key={t}>
          <line
            x1={pad.l}
            x2={width - pad.r}
            y1={y(t)}
            y2={y(t)}
            stroke="#EAECF0"
            strokeWidth={1}
          />
          <text x={2} y={y(t) + 3} fontSize={7} fill="#98A2B3">
            {t}%
          </text>
        </g>
      ))}
      <polygon points={over} fill={REPORT_RED} fillOpacity={0.12} />
      <line
        x1={pad.l}
        x2={width - pad.r}
        y1={y(cap)}
        y2={y(cap)}
        stroke={REPORT_GREEN}
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <polyline points={line} fill="none" stroke={REPORT_INK} strokeWidth={1.6} />
      {points.map((p, i) => (
        <circle key={p.label} cx={x(i)} cy={y(p.value)} r={2} fill={REPORT_INK} />
      ))}
      {points.map((p, i) =>
        i % 2 === 0 ? (
          <text
            key={`l-${p.label}`}
            x={x(i)}
            y={height - 3}
            fontSize={6.5}
            fill="#98A2B3"
            textAnchor="middle"
          >
            {p.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

/* ------------------------------ Rail de gates ----------------------------- */

const GATE_STATE_STYLE: Record<GateState, { bg: string; ring: string; icon: "check" | "dot" | "bar" }> = {
  passe: { bg: REPORT_GREEN, ring: REPORT_GREEN, icon: "check" },
  encours: { bg: REPORT_ACTION, ring: REPORT_ACTION, icon: "dot" },
  retard: { bg: REPORT_RED, ring: REPORT_RED, icon: "bar" },
  avenir: { bg: "#FFFFFF", ring: REPORT_GREY, icon: "dot" },
};

export function GateDot({ state, size = 15 }: { state: GateState; size?: number }) {
  const s = GATE_STATE_STYLE[state];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border"
      style={{
        width: size,
        height: size,
        backgroundColor: s.bg,
        borderColor: s.ring,
      }}
    >
      {s.icon === "check" ? (
        <Check className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
      ) : s.icon === "bar" ? (
        <Minus className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
      ) : (
        <span
          className="rounded-full"
          style={{
            width: size * 0.32,
            height: size * 0.32,
            backgroundColor: state === "avenir" ? REPORT_GREY : "#FFFFFF",
          }}
        />
      )}
    </span>
  );
}

/** Légende des états de gate, partagée par les planches qui en affichent. */
export function GateLegend() {
  return (
    <div className="flex items-center justify-center gap-3">
      {(
        [
          ["passe", "Passée"],
          ["encours", "En cours"],
          ["retard", "En retard"],
          ["avenir", "À venir"],
        ] as [GateState, string][]
      ).map(([state, label]) => (
        <span key={state} className="flex items-center gap-1 text-[7.5px] text-[#667085]">
          <GateDot state={state} size={11} />
          {label}
        </span>
      ))}
    </div>
  );
}

/* --------------------------------- Puces ---------------------------------- */

/** Pastille de statut d'un livrable. */
export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Approuvé"
      ? { bg: "#ECFDF3", fg: "#2E7D32", bd: "#BBF0CB" }
      : status === "En retard"
        ? { bg: "#FEF3F2", fg: "#D92D20", bd: "#FECDCA" }
        : { bg: "#E8FBF1", fg: "#0E7C52", bd: "#BFEFD5" };
  return (
    <span
      className="inline-block whitespace-nowrap rounded-[3px] border px-1.5 py-[1px] text-[7.5px] font-semibold"
      style={{ backgroundColor: tone.bg, color: tone.fg, borderColor: tone.bd }}
    >
      {status}
    </span>
  );
}

/** Étiquette de décision : GO, GO* ou HOLD. */
export function DecisionPill({
  label,
  color,
  large = false,
}: {
  label: string;
  color: string;
  large?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-[3px] border font-bold",
        large ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-[1px] text-[8px]",
      )}
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}14` }}
    >
      {label}
    </span>
  );
}
