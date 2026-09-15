const STATS = [
  { value: "200+", label: "AI Solutions" },
  { value: "80+", label: "Scenraios" },
  { value: "10+", label: "Countries\nreached" },
  { value: "400+", label: "Clients" },
];

export default function StatsGrid() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center justify-center gap-1 rounded-lg border border-[var(--color-ink)] px-4 py-6 text-center"
        >
          <span className="font-body text-3xl font-semibold text-[var(--color-brand)]">
            {stat.value}
          </span>
          <span className="whitespace-pre-line font-body text-base font-semibold text-[var(--color-brand)]">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
