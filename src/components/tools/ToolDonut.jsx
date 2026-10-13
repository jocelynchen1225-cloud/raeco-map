import { useRef, useState } from "react";
import { ListFilter } from "lucide-react";
import ToolLogo from "./ToolLogo";

// Brand-blue scale: the largest segment is the darkest. Color here encodes
// "how much", never "which industry" — the RAECO colors stay reserved for that.
const DARK = [25, 52, 160]; // #1934A0
const LIGHT = [205, 214, 244];
function shade(rank, total) {
  const t = total <= 1 ? 0 : rank / (total - 1);
  const c = DARK.map((d, i) => Math.round(d + (LIGHT[i] - d) * t));
  return `rgb(${c.join(",")})`;
}

const SIZE = 320;
const C = SIZE / 2;
const R = 138;
const THICK = 26;

function arcPath(start, end, r, thick) {
  // Angles in radians, 0 = 12 o'clock, clockwise.
  const pt = (a, rad) => [C + rad * Math.sin(a), C - rad * Math.cos(a)];
  const large = end - start > Math.PI ? 1 : 0;
  const [x1, y1] = pt(start, r);
  const [x2, y2] = pt(end, r);
  const [x3, y3] = pt(end, r - thick);
  const [x4, y4] = pt(start, r - thick);
  return `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r - thick} ${r - thick} 0 ${large} 0 ${x4} ${y4} Z`;
}

export default function ToolDonut({ segments, center, unit, selectedKey, onSelect, toolsById }) {
  const [hoverKey, setHoverKey] = useState(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  // Fade the legend's bottom edge until it is scrolled to the end, so it reads as scrollable.
  const [atEnd, setAtEnd] = useState(null);

  const total = segments.reduce((s, x) => s + x.value, 0);
  let angle = 0;
  const arcs = segments.map((seg, i) => {
    const sweep = (seg.value / total) * Math.PI * 2;
    const a = { ...seg, start: angle, end: angle + sweep, color: shade(i, segments.length) };
    angle += sweep;
    return a;
  });

  const focusKey = hoverKey ?? selectedKey;
  const hovered = arcs.find((a) => a.key === hoverKey);

  const trackPointer = (e) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (box) setPointer({ x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const pct = (v) => `${((v / total) * 100).toFixed(1)}%`;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div ref={wrapRef} className="relative mx-auto w-full max-w-[min(300px,calc(100vh-420px))] min-w-[220px]" onMouseMove={trackPointer}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full overflow-visible" role="img" aria-label={`${center.value} ${center.label}`}>
          {arcs.map((a) => {
            const active = a.key === hoverKey;
            const dimmed = focusKey && a.key !== focusKey;
            return (
              <path
                key={a.key}
                d={arcPath(a.start, a.end, active ? R + 6 : R, active ? THICK + 6 : THICK)}
                fill={a.color}
                stroke="#fff"
                strokeWidth={2}
                opacity={dimmed ? 0.28 : 1}
                className="cursor-pointer transition-opacity duration-150"
                onMouseEnter={() => setHoverKey(a.key)}
                onMouseLeave={() => setHoverKey(null)}
                onClick={() => onSelect(a)}
              />
            );
          })}
          <text x={C} y={C + 6} textAnchor="middle" pointerEvents="none" className="fill-[var(--color-ink)] font-body" fontSize="64" fontWeight="700">
            {center.value}
          </text>
          <text x={C} y={C + 36} textAnchor="middle" pointerEvents="none" className="fill-[var(--color-ink)]/60 font-body" fontSize="15" fontWeight="500">
            {center.label}
          </text>
          {center.sub && (
            <text x={C} y={C + 56} textAnchor="middle" pointerEvents="none" className="fill-[var(--color-ink)]/40 font-body" fontSize="12">
              {center.sub}
            </text>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-30 w-[260px] rounded-2xl border border-[var(--color-hairline)] bg-white p-4 shadow-[0_18px_44px_rgba(25,52,160,0.18)]"
            style={{
              left: Math.min(pointer.x + 16, (wrapRef.current?.offsetWidth ?? 300) - 120),
              top: pointer.y + 16,
            }}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-[4px]" style={{ background: hovered.color }} />
              <p className="flex-1 font-body text-sm font-semibold leading-5 text-[var(--color-ink)]">{hovered.label}</p>
              <p className="shrink-0 font-body text-sm text-[var(--color-ink)]/50">
                {hovered.value} ({pct(hovered.value)})
              </p>
            </div>
            {hovered.toolIds.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5">
                {hovered.toolIds.slice(0, 6).map((id) => (
                  <ToolLogo key={id} tool={toolsById[id]} size={28} />
                ))}
                {hovered.toolIds.length > 6 && (
                  <span className="ml-1 font-body text-xs text-[var(--color-ink)]/50">+{hovered.toolIds.length - 6}</span>
                )}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-hairline)] pt-3 font-body text-xs text-[var(--color-ink)]/55">
              <ListFilter size={14} />
              {selectedKey === hovered.key ? "Click to clear the filter" : "Click to filter the tools below"}
            </div>
          </div>
        )}
      </div>

      <ul
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
        }}
        ref={(el) => { if (el && atEnd === null) setAtEnd(el.scrollHeight <= el.clientHeight); }}
        className={`max-h-[min(300px,calc(100vh-420px))] min-h-[220px] overflow-y-auto pr-2 ${
          atEnd ? "" : "[mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
        }`} aria-label={`Segments, values in ${unit}`}>
        {arcs.map((a) => {
          const selected = a.key === selectedKey;
          const dimmed = focusKey && a.key !== focusKey;
          return (
            <li key={a.key}>
              <button
                type="button"
                onMouseEnter={() => setHoverKey(a.key)}
                onMouseLeave={() => setHoverKey(null)}
                onFocus={() => setHoverKey(a.key)}
                onBlur={() => setHoverKey(null)}
                onClick={() => onSelect(a)}
                aria-pressed={selected}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-body text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] ${
                  selected ? "bg-[var(--color-brand)]/8" : "hover:bg-[var(--color-paper-dim)]"
                } ${dimmed ? "opacity-45" : ""}`}
              >
                <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ background: a.color }} />
                <span className={`flex-1 truncate ${selected ? "font-semibold text-[var(--color-brand)]" : "text-[var(--color-ink)]/80"}`}>
                  {a.label}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--color-ink)]/45">{a.value}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
