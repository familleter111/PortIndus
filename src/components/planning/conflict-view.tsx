"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Layers,
  Users,
  Wrench,
} from "lucide-react";

import { Button, Card, Chip, Modal } from "@/components/ui/primitives";
import {
  CONFLICT_LANES,
  CONFLICT_WEEKS,
  EQUIPMENT_CONFLICTS,
  type ConflictLane,
} from "@/lib/data";

/** Semaines où la personne dépasse sa capacité hebdomadaire. */
function overWeeks(lane: ConflictLane): number[] {
  return lane.load.reduce<number[]>((acc, h, i) => (h > lane.weekly ? [...acc, i] : acc), []);
}

/** Heures à replacer pour ramener la personne sous sa capacité. */
function excessHours(lane: ConflictLane): number {
  return lane.load.reduce((n, h) => n + Math.max(0, h - lane.weekly), 0);
}

/* -------------------------------------------------------------------------- */
/*  Frise de charge                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Une ligne par personne : la charge de chaque semaine en colonne, la hauteur
 * de barre proportionnelle à la capacité. Le dépassement se voit — la barre
 * franchit le trait de capacité et passe au rouge — plutôt que de se lire dans
 * un tableau de chiffres.
 */
function LoadLane({ lane, onPick }: { lane: ConflictLane; onPick: () => void }) {
  const over = overWeeks(lane);
  const peak = Math.max(...lane.load, lane.weekly);

  return (
    <div className="border-b border-border py-2 last:border-0">
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: lane.color }}
        >
          {lane.initials}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[12px] font-semibold text-foreground">{lane.person}</span>
          <span className="block text-[10px] text-muted-foreground">
            {lane.fn} · capacité {lane.weekly} h/sem.
          </span>
        </span>
        <span className="ml-auto flex items-center gap-2">
          {over.length > 0 ? (
            <>
              <Chip tone="red">
                {over.length} semaine{over.length > 1 ? "s" : ""} en dépassement
              </Chip>
              <span className="text-[11px] font-semibold tabular-nums text-[#D92D20]">
                +{excessHours(lane)} h
              </span>
            </>
          ) : (
            <Chip tone="green">Dans la capacité</Chip>
          )}
        </span>
      </div>

      {/* Colonnes hebdomadaires */}
      <div className="mt-1.5 flex items-end gap-1 pl-8">
        {lane.load.map((h, i) => {
          const isOver = h > lane.weekly;
          return (
            <button
              key={CONFLICT_WEEKS[i]}
              type="button"
              onClick={onPick}
              title={`${CONFLICT_WEEKS[i]} — ${h} h sur ${lane.weekly} h`}
              className="group relative flex h-[46px] flex-1 items-end rounded-sm transition-colors hover:bg-muted"
            >
              {/* Trait de capacité : le repère qui rend le dépassement lisible. */}
              <span
                className="absolute left-0 right-0 border-t border-dashed border-[#98A2B3]"
                style={{ bottom: `${(lane.weekly / peak) * 100}%` }}
              />
              <span
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${(h / peak) * 100}%`,
                  backgroundColor: isOver ? "#D92D20" : lane.color,
                  opacity: isOver ? 1 : 0.45,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Tâches concurrentes, positionnées sur les mêmes semaines */}
      <div className="mt-1 space-y-0.5 pl-8">
        {lane.tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-1">
            {CONFLICT_WEEKS.map((w, i) => {
              const inside = i >= t.from && i < t.from + t.span;
              return (
                <span key={w} className="h-[13px] flex-1">
                  {inside ? (
                    <span
                      className="flex h-full items-center overflow-hidden rounded-sm px-1"
                      style={{ backgroundColor: `${lane.color}26` }}
                    >
                      {i === t.from ? (
                        <span
                          className="truncate text-[8px] font-semibold"
                          style={{ color: lane.color }}
                        >
                          {t.id} · {t.label}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modale                                                                     */
/* -------------------------------------------------------------------------- */

export function ConflictView({
  open,
  onClose,
  onOpenResource,
}: {
  open: boolean;
  onClose: () => void;
  onOpenResource: () => void;
}) {
  const [tab, setTab] = React.useState<"people" | "equipment">("people");

  React.useEffect(() => {
    if (open) setTab("people");
  }, [open]);

  const conflicted = CONFLICT_LANES.filter((l) => overWeeks(l).length > 0);
  const totalExcess = CONFLICT_LANES.reduce((n, l) => n + excessHours(l), 0);

  /** Semaine la plus tendue, tous acteurs confondus. */
  const worstWeek = React.useMemo(() => {
    const perWeek = CONFLICT_WEEKS.map((_, i) =>
      CONFLICT_LANES.reduce((n, l) => n + Math.max(0, l.load[i] - l.weekly), 0),
    );
    const max = Math.max(...perWeek);
    return max > 0 ? { week: CONFLICT_WEEKS[perWeek.indexOf(max)], hours: max } : null;
  }, []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-5xl"
      title="Risques & conflits — visualisation"
      subtitle="Charge hebdomadaire et concurrences détectées sur l'horizon des deux prochaines gates"
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3F2]">
          <AlertTriangle className="h-5 w-5 text-[#D92D20]" />
        </span>
      }
    >
      <div className="space-y-3">
        {/* Synthèse chiffrée */}
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              icon: <Users className="h-3.5 w-3.5" />,
              label: "Ressources en conflit",
              value: `${conflicted.length} / ${CONFLICT_LANES.length}`,
              color: conflicted.length > 0 ? "#D92D20" : "#2E7D32",
            },
            {
              icon: <Layers className="h-3.5 w-3.5" />,
              label: "Heures à replacer",
              value: `${totalExcess} h`,
              color: totalExcess > 0 ? "#D92D20" : "#2E7D32",
            },
            {
              icon: <CalendarRange className="h-3.5 w-3.5" />,
              label: "Semaine la plus tendue",
              value: worstWeek ? worstWeek.week : "—",
              color: "#E58A00",
            },
            {
              icon: <Wrench className="h-3.5 w-3.5" />,
              label: "Conflits de moyens",
              value: String(EQUIPMENT_CONFLICTS.length),
              color: EQUIPMENT_CONFLICTS.length > 0 ? "#D92D20" : "#2E7D32",
            },
          ].map((k) => (
            <Card key={k.label} className="px-3 py-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {k.icon}
                <span className="truncate text-[10px]">{k.label}</span>
              </span>
              <p className="mt-1 text-[18px] font-bold leading-none" style={{ color: k.color }}>
                {k.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Onglets */}
        <div className="flex gap-4 border-b border-border">
          {([
            ["people", `Charge des personnes (${conflicted.length})`],
            ["equipment", `Moyens partagés (${EQUIPMENT_CONFLICTS.length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`border-b-2 pb-1.5 text-[12px] font-medium transition-colors ${
                tab === key
                  ? "border-[#16A46B] text-[#0E7C52]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "people" ? (
          <>
            {/* En-tête des semaines, aligné sur les colonnes des frises */}
            <div className="flex items-center gap-1 pl-8">
              {CONFLICT_WEEKS.map((w) => (
                <span
                  key={w}
                  className="flex-1 text-center text-[9px] font-medium text-muted-foreground"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {CONFLICT_LANES.map((lane) => (
                <LoadLane key={lane.person} lane={lane} onPick={onOpenResource} />
              ))}
            </div>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-sm bg-[#D92D20]" />
                Au-delà de la capacité
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-sm bg-[#3976D3] opacity-45" />
                Dans la capacité
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 border-t border-dashed border-[#98A2B3]" />
                Capacité hebdomadaire
              </span>
            </div>
          </>
        ) : (
          <ul className="space-y-2">
            {EQUIPMENT_CONFLICTS.map((c) => (
              <li
                key={c.id}
                className={`rounded-lg border p-3 ${
                  c.level === "Critique"
                    ? "border-[#FECDCA] bg-[#FEF3F2]"
                    : "border-[#F8DEB0] bg-[#FEF9F0]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench
                    className={`h-4 w-4 shrink-0 ${
                      c.level === "Critique" ? "text-[#D92D20]" : "text-[#E58A00]"
                    }`}
                  />
                  <p className="min-w-0 flex-1 text-[12px] font-semibold text-foreground">
                    {c.resource}
                  </p>
                  <span className="text-[11px] tabular-nums text-muted-foreground">{c.weeks}</span>
                  <Chip tone={c.level === "Critique" ? "red" : "amber"}>{c.level}</Chip>
                </div>

                {/* Les deux demandes concurrentes, face à face. */}
                <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  {[c.a, c.b].map((side, i) => (
                    <React.Fragment key={side.project}>
                      {i === 1 ? (
                        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#D92D20]">
                          chevauchement {c.overlap}
                        </span>
                      ) : null}
                      <div className="min-w-0 rounded-md bg-white px-2.5 py-1.5">
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {side.task}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{side.project}</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] text-muted-foreground">
            {conflicted.length > 0 ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#D92D20]" />
                Arbitrage requis avant la gate G3 — Process Freeze.
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#2E7D32]" />
                Aucun dépassement sur l&apos;horizon.
              </>
            )}
          </p>
          <Button onClick={onClose}>Fermer</Button>
          <Button variant="primary" onClick={onOpenResource}>
            Analyser et arbitrer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
