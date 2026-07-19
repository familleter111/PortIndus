"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * Menu contextuel rendu dans un portail. Indispensable ici : les cartes du
 * planning sont en `overflow-hidden`, un menu positionné à l'intérieur s'y
 * ferait rogner. Il se replie vers le haut ou la gauche quand la place manque.
 */
export function FloatingMenu({
  x,
  y,
  onClose,
  className,
  children,
}: {
  /** Coordonnées viewport, telles que fournies par `clientX` / `clientY`. */
  x: number;
  y: number;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);

  React.useEffect(() => setMounted(true), []);

  // On mesure après montage : la hauteur dépend du contenu du menu.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const margin = 8;
    let left = x;
    let top = y;
    if (left + width > window.innerWidth - margin) left = x - width;
    if (top + height > window.innerHeight - margin) top = y - height;
    setPos({ left: Math.max(margin, left), top: Math.max(margin, top) });
  }, [x, y, mounted]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onClose);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="menu"
        onClick={(e) => e.stopPropagation()}
        style={{
          left: pos?.left ?? x,
          top: pos?.top ?? y,
          // Invisible tant que la position n'est pas corrigée, sinon le menu
          // apparaîtrait une frame au mauvais endroit.
          visibility: pos ? "visible" : "hidden",
        }}
        className={cn(
          "fixed z-[61] max-h-[85vh] overflow-y-auto rounded-lg border border-border bg-white shadow-modal scrollbar-thin",
          className,
        )}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
