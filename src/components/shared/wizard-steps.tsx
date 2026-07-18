"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  "Identité du projet",
  "Planning & ressources",
  "Prévisualisation & génération",
];

/** Three-step header shared by the "Créer un nouveau projet" screens. */
export function WizardSteps({ current }: { current: 1 | 2 | 3 }) {
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
                active && "bg-[#B45F09] text-white",
                !done && !active && "border border-border bg-white text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : step}
            </span>
            <span
              className={cn(
                "ml-2.5 whitespace-nowrap text-[13px] font-semibold",
                active ? "text-[#B45F09]" : done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="mx-4 h-px min-w-0 flex-1 bg-border" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
