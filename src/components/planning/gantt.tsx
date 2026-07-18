"use client";

import { PLAN_MONTHS, PLAN_ROWS, PLAN_WINDOW, STATUS_DATE } from "@/lib/data";

/** Row geometry — shared with the WBS table so both stay aligned. */
export const GANTT_ROW_H = 39;
export const GANTT_HEAD_H = 48;

const MS_DAY = 86_400_000;
const TOTAL_DAYS = PLAN_WINDOW.weeks * 7;

function toTime(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).getTime();
}

/** ISO date → percentage of the visible window. */
export function pct(isoDate: string): number {
  const days = (toTime(isoDate) - toTime(PLAN_WINDOW.start)) / MS_DAY;
  return Math.min(100, Math.max(0, (days / TOTAL_DAYS) * 100));
}

/** End bound is exclusive: a task ending on the 13th covers the whole 13th. */
function endPct(isoDate: string): number {
  const days = (toTime(isoDate) - toTime(PLAN_WINDOW.start)) / MS_DAY + 1;
  return Math.min(100, Math.max(0, (days / TOTAL_DAYS) * 100));
}

/** "15/12/2026" → ISO, so the status date drives the today line. */
function statusIso(): string {
  const [d, m, y] = STATUS_DATE.split("/");
  return `${y}-${m}-${d}`;
}

export function GanttChart() {
  const todayPct = pct(statusIso());
  const bodyH = PLAN_ROWS.length * GANTT_ROW_H;

  // Elbow connectors between a task and the task it depends on.
  const links = PLAN_ROWS.flatMap((row, i) => {
    if (!row.dependsOn) return [];
    const fromIndex = PLAN_ROWS.findIndex((r) => r.wbs === row.dependsOn);
    if (fromIndex < 0) return [];
    const from = PLAN_ROWS[fromIndex];
    return [
      {
        key: `${from.wbs}-${row.wbs}`,
        x1: from.milestone ? pct(from.fStart) : endPct(from.fEnd),
        y1: fromIndex * GANTT_ROW_H + GANTT_ROW_H / 2,
        x2: pct(row.fStart),
        y2: i * GANTT_ROW_H + GANTT_ROW_H / 2,
      },
    ];
  });

  return (
    <div className="flex h-full min-w-0 flex-col">
      {/* Header: months then ISO week numbers */}
      <div className="shrink-0 border-b border-border" style={{ height: GANTT_HEAD_H }}>
        <div className="flex" style={{ height: GANTT_HEAD_H / 2 }}>
          {PLAN_MONTHS.map((m) => (
            <div
              key={m.label}
              className="flex items-center justify-center border-r border-border text-[11px] font-semibold text-foreground last:border-r-0"
              style={{ flex: m.weeks.length }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex border-t border-border" style={{ height: GANTT_HEAD_H / 2 }}>
          {PLAN_MONTHS.flatMap((m) => m.weeks).map((w, i) => (
            <div
              key={`${w}-${i}`}
              className="flex flex-1 items-center justify-center border-r border-border/60 text-[10px] text-muted-foreground last:border-r-0"
            >
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="relative min-h-0 flex-1" style={{ minHeight: bodyH }}>
        {/* Week grid */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: PLAN_WINDOW.weeks }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-border/40 last:border-r-0" />
          ))}
        </div>

        {/* Dependency arrows */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${bodyH}`}
          preserveAspectRatio="none"
        >
          {links.map((l) => (
            <path
              key={l.key}
              d={`M ${l.x1} ${l.y1} L ${(l.x1 + l.x2) / 2} ${l.y1} L ${(l.x1 + l.x2) / 2} ${l.y2} L ${l.x2} ${l.y2}`}
              fill="none"
              stroke="#98A2B3"
              strokeWidth={0.18}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {/* Arrow heads are drawn unscaled so they stay square. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {links.map((l) => (
            <polygon
              key={l.key}
              points="0,-3 5,0 0,3"
              fill="#98A2B3"
              transform={`translate(${l.x2}%, ${l.y2}) translate(-5, 0)`}
            />
          ))}
        </svg>

        {/* Today line */}
        <div
          className="absolute top-0 z-20 border-l border-dashed border-[#3976D3]"
          style={{ left: `${todayPct}%`, height: bodyH }}
        />

        {/* Bars */}
        {PLAN_ROWS.map((row, i) => (
          <div key={row.id} className="relative" style={{ height: GANTT_ROW_H }}>
            {row.milestone ? (
              <div
                className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5"
                style={{ left: `${pct(row.fStart)}%` }}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 -translate-x-1/2 rotate-45 rounded-[2px]"
                  style={{ backgroundColor: row.gateTone === "blue" ? "#2563EB" : "#E58A00" }}
                />
                <span className="whitespace-nowrap leading-tight">
                  <span className="block text-[10px] font-bold text-foreground">{row.gate}</span>
                  <span className="block text-[9px] tabular-nums text-muted-foreground">
                    {row.fStart.split("-").reverse().join("/")}
                  </span>
                </span>
              </div>
            ) : (
              <>
                <span
                  className="absolute top-[7px] h-[8px] rounded-[3px] bg-[#98A2B3]"
                  style={{
                    left: `${pct(row.bStart)}%`,
                    width: `${Math.max(0.5, endPct(row.bEnd) - pct(row.bStart))}%`,
                  }}
                />
                <span
                  className="absolute top-[21px] h-[8px] rounded-[3px]"
                  style={{
                    left: `${pct(row.fStart)}%`,
                    width: `${Math.max(0.5, endPct(row.fEnd) - pct(row.fStart))}%`,
                    backgroundColor: row.critical ? "#D92D20" : "#E5A11B",
                  }}
                />
              </>
            )}
            {/* Keeps row index meaningful for the arrow maths above. */}
            <span className="hidden">{i}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex shrink-0 items-center justify-center gap-5 border-t border-border py-2 text-[10px] text-muted-foreground">
        <Item swatch={<span className="h-2 w-5 rounded-[2px] bg-[#98A2B3]" />} label="Baseline" />
        <Item swatch={<span className="h-2 w-5 rounded-[2px] bg-[#E5A11B]" />} label="Forecast" />
        <Item swatch={<span className="h-2 w-5 rounded-[2px] bg-[#D92D20]" />} label="Tâche critique" />
        <Item
          swatch={<span className="h-2.5 w-2.5 rotate-45 rounded-[1px] bg-[#E58A00]" />}
          label="Jalon"
        />
        <Item
          swatch={
            <svg width="26" height="8" className="text-[#98A2B3]">
              <line x1="0" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1" />
              <polygon points="18,1 24,4 18,7" fill="currentColor" />
            </svg>
          }
          label="Dépendance"
        />
      </div>
    </div>
  );
}

function Item({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  );
}
