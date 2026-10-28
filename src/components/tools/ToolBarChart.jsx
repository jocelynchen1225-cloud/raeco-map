import { useState } from "react";
import { ListFilter } from "lucide-react";
import ToolLogo from "./ToolLogo";

// Brand-blue scale: the largest segment is the darkest. Color here encodes
// "how much", never "which industry" — the RAECO colors stay reserved for
// that signal, and are used instead whenever a segment carries one (the
// "Tools by industry" chart tags each segment with its real RAECO color).
const DARK = [25, 52, 160]; // #1934A0
const LIGHT = [205, 214, 244];
function shade(rank, total) {
  const t = total <= 1 ? 0 : rank / (total - 1);
  const c = DARK.map((d, i) => Math.round(d + (LIGHT[i] - d) * t));
  return `rgb(${c.join(",")})`;
}

/**
 * Horizontal bar/column chart — a drop-in replacement for the donut chart
 * with the same props contract (segments/center/unit/selectedKey/onSelect/
 * toolsById), so it can back every chart tab on the AI Tools page. A single
 * tool can appear in more than one segment's `toolIds` (e.g. one tool
 * counted under several RAECO industries) — nothing here enforces
 * exclusivity, so overlap is a given rather than something to work around.
 */
export default function ToolBarChart({ segments, center, unit, selectedKey, onSelect, toolsById }) {
  const [hoverKey, setHoverKey] = useState(null);
  const total = segments.reduce((s, x) => s + x.value, 0);
  const max = Math.max(...segments.map((s) => s.value), 1);
  const focusKey = hoverKey ?? selectedKey;
  const pct = (v) => `${((v / total) * 100).toFixed(1)}%`;

  const bars = segments.map((seg, i) => ({ ...seg, color: seg.color ?? shade(i, segments.length) }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline gap-2.5 font-body">
        <span className="text-3xl font-bold text-[var(--color-ink)]">{center.value}</span>
        <span className="text-sm font-medium text-[var(--color-ink)]/60">{center.label}</span>
        {center.sub && <span className="text-xs text-[var(--color-ink)]/40">{center.sub}</span>}
      </div>

      <ul
        className="flex max-h-[min(360px,calc(100vh-460px))] min-h-[220px] flex-col gap-2 overflow-y-auto pr-2"
        aria-label={`Segments, values in ${unit}`}
      >
        {bars.map((b) => {
          const selected = b.key === selectedKey;
          const dimmed = focusKey && b.key !== focusKey;
          const widthPct = Math.max(2, (b.value / max) * 100);
          return (
            <li key={b.key} className="relative">
              <button
                type="button"
                onMouseEnter={() => setHoverKey(b.key)}
                onMouseLeave={() => setHoverKey(null)}
                onFocus={() => setHoverKey(b.key)}
                onBlur={() => setHoverKey(null)}
                onClick={() => onSelect(b)}
                aria-pressed={selected}
                className={`flex w-full flex-col gap-1.5 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] ${
                  selected ? "bg-[var(--color-brand)]/8" : "hover:bg-[var(--color-paper-dim)]"
                } ${dimmed ? "opacity-45" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`truncate font-body text-sm ${
                      selected ? "font-semibold text-[var(--color-brand)]" : "font-medium text-[var(--color-ink)]/80"
                    }`}
                  >
                    {b.label}
                  </span>
                  <span className="shrink-0 font-body text-sm tabular-nums text-[var(--color-ink)]/50">{b.value}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-paper-dim)]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${widthPct}%`, background: b.color }}
                  />
                </div>
              </button>

              {hoverKey === b.key && b.toolIds?.length > 0 && (
                <div className="pointer-events-none absolute left-3 top-full z-30 mt-1 w-[260px] rounded-2xl border border-[var(--color-hairline)] bg-white p-4 shadow-[0_18px_44px_rgba(25,52,160,0.18)]">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-[4px]" style={{ background: b.color }} />
                    <p className="flex-1 font-body text-sm font-semibold leading-5 text-[var(--color-ink)]">{b.label}</p>
                    <p className="shrink-0 font-body text-sm text-[var(--color-ink)]/50">
                      {b.value} ({pct(b.value)})
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    {b.toolIds.slice(0, 6).map((id) => (
                      <ToolLogo key={id} tool={toolsById[id]} size={28} />
                    ))}
                    {b.toolIds.length > 6 && (
                      <span className="ml-1 font-body text-xs text-[var(--color-ink)]/50">+{b.toolIds.length - 6}</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-hairline)] pt-3 font-body text-xs text-[var(--color-ink)]/55">
                    <ListFilter size={14} />
                    {selectedKey === b.key ? "Click to clear the filter" : "Click to filter the tools below"}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
