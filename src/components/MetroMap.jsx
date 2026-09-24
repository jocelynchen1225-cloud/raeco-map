import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sortedPhases, getTaskVisual, filterPhasesForStakeholder } from "../lib/taskVisuals";

const CURVE_LEN = 62;
const TASK_GAP = 78;
const SEG_BUFFER = 56;
const TOP_MARGIN = 90;
const EDGE_MARGIN = 100; // widened for pill-shaped nodes (item 12) vs the old circular ones
const TASK_CARD_EDGE_INSET = 28;
const BUCKET_KEYS = ["a", "b", "c"];

function bucketizeTasks(tasks) {
  const buckets = { a: [], b: [], c: [] };
  tasks.forEach((t, i) => buckets[BUCKET_KEYS[i % 3]].push(t));
  return buckets;
}

// `phases` here is already the FILTERED list (by stakeholder, and/or emptied
// by the collapse toggle) — buildLayout doesn't know or care which; it just
// lays out however many tasks each phase currently has, same as always.
//
// `collapsed` switches phase placement from the vertical chain to a 4-per-row
// grid (item 4) — segments are always empty here anyway since collapsed
// phases carry no tasks, so there's nothing to connect.
function buildLayout(CW, phases, collapsed) {
  if (collapsed) {
    const cols = Math.min(4, phases.length) || 1;
    const circleD = 172;
    const gapX = 56;
    const gapY = 64;
    const cellW = circleD + gapX;
    const cellH = circleD + gapY;
    const gridW = cols * cellW - gapX;
    const startX = -(gridW / 2) + circleD / 2;
    const nodes = phases.map((phase, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        type: "phase",
        id: phase.id,
        x: startX + col * cellW,
        y: TOP_MARGIN + circleD / 2 + row * cellH,
        phase,
      };
    });
    const rows = Math.ceil(phases.length / cols);
    return { nodes, segments: [], totalHeight: TOP_MARGIN + circleD / 2 + rows * cellH };
  }

  const half = CW / 2;
  const BUCKET_X = { a: -(half - EDGE_MARGIN), c: half - EDGE_MARGIN };
  BUCKET_X.b = BUCKET_X.c * 0.5;

  const nodes = [];
  const segments = [];
  let prevPhaseY = TOP_MARGIN + 250;

  phases.forEach((phase, phaseIdx) => {
    const isLastPhase = phaseIdx === phases.length - 1;
    const buckets = bucketizeTasks(phase.tasks);
    const maxTasks = Math.max(...BUCKET_KEYS.map((k) => buckets[k].length), 1);

    if (phaseIdx === 0 && !isLastPhase) {
      const phaseY = prevPhaseY;
      nodes.push({ type: "phase", id: phase.id, x: 0, y: phaseY, phase });

      const branchH = CURVE_LEN + (maxTasks - 1) * TASK_GAP + SEG_BUFFER * 0.6;
      const branchTopY = Math.max(36, phaseY - branchH);

      BUCKET_KEYS.forEach((key) => {
        const tasks = buckets[key];
        if (tasks.length === 0) return;
        const n = tasks.length;
        const spanStart = branchTopY;
        const spanEnd = phaseY - CURVE_LEN;
        const span = spanEnd - spanStart;
        const taskYs = tasks.map((t, i) => (n === 1 ? (spanStart + spanEnd) / 2 : spanStart + (span * i) / (n - 1)));
        const lineNearPhase = taskYs[n - 1] + TASK_CARD_EDGE_INSET;
        const lineFarFromPhase = taskYs[0] - TASK_CARD_EDGE_INSET;
        tasks.forEach((task, i) => {
          const visual = getTaskVisual(task);
          nodes.push({ type: "task", id: task.id, x: BUCKET_X[key], y: taskYs[i], task, phase, visual });
        });
        segments.push({
          id: `${phase.id}-${key}-start`,
          x1: BUCKET_X[key],
          y0: phaseY,
          y1Top: lineNearPhase,
          y1Bottom: lineFarFromPhase,
          y2: phaseY,
          open: true,
          reverse: true,
          color: getTaskVisual(tasks[0]).color,
        });
      });

      prevPhaseY = phaseY;
    } else if (!isLastPhase) {
      // Every phase but the last: its own tasks sit in the segment LEADING
      // INTO it (between the previous circle and this one), converging
      // closed as normal.
      const segH = CURVE_LEN * 2 + (maxTasks - 1) * TASK_GAP + SEG_BUFFER;
      const phaseY = prevPhaseY + segH;

      BUCKET_KEYS.forEach((key) => {
        const tasks = buckets[key];
        if (tasks.length === 0) return;
        const n = tasks.length;
        // Tasks are biased toward the BOTTOM of the gap (closer to the circle
        // they actually converge into) rather than spread evenly across it —
        // spread evenly, the upper tasks visually read as belonging to the
        // circle ABOVE them even though their line curves down into this
        // one. (Verified with a standalone simulation against the real data:
        // the attribution itself was always correct — phase 7's 5 tasks did
        // converge into circle 7 — this was purely a visual-clustering issue.)
        const rawStart = prevPhaseY + CURVE_LEN;
        const spanEnd = phaseY - CURVE_LEN;
        const spanStart = rawStart + (spanEnd - rawStart) * 0.3;
        const span = spanEnd - spanStart;
        const taskYs = tasks.map((t, i) => (n === 1 ? (spanStart + spanEnd) / 2 : spanStart + (span * i) / (n - 1)));
        tasks.forEach((task, i) => {
          const visual = getTaskVisual(task);
          nodes.push({ type: "task", id: task.id, x: BUCKET_X[key], y: taskYs[i], task, phase, visual });
        });
        segments.push({
          id: `${phase.id}-${key}`,
          x1: BUCKET_X[key],
          y0: prevPhaseY,
          y1Top: spanStart,
          y1Bottom: spanEnd,
          y2: phaseY,
          open: false,
          color: getTaskVisual(tasks[0]).color,
        });
      });

      nodes.push({ type: "phase", id: phase.id, x: 0, y: phaseY, phase });
      prevPhaseY = phaseY;
    } else {
      // Last phase: the segment LEADING INTO it carries no tasks of its own
      // (a plain closed connector from the previous circle) — its OWN tasks
      // instead trail OUT AFTER its circle as an open, non-converging tail.
      // (Previously both used the "leading in" segment, which visually
      // attached the last phase's tasks to the SECOND-TO-LAST circle instead
      // — nothing ever connected to the last circle at all.)
      const connectorH = CURVE_LEN * 2 + SEG_BUFFER;
      const phaseY = prevPhaseY + connectorH;
      segments.push({
        id: `${phase.id}-connector`,
        x1: 0,
        y0: prevPhaseY,
        y1Top: prevPhaseY + CURVE_LEN,
        y1Bottom: phaseY - CURVE_LEN,
        y2: phaseY,
        open: false,
        color: getTaskVisual(phase.tasks[0] ?? {}).color,
      });

      nodes.push({ type: "phase", id: phase.id, x: 0, y: phaseY, phase });

      const tailH = CURVE_LEN + (maxTasks - 1) * TASK_GAP + SEG_BUFFER * 0.6;
      const tailBottomY = phaseY + tailH;

      BUCKET_KEYS.forEach((key) => {
        const tasks = buckets[key];
        if (tasks.length === 0) return;
        const n = tasks.length;
        const spanStart = phaseY + CURVE_LEN;
        const spanEnd = tailBottomY;
        const span = spanEnd - spanStart;
        const taskYs = tasks.map((t, i) => (n === 1 ? (spanStart + spanEnd) / 2 : spanStart + (span * i) / (n - 1)));
        tasks.forEach((task, i) => {
          const visual = getTaskVisual(task);
          nodes.push({ type: "task", id: task.id, x: BUCKET_X[key], y: taskYs[i], task, phase, visual });
        });
        segments.push({
          id: `${phase.id}-${key}-tail`,
          x1: BUCKET_X[key],
          y0: phaseY,
          y1Top: spanStart,
          y1Bottom: spanEnd,
          y2: phaseY, // unused when open — the path never curves back to center
          open: true,
          color: getTaskVisual(tasks[0]).color,
        });
      });

      prevPhaseY = tailBottomY;
    }
  });

  return { nodes, segments, totalHeight: prevPhaseY + 50 };
}

