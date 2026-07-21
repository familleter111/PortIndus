"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReportTemplateId } from "@/lib/data";

/* ------------------------------ Fil du parcours --------------------------- */

const STEPS = ["Choix du modèle", "Paramètres", "Génération IA", "Édition & export"];

/** Bandeau d'étapes du parcours de rapport, du modèle jusqu'à l'export. */
export function ReportSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex shrink-0 items-center px-4">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                done && "bg-[#2E7D32] text-white",
                active && "bg-[#0E7C52] text-white",
                !done && !active && "border border-border bg-white text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : step}
            </span>
            <span
              className={cn(
                "ml-2 truncate text-[12px] font-semibold",
                active ? "text-[#0E7C52]" : done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="mx-3 h-px min-w-0 flex-1 bg-border" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Bascule -------------------------------- */

/** Interrupteur oui/non — le vert d'action signale l'état actif. */
export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      title={hint}
      className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-muted"
    >
      <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{label}</span>
      <span
        className={cn(
          "relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors",
          checked ? "bg-[#16A46B]" : "bg-[#D0D5DD]",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[16px]" : "left-[2px]",
          )}
        />
      </span>
    </button>
  );
}

/* -------------------------- Miniature d'un modèle ------------------------- */

/*
 * La miniature est dessinée, pas photographiée : une capture d'écran vieillirait
 * dès la première retouche de la mise en page, et sa résolution ne suivrait pas
 * la réduction du cadre. Chaque modèle a sa silhouette propre, ce qui suffit à
 * le reconnaître d'un coup d'œil.
 */

function Line({ w, dark }: { w: string; dark?: boolean }) {
  return (
    <span
      className={cn("block h-[3px] rounded-full", dark ? "bg-[#98A2B3]" : "bg-[#E4E7EC]")}
      style={{ width: w }}
    />
  );
}

function Tile({ tone = "green" }: { tone?: "green" | "slate" | "red" }) {
  const bg = tone === "green" ? "bg-[#E8FBF1]" : tone === "red" ? "bg-[#FEF3F2]" : "bg-[#F2F4F7]";
  const bar = tone === "green" ? "bg-[#5EDE99]" : tone === "red" ? "bg-[#F0A9A4]" : "bg-[#D0D5DD]";
  return (
    <span className={cn("flex h-[18px] flex-1 flex-col justify-center gap-[3px] rounded-[3px] px-1", bg)}>
      <span className={cn("block h-[3px] w-[70%] rounded-full", bar)} />
      <span className="block h-[2px] w-[45%] rounded-full bg-white/70" />
    </span>
  );
}

function Rows({ n }: { n: number }) {
  return (
    <span className="block space-y-[3px]">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="flex items-center gap-1">
          <Line w="34%" dark />
          <Line w="22%" />
          <Line w="16%" />
          <span className="h-[3px] flex-1 rounded-full bg-[#BFEFD5]" />
        </span>
      ))}
    </span>
  );
}

export function TemplateThumb({ id, className }: { id: ReportTemplateId; className?: string }) {
  return (
    <span
      className={cn(
        "block overflow-hidden rounded-md border border-border bg-white p-2",
        className,
      )}
    >
      {/* En-tête commun à tous les modèles */}
      <span className="mb-1.5 flex items-center gap-1 border-b border-[#EAECF0] pb-1">
        <span className="h-[7px] w-[7px] rounded-full bg-[#0E7C52]" />
        <Line w="38%" dark />
        <span className="flex-1" />
        <Line w="14%" />
      </span>

      {id === "direction" ? (
        <>
          <span className="mb-1.5 flex gap-1">
            <Tile />
            <Tile />
            <Tile tone="red" />
            <Tile tone="slate" />
          </span>
          <span className="mb-1.5 flex items-center gap-1.5">
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[4px] border-[#5EDE99]" />
            <span className="flex min-w-0 flex-1 items-end gap-[3px]">
              {[10, 16, 22, 13, 19, 8].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-[1px] bg-[#BFEFD5]"
                  style={{ height: `${h}px` }}
                />
              ))}
            </span>
          </span>
          <Rows n={3} />
        </>
      ) : null}

      {id === "gate-client" ? (
        <>
          <span className="mb-1.5 flex gap-1">
            <Tile />
            <Tile tone="slate" />
            <Tile tone="red" />
            <Tile />
            <Tile tone="slate" />
          </span>
          <Rows n={5} />
        </>
      ) : null}

      {id === "decision" ? (
        <>
          <span className="mb-1.5 flex h-[24px] items-center justify-center rounded-[3px] bg-[#0E7C52]">
            <span className="block h-[7px] w-[26px] rounded-full bg-[#5EDE99]" />
          </span>
          <span className="mb-1.5 flex gap-1">
            <Tile />
            <Tile />
            <Tile tone="slate" />
          </span>
          <Rows n={3} />
        </>
      ) : null}
    </span>
  );
}
