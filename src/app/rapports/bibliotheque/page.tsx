"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Copy,
  Eye,
  FileDown,
  FileText,
  History,
  Pencil,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TemplateThumb } from "@/components/reports/report-parts";
import { PageTitle } from "@/components/shared/page-parts";
import { Button, Card, Chip, Input, Panel, Select } from "@/components/ui/primitives";
import {
  PROJECTS,
  REPORT_STATUS_TONE,
  REPORT_TEMPLATES,
  REPORT_AUTHORS,
  formatDuration,
  reportScopeLabel,
  reportStats,
  reportTemplate,
  type ReportDoc,
  type ReportStatus,
} from "@/lib/data";
import {
  draftFromDoc,
  nextReportId,
  stamp,
  upsertReport,
  useReportDraft,
  useReportLibrary,
} from "@/lib/report-draft";
import { getInitials } from "@/lib/utils";

const TABS: { key: "tous" | ReportStatus; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "Brouillon", label: "Brouillons" },
  { key: "En révision", label: "En révision" },
  { key: "Généré", label: "Générés" },
  { key: "Exporté PDF", label: "Exportés PDF" },
];

/** « 15/12/2026 09:42 » → nombre comparable, pour trier sans ambiguïté. */
function timeKey(value: string): number {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/.exec(value);
  if (!m) return 0;
  return Number(`${m[3]}${m[2]}${m[1]}${m[4] ?? "00"}${m[5] ?? "00"}`);
}

