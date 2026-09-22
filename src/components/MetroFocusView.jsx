import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X } from "lucide-react";
import { sortedPhases, getTaskVisual } from "../lib/taskVisuals";
import NavBar from "./NavBar";
import StakeholderLegend from "./StakeholderLegend";

const glassPanel = (extra = {}) => ({
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1.5px solid rgba(255,255,255,0.85)",
  ...extra,
});

function buildFocusLayout(W, H, phase) {
  const hubR = Math.min(112, H * 0.16);
  const hubCX = W * 0.4;
  const hubCY = H * 0.52;
  const ghostR = hubR * 0.62;
  const gap = Math.min(150, hubCY - hubR - 60);

  // One left entry point per distinct primary stakeholder in this phase —
  // several task cards can share the same origin line if they share a role.
  const cardW = 250;
  const cardX = Math.min(W - cardW - 30, hubCX + hubR + 190);
  const gapY = 82;
  const n = phase.tasks.length;
  const startY = hubCY - ((n - 1) * gapY) / 2;

  const cards = phase.tasks.map((task, i) => ({
    task,
    visual: getTaskVisual(task),
    cy: startY + i * gapY,
    hubPassY: hubCY + (i - (n - 1) / 2) * 16,
  }));

  const stakeholderY = {};
  const seen = [];
  cards.forEach((c) => {
    if (!(c.visual.stakeholderId in stakeholderY)) {
      seen.push(c.visual.stakeholderId);
    }
  });
  const leftGap = 66;
  const leftStart = hubCY - ((seen.length - 1) * leftGap) / 2;
  seen.forEach((id, i) => {
    stakeholderY[id] = leftStart + i * leftGap;
  });

  return { hubR, hubCX, hubCY, ghostR, gap, leftX: 56, cardX, cards, stakeholderY, distinctStakeholders: seen };
}

function FlowPath({ x1, y1, hcx, hpy, x2, y2, color, delay }) {
  const mid1X = (x1 + hcx) / 2;
  const mid2X = (hcx + x2) / 2;
  const d = `M ${x1} ${y1} C ${mid1X} ${y1}, ${mid1X} ${hpy}, ${hcx} ${hpy} C ${mid2X} ${hpy}, ${mid2X} ${y2}, ${x2} ${y2}`;
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={3.4}
      strokeLinecap="round"
      opacity={0.9}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.3, delay, ease: [0.3, 0.1, 0.2, 1] }}
    />
  );
}

function GhostCircle({ phase, cx, cy, r, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute z-[4] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full opacity-85 transition-opacity hover:opacity-100"
      style={{ left: cx, top: cy, width: r * 2, height: r * 2, ...glassPanel() }}
    >
      <div className="font-body text-lg font-bold text-[var(--color-brand)]">{phase.order}</div>
      <div className="px-3 text-center font-body text-[10px] font-bold tracking-wide text-[var(--color-ink)]">
        {phase.label}
      </div>
    </button>
  );
}

function TaskCard({ x, y, task, visual, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="absolute z-[4] flex w-[250px] -translate-y-1/2 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-transform hover:scale-[1.03]"
      style={glassPanel({
        left: x,
        top: y,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(22px) saturate(1.3)",
        WebkitBackdropFilter: "blur(22px) saturate(1.3)",
        border: "1px solid rgba(255,255,255,0.95)",
        boxShadow:
          "inset 8px 9px 16px rgba(255,255,255,0.95), inset -6px -8px 13px rgba(150,160,190,0.12), 0 10px 26px rgba(30,40,70,0.11)",
      })}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/95"
        style={{ background: "rgba(255,255,255,0.85)" }}
      >
        <visual.Icon size={16} strokeWidth={1.8} color={visual.color} />
      </div>
      <div className="font-body text-[12.5px] font-semibold leading-tight text-[var(--color-ink)]">{task.label}</div>
    </button>
  );
}

/**
 * Full-screen focus view for one phase. Left side: one entry line per
 * distinct stakeholder role involved in this phase. Right side: one card per
 * task (reflects the real data — a placeholder phase shows one card, the
 * fleshed-out phase shows six). Prev/next glass circles navigate with a
 * continuous scroll-style slide.
 */
