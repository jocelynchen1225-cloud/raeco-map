import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, X } from "lucide-react";
import stakeholders from "../data/stakeholders.json";
import aalScenarioInsights from "../data/aalScenarioInsights.json";
import aalLogoDataUrl from "../../public/logo.png?inline";
import { sortedPhases } from "../lib/taskVisuals";

const stakeholderById = Object.fromEntries(stakeholders.map((s) => [s.id, s]));

const defaultPainStyle = {
  bg: "rgba(241,245,249,.78)",
  border: "rgba(203,213,225,.78)",
  text: "#475569",
  accent: "#94A3B8",
};

const painStyles = {
  "Manual & Repetitive Work": {
    bg: "#dbeafe",
    border: "#93c5fd",
    text: "#315783",
    accent: "#6b8fd6",
  },
  "Workforce & Skills Gap": {
    bg: "#e0e7ff",
    border: "#a5b4fc",
    text: "#3f4b83",
    accent: "#7c8ce3",
  },
  "Productivity Tracking Gaps": {
    bg: "#e2e8f0",
    border: "#cbd5e1",
    text: "#475569",
    accent: "#94a3b8",
  },
  "Data Fragmentation": {
    bg: "#eef8ee",
    border: "#c4dec9",
    text: "#4f7259",
    accent: "#86b892",
  },
  "Document Management": {
    bg: "#e2f3e6",
    border: "#b7d8bf",
    text: "#496b53",
    accent: "#72ad80",
  },
  "Knowledege Fragmentation": {
    bg: "#f5f8e8",
    border: "#d7e4b8",
    text: "#667646",
    accent: "#a9bc73",
  },
  "Knowledge Fragmentation": {
    bg: "#f5f8e8",
    border: "#d7e4b8",
    text: "#667646",
    accent: "#a9bc73",
  },
  "Data and Integration Challenge": {
    bg: "#eaf5f0",
    border: "#bfd9cc",
    text: "#537263",
    accent: "#78a98f",
  },
  "Decision Support Deficit": {
    bg: "#fef3c7",
    border: "#fcd34d",
    text: "#805d28",
    accent: "#d39a48",
  },
  "Cost & Schedule Uncertainty": {
    bg: "#ffedd5",
    border: "#fdba74",
    text: "#84502f",
    accent: "#dc8a4a",
  },
  "ROI and Cost Uncertainty": {
    bg: "#fee2c5",
    border: "#f6a95f",
    text: "#7a4c32",
    accent: "#c98140",
  },
  "Procurement Inefficiency": {
    bg: "#fff7ed",
    border: "#fed7aa",
    text: "#8a5a36",
    accent: "#df9f60",
  },
  "Design Error & Coordination Gaps": {
    bg: "#ede9fe",
    border: "#c4b5fd",
    text: "#60458b",
    accent: "#9877d9",
  },
  "Safety & Risk Management": {
    bg: "#fce7f3",
    border: "#f9a8d4",
    text: "#83445f",
    accent: "#c87991",
  },
  "Compliance & Regulatory Burden": {
    bg: "#fee2e2",
    border: "#fca5a5",
    text: "#8a3b3b",
    accent: "#d86b6b",
  },
  "AI Hallucinations": {
    bg: "#f5f3ff",
    border: "#ddd6fe",
    text: "#6a5585",
    accent: "#a994d6",
  },
  "Internal Alignment Needed": {
    bg: "#fdf2f8",
    border: "#fbcfe8",
    text: "#7b5066",
    accent: "#d58aa9",
  },
};

