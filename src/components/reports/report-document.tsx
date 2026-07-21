"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Sparkles } from "lucide-react";

import {
  Block,
  DecisionPill,
  Donut,
  DonutLegend,
  GateDot,
  GateLegend,
  KpiCell,
  LightBlock,
  LoadTrend,
  MiniBar,
  REPORT_GREEN,
  REPORT_GREY,
  REPORT_RED,
  StackedBars,
  StatusPill,
  VBars,
} from "@/components/reports/report-charts";
import {
  APQP_GATES,
  CAPACITY_TOTAL,
  type ReportTemplateId,
} from "@/lib/data";
import {
  DECISION_COLOR,
  DECISION_SHORT,
  contributionSplit,
  criticalitySplit,
  decisionConditions,
  decisionSplit,
  gateRail,
  healthSplit,
  kpiBlock,
  loadTrend,
  nextSteps,
  participants,
  passCriteria,
  portfolioRows,
  readinessByGate,
  reviewVotes,
  textLines,
  topRisks,
  upcomingGates,
  type BuiltReport,
  type ReportFacts,
  type ReportParams,
} from "@/lib/report-content";
import { cn } from "@/lib/utils";

/**
 * Le rapport tel qu'il sortira en PDF.
 *
 * Une page par écran de suivi de gate, sur le modèle des tableaux de bord
 * qu'un COMEX ou un client APQP attend : tout l'essentiel visible d'un coup
 * d'œil, sans dérouler un texte. Ce que l'IA rédige — synthèse, commentaires,
 * décision — reste modifiable et l'affiche ; ce qui vient des données ne l'est
 * pas, un rapport dont on pourrait retoucher les chiffres ne vaudrait rien en
 * revue client.
 */

/** Nombre de pages produites par un modèle, sans construire le rapport. */
export function pageCount(template: ReportTemplateId): number {
  return template === "decision" ? 4 : 1;
}

/** Sur quelle page se trouve une section modifiable — pour la navigation. */
export function pageOfSection(template: ReportTemplateId, id: string): number {
  if (template !== "decision") return 1;
  if (id === "synthese") return 1;
  if (id === "reco") return 3;
  return 4; // conclusion
}

/* --------------------------------- Texte ----------------------------------- */

function TextBlock({
  n,
  title,
  text,
  selected,
  edited,
  onSelect,
  className,
}: {
  n?: number;
  title: string;
  text: string;
  selected?: boolean;
  edited?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const lines = textLines(text);
  const clickable = Boolean(onSelect);
  return (
    <Block
      n={n}
      title={title}
      className={className}
      action={
        edited ? (
          <span className="flex items-center gap-1 text-[7.5px] font-semibold text-[#5EDE99]">
            <Pencil className="h-2 w-2" />
            Modifié
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[7.5px] font-medium text-white/60">
            <Sparkles className="h-2 w-2" />
            Rédigé par l&apos;IA
          </span>
        )
      }
    >
      <div
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={onSelect}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.();
                }
              }
            : undefined
        }
        className={cn(
          "h-full space-y-1 rounded-[4px] p-1",
          selected && "bg-[#F6FBF8] ring-1 ring-[#16A46B]",
          clickable && !selected && "cursor-pointer hover:bg-[#FBFEFC]",
        )}
      >
        {lines.map((l, i) => (
          <p
            key={i}
            className={cn(
              "flex items-start gap-1 text-[9px] leading-snug text-[#344054]",
              !l.bullet && "block",
            )}
          >
            {l.bullet ? <span className="mt-[3px] text-[#16A46B]">•</span> : null}
            <span>{l.text.replace(/^\d+\.\s*/, "")}</span>
          </p>
        ))}
      </div>
    </Block>
  );
}

/* -------------------------------- En-tête ----------------------------------- */