/**
 * Vertical scrolling metro map.
 *
 * Props:
 *  - onSelectPhase(phase): clicking a phase circle opens the focused view for
 *    it. Task pills here are preview-only (hover to enlarge, not clickable) —
 *    drilling into a specific task happens one level down, inside the
 *    focused per-phase view.
 *  - selectedStakeholderId: null/undefined = show nothing yet (caller keeps
 *    this locked behind the stakeholder picker); "all" = every task, every
 *    color; a specific stakeholder id = only tasks that involve them.
 *  - collapsed: true hides all tasks/lines, leaving just the 8 phase circles.
 */
export default function MetroMap({ onSelectPhase, selectedStakeholderId, collapsed }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(900);

  useEffect(() => {
    if (!wrapRef.current) return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setWidth(w);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const visiblePhases = useMemo(() => {
    const mapped = collapsed
      ? sortedPhases.map((phase) => ({ ...phase, tasks: [] }))
      : filterPhasesForStakeholder(sortedPhases, selectedStakeholderId, { keepEmpty: true });
    // Filtering to one stakeholder (item 6): phases with nothing left for
    // them drop out entirely, not just their tasks — "View All" and the
    // collapsed grid both keep every phase.
    if (!collapsed && selectedStakeholderId && selectedStakeholderId !== "all") {
      return mapped.filter((phase) => phase.tasks.length > 0);
    }
    return mapped;
  }, [selectedStakeholderId, collapsed]);

  const layout = useMemo(() => buildLayout(width, visiblePhases, collapsed), [width, visiblePhases, collapsed]);
  const cx = width / 2;

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: layout.totalHeight }}>
      <svg
        width={width}
        height={layout.totalHeight}
        viewBox={`0 0 ${width} ${layout.totalHeight}`}
        className="absolute left-0 top-0 overflow-visible"
      >
        <AnimatePresence>
          {layout.segments.map((seg) => {
            const sx = cx + (seg.x0 ?? 0);
            const lx = cx + seg.x1;
            let d;
            if (seg.open && seg.reverse) {
              d = `M ${sx} ${seg.y0}
                 C ${sx} ${seg.y0 - CURVE_LEN * 0.6}, ${lx} ${seg.y1Top + CURVE_LEN * 0.6}, ${lx} ${seg.y1Top}
                 L ${lx} ${seg.y1Bottom}`;
            } else if (seg.open) {
              d = `M ${cx} ${seg.y0}
                 C ${cx} ${seg.y0 + CURVE_LEN * 0.6}, ${lx} ${seg.y1Top - CURVE_LEN * 0.6}, ${lx} ${seg.y1Top}
                 L ${lx} ${seg.y1Bottom}`;
            } else {
              d = `M ${cx} ${seg.y0}
                 C ${cx} ${seg.y0 + CURVE_LEN * 0.6}, ${lx} ${seg.y1Top - CURVE_LEN * 0.6}, ${lx} ${seg.y1Top}
                 L ${lx} ${seg.y1Bottom}
                 C ${lx} ${seg.y1Bottom + CURVE_LEN * 0.6}, ${cx} ${seg.y2 - CURVE_LEN * 0.6}, ${cx} ${seg.y2}`;
            }
            return (
              <motion.path
                key={seg.id}
                d={d}
                fill="none"
                stroke={seg.color}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.88}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.3, 0.1, 0.2, 1] }}
              />
            );
          })}
        </AnimatePresence>
      </svg>

      <div className="relative">
        <AnimatePresence>
          {layout.nodes.map((node) => {
            if (node.type === "task") {
              const { visual, task } = node;
              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25 } }}
                  className="group absolute z-[3] flex w-[184px] -translate-x-1/2 -translate-y-1/2 cursor-default items-center gap-2.5 rounded-full border px-3 py-2 text-left transition-transform hover:scale-[1.04]"
                  style={{
                    left: cx + node.x,
                    top: node.y,
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    borderColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 14px rgba(30,40,70,0.10)",
                  }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${visual.color}33` }}
                  >
                    <visual.Icon size={16} strokeWidth={1.8} color={visual.color} />
                  </span>
                  <span className="min-w-0 font-body text-xs font-medium leading-tight text-[var(--color-ink)]">
                    {task.label}
                    {task.isDummy && <span className="block text-[10px] text-[var(--color-ink)]/40">(placeholder)</span>}
                  </span>
                </motion.div>
              );
            }
            if (node.type === "phase") {
              return (
                <motion.button
                  key={node.id}
                  layout
                  type="button"
                  onClick={() => onSelectPhase?.(node.phase)}
                  transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
                  className="absolute z-[4] flex h-[172px] w-[172px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border transition-transform hover:scale-[1.04]"
                  style={{
                    left: cx + (node.x ?? 0),
                    top: node.y,
                    background: "rgba(255,255,255,0.62)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderColor: "rgba(255,255,255,0.85)",
                    boxShadow:
                      "inset 12px 14px 26px rgba(255,255,255,0.9), inset -9px -11px 18px rgba(150,160,190,0.12), 0 18px 46px rgba(30,40,70,0.11)",
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -z-10 rounded-full blur-[3px]"
                    style={{ inset: -22, background: "radial-gradient(circle, rgba(25,52,160,0.18) 0%, rgba(25,52,160,0) 70%)" }}
                  />
                  <div className="font-body text-2xl font-bold text-[var(--color-brand)]">{node.phase.order}</div>
                  <div className="mt-1 px-4 text-center font-body text-sm font-bold tracking-wide text-[var(--color-ink)]">
                    {node.phase.label}
                  </div>
                  {node.phase.isDummy && (
                    <div className="mt-1 font-body text-[10px] text-[var(--color-ink)]/35">content pending</div>
                  )}
                </motion.button>
              );
            }
            return null;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
