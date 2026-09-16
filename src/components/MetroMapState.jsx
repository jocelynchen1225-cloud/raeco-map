import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import MetroMap from "./MetroMap";
import MetroFocusView from "./MetroFocusView";
import StakeholderPopup from "./StakeholderPopup";
import StakeholderLegend from "./StakeholderLegend";

export default function MetroMapState({
  selectedStakeholderId,
  onSelectStakeholder,
  focusPhase,
  onFocusPhase,
  onSelectTask,
  onBack,
}) {
  const locked = !selectedStakeholderId;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-[calc(100vh-100px)] flex-col"
    >
      <div className="relative">
        {!locked && !focusPhase && (
          <button
            type="button"
            onClick={onBack}
            className="fixed left-6 top-28 z-20 flex items-center gap-2 rounded-full border border-white/85 bg-white/75 px-5 py-3 font-body text-sm font-semibold text-[var(--color-ink)] shadow-[0_14px_40px_rgba(25,52,160,0.13)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-[var(--color-brand)]"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* The live, interactive metro map — blurred and non-interactive until a
            stakeholder is picked, then it unblurs in place (no page/component
            swap), so "unlocking" reads as one continuous map, not a scene change.
            IMPORTANT: unlocked state must be `filter: none`, not `blur(0px)` —
            any non-none filter value (even a 0px blur) still creates a CSS
            filter containing block, which breaks how descendant
            `backdrop-filter` elements (the glass phase/task nodes) sample the
            page behind them. That mismatch was exactly what made the phase
            circles look washed-out even after "unlocking". */}
        <div
          className={locked ? "pointer-events-none select-none" : ""}
          style={{ filter: locked ? "blur(16px)" : "none", transition: "filter 0.7s ease" }}
        >
          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10">
            <MetroMap onSelectPhase={onFocusPhase} onSelectTask={onSelectTask} />
          </div>
        </div>

        {/* Legend blurs in step with the map, but is kept OUT of the map's
            filter wrapper above: a `position: fixed` element nested inside an
            ancestor with a non-none `filter` gets re-anchored to that
            ancestor instead of the viewport (another CSS filter gotcha), which
            would break "stay put while scrolling". Its own independent filter
            gets the same visual result without that side effect. */}
        <StakeholderLegend
          className="fixed right-6 top-28 z-10 hidden lg:block"
          style={{ filter: locked ? "blur(16px)" : "none", transition: "filter 0.7s ease" }}
        />

        <AnimatePresence>
          {locked && (
            <motion.div
              className="absolute inset-0 z-20 bg-white/35"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StakeholderPopup onSelectStakeholder={onSelectStakeholder} onBack={onBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!locked && focusPhase && (
        <MetroFocusView
          phase={focusPhase}
          onChangeIndex={onFocusPhase}
          onClose={() => onFocusPhase(null)}
          onSelectTask={onSelectTask}
        />
      )}
    </motion.section>
  );
}
