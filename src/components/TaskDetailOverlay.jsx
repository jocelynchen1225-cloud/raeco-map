import { motion } from "framer-motion";
import StaticHotspotImage from "./StaticHotspotImage";
import stakeholders from "../data/stakeholders.json";

// backdropConfig is optional: pass a static-image config for the old
// hotspot-image flow, or omit it when arriving from the live metro map
// (there's no static image of that to blur, so it just sits on the page background).
export default function TaskDetailOverlay({ backdropConfig, task, onBack, onExploreScenario }) {
  const scenarios = task?.scenarios ?? [];

  return (
    <div className="relative min-h-[calc(100vh-100px)] overflow-hidden">
      {backdropConfig && <StaticHotspotImage config={backdropConfig} blurred />}

      <div className="relative z-10 flex min-h-[calc(100vh-100px)] flex-col gap-8 px-6 py-10 md:px-14">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 font-body text-sm text-[var(--color-brand)] shadow-sm"
          >
            ← back
          </button>
          <div className="rounded-2xl bg-white/90 px-6 py-3 shadow-sm">
            <p className="font-body text-sm text-[var(--color-brand)]">Task 1</p>
            <p className="font-body text-lg font-semibold text-[var(--color-ink)]">
              {task?.label}
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center">
          <div className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {scenarios.length === 0 && (
              <div className="flex w-full min-w-[320px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-hairline)] bg-white/60 p-10 text-center">
                <p className="font-body text-base font-semibold text-[var(--color-ink)]/60">
                  No scenarios yet for this task
                </p>
                <p className="font-body text-sm text-[var(--color-ink)]/40">
                  This will populate once the scenario database is connected.
                </p>
              </div>
            )}
            {scenarios.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex w-[calc((100%-4.5rem)/3.5)] min-w-[320px] shrink-0 snap-start flex-col gap-5 rounded-2xl bg-white/95 p-8 shadow-[0_8px_30px_rgba(25,52,160,0.12)]"
              >
                <div>
                  <p className="font-body text-base font-semibold text-[var(--color-brand)]">
                    Scenario {i + 1}:
                  </p>
                  <p className="font-body text-lg font-semibold text-[var(--color-ink)]">
                    {s.label}
                  </p>
                </div>

                <p className="font-body text-sm text-[var(--color-ink)]/40">
                  Description: ......................................
                </p>

                <div>
                  <p className="font-body text-sm font-semibold text-[var(--color-ink)]">
                    Common Pain Points
                  </p>
                  <p className="flex items-center gap-1.5 font-body text-base text-[var(--color-ink)]/80">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]" />
                    {s.painPoint}
                  </p>
                </div>

                <div>
                  <p className="font-body text-sm font-semibold text-[var(--color-ink)]">
                    Stakeholders
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {(s.stakeholders ?? []).map((id) => {
                      const sh = stakeholders.find((st) => st.id === id);
                      return (
                        <span key={id} className="flex items-center gap-1.5 font-body text-base text-[var(--color-ink)]/80">
                          <span
                            className="h-[3px] w-5 rounded-full"
                            style={{ backgroundColor: sh?.color ?? "#999" }}
                          />
                          {sh?.label ?? id}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--color-hairline)] pt-4">
                  <p className="font-body text-sm font-semibold text-[var(--color-ink)]">
                    How AI can solve this?
                  </p>
                  <button
                    type="button"
                    onClick={() => onExploreScenario?.(s)}
                    disabled={!s.aiTools}
                    className="font-body text-base text-[var(--color-brand)] disabled:cursor-not-allowed disabled:text-[var(--color-ink)]/30"
                  >
                    Explore →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
