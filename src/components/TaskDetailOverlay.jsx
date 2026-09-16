import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import stakeholders from "../data/stakeholders.json";

const stakeholderById = Object.fromEntries(stakeholders.map((s) => [s.id, s]));

const painPalette = [
  { bg: "rgba(219,234,254,.72)", border: "rgba(96,165,250,.38)", text: "#315783", accent: "#6B8FD6" },
  { bg: "rgba(220,252,231,.64)", border: "rgba(74,222,128,.34)", text: "#2F6F4B", accent: "#66B486" },
  { bg: "rgba(254,243,199,.68)", border: "rgba(251,191,36,.35)", text: "#805D28", accent: "#D39A48" },
  { bg: "rgba(237,233,254,.70)", border: "rgba(167,139,250,.36)", text: "#60458B", accent: "#9877D9" },
  { bg: "rgba(252,231,243,.64)", border: "rgba(244,114,182,.30)", text: "#83445F", accent: "#C87991" },
  { bg: "rgba(224,242,254,.66)", border: "rgba(34,211,238,.32)", text: "#286579", accent: "#4CBAC8" },
  { bg: "rgba(255,237,213,.66)", border: "rgba(251,146,60,.30)", text: "#84502F", accent: "#DC8A4A" },
];

function hashText(text = "") {
  return [...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function painStyle(label = "") {
  return painPalette[hashText(label) % painPalette.length];
}

function initials(name = "AI") {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AI";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function scenarioWeight(s) {
  return (s.description?.length ?? 0) + (s.aiValue?.length ?? 0) + (s.aiTools?.length ?? 0) * 80 + (s.painPoints?.length ?? 0) * 45;
}

function distributeScenarios(scenarios, columnCount = 3) {
  const columns = Array.from({ length: columnCount }, () => ({ weight: 0, items: [] }));
  scenarios.forEach((scenario, index) => {
    const target = columns.reduce((best, col) => (col.weight < best.weight ? col : best), columns[0]);
    target.items.push({ scenario, index });
    target.weight += scenarioWeight(scenario);
  });
  return columns.map((col) => col.items);
}

function getStakeholderLabel(id, fallback) {
  return stakeholderById[id]?.label ?? fallback ?? id;
}

function ScenarioCard({ scenario, index, onExploreScenario }) {
  const painPoints = scenario.painPoints?.length ? scenario.painPoints : scenario.painPoint ? [scenario.painPoint] : [];
  const primary = painStyle(painPoints[0] || scenario.label);
  const tools = scenario.aiTools?.length ? scenario.aiTools : scenario.solutions ?? [];
  const stakeholderLabels = scenario.stakeholders?.length
    ? scenario.stakeholders.map((id, i) => getStakeholderLabel(id, scenario.stakeholderLabels?.[i]))
    : scenario.stakeholderLabels ?? [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: Math.min(index * 0.045, 0.35) }}
      className="rounded-[28px] border border-white/80 bg-white/78 p-7 text-left shadow-[0_26px_70px_rgba(48,58,86,0.15)] backdrop-blur-2xl"
      style={{
        boxShadow:
          "inset 10px 12px 24px rgba(255,255,255,.86), inset -10px -12px 22px rgba(148,163,184,.08), 0 26px 70px rgba(48,58,86,.15)",
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-[3px] w-7 rounded-full" style={{ background: primary.accent }} />
        <p className="font-body text-[12px] font-extrabold uppercase tracking-[0.24em] text-slate-500">
          Scenario {index + 1}
        </p>
      </div>

      <h2 className="font-body text-[22px] font-extrabold leading-tight text-slate-950">
        {scenario.label || scenario.name}
      </h2>

      {painPoints.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {painPoints.map((point) => {
            const style = painStyle(point);
            return (
              <span
                key={point}
                className="rounded-full border px-3 py-1 font-body text-[12px] font-bold"
                style={{ background: style.bg, borderColor: style.border, color: style.text }}
              >
                {point}
              </span>
            );
          })}
        </div>
      )}

      {scenario.description && (
        <p className="mt-5 font-body text-[15px] font-medium leading-7 text-slate-700">
          {scenario.description}
        </p>
      )}

      {stakeholderLabels.length > 0 && (
        <section className="mt-6">
          <p className="font-body text-[12px] font-extrabold uppercase tracking-[0.28em] text-slate-950">Stakeholders</p>
          <p className="mt-2 font-body text-[14px] font-bold leading-6 text-slate-700">
            {stakeholderLabels.join(" | ")}
          </p>
        </section>
      )}

      {tools.length > 0 && (
        <section className="mt-6">
          <p className="font-body text-[12px] font-extrabold uppercase tracking-[0.28em] text-slate-950">AI Solutions</p>
          <div className="mt-3 space-y-2">
            {tools.map((tool) => (
              <div
                key={tool}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/55 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.9)]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-body text-[12px] font-extrabold text-white"
                  style={{ background: primary.accent }}
                >
                  {initials(tool)}
                </span>
                <span className="font-body text-[14px] font-extrabold text-slate-900">{tool}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {scenario.aiTechniques?.length > 0 && (
        <p className="mt-4 font-body text-[12px] font-extrabold leading-5 text-slate-500">
          {scenario.aiTechniques.join(" · ")}
        </p>
      )}

      {scenario.aiValue && (
        <p className="mt-4 border-l-2 pl-4 font-body text-[14px] leading-6 text-slate-700" style={{ borderColor: primary.accent }}>
          {scenario.aiValue}
        </p>
      )}

      {(scenario.solutionTypes?.length > 0 || scenario.deploymentModels?.length > 0) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {[...(scenario.solutionTypes ?? []), ...(scenario.deploymentModels ?? [])].map((tag) => (
            <span key={tag} className="rounded-full border border-slate-300/80 bg-white/70 px-3 py-1 font-body text-[12px] font-extrabold text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={() => onExploreScenario?.(scenario)}
          className="group inline-flex items-center gap-2 rounded-full border border-white/80 bg-[var(--color-brand)] px-5 py-2.5 font-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_rgba(25,52,160,0.24)] transition hover:-translate-y-0.5 hover:bg-slate-950 hover:shadow-[0_18px_38px_rgba(15,23,42,0.22)]"
        >
          Explore
          <span className="text-base leading-none transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </motion.article>
  );
}

export default function TaskDetailOverlay({ task, onBack, onExploreScenario }) {
  const scenarios = task?.scenarios ?? [];
  const columns = distributeScenarios(scenarios, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="relative min-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden bg-[#e9eef5]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(84,104,135,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(84,104,135,.12) 1px, transparent 1px), radial-gradient(circle at 70% 35%, rgba(91,169,235,.18), transparent 32%), radial-gradient(circle at 20% 75%, rgba(139,92,246,.11), transparent 30%)",
          backgroundSize: "72px 72px, 72px 72px, 100% 100%, 100% 100%",
        }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-36 bg-gradient-to-b from-white/80 to-transparent" />

      <div className="relative z-10 px-6 pb-16 pt-9 md:px-10">
        <div className="flex items-start gap-5">
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/85 bg-white/78 px-5 py-4 font-body text-[16px] font-extrabold text-slate-950 shadow-[0_18px_50px_rgba(48,58,86,.13)] backdrop-blur-2xl transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} /> back
          </button>

          <div className="min-w-0 flex-1 rounded-[26px] border border-white/85 bg-white/72 px-7 py-5 shadow-[0_18px_60px_rgba(48,58,86,.13)] backdrop-blur-2xl">
            <p className="font-body text-[14px] font-extrabold text-[var(--color-brand)]">Task Preview</p>
            <h1 className="mt-1 font-body text-[28px] font-extrabold leading-tight text-slate-950">
              {task?.label ?? "Task Preview"}
            </h1>
          </div>

          <button
            type="button"
            onClick={onBack}
            aria-label="Close task preview"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/85 bg-white/76 text-slate-950 shadow-[0_18px_50px_rgba(48,58,86,.13)] backdrop-blur-2xl transition hover:-translate-y-0.5"
          >
            <X size={22} />
          </button>
        </div>

        {scenarios.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-dashed border-slate-300 bg-white/68 p-10 text-center shadow-[0_22px_60px_rgba(48,58,86,.12)] backdrop-blur-2xl">
            <p className="font-body text-lg font-extrabold text-slate-800">No scenario content yet for this task</p>
            <p className="mt-2 font-body text-sm font-medium text-slate-500">This task exists in the real phase/task dataset, but the current AI solution dataset has no matched scenario rows for it yet.</p>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-8 xl:grid-cols-3 lg:grid-cols-2">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex min-w-0 flex-col gap-8">
                {column.map(({ scenario, index }) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} index={index} onExploreScenario={onExploreScenario} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