function painStyle(label = "") {
  return painStyles[label] ?? defaultPainStyle;
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

function getAalInsight(scenario) {
  return scenario?.id ? aalScenarioInsights[scenario.id] : null;
}

function savedScenarioRecords(savedScenarioIds) {
  const ids = savedScenarioIds ?? new Set();
  return sortedPhases.flatMap((phase) =>
    phase.tasks.flatMap((task) =>
      (task.scenarios ?? [])
        .filter((scenario) => ids.has(scenario.id))
        .map((scenario) => ({ phase, task, scenario }))
    )
  );
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function reportPainTag(point) {
  const style = painStyle(point);
  return `<span style="background:${style.bg};border-color:${style.border};color:${style.text};">${escapeHtml(point)}</span>`;
}

function exportSavedReport(records, contact = {}) {
  const rows = records
    .map(({ phase, task, scenario }, index) => {
      const painPoints = scenario.painPoints?.length ? scenario.painPoints : scenario.painPoint ? [scenario.painPoint] : [];
      const solutions = scenario.aiTools?.length ? scenario.aiTools : scenario.solutions ?? [];
      const aalInsight = getAalInsight(scenario);
      return `
        <article class="scenario">
          <div class="scenario-index">Scenario ${index + 1}</div>
          <h2>${escapeHtml(scenario.label || scenario.name)}</h2>
          <div class="meta">${escapeHtml(phase.fullLabel ?? `${phase.order}. ${phase.label}`)} · ${escapeHtml(task.label)}</div>
          <div class="tags">${painPoints.map((point) => reportPainTag(point)).join("")}</div>
          <p>${escapeHtml(scenario.description)}</p>
          <dl>
            <dt>Stakeholders</dt>
            <dd>${escapeHtml((scenario.stakeholderLabels?.length ? scenario.stakeholderLabels : scenario.stakeholders?.map((id) => getStakeholderLabel(id))).join(" | "))}</dd>
            <dt>AI Solutions</dt>
            <dd>${escapeHtml(solutions.join(" | ") || "To be reviewed")}</dd>
            <dt>AI Value</dt>
            <dd>${escapeHtml(scenario.aiValue || scenario.howAiSolves || "To be reviewed")}</dd>
            ${
              aalInsight?.evaluation
                ? `<dt>AAL Evaluation</dt><dd>${escapeHtml(aalInsight.evaluation)}</dd>`
                : ""
            }
            ${
              aalInsight?.recommendedPath
                ? `<dt>Recommended Path</dt><dd><span class="path-chip">${escapeHtml(aalInsight.recommendedPath)}</span></dd>`
                : ""
            }
            ${
              aalInsight?.aalRole
                ? `<dt>AAL Role</dt><dd>${escapeHtml(aalInsight.aalRole)}</dd>`
                : ""
            }
            ${
              aalInsight?.suggestedSolutionDirection
                ? `<dt>Solution Direction</dt><dd>${escapeHtml(aalInsight.suggestedSolutionDirection)}</dd>`
                : ""
            }
            ${
              aalInsight?.solution
                ? `<dt>AAL Consultancy Solution</dt><dd><strong>${escapeHtml(aalInsight.solution.name)}</strong><br />${escapeHtml(aalInsight.solution.summary)}<br /><span class="solution-status">${escapeHtml(aalInsight.solution.status)}</span></dd>`
                : ""
            }
          </dl>
        </article>
      `;
    })
    .join("");

  const preparedName = [contact.firstName, contact.surname].filter(Boolean).join(" ");
  const preparedLines = [
    preparedName && `<b>Prepared for:</b> ${escapeHtml(preparedName)}`,
    contact.company && `<b>Company:</b> ${escapeHtml(contact.company)}`,
    contact.position && `<b>Position:</b> ${escapeHtml(contact.position)}`,
    `<b>Generated:</b> ${new Date().toLocaleDateString()}`,
  ].filter(Boolean);

  const reportHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>AAL Saved Pain Point Scenario Report</title>
        <style>
          @page { size: A4; margin: 16mm; }
          body { margin: 0; font-family: Inter, Arial, sans-serif; color: #101828; background: #eef3f8; font-size: 13px; }
          .page { max-width: 820px; margin: 22px auto; background: rgba(255,255,255,.94); border: 1px solid #fff; border-radius: 22px; padding: 28px; box-shadow: 0 20px 58px rgba(43,58,90,.13); }
          .header { display: flex; align-items: center; justify-content: space-between; gap: 22px; border-bottom: 1px solid #e2e8f0; padding-bottom: 18px; }
          .logo { width: 58px; height: 58px; border-radius: 13px; display: block; object-fit: cover; box-shadow: 0 12px 26px rgba(25,52,160,.16); }
          h1 { margin: 0; color: #1934a0; font-size: 26px; line-height: 1.12; }
          .subtitle { margin-top: 8px; color: #667085; font-size: 12px; line-height: 1.55; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 18px 0; }
          .summary div { border: 1px solid #dbe3ef; background: #f8fafc; border-radius: 13px; padding: 11px 12px; font-size: 12px; font-weight: 800; color: #1934a0; }
          .scenario { break-inside: avoid; page-break-inside: avoid; border: 1px solid #dbe3ef; background: #fff; border-radius: 18px; padding: 18px; margin-top: 14px; }
          .scenario-index { color: #667085; text-transform: uppercase; letter-spacing: .16em; font-size: 10px; font-weight: 900; }
          h2 { margin: 8px 0 6px; font-size: 19px; line-height: 1.24; }
          .meta { color: #667085; font-size: 11px; font-weight: 700; }
          .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
          .tags span { border-radius: 999px; border: 1px solid; padding: 4px 8px; font-size: 10px; font-weight: 800; }
          p { color: #344054; line-height: 1.55; margin: 10px 0; }
          dl { display: grid; grid-template-columns: 118px 1fr; gap: 8px 13px; margin-top: 14px; }
          dt { color: #667085; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; }
          dd { margin: 0; color: #101828; font-size: 12px; font-weight: 700; line-height: 1.42; }
          .path-chip { display: inline-block; border-radius: 999px; background: #eef2ff; border: 1px solid #c7d2fe; color: #2742a6; padding: 4px 8px; font-size: 10px; font-weight: 900; }
          .solution-status { display: inline-block; margin-top: 6px; border-radius: 999px; background: #eff6ff; border: 1px solid #bfdbfe; color: #315783; padding: 3px 7px; font-size: 10px; font-weight: 900; }
          .prepared-for { margin-top: 12px; font-size: 12px; line-height: 1.7; color: #475569; }
          .prepared-for b { color: #101828; }
          .actions { position: sticky; bottom: 18px; margin-top: 22px; display: flex; justify-content: flex-end; pointer-events: none; }
          button { pointer-events: auto; border: 0; border-radius: 999px; background: #1934a0; color: #fff; padding: 10px 15px; font-size: 11px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; box-shadow: 0 12px 28px rgba(25,52,160,.18); }
          @media print { body { background: #fff; font-size: 11px; } .page { box-shadow: none; margin: 0; max-width: none; border: 0; border-radius: 0; padding: 0; } .scenario { padding: 14px; margin-top: 10px; } .actions { display: none; } }
        </style>
        <script>
          function printReport() {
            requestAnimationFrame(function () {
              window.focus();
              window.print();
            });
          }
        </script>
      </head>
      <body>
        <main class="page">
          <header class="header">
            <div>
              <h1>Saved Pain Point Scenario Report</h1>
              <div class="subtitle">AAL Innovation · RAECO AI Map<br />Generated from saved scenarios in the prototype.</div>
              <div class="prepared-for">${preparedLines.map((line) => `<div>${line}</div>`).join("")}</div>
            </div>
            <img class="logo" src="${aalLogoDataUrl}" alt="AAL Innovation" />
          </header>
          <section class="summary">
            <div>${records.length} saved scenarios</div>
            <div>${new Set(records.map((record) => record.task.id)).size} tasks</div>
            <div>${new Set(records.flatMap((record) => record.scenario.painPoints ?? [])).size} pain point types</div>
          </section>
          ${rows || "<p>No saved scenarios yet.</p>"}
          <div class="actions"><button type="button" onclick="printReport()">Print / Save PDF</button></div>
        </main>
      </body>
    </html>
  `;
  const reportBlob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
  const reportUrl = URL.createObjectURL(reportBlob);
  const reportWindow = window.open(reportUrl, "_blank");

  if (!reportWindow) {
    const link = document.createElement("a");
    link.href = reportUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function FavoriteButton({ active, onClick, label = "Save scenario" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5 ${
        active
          ? "border-amber-200 bg-amber-50 text-amber-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75),inset_0_0_14px_rgba(245,166,35,0.18)]"
          : "border-slate-200/80 bg-white/72 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:text-[var(--color-brand)]"
      }`}
    >
      <Star size={18} strokeWidth={2} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

function ScenarioCard({ scenario, index, onExploreScenario, isSaved, onToggleSavedScenario }) {
  const painPoints = scenario.painPoints?.length ? scenario.painPoints : scenario.painPoint ? [scenario.painPoint] : [];
  const primary = painStyle(painPoints[0] || scenario.label);
  const tools = scenario.aiTools?.length ? scenario.aiTools : scenario.solutions ?? [];
  const stakeholderLabels = scenario.stakeholders?.length
    ? scenario.stakeholders.map((id, i) => getStakeholderLabel(id, scenario.stakeholderLabels?.[i]))
    : scenario.stakeholderLabels ?? [];
  const aalInsight = getAalInsight(scenario);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: Math.min(index * 0.045, 0.35) }}
      className="relative rounded-[28px] border border-white/80 bg-white/78 p-7 text-left shadow-[0_26px_70px_rgba(48,58,86,0.15)] backdrop-blur-2xl"
      style={{
        boxShadow:
          "inset 10px 12px 24px rgba(255,255,255,.86), inset -10px -12px 22px rgba(148,163,184,.08), 0 26px 70px rgba(48,58,86,.15)",
      }}
    >
      <div className="absolute right-5 top-5">
        <FavoriteButton active={isSaved} onClick={() => onToggleSavedScenario?.(scenario.id)} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="h-[3px] w-7 rounded-full" style={{ background: primary.accent }} />
        <p className="font-body text-[12px] font-extrabold uppercase tracking-[0.24em] text-slate-500">
          Scenario {index + 1}
        </p>
      </div>

      <h2 className="pr-12 font-body text-[22px] font-extrabold leading-tight text-slate-950">
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

      {aalInsight && (
        <section className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.72)]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-body text-[12px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-brand)]">
              AAL Evaluation
            </p>
            {aalInsight.recommendedPath && (
              <span className="rounded-full border border-blue-200 bg-white/70 px-2.5 py-1 font-body text-[11px] font-extrabold text-blue-700">
                {aalInsight.recommendedPath}
              </span>
            )}
          </div>
          <p className="mt-2 font-body text-[13px] font-semibold leading-6 text-slate-700">
            {aalInsight.evaluation}
          </p>
          {aalInsight.solution && (
            <div className="mt-4 rounded-xl border border-white/80 bg-white/70 p-3">
              <p className="font-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
                AAL Consultancy Solution
              </p>
              <p className="mt-1 font-body text-[14px] font-extrabold text-slate-900">
                {aalInsight.solution.name}
              </p>
              <p className="mt-1 font-body text-[13px] font-medium leading-5 text-slate-600">
                {aalInsight.solution.summary}
              </p>
              <span className="mt-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-body text-[11px] font-extrabold text-blue-700">
                {aalInsight.solution.status}
              </span>
            </div>
          )}
        </section>
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

function ContactField({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={`flex flex-col gap-1 font-body text-xs text-slate-600 ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 p-2 text-sm text-slate-900 outline-none focus:border-[var(--color-brand)]"
      />
    </label>
  );
}

// Gate in front of the existing export flow — collects lead info, then calls
// the SAME exportSavedReport(records) as before. Doesn't touch the report's
// HTML/PDF output at all.
function ContactGateModal({ onSubmit, onClose }) {
  const [contact, setContact] = useState({ firstName: "", surname: "", email: "", company: "", position: "" });
  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(20,24,38,0.45)] p-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        className="relative w-full max-w-[480px] rounded-3xl bg-white p-9 shadow-[0_30px_80px_rgba(25,52,160,0.35)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
        >
          <X size={18} />
        </button>
        <p className="font-body text-sm font-extrabold text-slate-900">A couple of details before your report</p>
        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(contact);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <ContactField label="First Name" value={contact.firstName} onChange={(v) => setContact((c) => ({ ...c, firstName: v }))} />
            <ContactField label="Surname" value={contact.surname} onChange={(v) => setContact((c) => ({ ...c, surname: v }))} />
            <ContactField
              label="Email"
              type="email"
              className="col-span-2"
              value={contact.email}
              onChange={(v) => setContact((c) => ({ ...c, email: v }))}
            />
            <ContactField label="Company" value={contact.company} onChange={(v) => setContact((c) => ({ ...c, company: v }))} />
            <ContactField label="Position" value={contact.position} onChange={(v) => setContact((c) => ({ ...c, position: v }))} />
          </div>
          <button
            type="submit"
            className="mt-1 self-end rounded-lg bg-[var(--color-brand)] px-8 py-2.5 font-body text-sm font-semibold text-white"
          >
            Export your report
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function TaskDetailOverlay({ task, savedScenarioIds, onToggleSavedScenario, onBack, onExploreScenario }) {
  const scenarios = task?.scenarios ?? [];
  const columns = distributeScenarios(scenarios, 3);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showContactGate, setShowContactGate] = useState(false);
  const savedRecords = savedScenarioRecords(savedScenarioIds);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="relative min-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden bg-[var(--color-paper)]"
    >
      <div className="relative z-10 px-6 pb-16 pt-9 md:px-10">
        <div className="flex items-start gap-5">
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/85 bg-white/78 px-5 py-4 font-body text-[16px] font-extrabold text-slate-950 shadow-[0_18px_50px_rgba(48,58,86,.13)] backdrop-blur-2xl transition hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} /> back
          </button>

          <div className="min-w-0 max-w-[980px] flex-[1_1_auto] rounded-[26px] border border-white/85 bg-white/72 px-7 py-5 shadow-[0_18px_60px_rgba(48,58,86,.13)] backdrop-blur-2xl">
            <p className="font-body text-[14px] font-extrabold text-[var(--color-brand)]">Task Preview</p>
            <h1 className="mt-1 font-body text-[28px] font-extrabold leading-tight text-slate-950">
              {task?.label ?? "Task Preview"}
            </h1>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSavedPanel((open) => !open)}
              className="flex h-16 items-center gap-2 rounded-2xl border border-white/85 bg-white/76 px-5 font-body text-[14px] font-extrabold text-[var(--color-brand)] shadow-[0_18px_50px_rgba(48,58,86,.13)] backdrop-blur-2xl transition hover:-translate-y-0.5"
            >
              <Star size={17} strokeWidth={2.1} fill={savedScenarioIds?.size ? "currentColor" : "none"} />
              Saved Scenarios
              <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[11px] text-white">
                {savedScenarioIds?.size ?? 0}
              </span>
            </button>

            {showSavedPanel && (
              <>
                {/* Click-outside-to-close backdrop — sits below the panel, above
                    everything else, so it never intercepts the panel's own clicks. */}
                <button
                  type="button"
                  aria-label="Dismiss saved scenarios"
                  onClick={() => setShowSavedPanel(false)}
                  className="fixed inset-0 z-20 cursor-default"
                />
                <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[340px] rounded-3xl border border-white/85 bg-white/88 p-5 shadow-[0_26px_70px_rgba(48,58,86,0.18)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between">
                    <p className="font-body text-[13px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
                      Saved Scenarios
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSavedPanel(false)}
                      aria-label="Close saved scenarios panel"
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                {savedRecords.length === 0 ? (
                  <p className="mt-3 font-body text-sm font-semibold leading-6 text-slate-500">
                    No saved scenarios yet. Use the star on a scenario card to save it.
                  </p>
                ) : (
                  <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                    {savedRecords.map(({ phase, task: savedTask, scenario }) => (
                      <div key={scenario.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3">
                        <p className="font-body text-sm font-extrabold leading-5 text-slate-900">
                          {scenario.label || scenario.name}
                        </p>
                        <p className="mt-1 font-body text-[11px] font-bold leading-4 text-slate-500">
                          {phase.order}. {phase.label} · {savedTask.label}
                        </p>
                        <button
                          type="button"
                          onClick={() => onToggleSavedScenario?.(scenario.id)}
                          className="mt-2 font-body text-xs font-bold text-slate-500 underline underline-offset-4"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowContactGate(true)}
                  disabled={savedRecords.length === 0}
                  className="mt-5 w-full rounded-full bg-[var(--color-brand)] px-4 py-2.5 font-body text-xs font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_14px_30px_rgba(25,52,160,0.20)]"
                >
                  Export Saved Report
                </button>
                <p className="mt-3 font-body text-xs font-semibold leading-5 text-slate-500">
                  Future report export can include the AAL logo, task context, pain points, scenarios, and AI solutions.
                </p>
                </div>
              </>
            )}
          </div>
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
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    index={index}
                    isSaved={savedScenarioIds?.has(scenario.id)}
                    onToggleSavedScenario={onToggleSavedScenario}
                    onExploreScenario={onExploreScenario}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showContactGate && (
          <ContactGateModal
            onClose={() => setShowContactGate(false)}
            onSubmit={(contact) => {
              // TODO: send `contact` to a CRM/email endpoint once one exists.
              console.info("Report requested by:", contact);
              exportSavedReport(savedRecords, contact);
              setShowContactGate(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
