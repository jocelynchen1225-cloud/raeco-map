const STATS = [
  { value: "200+", label: "AI Solutions", blurb: "Curated from across the AEC industry, from BIM automation to site safety monitoring." },
  { value: "80+", label: "Scenarios", blurb: "Real day-to-day tasks, mapped from Pre-Design through Operations." },
  { value: "10+", label: "Countries reached", blurb: "Insights and case studies drawn from projects across the globe." },
  { value: "400+", label: "Clients", blurb: "AEC firms already using this to plan their AI adoption." },
];

export default function StatsGrid() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-[var(--color-ink)] px-4 py-4 text-center"
        >
          <span className="font-body text-3xl font-semibold text-[var(--color-brand)]">{stat.value}</span>
          <span className="whitespace-pre-line font-body text-base font-semibold text-[var(--color-brand)]">
            {stat.label}
          </span>
          <span className="mt-1 font-body text-xs leading-snug text-[var(--color-ink)]/60">{stat.blurb}</span>
        </div>
      ))}
    </div>
  );
}
