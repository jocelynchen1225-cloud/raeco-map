import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

export default function SolutionDetailStatic({ task, scenario, backdropConfig, onBack }) {
  const tool = aiTools.find((t) => scenario?.aiTools?.includes(t.id));
  const [hovered, setHovered] = useState(false);

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

      <div>
        <p className="font-body text-sm text-[var(--color-brand)]">Task 1</p>
        <p className="font-body text-xl font-semibold text-[var(--color-ink)]">{task?.label}</p>
      </div>

      <p className="font-body text-lg font-semibold text-[var(--color-brand)]">
        {scenario?.label}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="font-body text-sm font-semibold text-[var(--color-ink)]">
            Pain Point: <span className="font-normal">● {scenario?.painPoint}</span>
          </p>
          <p className="mt-4 font-body text-sm text-[var(--color-ink)]/40">Description</p>
          <button type="button" className="mt-1 font-body text-sm font-semibold text-[var(--color-ink)]">
            Add your recent pain point →
          </button>
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
