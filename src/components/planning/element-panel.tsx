"use client";

import * as React from "react";
import { Copy, Save, Trash2, X } from "lucide-react";

import { Button, DateInput, Input, Select } from "@/components/ui/primitives";
import type { PlanRow } from "@/lib/data";

const OWNERS = ["Youssef Jaziri", "Noura Trabelsi", "Karim Belhadj", "—"];

const SHAPES = [
  { key: "task", label: "Tâche" },
  { key: "milestone", label: "Jalon" },
  { key: "summary", label: "Récap." },
] as const;

export type Shape = (typeof SHAPES)[number]["key"];

/** "2026-12-02" → "02/12/2026" */
const fr = (iso: string) => iso.split("-").reverse().join("/");

/** Contrôles resserrés : le bandeau ne doit pas voler de hauteur au schéma. */
const CTL = "h-8 text-[11px]";

/**
 * Éditeur en bandeau, posé au-dessus du tableau et du schéma. Il pousse le
 * contenu vers le bas au lieu de le recouvrir : le Gantt reste lisible en
 * entier pendant la modification.
 */
export function ElementPopover({
  row,
  onClose,
  onDelete,
  onDuplicate,
  onShapeChange,
}: {
  row: PlanRow;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onShapeChange: (shape: Shape) => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const shape: Shape = row.milestone ? "milestone" : row.summary ? "summary" : "task";

  return (
    <div
      role="dialog"
      aria-label={`Modifier ${row.name}`}
      className="mt-1.5 shrink-0 animate-fade-in rounded-xl border border-[#EFE2CE] bg-[#FFFCF7] shadow-card"
    >
      {/* Identité de l'élément */}
      <div className="flex items-center gap-2 border-b border-[#F3E7D3] px-3 py-1">
        <span className="shrink-0 rounded-md bg-[#FDF4E7] px-1.5 py-0.5 text-[10px] font-bold text-[#B45F09]">
          {row.id}
        </span>
        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{row.wbs}</span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-foreground">
          {row.name}
        </span>
        <span className="hidden shrink-0 text-[10px] text-muted-foreground lg:inline">
          Échap pour fermer
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'éditeur"
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Champs sur un rang, repliés seulement si la largeur manque */}
      <div className="flex flex-wrap items-end gap-2 px-3 py-2">
        <Cell label="Nom" className="min-w-[160px] flex-1">
          <Input defaultValue={row.name} className={CTL} />
        </Cell>

        <Cell label="Forme">
          <div className="flex h-8 items-center gap-0.5 rounded-lg border border-input bg-white p-0.5">
            {SHAPES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onShapeChange(s.key)}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                  shape === s.key
                    ? "bg-[#E58A00] text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Cell>

        <Cell label="Responsable" className="w-[124px]">
          <Select defaultValue={row.owner} className={CTL}>
            {OWNERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Cell>

        <Cell label="Début" className="w-[118px]">
          <DateInput defaultValue={fr(row.fStart)} className={CTL} />
        </Cell>
        <Cell label="Fin" className="w-[118px]">
          <DateInput defaultValue={fr(row.fEnd)} className={CTL} />
        </Cell>
        <Cell label="Charge (h)" className="w-[70px]">
          <Input type="number" defaultValue={row.load} className={CTL} />
        </Cell>
        <Cell label="Statut" className="w-[108px]">
          <Select defaultValue={row.status} className={CTL}>
            <option>Non démarré</option>
            <option>En cours</option>
            <option>En retard</option>
            <option>Terminé</option>
          </Select>
        </Cell>
        <Cell label="Criticité" className="w-[94px]">
          <Select defaultValue={row.critical ? "Critique" : "Normale"} className={CTL}>
            <option>Normale</option>
            <option>Critique</option>
          </Select>
        </Cell>

        <div className="ml-auto flex items-center gap-1.5">
          <Button className="h-8 px-2 py-0 text-[11px]" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" />
            Dupliquer
          </Button>
          <Button
            className="h-8 border-[#FECDCA] px-2 py-0 text-[11px] text-[#D92D20] hover:bg-[#FEF3F2]"
            onClick={onDelete}
            title="Supprimer"
            aria-label="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="primary" className="h-8 px-2.5 py-0 text-[11px]" onClick={onClose}>
            <Save className="h-3.5 w-3.5" />
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
