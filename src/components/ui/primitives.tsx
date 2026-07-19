"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/* --------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "outline" | "ghost" | "blue" | "amber";

export function Button({
  variant = "outline",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#B45F09] text-white hover:bg-[#9A5008] border border-transparent shadow-sm",
    amber:
      "bg-[#E07B18] text-white hover:bg-[#C96C12] border border-transparent shadow-sm",
    blue: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] border border-transparent shadow-sm",
    outline:
      "bg-white text-[#B45F09] border border-[#EFE2CE] hover:bg-[#FDF7EF] shadow-sm",
    ghost: "bg-transparent text-foreground border border-transparent hover:bg-muted",
  };
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-card",
        className,
      )}
      {...props}
    />
  );
}

/** Card with a compact title row; the body scrolls on its own when needed. */
export function Panel({
  title,
  icon,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("flex min-h-0 flex-col overflow-hidden", className)}>
      {title ? (
        <div className="flex shrink-0 items-center gap-2 px-3.5 pb-1.5 pt-3">
          {icon}
          <span className="text-[13px] font-semibold text-foreground">{title}</span>
          {action ? <div className="ml-auto">{action}</div> : null}
        </div>
      ) : null}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-3.5 pb-3 scrollbar-thin",
          !title && "pt-3",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </Card>
  );
}

/* ---------------------------------- Chip ---------------------------------- */

const CHIP_TONES = {
  red: "bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]",
  amber: "bg-[#FEF6E7] text-[#E58A00] border-[#F8DEB0]",
  green: "bg-[#ECFDF3] text-[#2E7D32] border-[#BBF0CB]",
  blue: "bg-[#EFF6FF] text-[#3976D3] border-[#C7DBF8]",
  slate: "bg-[#F5F6F8] text-[#667085] border-[#E4E7EC]",
  bronze: "bg-[#FDF4E7] text-[#B45F09] border-[#F0DFC4]",
} as const;

export type ChipTone = keyof typeof CHIP_TONES;

export function Chip({
  tone = "slate",
  className,
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        CHIP_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Coloured dot + label, used in tables and legends. */
export function Dot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  );
}

/* --------------------------------- Avatar --------------------------------- */

export function Avatar({
  initials,
  className,
  color = "#B45F09",
}: {
  initials: string;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
        className,
      )}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {initials}
    </span>
  );
}

/* --------------------------------- Progress ------------------------------- */

export function Bar({
  value,
  color = "#B45F09",
  className,
  track = "#EFF1F4",
}: {
  value: number;
  color?: string;
  className?: string;
  track?: string;
}) {
  return (
    <span
      className={cn("block h-1.5 w-full overflow-hidden rounded-full", className)}
      style={{ backgroundColor: track }}
    >
      <span
        className="block h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </span>
  );
}

/* ------------------------------- Form fields ------------------------------ */

export function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
        {label}
        {required ? <span className="ml-0.5 text-[#D92D20]">*</span> : null}
      </label>
      {children}
    </div>
  );
}

const CONTROL =
  "h-9 w-full rounded-lg border border-input bg-white px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:border-[#E5A11B] focus:outline-none focus:ring-1 focus:ring-[#E5A11B]";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

/** "12/01/2027" → "2027-01-12" (format attendu par `input[type=date]`). */
function frToIso(value: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : value;
}

/**
 * Champ date : ouvre le calendrier natif du navigateur. La valeur est fournie
 * au format français, la conversion ISO est faite ici.
 */
export function DateInput({
  defaultValue,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "defaultValue"> & {
  defaultValue?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = ref.current;
    if (!el) return;
    // showPicker() n'est pas universel : on retombe sur le focus si absent.
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* certains navigateurs refusent hors interaction directe */
      }
    }
    el.focus();
  };

  return (
    <span className="relative block">
      <button
        type="button"
        onClick={openPicker}
        aria-label="Ouvrir le calendrier"
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#B45F09]"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      </button>
      <input
        ref={ref}
        type="date"
        defaultValue={defaultValue ? frToIso(defaultValue) : undefined}
        className={cn(CONTROL, "date-field cursor-pointer px-1.5 pl-7", className)}
        {...props}
      />
    </span>
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, "appearance-none pr-7", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        CONTROL,
        "h-auto resize-none py-2 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

/* --------------------------------- Modal ---------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  width = "max-w-3xl",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-[#101828]/25"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[calc(100vh-3rem)] w-full animate-zoom-in flex-col overflow-hidden rounded-2xl bg-white shadow-modal",
          width,
        )}
      >
        <div className="flex shrink-0 items-start gap-3 px-6 pb-3 pt-5">
          {icon}
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}
