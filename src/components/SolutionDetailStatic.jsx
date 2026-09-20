import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import aalScenarioInsights from "../data/aalScenarioInsights.json";
import aiTools from "../data/aiTools.json";
import StaticHotspotImage from "./StaticHotspotImage";

function SwappLogo({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <path d="M4 26 L18 12 L26 20 L36 10" stroke="#1B4CE0" strokeWidth="7" strokeLinecap="round" />
      <path d="M4 34 L14 24" stroke="#1B4CE0" strokeWidth="7" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

function FavoriteButton({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Remove saved scenario" : "Save scenario"}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-extrabold transition hover:-translate-y-0.5 ${
        active
          ? "border-amber-200 bg-amber-50 text-amber-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75),inset_0_0_14px_rgba(245,166,35,0.18)]"
          : "border-slate-200/80 bg-white/72 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:text-[var(--color-brand)]"
      }`}
    >
      <Star size={17} strokeWidth={2} fill={active ? "currentColor" : "none"} />
      {active ? "Saved" : "Save Scenario"}
    </button>
  );
}

export default function SolutionDetailStatic({ task, scenario, backdropConfig, savedScenarioIds, onToggleSavedScenario, onBack }) {
  const tool = aiTools.find((t) => scenario?.aiTools?.includes(t.id));
  const [hovered, setHovered] = useState(false);
  const isSaved = Boolean(scenario?.id && savedScenarioIds?.has(scenario.id));
  const aalInsight = scenario?.id ? aalScenarioInsights[scenario.id] : null;

  return (
    <div className="relative min-h-[calc(100vh-100px)] overflow-hidden">
      {backdropConfig && <StaticHotspotImage config={backdropConfig} blurred />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 md:px-0"
      >
      <button
        type="button"
        onClick={onBack}
        className="w-fit font-body text-sm text-[var(--color-brand)] underline underline-offset-4"
      >
        ← back
      </button>

      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="font-body text-sm text-[var(--color-brand)]">Task Preview</p>
          <p className="font-body text-xl font-semibold text-[var(--color-ink)]">{task?.label}</p>
        </div>
        {scenario && (
          <FavoriteButton
            active={isSaved}
            onClick={() => onToggleSavedScenario?.(scenario.id)}
          />
        )}
      </div>

      <p className="font-body text-lg font-semibold text-[var(--color-brand)]">
        {scenario?.label}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="font-body text-sm font-semibold text-[var(--color-ink)]">
            Pain Point: <span className="font-normal">● {scenario?.painPoint}</span>
          </p>
          <p className="mt-4 font-body text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-ink)]/40">
            Pain Point Description
          </p>
          <p className="mt-2 font-body text-sm font-medium leading-6 text-[var(--color-ink)]/75">
            {scenario?.description ?? "No pain point description is available for this scenario yet."}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="font-body text-sm font-semibold text-[var(--color-ink)]">
            How AI solves this:
          </p>
          <p className="mt-2 font-body text-sm text-[var(--color-ink)]/80">
            {scenario?.howAiSolves ?? tool?.description}
          </p>
        </div>
      </div>

      {aalInsight && (
        <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_18px_45px_rgba(25,52,160,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              AAL Evaluation
            </p>
            {aalInsight.recommendedPath && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-body text-xs font-extrabold text-blue-700">
                Recommended Path · {aalInsight.recommendedPath}
              </span>
            )}
          </div>
          <p className="mt-3 font-body text-sm font-semibold leading-6 text-[var(--color-ink)]/80">
            {aalInsight.evaluation}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {aalInsight.whyThisPath && (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="font-body text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  Why This Path
                </p>
                <p className="mt-2 font-body text-sm font-medium leading-6 text-[var(--color-ink)]/75">
                  {aalInsight.whyThisPath}
                </p>
              </div>
            )}

            {aalInsight.aalRole && (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="font-body text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  AAL Role
                </p>
                <p className="mt-2 font-body text-sm font-medium leading-6 text-[var(--color-ink)]/75">
                  {aalInsight.aalRole}
                </p>
              </div>
            )}

            {aalInsight.suggestedSolutionDirection && (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="font-body text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  Suggested Solution Direction
                </p>
                <p className="mt-2 font-body text-sm font-medium leading-6 text-[var(--color-ink)]/75">
                  {aalInsight.suggestedSolutionDirection}
                </p>
              </div>
            )}

            {aalInsight.potentialAiToolFit && (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="font-body text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  Potential AI Tool Fit
                </p>
                <p className="mt-2 font-body text-sm font-medium leading-6 text-[var(--color-ink)]/75">
                  {aalInsight.potentialAiToolFit}
                </p>
              </div>
            )}
          </div>

          {aalInsight.solution && (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <p className="font-body text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-brand)]">
                AAL Consultancy Solution
              </p>
              <p className="mt-3 font-body text-base font-extrabold text-[var(--color-ink)]">
                {aalInsight.solution.name}
              </p>
              <p className="mt-2 font-body text-sm font-medium leading-6 text-[var(--color-ink)]/70">
                {aalInsight.solution.summary}
              </p>
              <span className="mt-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-body text-xs font-extrabold text-blue-700">
                {aalInsight.solution.status}
              </span>
            </div>
          )}

          {aalInsight.dataSecurityNote && (
            <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 font-body text-sm font-semibold leading-6 text-amber-900/80">
              Data / Security Note: {aalInsight.dataSecurityNote}
            </p>
          )}
        </div>
      )}

      {tool && (
        <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="font-body text-sm font-semibold text-[var(--color-ink)]">AI TOOLS:</p>
          <div className="mt-3 flex items-center gap-4">
            <div
              className="relative shrink-0"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <SwappLogo className="h-10 w-10 cursor-pointer" />

              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full z-30 mt-3 w-80 rounded-2xl border border-[var(--color-hairline)] bg-white p-5 shadow-[0_16px_48px_rgba(25,52,160,0.25)]"
                  >
                    <div className="flex items-center gap-3">
                      <SwappLogo className="h-8 w-8" />
                      <p className="font-body text-lg font-bold text-[var(--color-ink)]">
                        {tool.name} ({tool.matchScore})
                      </p>
                    </div>
                    <p className="mt-3 font-body text-sm text-[var(--color-ink)]">
                      (Description) {tool.description}
                    </p>
                    <div className="mt-4 space-y-2 border-t border-[var(--color-hairline)] pt-3 font-body text-xs">
                      {[
                        ["AI Techniques", tool.aiTechniques?.join(", ")],
                        ["Deployment model", tool.deploymentModel],
                        ["Key Capability", tool.keyCapability],
                        ["PainPoints", tool.painPoints?.join(", ")],
                        ["Scenarios", scenario?.label],
                        ["Solution Type", tool.solutionType],
                        ["Task", tool.task],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3">
                          <dt className="shrink-0 text-[var(--color-ink)]/50">{label}</dt>
                          <dd className="text-right font-medium text-[var(--color-ink)]">{value}</dd>
                        </div>
                      ))}
                    </div>
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block text-right font-body text-sm font-semibold text-[var(--color-ink)]"
                    >
                      Website →
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="font-body text-base font-semibold text-[var(--color-ink)]">
              {tool.name} ({tool.matchScore})
            </p>
            <span className="font-body text-sm text-[var(--color-ink)]/30">......</span>

            <ul className="space-y-0.5 font-body text-xs text-[var(--color-ink)]/70">
              {tool.relatedTools?.map((rt) => (
                <li key={rt}>{rt}</li>
              ))}
            </ul>

            <button
              type="button"
              className="ml-auto shrink-0 font-body text-sm font-semibold text-[var(--color-brand)]"
            >
              Get a Comparison Report →
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
        <p className="font-body text-sm font-semibold text-[var(--color-ink)]">
          Customized Solution:
        </p>
        <div className="mt-8 flex justify-end">
          <button type="button" className="font-body text-sm font-semibold text-[var(--color-ink)]">
            Book a Consultancy Call to learn more →
          </button>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
