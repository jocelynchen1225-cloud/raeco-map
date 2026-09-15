import stakeholders from "../data/stakeholders.json";
import { STAKEHOLDER_ICONS } from "../lib/taskVisuals";

// One representative entry per category (6 categories, not all 12 specific
// roles) — this is the legend, so it should read at a glance.
const categories = [];
const seen = new Set();
stakeholders.forEach((s) => {
  if (!seen.has(s.category)) {
    seen.add(s.category);
    categories.push(s);
  }
});

export default function StakeholderLegend({ className = "", style }) {
  return (
    <div
      className={`w-[188px] rounded-2xl border border-white/85 bg-white/70 p-4 shadow-[0_8px_30px_rgba(30,40,70,0.08)] backdrop-blur-xl ${className}`}
      style={style}
    >
      <h3 className="mb-3 font-body text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink)]/40">
        Stakeholders
      </h3>
      <ul className="flex flex-col gap-3">
        {categories.map((s) => {
          const Icon = STAKEHOLDER_ICONS[s.icon];
          return (
            <li key={s.category} className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: `${s.color}22` }}
              >
                <Icon size={14} color={s.color} strokeWidth={1.8} />
              </span>
              <span className="font-body text-xs font-semibold capitalize text-[var(--color-ink)]">
                {s.category}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
