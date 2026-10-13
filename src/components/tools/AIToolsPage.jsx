import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ChevronDown } from "lucide-react";
import ToolDonut from "./ToolDonut";
import ToolLogo from "./ToolLogo";
import ToolDrawer from "./ToolDrawer";
import directory from "../../data/toolDirectory.json";
import stakeholders from "../../data/stakeholders.json";
import phases from "../../data/phases.json";
import { INDUSTRY_ORDER, INDUSTRY_LABELS, getIndustryColor } from "../../lib/taskVisuals";

const { tools, useCases } = directory;
const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]));
const useCaseById = Object.fromEntries(useCases.map((u) => [u.id, u]));
const stakeholderById = Object.fromEntries(stakeholders.map((s) => [s.id, s]));
const COLUMN_PREVIEW = 8;

const uniq = (a) => [...new Set(a)];
const allPainPoints = uniq(useCases.flatMap((u) => u.painPoints));
const allTasks = uniq(useCases.map((u) => u.task));
const allSolutionTypes = uniq(useCases.flatMap((u) => u.solutionTypes)).sort();

// Tools behind a segment, most-used first — feeds the tooltip logo strip.
function toolsWhere(pred) {
  const counts = {};
  useCases.filter(pred).forEach((u) => { counts[u.toolId] = (counts[u.toolId] ?? 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

function byValue(segments) {
  return segments.filter((s) => s.value > 0).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

// The four views mirror the Notion database's chart tabs.
const CHARTS = [
  {
    id: "tools-by-pain",
    tab: "Tools by pain point",
    filterKind: "painPoint",
    unit: "tools",
    center: { value: tools.length, label: "AI tools", sub: `across ${useCases.length} use cases` },
    segments: () =>
      byValue(allPainPoints.map((p) => {
        const ids = toolsWhere((u) => u.painPoints.includes(p));
        return { key: p, label: p, value: ids.length, toolIds: ids };
      })),
  },
  {
    id: "pain-by-role",
    tab: "Pain points by role",
    filterKind: "stakeholder",
    unit: "pain points",
    center: { value: allPainPoints.length, label: "pain points" },
    segments: () =>
      byValue(stakeholders.map((s) => {
        const ucs = useCases.filter((u) => u.stakeholders.includes(s.id));
        return { key: s.id, label: s.label, value: uniq(ucs.flatMap((u) => u.painPoints)).length, toolIds: toolsWhere((u) => u.stakeholders.includes(s.id)) };
      })),
  },
  {
    id: "pain-by-task",
    tab: "Pain points by task",
    filterKind: "task",
    unit: "pain points",
    center: { value: allPainPoints.length, label: "pain points" },
    segments: () =>
      byValue(allTasks.map((t) => {
        const ucs = useCases.filter((u) => u.task === t);
        return { key: t, label: t, value: uniq(ucs.flatMap((u) => u.painPoints)).length, toolIds: toolsWhere((u) => u.task === t) };
      })),
  },
  {
    id: "tasks-by-role",
    tab: "Tasks by role",
    filterKind: "stakeholder",
    unit: "tasks",
    center: { value: allTasks.length, label: "tasks" },
    segments: () =>
      byValue(stakeholders.map((s) => {
        const ucs = useCases.filter((u) => u.stakeholders.includes(s.id));
        return { key: s.id, label: s.label, value: uniq(ucs.map((u) => u.task)).length, toolIds: toolsWhere((u) => u.stakeholders.includes(s.id)) };
      })),
  },
];

const FILTER_KIND_LABEL = { painPoint: "Pain point", stakeholder: "Role", task: "Task" };

function Select({ label, value, onChange, options }) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-full border py-2.5 pl-4 pr-10 font-body text-sm outline-none transition focus-visible:border-[var(--color-brand)] ${
          value ? "border-[var(--color-brand)] bg-[var(--color-brand)]/6 font-semibold text-[var(--color-brand)]" : "border-[var(--color-hairline)] bg-white text-[var(--color-ink)]/75"
        }`}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 text-[var(--color-ink)]/45" />
    </label>
  );
}

function IndustryColumn({ industry, entries, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const color = getIndustryColor(industry);
  const shown = expanded ? entries : entries.slice(0, COLUMN_PREVIEW);

  return (
    <section className="flex min-w-[220px] flex-col rounded-[22px] border-2 bg-white p-3" style={{ borderColor: color }}>
      <header className="flex items-center justify-between rounded-[14px] px-3 py-2.5" style={{ background: color }}>
        <h3 className="font-body text-sm font-bold text-[var(--color-ink)]">{INDUSTRY_LABELS[industry]}</h3>
        <span className="font-body text-sm font-semibold tabular-nums text-[var(--color-ink)]/60">{entries.length}</span>
      </header>

      {entries.length === 0 ? (
        <p className="px-2 py-6 text-center font-body text-sm leading-6 text-[var(--color-ink)]/45">
          No tools match these filters for this industry.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {shown.map(({ tool, count }) => (
            <li key={tool.id}>
              <button
                type="button"
                onClick={() => onOpen(tool)}
                className="flex w-full items-center gap-3 rounded-[14px] border border-[var(--color-hairline)] bg-white p-2.5 text-left transition hover:border-[var(--color-brand)]/40 hover:shadow-[0_8px_20px_rgba(25,52,160,0.10)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
              >
                <ToolLogo tool={tool} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-body text-sm font-semibold text-[var(--color-ink)]">{tool.name}</span>
                  <span className="block font-body text-xs text-[var(--color-ink)]/50">
                    {count} use case{count > 1 ? "s" : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {entries.length > COLUMN_PREVIEW && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 rounded-full py-2 font-body text-sm font-semibold text-[var(--color-brand)] hover:bg-[var(--color-brand)]/6"
        >
          {expanded ? "Show fewer" : `Show all ${entries.length}`}
        </button>
      )}
    </section>
  );
}

export default function AIToolsPage() {
  const [chartId, setChartId] = useState(CHARTS[0].id);
  const [chartFilter, setChartFilter] = useState(null); // { kind, key, label }
  const [phaseId, setPhaseId] = useState("");
  const [solutionType, setSolutionType] = useState("");
  const [query, setQuery] = useState("");
  const [openTool, setOpenTool] = useState(null);

  const chart = CHARTS.find((c) => c.id === chartId);
  const segments = useMemo(() => chart.segments(), [chart]);

  const selectSegment = (seg) => {
    setChartFilter((prev) =>
      prev && prev.kind === chart.filterKind && prev.key === seg.key ? null : { kind: chart.filterKind, key: seg.key, label: seg.label },
    );
  };

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    return useCases.filter((u) => {
      if (chartFilter) {
        if (chartFilter.kind === "painPoint" && !u.painPoints.includes(chartFilter.key)) return false;
        if (chartFilter.kind === "stakeholder" && !u.stakeholders.includes(chartFilter.key)) return false;
        if (chartFilter.kind === "task" && u.task !== chartFilter.key) return false;
      }
      if (phaseId && u.phaseId !== phaseId) return false;
      if (solutionType && !u.solutionTypes.includes(solutionType)) return false;
      if (q) {
        const hay = `${toolsById[u.toolId].name} ${u.scenario} ${u.task}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [chartFilter, phaseId, solutionType, query]);

  // A tool sits in every industry column where at least one matching use case
  // names a stakeholder from that industry, ranked by how many such use cases.
  const columns = useMemo(() => {
    const out = Object.fromEntries(INDUSTRY_ORDER.map((i) => [i, {}]));
    matching.forEach((u) => {
      uniq(u.stakeholders.map((s) => stakeholderById[s]?.industry).filter(Boolean)).forEach((ind) => {
        out[ind][u.toolId] = (out[ind][u.toolId] ?? 0) + 1;
      });
    });
    return Object.fromEntries(
      INDUSTRY_ORDER.map((ind) => [
        ind,
        Object.entries(out[ind])
          .map(([id, count]) => ({ tool: toolsById[id], count }))
          .sort((a, b) => b.count - a.count || a.tool.name.localeCompare(b.tool.name)),
      ]),
    );
  }, [matching]);

  const matchingToolCount = uniq(matching.map((u) => u.toolId)).length;
  const anyFilter = chartFilter || phaseId || solutionType || query;
  const clearAll = () => { setChartFilter(null); setPhaseId(""); setSolutionType(""); setQuery(""); };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-[1320px] px-6 pb-24 pt-2 md:px-16"
    >
      {/* Header + chart are sized to fit in the first screen (nav included) on a laptop. */}
      <header>
        <h1 className="font-display text-3xl font-bold leading-tight text-[var(--color-ink)] md:text-4xl">
          Explore the AI tools your project needs
        </h1>
        <p className="mt-2 font-body text-base leading-7 text-[var(--color-ink)]/65">
          {tools.length} ready-to-use tools, mapped to the pain points, roles and tasks they solve across {useCases.length} use cases.
        </p>
      </header>

      <section className="mt-6 rounded-[28px] border border-[var(--color-hairline)] bg-white px-6 py-5 md:px-8">
        <div role="tablist" aria-label="Chart view" className="flex flex-wrap gap-2">
          {CHARTS.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === chartId}
              type="button"
              onClick={() => setChartId(c.id)}
              className={`rounded-full px-4 py-2 font-body text-sm transition ${
                c.id === chartId
                  ? "bg-[var(--color-brand)] font-semibold text-white"
                  : "bg-[var(--color-paper-dim)] text-[var(--color-ink)]/70 hover:text-[var(--color-ink)]"
              }`}
            >
              {c.tab}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <ToolDonut
            key={chart.id}
            segments={segments}
            center={chart.center}
            unit={chart.unit}
            selectedKey={chartFilter?.kind === chart.filterKind ? chartFilter.key : null}
            onSelect={selectSegment}
            toolsById={toolsById}
          />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="tool-list-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="tool-list-title" className="font-display text-2xl font-bold text-[var(--color-ink)]">
              Browse by industry
            </h2>
            <p className="mt-1 font-body text-sm text-[var(--color-ink)]/55">
              Showing {matchingToolCount} of {tools.length} tools. A tool appears under every industry whose roles use it.
            </p>
          </div>
          {anyFilter && (
            <button type="button" onClick={clearAll} className="font-body text-sm font-semibold text-[var(--color-brand)] underline underline-offset-4">
              Clear all filters
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="relative flex min-w-[240px] flex-1 items-center md:max-w-[320px]">
            <Search size={16} className="pointer-events-none absolute left-4 text-[var(--color-ink)]/40" />
            <span className="sr-only">Search tools</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, scenarios or tasks"
              className="w-full rounded-full border border-[var(--color-hairline)] bg-white py-2.5 pl-10 pr-4 font-body text-sm outline-none focus:border-[var(--color-brand)]"
            />
          </label>
          <Select
            label="All phases"
            value={phaseId}
            onChange={setPhaseId}
            options={phases.map((p) => ({ value: p.id, label: p.label }))}
          />
          <Select
            label="All solution types"
            value={solutionType}
            onChange={setSolutionType}
            options={allSolutionTypes.map((t) => ({ value: t, label: t }))}
          />
          {chartFilter && (
            <span className="flex items-center gap-2 rounded-full bg-[var(--color-brand)] py-2 pl-4 pr-2 font-body text-sm text-white">
              <span className="text-white/70">{FILTER_KIND_LABEL[chartFilter.kind]}:</span>
              <span className="max-w-[260px] truncate font-semibold">
                {chartFilter.kind === "stakeholder" ? stakeholderById[chartFilter.key]?.label : chartFilter.label}
              </span>
              <button
                type="button"
                onClick={() => setChartFilter(null)}
                aria-label="Remove chart filter"
                className="rounded-full p-1 hover:bg-white/20"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>

        {matching.length === 0 ? (
          <div className="mt-8 rounded-[22px] border border-dashed border-[var(--color-hairline)] p-10 text-center">
            <p className="font-body text-base text-[var(--color-ink)]/70">No tools match this combination of filters.</p>
            <button type="button" onClick={clearAll} className="mt-3 font-body text-sm font-semibold text-[var(--color-brand)] underline underline-offset-4">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 overflow-x-auto pb-2 [grid-template-columns:repeat(5,minmax(220px,1fr))]">
            {INDUSTRY_ORDER.map((ind) => (
              <IndustryColumn key={`${ind}-${matching.length}`} industry={ind} entries={columns[ind]} onOpen={setOpenTool} />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {openTool && (
          <ToolDrawer
            key={openTool.id}
            tool={openTool}
            useCases={openTool.useCaseIds.map((id) => useCaseById[id])}
            onClose={() => setOpenTool(null)}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
