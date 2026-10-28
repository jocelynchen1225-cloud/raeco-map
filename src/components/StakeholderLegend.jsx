import stakeholders from "../data/stakeholders.json";
import { STAKEHOLDER_ICONS, INDUSTRY_ORDER } from "../lib/taskVisuals";

// One representative entry per category (6 categories, not all 12 specific
// roles) — this is the legend, so it should read at a glance. Grouped by
// RAECO industry (same color together) rather than raw data-file order.
const categories = [];
const seen = new Set();
stakeholders.forEach((s) => {
  if (!seen.has(s.category)) {
    seen.add(s.category);
    categories.push(s);
  }
});
categories.sort((a, b) => INDUSTRY_ORDER.indexOf(a.industry) - INDUSTRY_ORDER.indexOf(b.industry));

export default function StakeholderLegend({ className = "", style, selectedStakeholderId, onSelectStakeholder }) {
  const clickable = Boolean(onSelectStakeholder);
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
          const active = s.category === selectedStakeholderId || s.id === selectedStakeholderId;
          const Tag = clickable ? "button" : "li";
          return (
            <li key={s.category}>
              <Tag
                type={clickable ? "button" : undefined}
                onClick={clickable ? () => onSelectStakeholder(s.id) : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg px-1 py-0.5 text-left transition-colors ${
                  clickable ? "cursor-pointer hover:bg-[var(--color-brand)]/8" : ""
                } ${active ? "bg-[var(--color-brand)]/10" : ""}`}
              >
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${s.color}22` }}
                >
                  <Icon size={14} color={s.color} strokeWidth={1.8} />
                </span>
                <span
                  className={`font-body text-xs capitalize text-[var(--color-ink)] ${
                    active ? "font-bold" : "font-semibold"
                  }`}
                >
                  {s.category}
                </span>
              </Tag>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
