import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Noura Trabelsi" → "NT" */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** 10630 → "10 630" (narrow no-break space, French convention). */
export function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR").replace(/ | /g, " ");
}
