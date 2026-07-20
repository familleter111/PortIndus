"use client";

import * as React from "react";
import { Lock, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/primitives";

/**
 * Mot de passe de la démonstration.
 *
 * ⚠️ Ce n'est PAS une sécurité. L'application est entièrement front-end : cette
 * chaîne part dans le bundle JavaScript envoyé au navigateur et reste lisible
 * par quiconque ouvre les outils de développement. Elle sert uniquement à
 * éviter qu'un visiteur de passage tombe sur la démo par hasard.
 */
const DEMO_PASSWORD = "industryx0";

/** Clé de session : le déverrouillage vaut pour l'onglet courant. */
const SESSION_KEY = "portindus-access";

export function AccessGate({ children }: { children: React.ReactNode }) {
  // Verrouillé par défaut, côté serveur comme au premier rendu client : l'écran
  // s'affiche donc immédiatement flouté, sans page blanche intermédiaire.
  const [unlocked, setUnlocked] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // sessionStorage n'existe pas au rendu serveur : on relit l'état après montage.
  React.useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) === "granted") setUnlocked(true);
  }, []);

  React.useEffect(() => {
    if (!unlocked) inputRef.current?.focus();
  }, [unlocked]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === DEMO_PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, "granted");
      setUnlocked(true);
      setError(false);
      return;
    }
    // Mot de passe refusé : on efface le champ et on attend une nouvelle saisie.
    setError(true);
    setValue("");
    inputRef.current?.focus();
  };

  if (unlocked) return <>{children}</>;

  return (
    <>
      {/* L'application reste visible, floutée et inerte, derrière le voile. */}
      <div
        aria-hidden
        className="h-full pointer-events-none select-none blur-[7px]"
        tabIndex={-1}
      >
        {children}
      </div>

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 p-4">
        <form
          onSubmit={submit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
          className="w-full max-w-[380px] rounded-2xl border border-border bg-white p-6 shadow-modal"
        >
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8FBF1]">
              <Lock className="h-6 w-6 text-[#0E7C52]" />
            </span>
            <h1 id="gate-title" className="mt-3 text-[19px] font-bold text-foreground">
              Accès à la démonstration
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Saisissez le mot de passe pour ouvrir PortIndus.
            </p>
          </div>

          <label htmlFor="gate-password" className="sr-only">
            Mot de passe
          </label>
          <input
            id="gate-password"
            ref={inputRef}
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(false);
            }}
            placeholder="Mot de passe"
            aria-invalid={error}
            aria-describedby={error ? "gate-error" : undefined}
            className={`mt-5 h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
              error
                ? "border-[#D92D20] focus:border-[#D92D20] focus:ring-[#D92D20]"
                : "border-input focus:border-[#16A46B] focus:ring-[#16A46B]"
            }`}
          />

          {error ? (
            <p
              id="gate-error"
              role="alert"
              className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#D92D20]"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Mot de passe incorrect.
            </p>
          ) : null}

          <Button type="submit" variant="primary" className="mt-4 w-full justify-center">
            Déverrouiller
          </Button>
        </form>
      </div>
    </>
  );
}
