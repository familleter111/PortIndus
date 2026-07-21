"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  Database,
  FileText,
  Info,
  Sparkles,
  Timer,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ReportSteps, TemplateThumb, Toggle } from "@/components/reports/report-parts";
import { PageTitle } from "@/components/shared/page-parts";
import {
  Button,
  Card,
  Chip,
  DateInput,
  Field,
  Input,
  Panel,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import {
  APQP_GATES,
  PORTFOLIO_CLIENTS,
  PORTFOLIO_CLIENTS_LABEL,
  PORTFOLIO_GATES_LABEL,
  PROJECTS,
  REPORT_CONFIDENTIALITY,
  REPORT_LANGUAGES,
  REPORT_PERIODS,
  REPORT_SOURCES,
  REPORT_TEMPLATES,
  REPORT_TONES,
  gateLabel,
  reportTemplate,
  type ReportTemplateId,
  type ReportToneName,
} from "@/lib/data";
import { autoName, defaultParams, gatesForProject } from "@/lib/report-content";
import { useReportDraft } from "@/lib/report-draft";

const MAX_INSTRUCTIONS = 1000;

export default function NouveauRapportPage() {
  const router = useRouter();
  const { draft, setDraft, patchParams } = useReportDraft();
  const params = draft.params;
  const spec = reportTemplate(params.template);
  const portfolio = spec.scope === "portefeuille";

  const project = PROJECTS.find((p) => p.id === params.scopeId);
  const client = portfolio ? PORTFOLIO_CLIENTS_LABEL : (project?.client ?? "—");

  /*
   * Un brouillon enregistré avant ce libellé porte encore « — » comme gate :
   * on le remet au périmètre réel, sinon le champ afficherait une valeur qui
   * n'est plus dans la liste.
   */
  React.useEffect(() => {
    if (portfolio && params.gate !== PORTFOLIO_GATES_LABEL) {
      patchParams({ gate: PORTFOLIO_GATES_LABEL });
    }
  }, [portfolio, params.gate, patchParams]);

  /*
   * Le nom suit le périmètre tant qu'il n'a pas été retouché à la main. Sans
   * cela, changer de projet laisserait en tête du rapport le nom du précédent.
   */
  const renameIfAuto = (next: typeof params) =>
    params.name === autoName(params) ? { ...next, name: autoName(next) } : next;

  const changeTemplate = (id: ReportTemplateId) => {
    const base = defaultParams(id);
    setDraft((d) => ({
      ...d,
      params: {
        ...base,
        // Ce qui ne dépend pas du modèle est conservé.
        reviewDate: d.params.reviewDate,
        period: d.params.period,
        language: d.params.language,
      },
    }));
  };

  const set = (patch: Partial<typeof params>) =>
    patchParams(renameIfAuto({ ...params, ...patch }));

  const generate = () => {
    setDraft((d) => ({ ...d, generated: false }));
    router.push("/rapports/generation");
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Créer un rapport"
          subtitle="Sélectionnez votre modèle et configurez les paramètres de génération."
        />

        <ReportSteps current={2} />

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          <div className="col-span-9 flex min-h-0 flex-col gap-2.5 overflow-y-auto pr-0.5 scrollbar-thin">
            {/* --------------------------------------- 1. Modèle */}
            <Panel
              title="1. Choisissez un modèle de rapport"
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              className="shrink-0"
            >
              <div className="grid grid-cols-3 gap-2.5">
                {REPORT_TEMPLATES.map((t) => {
                  const active = t.id === params.template;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => changeTemplate(t.id)}
                      aria-pressed={active}
                      className={`flex flex-col rounded-xl border p-2.5 text-left transition-colors ${
                        active
                          ? "border-[#16A46B] bg-[#F6FBF8] ring-1 ring-[#16A46B]"
                          : "border-border bg-card hover:border-[#BFEFD5] hover:bg-[#FBFEFC]"
                      }`}
                    >
                      <span className="mb-2 flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            active ? "border-[#0E7C52] bg-[#0E7C52]" : "border-[#D0D5DD] bg-white"
                          }`}
                        >
                          {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-foreground">
                          {t.name}
                        </span>
                      </span>
                      <TemplateThumb id={t.id} className="h-[92px]" />
                      <span className="mt-1.5 block min-h-[28px] text-[11px] leading-snug text-muted-foreground">
                        {t.tagline}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <Chip tone={active ? "action" : "slate"}>Idéal pour : {t.audience}</Chip>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>

            {/* --------------------------------- 2. Paramètres */}
            <Panel
              title="2. Paramètres du rapport"
              icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
              className="shrink-0"
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="space-y-2">
                  <Field label="Nom du rapport" required>
                    <Input
                      value={params.name}
                      onChange={(e) => patchParams({ name: e.target.value })}
                    />
                  </Field>

                  <Field label="Périmètre" required>
                    <Select
                      value={params.scopeId}
                      disabled={portfolio}
                      title={
                        portfolio
                          ? "Ce modèle couvre l'ensemble du portefeuille"
                          : "Projet sur lequel porte la revue"
                      }
                      onChange={(e) => set({ scopeId: e.target.value })}
                    >
                      {portfolio ? (
                        <option value="PORTFOLIO">Portefeuille global</option>
                      ) : (
                        PROJECTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id} — {p.name}
                          </option>
                        ))
                      )}
                    </Select>
                  </Field>

                  <Field label="Client">
                    {/* Déduit du projet : le saisir permettrait de contredire la fiche. */}
                    <Input
                      value={client}
                      readOnly
                      disabled
                      title={
                        portfolio
                          ? `Donneurs d'ordre couverts : ${PORTFOLIO_CLIENTS.join(", ")}`
                          : "Déduit du projet choisi"
                      }
                    />
                  </Field>

                  <Field label="Gate / Phase" required>
                    <Select
                      value={params.gate}
                      disabled={portfolio}
                      onChange={(e) => set({ gate: e.target.value })}
                    >
                      {portfolio ? (
                        <option value={PORTFOLIO_GATES_LABEL}>{PORTFOLIO_GATES_LABEL}</option>
                      ) : (
                        gatesForProject().map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.id} — {g.label}
                          </option>
                        ))
                      )}
                    </Select>
                  </Field>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Date de revue" required>
                      <DateInput
                        defaultValue={params.reviewDate}
                        onChange={(e) => {
                          const [y, m, d] = e.target.value.split("-");
                          if (y && m && d) patchParams({ reviewDate: `${d}/${m}/${y}` });
                        }}
                      />
                    </Field>
                    <Field label="Langue" required>
                      <Select
                        value={params.language}
                        onChange={(e) => patchParams({ language: e.target.value })}
                      >
                        {REPORT_LANGUAGES.map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field label="Période" required>
                    <Select
                      value={params.period}
                      onChange={(e) => set({ period: e.target.value })}
                    >
                      {REPORT_PERIODS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="space-y-2">
                  <Field label="Niveau de confidentialité" required>
                    <Select
                      value={params.confidentiality}
                      onChange={(e) => patchParams({ confidentiality: e.target.value })}
                    >
                      {REPORT_CONFIDENTIALITY.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Ton du rapport">
                    <Select
                      value={params.tone}
                      onChange={(e) => patchParams({ tone: e.target.value as ReportToneName })}
                    >
                      {REPORT_TONES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>

                  <div className="rounded-lg border border-border px-2 py-1.5">
                    <p className="mb-0.5 px-1 text-[11px] font-medium text-muted-foreground">
                      Contenu inclus
                    </p>
                    <Toggle
                      checked={params.includeKpis}
                      onChange={(v) => patchParams({ includeKpis: v })}
                      label="Inclure les indicateurs"
                      hint="Bloc KPI en tête de rapport"
                    />
                    <Toggle
                      checked={params.includeRisks}
                      onChange={(v) => patchParams({ includeRisks: v })}
                      label="Inclure les risques"
                      hint="Tableau des risques et actions"
                    />
                    <Toggle
                      checked={params.includeComments}
                      onChange={(v) => patchParams({ includeComments: v })}
                      label="Inclure les commentaires"
                      hint="Commentaires de revue en annexe"
                    />
                  </div>

                  <Field label="Instructions complémentaires pour l'IA">
                    <Textarea
                      rows={4}
                      maxLength={MAX_INSTRUCTIONS}
                      placeholder="Précisions sur le contexte, points clés à mettre en avant, niveau de détail attendu…"
                      value={params.instructions}
                      onChange={(e) => patchParams({ instructions: e.target.value })}
                    />
                  </Field>
                  <p className="-mt-1 text-right text-[10px] text-muted-foreground">
                    {params.instructions.length} / {MAX_INSTRUCTIONS}
                  </p>
                </div>
              </div>
            </Panel>
          </div>

          {/* ------------------------------- Résumé de génération */}
          <Panel
            title="Résumé de génération"
            icon={<Database className="h-4 w-4 text-muted-foreground" />}
            className="col-span-3"
          >
            <Card className="flex items-center gap-2 p-2">
              <TemplateThumb id={params.template} className="h-[46px] w-[62px] shrink-0 p-1" />
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-foreground">
                  {spec.name}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                  {spec.tagline}
                </span>
              </span>
            </Card>

            <p className="mt-2.5 text-[11px] font-medium text-muted-foreground">
              Sources de données utilisées
            </p>
            <ul className="mt-1 space-y-1">
              {REPORT_SOURCES.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-[11px] text-foreground">
                  <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-[#2E7D32]" />
                  <span className="min-w-0 flex-1 leading-snug">{s}</span>
                </li>
              ))}
            </ul>

            <p className="mt-2.5 text-[11px] font-medium text-muted-foreground">
              Sections produites
            </p>
            <ul className="mt-1 space-y-0.5">
              {spec.sections.map((s, i) => (
                <li key={s.id} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-3 shrink-0 text-right tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground">{s.title}</span>
                  <span className="shrink-0 text-[9px] text-muted-foreground">
                    {s.kind === "text" ? "texte" : "données"}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-2.5 py-2">
              <Timer className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-[11px] leading-snug text-foreground">
                Temps estimé
                <span className="block text-muted-foreground">
                  ~ {Math.round(spec.estimate[0] / 60)} à {Math.round(spec.estimate[1] / 60)} minutes
                </span>
              </span>
            </div>

            {!portfolio && project ? (
              <div className="mt-2 rounded-lg border border-[#BFEFD5] bg-[#F1FCF6] p-2.5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#0E7C52]">
                  <Info className="h-3.5 w-3.5" />
                  {gateLabel(params.gate)}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {APQP_GATES.some((g) => g.id === params.gate)
                    ? `Le rapport reprendra les livrables de cette gate pour ${project.name}, ainsi que ses risques et son avancement.`
                    : "Gate hors référentiel."}
                </p>
              </div>
            ) : null}
          </Panel>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button onClick={() => router.push("/rapports")}>
            <ChevronLeft className="h-4 w-4" />
            Retour aux modèles
          </Button>
          <Button
            variant="ghost"
            className="ml-auto border-border"
            onClick={() => router.push("/rapports")}
          >
            Annuler
          </Button>
          <Button variant="primary" onClick={generate} disabled={!params.name.trim()}>
            <Sparkles className="h-4 w-4" />
            Générer avec l&apos;IA
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
