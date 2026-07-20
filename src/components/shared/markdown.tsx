"use client";

import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Rendu Markdown minimal — couvre le sous-ensemble utilisé par SCENARIO.md   */
/*  (titres, listes, tableaux, blocs de code, citations, filets, gras, liens). */
/*  Volontairement sans dépendance externe.                                    */
/* -------------------------------------------------------------------------- */

/** Applique le formatage en ligne : `code`, **gras**, *italique*, [lien](url). */
function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith("`")) {
      out.push(
        <code
          key={key}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-[#0E7C52]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      out.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      out.push(
        <a
          key={key}
          href={href}
          className="text-[#0E7C52] underline underline-offset-2"
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          {label}
        </a>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const k = `b${key++}`;

    // Bloc de code
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre
          key={k}
          className="my-3 overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-foreground scrollbar-thin"
        >
          {buf.join("\n")}
        </pre>,
      );
      continue;
    }

    // Filet
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={k} className="my-4 border-border" />);
      i += 1;
      continue;
    }

    // Titres
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = inline(heading[2], k);
      const sizes = ["text-[20px]", "text-[17px]", "text-[15px]", "text-[13px]"];
      blocks.push(
        React.createElement(
          `h${Math.min(level + 1, 6)}`,
          {
            key: k,
            className: `${sizes[level - 1]} font-bold text-foreground ${
              level === 1 ? "mb-2 mt-1" : level === 2 ? "mb-2 mt-5" : "mb-1.5 mt-4"
            }`,
          },
          content,
        ),
      );
      i += 1;
      continue;
    }

    // Tableau
    if (line.trim().startsWith("|") && lines[i + 1]?.includes("---")) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={k} className="my-3 overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {header.map((h, hi) => (
                  <th
                    key={hi}
                    className="border border-border bg-muted/50 px-2 py-1.5 text-left font-semibold text-foreground"
                  >
                    {inline(h, `${k}-h${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border border-border px-2 py-1.5 text-muted-foreground">
                      {inline(c, `${k}-r${ri}c${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Citation
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={k}
          className="my-3 border-l-[3px] border-[#16A46B] bg-[#E8FBF1]/50 py-2 pl-3 pr-2 text-[12px] leading-relaxed text-muted-foreground"
        >
          {inline(buf.join(" "), k)}
        </blockquote>,
      );
      continue;
    }

    // Listes
    const bullet = /^\s*[-*]\s+/.test(line);
    const ordered = /^\s*\d+\.\s+/.test(line);
    if (bullet || ordered) {
      const items: string[] = [];
      const test = bullet ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/;
      while (i < lines.length && test.test(lines[i])) {
        let item = lines[i].replace(test, "");
        i += 1;
        // Lignes de continuation indentées
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !test.test(lines[i])) {
          item += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push(item);
      }
      const cls = "my-2 space-y-1 pl-5 text-[12px] leading-relaxed text-muted-foreground";
      blocks.push(
        ordered ? (
          <ol key={k} className={`${cls} list-decimal`}>
            {items.map((it, ii) => (
              <li key={ii}>{inline(it, `${k}-l${ii}`)}</li>
            ))}
          </ol>
        ) : (
          <ul key={k} className={`${cls} list-disc`}>
            {items.map((it, ii) => (
              <li key={ii}>{inline(it, `${k}-l${ii}`)}</li>
            ))}
          </ul>
        ),
      );
      continue;
    }

    // Ligne vide
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Paragraphe
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("```") &&
      !lines[i].trim().startsWith("|") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    blocks.push(
      <p key={k} className="my-2 text-[12px] leading-relaxed text-muted-foreground">
        {inline(buf.join(" "), k)}
      </p>,
    );
  }

  return <div>{blocks}</div>;
}