export default function MetroFocusView({ phase, onChangeIndex, onClose, onSelectTask }) {
  const stageRef = useRef(null);
  const [size, setSize] = useState({ w: 1100, h: 760 });
  const controls = useAnimation();
  const slideDist = useRef(260);

  const phaseIndex = sortedPhases.findIndex((p) => p.id === phase?.id);

  // Lock background scroll while this overlay is open — otherwise the tall
  // metro map underneath still scrolls with the page, so by the time you
  // click a task the app has silently scrolled to wherever that gesture
  // left it, and the next screen opens partway down instead of at the top.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (!stageRef.current) return undefined;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => (phase ? buildFocusLayout(size.w, size.h, phase) : null), [phase, size.w, size.h]);

  useEffect(() => {
    if (layout) slideDist.current = layout.hubR + layout.gap;
  }, [layout]);

  const navigate = useCallback(
    async (newIndex, dir) => {
      const dist = slideDist.current;
      await controls.start({ y: dir === "down" ? -dist : dist, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } });
      onChangeIndex(sortedPhases[newIndex]);
      controls.set({ y: dir === "down" ? dist : -dist });
      await controls.start({ y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } });
    },
    [controls, onChangeIndex]
  );

  if (!phase || !layout) return null;

  const { hubR, hubCX, hubCY, ghostR, gap, leftX, cardX, cards, stakeholderY, distinctStakeholders } = layout;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] overflow-hidden bg-[rgba(246,247,251,0.97)] backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="absolute left-0 right-0 top-0 z-[8] bg-white">
          <NavBar />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute left-8 top-[132px] z-[7] flex items-center gap-2 rounded-full border border-white/85 bg-white/82 px-5 py-3 font-body text-sm font-extrabold text-[var(--color-ink)] shadow-[0_18px_46px_rgba(25,52,160,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-[var(--color-brand)]"
        >
          <X size={16} /> Back
        </button>

        <StakeholderLegend className="absolute right-6 top-[132px] z-[6]" />

        <div ref={stageRef} className="absolute inset-x-0 bottom-0 top-[100px] mx-auto w-full max-w-[1220px] overflow-hidden">
          <motion.div className="relative h-full w-full" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.28 }}>
            <motion.div className="relative h-full w-full" animate={controls}>
              <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="absolute left-0 top-0 overflow-visible">
                {phaseIndex > 0 && (
                  <line x1={hubCX} y1={hubCY - hubR} x2={hubCX} y2={hubCY - hubR - gap + ghostR} stroke="rgba(150,160,190,.5)" strokeWidth={2} strokeDasharray="5 6" />
                )}
                {phaseIndex < sortedPhases.length - 1 && (
                  <line x1={hubCX} y1={hubCY + hubR} x2={hubCX} y2={hubCY + hubR + gap - ghostR} stroke="rgba(150,160,190,.5)" strokeWidth={2} strokeDasharray="5 6" />
                )}
                {cards.map(({ task, visual, cy, hubPassY }, i) => (
                  <FlowPath
                    key={`${phase.id}-${task.id}`}
                    x1={leftX}
                    y1={stakeholderY[visual.stakeholderId]}
                    hcx={hubCX}
                    hpy={hubPassY}
                    x2={cardX}
                    y2={cy}
                    color={visual.color}
                    delay={i * 0.07}
                  />
                ))}
              </svg>

              {phaseIndex > 0 && (
                <GhostCircle phase={sortedPhases[phaseIndex - 1]} cx={hubCX} cy={hubCY - hubR - gap} r={ghostR} onClick={() => navigate(phaseIndex - 1, "up")} />
              )}
              {phaseIndex < sortedPhases.length - 1 && (
                <GhostCircle phase={sortedPhases[phaseIndex + 1]} cx={hubCX} cy={hubCY + hubR + gap} r={ghostR} onClick={() => navigate(phaseIndex + 1, "down")} />
              )}

              {/* hub */}
              <div
                className="absolute z-[5] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
                style={{
                  left: hubCX,
                  top: hubCY,
                  width: hubR * 2,
                  height: hubR * 2,
                  ...glassPanel({ boxShadow: "inset 14px 16px 28px rgba(255,255,255,.9), inset -10px -12px 20px rgba(150,160,190,.12), 0 24px 60px rgba(30,40,70,.14)" }),
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -z-10 rounded-full blur-[4px]"
                  style={{ inset: -30, background: "radial-gradient(circle, rgba(25,52,160,0.18) 0%, rgba(25,52,160,0) 70%)" }}
                />
                <div className="font-body text-[30px] font-bold text-[var(--color-brand)]">{phase.order}</div>
                <div className="mt-1 px-6 text-center font-body text-sm font-bold tracking-wide text-[var(--color-ink)]">{phase.label}</div>
                {phase.isDummy && <div className="mt-1 font-body text-[10.5px] text-[var(--color-ink)]/40">content pending — connect the database</div>}
              </div>

              {/* stakeholder markers + labels */}
              {distinctStakeholders.map((id) => {
                const rep = cards.find((c) => c.visual.stakeholderId === id)?.visual;
                if (!rep) return null;
                return (
                  <div key={id}>
                    <div
                      className="absolute z-[3] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                      style={{ left: leftX, top: stakeholderY[id], border: `2.5px solid ${rep.color}` }}
                    />
                    <div
                      className="absolute z-[3] -translate-y-full whitespace-nowrap font-body text-xs font-semibold"
                      style={{ left: leftX - 4, top: stakeholderY[id] - 14, color: rep.color }}
                    >
                      {rep.stakeholderLabel}
                    </div>
                  </div>
                );
              })}

              {cards.map(({ task, visual, cy }, i) => (
                <TaskCard key={i} x={cardX} y={cy} task={task} visual={visual} onSelect={() => onSelectTask?.(task, phase)} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