export default function BibliothequePage() {
  const router = useRouter();
  const [library, setLibrary] = useReportLibrary();
  const { setDraft } = useReportDraft();

  const [tab, setTab] = React.useState<"tous" | ReportStatus>("tous");
  const [query, setQuery] = React.useState("");
  const [template, setTemplate] = React.useState("tous");
  const [scope, setScope] = React.useState("tous");
  const [author, setAuthor] = React.useState("tous");
  const [recentFirst, setRecentFirst] = React.useState(true);
  const [preview, setPreview] = React.useState<string | null>(null);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const kept = library.filter((r) => {
      if (tab !== "tous" && r.status !== tab) return false;
      if (template !== "tous" && r.template !== template) return false;
      if (scope !== "tous" && r.scopeId !== scope) return false;
      if (author !== "tous" && r.author !== author) return false;
      if (q && !`${r.name} ${r.id} ${r.client}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return kept.sort((a, b) =>
      recentFirst
        ? timeKey(b.editedAt) - timeKey(a.editedAt)
        : timeKey(a.editedAt) - timeKey(b.editedAt),
    );
  }, [library, tab, template, scope, author, query, recentFirst]);

  /* Les compteurs suivent le filtre : ils décrivent ce qui est à l'écran. */
  const stats = React.useMemo(() => reportStats(rows), [rows]);

  const selected = React.useMemo(
    () => rows.find((r) => r.id === preview) ?? rows[0],
    [rows, preview],
  );

  const filtered =
    tab !== "tous" || template !== "tous" || scope !== "tous" || author !== "tous" || query.trim();

  const clearFilters = () => {
    setTab("tous");
    setTemplate("tous");
    setScope("tous");
    setAuthor("tous");
    setQuery("");
  };

  const open = (doc: ReportDoc) => {
    setDraft(draftFromDoc(doc));
    router.push("/rapports/apercu");
  };

  const duplicate = (doc: ReportDoc) => {
    const at = stamp();
    const copy: ReportDoc = {
      ...doc,
      id: nextReportId(library),
      name: `${doc.name} (copie)`,
      version: "V1.0",
      status: "Brouillon",
      generatedAt: at,
      editedAt: at,
      history: [{ version: "V1.0", date: at, author: doc.author, status: "Brouillon" }],
    };
    setLibrary((all) => upsertReport(all, copy));
    setPreview(copy.id);
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-3">
        <PageTitle
          title="Bibliothèque des rapports"
          subtitle="Parcourez, filtrez et reprenez tous les rapports générés."
          action={
            <Button
              variant="primary"
              onClick={() => {
                setDraft((d) => ({ ...d, id: nextReportId(library) }));
                router.push("/rapports/nouveau");
              }}
            >
              <Plus className="h-4 w-4" />
              Nouveau rapport
            </Button>
          }
        />

        {/* Onglets par statut */}
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border p-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count =
              t.key === "tous"
                ? library.length
                : library.filter((r) => r.status === t.key).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={active}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-semibold transition-colors ${
                  active
                    ? "bg-[#E8FBF1] text-[#0E7C52]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                    active ? "bg-white text-[#0E7C52]" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtres */}
        <Card className="flex shrink-0 items-end gap-2 px-2.5 py-2">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un rapport, un identifiant, un client…"
              className="pl-7"
            />
          </label>
          <Select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-[190px]"
          >
            <option value="tous">Tous les modèles</option>
            {REPORT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select value={scope} onChange={(e) => setScope(e.target.value)} className="w-[190px]">
            <option value="tous">Tous les périmètres</option>
            <option value="PORTFOLIO">Portefeuille global</option>
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name}
              </option>
            ))}
          </Select>
          <Select value={author} onChange={(e) => setAuthor(e.target.value)} className="w-[150px]">
            <option value="tous">Tous les auteurs</option>
            {REPORT_AUTHORS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
          <button
            type="button"
            onClick={() => setRecentFirst((v) => !v)}
            title="Inverser le tri par date de modification"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            {recentFirst ? "Plus récents" : "Plus anciens"}
          </button>
          {filtered ? (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Effacer
            </button>
          ) : null}
        </Card>

        {/* Compteurs — calculés sur ce qui est affiché */}
        <div className="flex shrink-0 items-center gap-2">
          <Chip tone="slate">
            <FileText className="h-3 w-3" />
            {stats.total} rapport{stats.total > 1 ? "s" : ""} affiché{stats.total > 1 ? "s" : ""}
          </Chip>
          {/* Même couleur que le statut « Brouillon » dans le tableau. */}
          <Chip tone="slate">{stats.drafts} brouillons</Chip>
          <Chip tone="green">
            <Sparkles className="h-3 w-3" />
            {stats.generated} générés par l&apos;IA
          </Chip>
          <Chip tone="blue">
            <FileDown className="h-3 w-3" />
            {stats.exported} exportés PDF
          </Chip>
          <span className="ml-auto text-[11px] text-muted-foreground">
            Temps moyen de génération :{" "}
            <span className="font-semibold text-foreground tabular-nums">{stats.avgLabel}</span>
          </span>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2.5">
          <Panel className="col-span-8" bodyClassName="px-0 pt-0">
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  {["Rapport", "Modèle", "Périmètre", "Version", "Statut", "Modifié le", "Auteur", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-2.5 py-2 font-medium first:pl-3.5 last:pr-3.5"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const active = selected?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setPreview(r.id)}
                      onDoubleClick={() => open(r)}
                      className={`cursor-pointer border-b border-border/60 transition-colors last:border-0 ${
                        active ? "bg-[#F6FBF8]" : "hover:bg-[#FCFCFD]"
                      }`}
                    >
                      <td className="py-2 pl-3.5 pr-2.5">
                        <span className="flex items-start gap-2">
                          <FileText className="mt-px h-3.5 w-3.5 shrink-0 text-[#0E7C52]" />
                          <span className="leading-tight">
                            <span className="block font-medium text-foreground">{r.name}</span>
                            <span className="block text-[10px] text-muted-foreground">{r.id}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {reportTemplate(r.template).audience}
                      </td>
                      <td className="px-2.5 py-2 text-muted-foreground">
                        {reportScopeLabel(r.scopeId)}
                      </td>
                      <td className="px-2.5 py-2 font-semibold tabular-nums text-foreground">
                        {r.version}
                      </td>
                      <td className="px-2.5 py-2">
                        <Chip tone={REPORT_STATUS_TONE[r.status]}>{r.status}</Chip>
                      </td>
                      <td className="px-2.5 py-2 tabular-nums text-muted-foreground">
                        {r.editedAt}
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8FBF1] text-[9px] font-bold text-[#0E7C52]">
                            {getInitials(r.author)}
                          </span>
                          {r.author}
                        </span>
                      </td>
                      <td className="py-2 pl-2.5 pr-3.5">
                        <span className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            aria-label="Ouvrir"
                            title="Ouvrir le rapport"
                            onClick={(e) => {
                              e.stopPropagation();
                              open(r);
                            }}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-[#0E7C52]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Dupliquer"
                            title="Dupliquer le rapport"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicate(r);
                            }}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-[#0E7C52]"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3.5 py-6 text-center text-muted-foreground">
                      Aucun rapport ne correspond à ces filtres.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Panel>

          {/* Aperçu rapide du rapport sélectionné */}
          <Panel
            title="Aperçu rapide"
            icon={<Eye className="h-4 w-4 text-muted-foreground" />}
            className="col-span-4"
          >
            {selected ? (
              <>
                <div className="flex gap-2">
                  <TemplateThumb
                    id={selected.template}
                    className="h-[76px] w-[104px] shrink-0 p-1.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold leading-tight text-foreground">
                      {selected.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{selected.id}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Chip tone={REPORT_STATUS_TONE[selected.status]}>{selected.status}</Chip>
                      <Chip tone="slate">{selected.version}</Chip>
                    </div>
                  </div>
                </div>

                <dl className="mt-2.5 space-y-1 border-t border-border pt-2">
                  {[
                    { k: "Modèle", v: reportTemplate(selected.template).name },
                    { k: "Périmètre", v: reportScopeLabel(selected.scopeId) },
                    { k: "Client", v: selected.client },
                    { k: "Gate", v: selected.gate },
                    { k: "Généré le", v: selected.generatedAt },
                    { k: "Modifié le", v: selected.editedAt },
                    { k: "Génération", v: formatDuration(selected.genSeconds) },
                    { k: "Auteur", v: selected.author },
                  ].map((r) => (
                    <div key={r.k} className="flex items-baseline gap-2 text-[11px]">
                      <dt className="w-[86px] shrink-0 text-muted-foreground">{r.k}</dt>
                      <dd className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {r.v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] font-semibold text-foreground">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  Historique des versions
                </p>
                <ul className="mt-1 space-y-1">
                  {selected.history.map((h, i) => (
                    <li key={`${h.version}-${h.date}`} className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          i === 0 ? "bg-[#16A46B]" : "bg-border"
                        }`}
                      />
                      <span className="w-9 shrink-0 text-[11px] font-semibold text-foreground">
                        {h.version}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground">
                        {h.date}
                      </span>
                      <Chip tone={REPORT_STATUS_TONE[h.status]}>{h.status}</Chip>
                    </li>
                  ))}
                </ul>

                <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-border pt-2">
                  <Button variant="primary" onClick={() => open(selected)}>
                    <Eye className="h-4 w-4" />
                    Ouvrir
                  </Button>
                  <Button
                    onClick={() => {
                      setDraft(draftFromDoc(selected));
                      router.push("/rapports/apercu");
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Éditer le texte
                  </Button>
                  <Button onClick={() => duplicate(selected)}>
                    <Copy className="h-4 w-4" />
                    Dupliquer
                  </Button>
                  <Button
                    onClick={() => {
                      setDraft(draftFromDoc(selected));
                      router.push("/rapports/apercu");
                    }}
                  >
                    <FileDown className="h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Sélectionnez un rapport pour en voir le détail.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
