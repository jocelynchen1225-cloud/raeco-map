import { INDUSTRY_ORDER, INDUSTRY_LABELS, getIndustryColor } from "../lib/taskVisuals";

export default function LandingIndustryStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {INDUSTRY_ORDER.map((id) => (
        <span
          key={id}
          className="rounded-full px-4 py-1.5 font-body text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]"
          style={{ background: `${getIndustryColor(id)}66` }}
        >
          {INDUSTRY_LABELS[id]}
        </span>
      ))}
    </div>
  );
}
