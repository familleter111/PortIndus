"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { FloatingMenu } from "@/components/planning/floating-menu";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  /** Forme courte pour le bouton, quand `label` est une phrase. */
  short?: string;
  /** Pastille de couleur devant l'option — santé, niveau de charge… */
  dot?: string;
  /** Nombre de pilotes que l'option retiendrait, filtres voisins appliqués. */
  count?: number;
}

/**
 * Liste déroulante de filtre. Remplace le `<select>` natif, dont l'apparence
 * n'est pas maîtrisable sous Windows et qui ne sait afficher ni pastille ni
 * décompte. Le menu part dans un portail : la barre de filtres vit dans une
 * carte `overflow-hidden` qui le rognerait.
 */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel = "Tous",
}: {
  label: string;
  /** `null` = aucun filtre, l'option « Tous ». */
  value: string | null;
  options: FilterOption[];
  onChange: (value: string | null) => void;
  allLabel?: string;
}) {
  const [anchor, setAnchor] = React.useState<{ x: number; y: number } | null>(null);
  const active = value !== null;
  const selected = options.find((o) => o.value === value);

  const open = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setAnchor({ x: r.left, y: r.bottom + 6 });
  };

  return (
    <>
      <span
        className={cn(
          "flex h-8 shrink-0 items-center rounded-lg border text-[12px] transition-colors",
          active
            ? "border-[#16A46B] bg-[#FEF6E7] text-[#0E7C52]"
            : "border-input bg-white hover:border-[#D8DCE3]",
        )}
      >
        <button
          type="button"
          onClick={open}
          aria-haspopup="menu"
          aria-expanded={anchor !== null}
          className="flex h-full items-center gap-1.5 rounded-l-lg pl-2.5 pr-1.5"
        >
          <span className={cn(active ? "text-[#0E7C52]/70" : "text-muted-foreground")}>
            {label}
          </span>
          {selected?.dot ? (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: selected.dot }}
            />
          ) : null}
          <span className={cn("font-semibold", !active && "text-foreground")}>
            {selected ? selected.short ?? selected.label : allLabel}
          </span>
          {/* Le chevron reste même filtre posé : c'est ce qui dit que le champ
              ouvre une liste, l'information vaut aussi une fois choisi. */}
          <ChevronDown
            className={cn("h-3.5 w-3.5", active ? "text-[#0E7C52]/60" : "text-muted-foreground")}
          />
        </button>
        {/* Actif : la chevron laisse place à une croix, on retire le filtre sans
            rouvrir le menu. */}
        {active ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Retirer le filtre ${label}`}
            title={`Retirer le filtre ${label}`}
            className="flex h-full items-center rounded-r-lg pl-0.5 pr-2 text-[#0E7C52]/60 transition-colors hover:text-[#0E7C52]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </span>

      {anchor ? (
        <FloatingMenu
          x={anchor.x}
          y={anchor.y}
          onClose={() => setAnchor(null)}
          className="min-w-[210px] py-1"
        >
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <Option
            label={allLabel}
            selected={!active}
            onClick={() => {
              onChange(null);
              setAnchor(null);
            }}
          />
          <div className="my-1 h-px bg-border" />
          {options.map((o) => (
            <Option
              key={o.value}
              label={o.label}
              dot={o.dot}
              count={o.count}
              selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setAnchor(null);
              }}
            />
          ))}
        </FloatingMenu>
      ) : null}
    </>
  );
}

function Option({
  label,
  dot,
  count,
  selected,
  onClick,
}: {
  label: string;
  dot?: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}) {
  // Une option qui ne retiendrait personne mène à un écran vide : on la barre
  // plutôt que de laisser l'utilisateur y tomber.
  const empty = count === 0 && !selected;
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      disabled={empty}
      title={empty ? "Aucun pilote ne répond à ce critère" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors",
        empty
          ? "cursor-not-allowed text-muted-foreground/60"
          : "hover:bg-muted",
        selected ? "font-semibold text-[#0E7C52]" : "text-foreground",
      )}
    >
      <Check
        className={cn("h-3.5 w-3.5 shrink-0", selected ? "text-[#0E7C52]" : "opacity-0")}
      />
      {dot ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
        />
      ) : null}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "shrink-0 tabular-nums text-[10px]",
            empty ? "text-border" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