function DocHeader({
  eyebrow,
  title,
  version,
  date,
  confidentiality,
  decision,
}: {
  eyebrow: string;
  title: string;
  version: string;
  date: string;
  confidentiality: string;
  decision?: { label: string; color: string; reason: string };
}) {
  return (
    <div className="flex items-start gap-3 pb-2">
      <Image
        src="/portfolio.png"
        alt="Portfolio"
        width={800}
        height={188}
        className="mt-1 h-auto w-[78px] shrink-0 object-contain"
      />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[19px] font-bold uppercase leading-tight tracking-tight text-[#101828]">
          {title}
        </h1>
        <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-wide text-[#667085]">
          {eyebrow}
        </p>
      </div>
      {decision ? (
        <div
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-[6px] px-3 py-1.5 text-white"
          style={{ backgroundColor: "#101828" }}
        >
          <span className="text-[7.5px] font-semibold uppercase tracking-wide text-white/70">
            Décision proposée
          </span>
          <span className="flex items-center gap-1.5 text-[15px] font-extrabold" style={{ color: decision.color }}>
            {decision.label}
          </span>
        </div>
      ) : (
        <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-0.5 text-[8px] text-[#667085]">
          <span>Date : <b className="text-[#101828]">{date}</b></span>
          <span>Version : <b className="text-[#101828]">{version}</b></span>
          <span className="col-span-2">Confidentialité : <b className="text-[#101828]">{confidentiality}</b></span>
        </div>
      )}
    </div>
  );
}

function Footer({ page, pages }: { page: number; pages: number }) {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-[#EAECF0] pt-1 text-[7.5px] text-[#98A2B3]">
      <span>APQP 360° — Généré automatiquement à partir des données projet</span>
      <span>Document confidentiel — diffusion restreinte</span>
      <span>
        Page {page} / {pages}
      </span>
    </div>
  );
}

/** Cadre de page A4 paysage, commun aux quatre modèles. */
function Sheet({
  page,
  pages,
  className,
  children,
  bare,
}: {
  page: number;
  pages: number;
  className?: string;
  children: React.ReactNode;
  bare?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[480px] w-[720px] flex-col bg-white px-6 py-4",
        !bare && "rounded-lg border border-border shadow-card",
        className,
      )}
    >
      {children}
      <Footer page={page} pages={pages} />
    </div>
  );
}

/* ---------------------------- Éditabilité commune --------------------------- */

interface EditCtx {
  selected?: string;
  onSelect?: (id: string) => void;
  editedIds: string[];
}

function textProps(ctx: EditCtx, id: string, text: string) {
  return {
    text,
    selected: ctx.selected === id,
    edited: ctx.editedIds.includes(id),
    onSelect: ctx.onSelect ? () => ctx.onSelect?.(id) : undefined,
  };
}

/* ------------------------------ Page « direction » --------------------------- */

function DirectionPage({
  report,
  params,
  version,
  date,
  ctx,
  bare,
}: {
  report: BuiltReport;
  params: ReportParams;
  version: string;
  date: string;
  ctx: EditCtx;
  bare?: boolean;
}) {
  const f = report.facts;
  const kpis = kpiBlock(f);
  const health = healthSplit();
  const readiness = readinessByGate().filter((r) => r.count > 0);
  const gates = upcomingGates().slice(0, 6);
  const risks = topRisks().slice(0, 5);
  const trend = loadTrend(12);
  const rows = portfolioRows();
  const text = (id: string) => report.sections.find((s) => s.id === id)?.text;

  return (
    <Sheet page={1} pages={1} bare={bare}>
      <DocHeader
        eyebrow={`Pilotage global des projets & performance — ${params.period.split(" (")[0]}`}
        title={params.name}
        version={version}
        date={date}
        confidentiality={params.confidentiality}
      />

      {kpis.length ? (
        <div className="mb-1.5 grid grid-cols-6 divide-x divide-[#EAECF0] rounded-[6px] border border-[#EAECF0]">
          {kpis.map((k) => (
            <KpiCell key={k.label} {...k} />
          ))}
        </div>
      ) : null}

      <div className="mb-1.5 grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <LightBlock title="Vue synthèse du portefeuille" className="col-span-6" bodyClassName="overflow-hidden">
          <table className="w-full text-[7.5px]">
            <thead>
              <tr className="text-left text-[#98A2B3]">
                {["Projet", "Client", "Phase", "Prochain gate", "Readiness", "Santé"].map((h) => (
                  <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 7).map(({ p }) => (
                <tr key={p.id} className="border-b border-[#F2F4F7]">
                  <td className="py-0.5 pr-1 font-semibold text-[#101828]">{p.id}</td>
                  <td className="py-0.5 pr-1 text-[#667085]">{p.client}</td>
                  <td className="py-0.5 pr-1 text-[#667085]">{p.phase}</td>
                  <td className="py-0.5 pr-1 text-[#667085]">{p.nextGate.split(" ")[0]}</td>
                  <td className="w-[52px] py-0.5 pr-1">
                    <span className="flex items-center gap-1">
                      <span className="w-5 shrink-0 text-right font-semibold text-[#101828]">
                        {p.readiness}%
                      </span>
                      <MiniBar value={p.readiness} />
                    </span>
                  </td>
                  <td className="py-0.5">
                    <span
                      className="inline-block h-[7px] w-[7px] rounded-full"
                      style={{
                        backgroundColor:
                          p.health === "red" ? REPORT_RED : p.health === "orange" ? "#E58A00" : REPORT_GREEN,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </LightBlock>

        <LightBlock title="Répartition des projets par statut" className="col-span-3">
          <div className="flex h-full items-center gap-2">
            <Donut
              segments={health.map((h) => ({ label: h.name, value: h.value, color: h.color }))}
              size={70}
              thickness={11}
              center={health.reduce((n2, h) => n2 + h.value, 0)}
              sub="projets"
            />
            <DonutLegend
              segments={health.map((h) => ({
                label: h.name,
                value: h.value,
                color: h.color,
                note: `${h.pct}%`,
              }))}
            />
          </div>
        </LightBlock>

        <LightBlock title="Readiness moyen par phase APQP" className="col-span-3">
          <VBars
            items={readiness.map((r) => ({
              label: APQP_GATES.find((g) => g.id === r.gate)?.label.split(" ")[0] ?? r.gate,
              value: r.value,
              color: r.value >= 70 ? REPORT_GREEN : r.value >= 50 ? "#E58A00" : REPORT_RED,
            }))}
            height={70}
          />
        </LightBlock>
      </div>

      <div className="mb-1.5 grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <LightBlock title="Calendrier des gates à venir" className="col-span-4" bodyClassName="overflow-hidden">
          <table className="w-full text-[7.5px]">
            <thead>
              <tr className="text-left text-[#98A2B3]">
                {["Gate", "Projet", "Date cible", "Readiness", "Décision"].map((h) => (
                  <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gates.map((g) => (
                <tr key={g.project.id} className="border-b border-[#F2F4F7]">
                  <td className="py-0.5 pr-1 font-semibold text-[#101828]">{g.gate}</td>
                  <td className="py-0.5 pr-1 text-[#667085]">{g.project.id}</td>
                  <td className="py-0.5 pr-1 tabular-nums text-[#667085]">{g.date}</td>
                  <td className="py-0.5 pr-1 tabular-nums text-[#101828]">{g.readiness}%</td>
                  <td className="py-0.5">
                    <DecisionPill label={DECISION_SHORT[g.decision]} color={DECISION_COLOR[g.decision]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </LightBlock>

        <LightBlock title="Top risques portefeuille" className="col-span-4" bodyClassName="overflow-hidden">
          <table className="w-full text-[7.5px]">
            <thead>
              <tr className="text-left text-[#98A2B3]">
                {["Risque", "Criticité", "Analyse"].map((h) => (
                  <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className="border-b border-[#F2F4F7]">
                  <td className="py-0.5 pr-1 font-medium text-[#101828]">{r.label}</td>
                  <td className="py-0.5 pr-1">
                    <span
                      className="font-semibold"
                      style={{ color: r.level === "Critique" ? REPORT_RED : r.level === "Majeur" ? "#E58A00" : "#667085" }}
                    >
                      {r.level}
                    </span>
                  </td>
                  <td className="truncate py-0.5 text-[#667085]">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </LightBlock>

        <LightBlock title={`Charge vs capacité (${CAPACITY_TOTAL.ratio}% global)`} className="col-span-4">
          <LoadTrend points={trend} width={220} height={82} />
        </LightBlock>
      </div>

      <div className="grid grid-cols-12 gap-1.5" style={{ height: 92 }}>
        {text("synthese") !== undefined ? (
          <TextBlock n={1} title="Insights clés" className="col-span-4" {...textProps(ctx, "synthese", text("synthese")!)} />
        ) : null}
        {text("reco") !== undefined ? (
          <TextBlock n={2} title="Recommandations" className="col-span-4" {...textProps(ctx, "reco", text("reco")!)} />
        ) : null}
        {text("conclusion") !== undefined ? (
          <TextBlock n={3} title="Décisions attendues" className="col-span-4" {...textProps(ctx, "conclusion", text("conclusion")!)} />
        ) : null}
      </div>
    </Sheet>
  );
}

/* ----------------------------- Page « gate client » --------------------------- */

function GateClientPage({
  report,
  params,
  version,
  date,
  ctx,
  bare,
}: {
  report: BuiltReport;
  params: ReportParams;
  version: string;
  date: string;
  ctx: EditCtx;
  bare?: boolean;
}) {
  const f = report.facts;
  const p = f.project!;
  const criteria = passCriteria(f);
  const rail = gateRail(p);
  const kpis = kpiBlock(f);
  const text = (id: string) => report.sections.find((s) => s.id === id)?.text;

  return (
    <Sheet page={1} pages={1} bare={bare}>
      <DocHeader
        eyebrow={`Revue de gate — ${p.name} — ${p.client}`}
        title={f.gateTitle}
        version={version}
        date={date}
        confidentiality={params.confidentiality}
      />

      <div className="mb-1.5 grid grid-cols-6 gap-x-3 rounded-[6px] border border-[#EAECF0] px-3 py-1.5 text-[8px]">
        {[
          { k: "Programme", v: p.name },
          { k: "Chef de projet", v: p.manager },
          { k: "Phase actuelle", v: p.phase },
          { k: "Prochain gate", v: `${p.nextGate.split(" ")[0]} (${p.forecast})` },
          { k: "Date cible", v: p.forecast },
          { k: "Participants", v: participants(f).join(", ") },
        ].map((r) => (
          <div key={r.k} className="min-w-0">
            <p className="truncate text-[#98A2B3]">{r.k}</p>
            <p className="truncate font-semibold text-[#101828]">{r.v}</p>
          </div>
        ))}
      </div>

      <div className="mb-1.5 grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        {text("synthese") !== undefined ? (
          <TextBlock n={1} title="Synthèse exécutive" className="col-span-4" {...textProps(ctx, "synthese", text("synthese")!)} />
        ) : null}

        <LightBlock title="Statut des livrables obligatoires" className="col-span-5" bodyClassName="overflow-hidden">
          <table className="w-full text-[7.5px]">
            <thead>
              <tr className="text-left text-[#98A2B3]">
                {["Livrable", "Statut", "Propriétaire", "Échéance", "Readiness"].map((h) => (
                  <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.deliverables.slice(0, 7).map((l) => (
                <tr key={l.d.id} className="border-b border-[#F2F4F7]">
                  <td className="max-w-[110px] truncate py-0.5 pr-1 text-[#101828]">{l.d.name}</td>
                  <td className="py-0.5 pr-1">
                    <StatusPill status={l.status} />
                  </td>
                  <td className="py-0.5 pr-1 text-[#667085]">{l.d.owner}</td>
                  <td className="py-0.5 pr-1 tabular-nums text-[#667085]">{l.d.dueDate}</td>
                  <td className="w-[46px] py-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-6 shrink-0 text-right font-semibold text-[#101828]">
                        {l.d.progress}%
                      </span>
                      <MiniBar value={l.d.progress} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </LightBlock>

        <LightBlock title="Risques & actions" className="col-span-3">
          <div className="flex flex-col items-center gap-1">
            <Donut
              segments={[
                { label: "Critiques", value: PLAN_LEVEL(f, "Critique"), color: REPORT_RED },
                { label: "Élevés", value: PLAN_LEVEL(f, "Majeur"), color: "#E58A00" },
                { label: "Moyens", value: PLAN_LEVEL(f, "Mineur"), color: "#E9C46A" },
                { label: "Faibles", value: PLAN_LEVEL(f, "Faible"), color: REPORT_GREY },
              ]}
              size={64}
              thickness={10}
              center={topRisks().length}
            />
            <ul className="w-full space-y-0.5">
              {decisionConditions(f).slice(0, 2).map((c) => (
                <li key={c.action} className="text-[7px] leading-tight text-[#344054]">
                  <span className="font-semibold text-[#101828]">{c.action}</span> · {c.owner} ·{" "}
                  <span className="tabular-nums">{c.due}</span>
                </li>
              ))}
            </ul>
          </div>
        </LightBlock>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <LightBlock title="Avancement par phase APQP" className="col-span-4">
          <div className="flex items-center justify-between px-1">
            {rail.map((g) => (
              <div key={g.id} className="flex flex-col items-center gap-0.5">
                <GateDot state={g.state} size={16} />
                <span className="text-[6.5px] font-semibold text-[#667085]">{g.id}</span>
              </div>
            ))}
          </div>
          <div className="mt-1.5">
            <GateLegend />
          </div>
        </LightBlock>

        <LightBlock title="Capacité & charge" className="col-span-5">
          <VBars
            items={f.charge.map((c) => ({
              label: c.fn,
              value: c.ratio,
              color: c.ratio > 100 ? REPORT_RED : c.ratio >= 90 ? "#E58A00" : REPORT_GREEN,
            }))}
            height={64}
            reference={100}
          />
        </LightBlock>

        <LightBlock title="Indicateurs clés" className="col-span-3">
          <div className="grid grid-cols-2 gap-1">
            {kpis.slice(0, 4).map((k) => (
              <div key={k.label} className="rounded-[4px] bg-[#F9FAFB] px-1 py-1 text-center">
                <p className="truncate text-[6.5px] text-[#98A2B3]">{k.label}</p>
                <p
                  className="text-[13px] font-bold leading-none"
                  style={{
                    color:
                      k.tone === "red" ? REPORT_RED : k.tone === "green" ? REPORT_GREEN : k.tone === "amber" ? "#E58A00" : "#101828",
                  }}
                >
                  {k.value}
                </p>
              </div>
            ))}
          </div>
        </LightBlock>
      </div>

      <div className="mt-1.5 grid grid-cols-2 gap-1.5" style={{ height: 66 }}>
        {text("reco") !== undefined ? (
          <TextBlock n={2} title="Commentaires & points d'attention" {...textProps(ctx, "reco", text("reco")!)} />
        ) : null}
        {text("conclusion") !== undefined ? (
          <TextBlock n={3} title="Décision & prochaines étapes" {...textProps(ctx, "conclusion", text("conclusion")!)} />
        ) : null}
      </div>
    </Sheet>
  );
}

/** Compte les risques d'un niveau donné — sert au donut de la page client. */
function PLAN_LEVEL(_f: ReportFacts, level: string): number {
  return topRisks().filter((r) => r.level === level).length;
}

/* ------------------------------ Pages « decision » ---------------------------- */

function DecisionPage1({ report, params, version, date, ctx, bare }: PageProps) {
  const f = report.facts;
  const p = f.project!;
  const criteria = passCriteria(f);
  const steps = nextSteps(f);
  const decisionLabel = DECISION_SHORT[f.decision];
  const text = (id: string) => report.sections.find((s) => s.id === id)?.text;

  return (
    <Sheet page={1} pages={4} bare={bare}>
      <DocHeader
        eyebrow={`Revue de gate — ${date}`}
        title={f.gateTitle}
        version={version}
        date={date}
        confidentiality={params.confidentiality}
        decision={{
          label: decisionLabel,
          color: DECISION_COLOR[f.decision] === REPORT_GREEN ? "#5EDE99" : DECISION_COLOR[f.decision],
          reason: f.decisionReason,
        }}
      />

      <div className="mb-1.5 grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <LightBlock title="Readiness du gate" className="col-span-3">
          <div className="flex items-center gap-2">
            <Donut
              segments={[
                { label: "Validés", value: f.approved, color: REPORT_GREEN },
                { label: "En cours", value: f.running, color: "#E58A00" },
                { label: "Retard", value: f.late, color: REPORT_RED },
              ]}
              size={64}
              thickness={10}
              center={`${f.readiness}%`}
            />
            <DonutLegend
              segments={[
                { label: "Validés", value: f.approved, color: REPORT_GREEN },
                { label: "En cours", value: f.running, color: "#E58A00" },
                { label: "Retard", value: f.late, color: REPORT_RED },
              ]}
            />
          </div>
        </LightBlock>

        <LightBlock title="Critères de passage" className="col-span-4">
          <ul className="space-y-1">
            {criteria.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5 text-[8px]">
                <span
                  className="h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: c.ok ? REPORT_GREEN : "#E58A00" }}
                />
                <span className="min-w-0 flex-1 truncate text-[#344054]">{c.label}</span>
                <span className="shrink-0 tabular-nums text-[#98A2B3]">{c.detail}</span>
              </li>
            ))}
          </ul>
        </LightBlock>

        {text("synthese") !== undefined ? (
          <TextBlock n={1} title="Résumé décision" className="col-span-5" {...textProps(ctx, "synthese", text("synthese")!)} />
        ) : null}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <LightBlock title="Statut des livrables obligatoires" className="col-span-6" bodyClassName="overflow-hidden">
          <table className="w-full text-[7px]">
            <thead>
              <tr className="text-left text-[#98A2B3]">
                {["Livrable", "Statut", "Propriétaire", "Échéance"].map((h) => (
                  <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.deliverables.slice(0, 6).map((l) => (
                <tr key={l.d.id} className="border-b border-[#F2F4F7]">
                  <td className="max-w-[130px] truncate py-0.5 pr-1 text-[#101828]">{l.d.name}</td>
                  <td className="py-0.5 pr-1">
                    <StatusPill status={l.status} />
                  </td>
                  <td className="py-0.5 pr-1 text-[#667085]">{l.d.owner}</td>
                  <td className="py-0.5 tabular-nums text-[#667085]">{l.d.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </LightBlock>

        <LightBlock title="Risques & actions critiques" className="col-span-3" bodyClassName="overflow-hidden">
          <ul className="space-y-1">
            {decisionConditions(f).slice(0, 4).map((c) => (
              <li key={c.action} className="rounded-[4px] bg-[#F9FAFB] px-1.5 py-1">
                <p className="truncate text-[7.5px] font-semibold text-[#101828]">{c.condition}</p>
                <p className="mt-0.5 flex items-center justify-between text-[7px] text-[#667085]">
                  <span>{c.owner}</span>
                  <span className="tabular-nums">{c.due}</span>
                </p>
              </li>
            ))}
            {decisionConditions(f).length === 0 ? (
              <li className="text-[7.5px] text-[#667085]">Aucune action critique ouverte.</li>
            ) : null}
          </ul>
        </LightBlock>

        <LightBlock title="Charge vs capacité" className="col-span-3">
          <VBars
            items={f.charge.map((c) => ({
              label: c.fn,
              value: c.ratio,
              color: c.ratio > 100 ? REPORT_RED : c.ratio >= 90 ? "#E58A00" : REPORT_GREEN,
            }))}
            height={64}
            reference={100}
          />
        </LightBlock>
      </div>

      {steps.length ? (
        <div className="mt-1.5 rounded-[6px] border border-[#EAECF0] px-2.5 py-1.5">
          <p className="mb-1 text-[8px] font-bold uppercase tracking-wide text-[#101828]">Prochains pas</p>
          <div className="flex items-center gap-3 overflow-hidden">
            {steps.map((s, i) => (
              <React.Fragment key={`${s.label}-${i}`}>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0E7C52] text-[7px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate text-[7.5px] text-[#344054]">
                    <b className="tabular-nums text-[#101828]">{s.date}</b> — {s.label}
                  </span>
                </div>
                {i < steps.length - 1 ? <span className="h-px w-4 shrink-0 bg-[#EAECF0]" /> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}

function DecisionPage2({ report, params, version, date, bare }: PageProps) {
  const f = report.facts;
  const kpis = kpiBlock(f);
  const rows = portfolioRows();
  const split = decisionSplit();
  const trend = loadTrend(6);
  const risks = topRisks().slice(0, 4);
  const soon = upcomingGates().filter((g) => g.inDays <= 30).length;

  return (
    <Sheet page={2} pages={4} bare={bare}>
      <DocHeader
        eyebrow={`Revue de gates — ${date}`}
        title="Gate review — Synthèse portfolio"
        version={version}
        date={date}
        confidentiality={params.confidentiality}
      />

      <div className="mb-1.5 grid grid-cols-6 divide-x divide-[#EAECF0] rounded-[6px] border border-[#EAECF0]">
        <KpiCell label="Programmes actifs" value={rows.length} />
        <KpiCell label="Gates à venir (≤30j)" value={soon} tone={soon > 0 ? "amber" : "ink"} />
        <KpiCell label="Readiness moyen" value={`${Math.round(f.readiness)}%`} tone={f.readiness >= 60 ? "green" : "amber"} />
        <KpiCell label="Décisions GO" value={split.find((s) => s.decision === "GO")?.count ?? 0} tone="green" />
        <KpiCell
          label="GO conditionnel"
          value={split.find((s) => s.decision === "GO conditionnel")?.count ?? 0}
          tone="amber"
        />
        <KpiCell label="HOLD" value={split.find((s) => s.decision === "NO GO")?.count ?? 0} tone="red" />
      </div>

      <LightBlock title="État des gates par programme" className="mb-1.5 min-h-0 flex-[1.4]" bodyClassName="overflow-hidden">
        <table className="w-full text-[7px]">
          <thead>
            <tr className="text-left text-[#98A2B3]">
              <th className="border-b border-[#EAECF0] pb-0.5 pr-1 font-semibold">Programme</th>
              <th className="border-b border-[#EAECF0] pb-0.5 pr-1 font-semibold">Phase actuelle</th>
              {APQP_GATES.map((g) => (
                <th key={g.id} className="border-b border-[#EAECF0] pb-0.5 text-center font-semibold">
                  {g.id}
                </th>
              ))}
              <th className="border-b border-[#EAECF0] pb-0.5 pl-1 font-semibold">Prochain gate</th>
              <th className="border-b border-[#EAECF0] pb-0.5 pl-1 text-right font-semibold">Readiness</th>
              <th className="border-b border-[#EAECF0] pb-0.5 pl-1 font-semibold">Décision</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, decision }) => (
              <tr key={p.id} className="border-b border-[#F2F4F7]">
                <td className="py-0.5 pr-1 font-semibold text-[#101828]">{p.id}</td>
                <td className="py-0.5 pr-1 text-[#667085]">{p.phase}</td>
                {gateRail(p).map((g) => (
                  <td key={g.id} className="py-0.5 text-center">
                    <GateDot state={g.state} size={11} />
                  </td>
                ))}
                <td className="py-0.5 pl-1 text-[#667085]">{p.nextGate.split(" ")[0]}</td>
                <td className="py-0.5 pl-1 text-right tabular-nums font-semibold text-[#101828]">
                  {p.readiness}%
                </td>
                <td className="py-0.5 pl-1">
                  <DecisionPill label={DECISION_SHORT[decision]} color={DECISION_COLOR[decision]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </LightBlock>

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <LightBlock title="Top risques portfolio" className="col-span-5" bodyClassName="overflow-hidden">
          <table className="w-full text-[7px]">
            <thead>
              <tr className="text-left text-[#98A2B3]">
                {["Risque", "Criticité", "Analyse"].map((h) => (
                  <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <tr key={r.id} className="border-b border-[#F2F4F7]">
                  <td className="py-0.5 pr-1 font-medium text-[#101828]">{r.label}</td>
                  <td className="py-0.5 pr-1">
                    <span
                      className="font-semibold"
                      style={{ color: r.level === "Critique" ? REPORT_RED : r.level === "Majeur" ? "#E58A00" : "#667085" }}
                    >
                      {r.level}
                    </span>
                  </td>
                  <td className="truncate py-0.5 text-[#667085]">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </LightBlock>

        <LightBlock title="Tendance readiness (moyenne)" className="col-span-4">
          <LoadTrend points={trend} width={200} height={70} cap={100} />
        </LightBlock>

        <LightBlock title="Décisions proposées" className="col-span-3">
          <ul className="space-y-1">
            {split.map((s) => (
              <li key={s.decision} className="flex items-center gap-1.5">
                <DecisionPill label={DECISION_SHORT[s.decision]} color={DECISION_COLOR[s.decision]} />
                <span className="text-[10px] font-bold text-[#101828]">{s.count}</span>
                <span className="min-w-0 flex-1 truncate text-[7px] text-[#667085]">{s.note}</span>
              </li>
            ))}
          </ul>
        </LightBlock>
      </div>
    </Sheet>
  );
}

function DecisionPage3({ report, params, version, date, ctx, bare }: PageProps) {
  const f = report.facts;
  const p = f.project!;
  const crit = criticalitySplit(f);
  const contrib = contributionSplit(f);
  const text = (id: string) => report.sections.find((s) => s.id === id)?.text;

  return (
    <Sheet page={3} pages={4} bare={bare}>
      <DocHeader
        eyebrow={`Détail des livrables — ${f.gateTitle}`}
        title="Gate review — Détail par livrable"
        version={version}
        date={date}
        confidentiality={params.confidentiality}
      />

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <LightBlock title="Informations gate" className="col-span-3">
          <dl className="space-y-1 text-[8px]">
            {[
              { k: "Programme", v: p.name },
              { k: "Phase", v: p.phase },
              { k: "Gate", v: f.gateTitle },
              { k: "Date cible", v: p.forecast },
              { k: "Propriétaire", v: p.manager },
              { k: "Prochaine revue", v: params.reviewDate },
            ].map((r) => (
              <div key={r.k} className="flex items-baseline gap-1.5">
                <dt className="w-[62px] shrink-0 text-[#98A2B3]">{r.k}</dt>
                <dd className="min-w-0 flex-1 truncate font-semibold text-[#101828]">{r.v}</dd>
              </div>
            ))}
          </dl>
        </LightBlock>

        <LightBlock title="Statut des livrables" className="col-span-9" bodyClassName="overflow-hidden">
          <table className="w-full text-[7.5px]">
            <thead>
              <tr className="text-left text-[#98A2B3]">
                {["Livrable", "Obligatoire", "Statut", "Propriétaire", "Échéance", "Readiness"].map((h) => (
                  <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.deliverables.map((l) => (
                <tr key={l.d.id} className="border-b border-[#F2F4F7]">
                  <td className="max-w-[140px] truncate py-0.5 pr-1 text-[#101828]">{l.d.name}</td>
                  <td className="py-0.5 pr-1 text-[#667085]">
                    {l.d.criticality === "Moyenne" ? "Non" : "Oui"}
                  </td>
                  <td className="py-0.5 pr-1">
                    <StatusPill status={l.status} />
                  </td>
                  <td className="py-0.5 pr-1 text-[#667085]">{l.d.owner}</td>
                  <td className="py-0.5 pr-1 tabular-nums text-[#667085]">{l.d.dueDate}</td>
                  <td className="w-[52px] py-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-6 shrink-0 text-right font-semibold text-[#101828]">
                        {l.d.progress}%
                      </span>
                      <MiniBar value={l.d.progress} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </LightBlock>
      </div>

      <div className="mt-1.5 grid grid-cols-12 gap-1.5" style={{ height: 108 }}>
        <LightBlock title="Contribution des livrables au gate" className="col-span-3">
          <div className="flex h-full items-center gap-1.5">
            <Donut
              segments={contrib.map((c) => ({ label: c.label, value: c.value, color: c.color }))}
              size={58}
              thickness={9}
              center={`${contrib[0]?.value ?? 0}%`}
            />
            <DonutLegend
              segments={contrib.map((c) => ({ label: c.label, value: c.value, color: c.color }))}
              suffix="%"
            />
          </div>
        </LightBlock>

        <LightBlock title="Répartition par criticité" className="col-span-4">
          <StackedBars
            rows={crit.map((c) => ({
              label: c.level,
              values: [c.approved, c.running, c.late],
              total: c.total,
            }))}
            parts={[
              { label: "Validés", color: REPORT_GREEN },
              { label: "En cours", color: "#E58A00" },
              { label: "Retard", color: REPORT_RED },
            ]}
          />
        </LightBlock>

        {text("reco") !== undefined ? (
          <TextBlock n={1} title="Commentaires clés" className="col-span-5" {...textProps(ctx, "reco", text("reco")!)} />
        ) : null}
      </div>
    </Sheet>
  );
}

function DecisionPage4({ report, params, version, date, ctx, bare }: PageProps) {
  const f = report.facts;
  const conditions = decisionConditions(f);
  const votes = reviewVotes(f);
  const steps = nextSteps(f);
  const text = (id: string) => report.sections.find((s) => s.id === id)?.text;

  return (
    <Sheet page={4} pages={4} bare={bare}>
      <DocHeader
        eyebrow={`Présentation décision — ${f.gateTitle}`}
        title="Gate review — Présentation décision"
        version={version}
        date={date}
        confidentiality={params.confidentiality}
      />

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-1.5">
        <div
          className="col-span-3 flex flex-col items-center justify-center gap-1.5 rounded-[6px] px-2 py-3 text-center text-white"
          style={{ backgroundColor: "#101828" }}
        >
          <span className="text-[8px] font-semibold uppercase tracking-wide text-white/60">La décision</span>
          <span className="text-[30px] font-extrabold leading-none" style={{ color: "#5EDE99" }}>
            {DECISION_SHORT[f.decision]}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wide text-white/85">{f.decision}</span>
          <p className="mt-1.5 text-[7.5px] leading-snug text-white/70">{f.decisionReason}</p>
        </div>

        <div className="col-span-9 flex min-h-0 flex-col gap-1.5">
          <div className="grid grid-cols-4 divide-x divide-[#EAECF0] rounded-[6px] border border-[#EAECF0]">
            <KpiCell label="Readiness du gate" value={`${f.readiness}%`} tone={f.readiness >= 60 ? "green" : "amber"} />
            <KpiCell label="Livrables validés" value={`${f.approved} / ${f.deliverables.length}`} />
            <KpiCell label="Risques critiques" value={f.criticalOpen} tone={f.criticalOpen > 0 ? "red" : "green"} />
            <KpiCell label="Actions en retard" value={f.overdue} tone={f.overdue > 0 ? "red" : "green"} />
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
            <LightBlock title="Conditions de la décision" bodyClassName="overflow-hidden">
              <table className="w-full text-[7px]">
                <thead>
                  <tr className="text-left text-[#98A2B3]">
                    {["Condition", "Propriétaire", "Échéance"].map((h) => (
                      <th key={h} className="border-b border-[#EAECF0] pb-0.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conditions.slice(0, 4).map((c) => (
                    <tr key={c.action} className="border-b border-[#F2F4F7]">
                      <td className="max-w-[130px] truncate py-0.5 pr-1 text-[#101828]">{c.condition}</td>
                      <td className="py-0.5 pr-1 text-[#667085]">{c.owner}</td>
                      <td className="py-0.5 tabular-nums text-[#667085]">{c.due}</td>
                    </tr>
                  ))}
                  {conditions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-1 text-[#667085]">
                        Aucune condition : tous les livrables sont validés.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </LightBlock>

            <LightBlock title="Votes de la revue" bodyClassName="overflow-hidden">
              <table className="w-full text-[7px]">
                <thead>
                  <tr className="text-left text-[#98A2B3]">
                    <th className="border-b border-[#EAECF0] pb-0.5 font-semibold">Fonction</th>
                    <th className="border-b border-[#EAECF0] pb-0.5 text-right font-semibold">Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((v) => (
                    <tr key={v.fn} className="border-b border-[#F2F4F7]">
                      <td className="py-0.5 text-[#101828]">{v.fn}</td>
                      <td className="py-0.5 text-right">
                        <DecisionPill label={DECISION_SHORT[v.decision]} color={DECISION_COLOR[v.decision]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-1 font-bold text-[#101828]">Décision finale</td>
                    <td className="pt-1 text-right">
                      <DecisionPill label={DECISION_SHORT[f.decision]} color={DECISION_COLOR[f.decision]} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </LightBlock>
          </div>

          {steps.length ? (
            <div className="rounded-[6px] border border-[#EAECF0] px-2.5 py-1.5">
              <p className="mb-1 text-[7.5px] font-bold uppercase tracking-wide text-[#101828]">Prochaines étapes</p>
              <div className="flex items-center gap-3">
                {steps.map((s, i) => (
                  <React.Fragment key={`${s.label}-${i}`}>
                    <span className="min-w-0 truncate text-[7px] text-[#344054]">
                      <b className="tabular-nums text-[#101828]">{s.date}</b> — {s.label}
                    </span>
                    {i < steps.length - 1 ? <span className="h-px w-3 shrink-0 bg-[#EAECF0]" /> : null}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {text("conclusion") !== undefined ? (
        <div className="mt-1.5" style={{ height: 60 }}>
          <TextBlock n={1} title="Justification de la décision" {...textProps(ctx, "conclusion", text("conclusion")!)} />
        </div>
      ) : null}
    </Sheet>
  );
}

/* --------------------------------- Export ----------------------------------- */

interface PageProps {
  report: BuiltReport;
  params: ReportParams;
  version: string;
  date: string;
  ctx: EditCtx;
  bare?: boolean;
}

export function ReportDocument({
  report,
  params,
  version,
  date,
  page = 1,
  selected,
  onSelect,
  editedIds = [],
  zoom = 1,
  watermark = false,
  bare = false,
}: {
  report: BuiltReport;
  params: ReportParams;
  version: string;
  date: string;
  page?: number;
  selected?: string;
  onSelect?: (id: string) => void;
  editedIds?: string[];
  zoom?: number;
  /** Filigrane diagonal, demandé au moment de l'export. */
  watermark?: boolean;
  /** Sans cadre ni ombre : pour l'impression, où la page est déjà le support. */
  bare?: boolean;
}) {
  const ctx: EditCtx = { selected, onSelect, editedIds };
  const props: PageProps = { report, params, version, date, ctx };

  let content: React.ReactNode;
  if (params.template === "direction") content = <DirectionPage {...props} />;
  else if (params.template === "gate-client") content = <GateClientPage {...props} />;
  else {
    content =
      page === 1 ? (
        <DecisionPage1 {...props} />
      ) : page === 2 ? (
        <DecisionPage2 {...props} />
      ) : page === 3 ? (
        <DecisionPage3 {...props} />
      ) : (
        <DecisionPage4 {...props} />
      );
  }

  return (
    <div style={{ zoom }} className="relative mx-auto" data-bare={bare || undefined}>
      {watermark ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
        >
          <span className="-rotate-[28deg] whitespace-nowrap text-[52px] font-bold uppercase tracking-widest text-[#D92D20]/10">
            Confidentiel
          </span>
        </span>
      ) : null}
      {content}
    </div>
  );
}
