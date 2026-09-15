import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { sortedPhases, getTaskVisual } from "../lib/taskVisuals";

// Layout constants (all in real px, computed against the ACTUAL measured
// container width — avoids the SVG-viewBox-vs-HTML-position scaling drift
// that shows up if you instead scale a fixed-size viewBox to fit).
const CURVE_LEN = 62;
const TASK_GAP = 78;
const SEG_BUFFER = 56;
const TOP_MARGIN = 90;
const EDGE_MARGIN = 78; // how close the outermost bucket gets to the container edge
const BUCKET_KEYS = ["a", "b", "c"]; // positional buckets: left / right-near / right-far

// Tasks don't carry a fixed "lane" in the real data — a task can belong to
// any mix of stakeholders — so they're distributed round-robin across three
// positional buckets purely for layout, while each task keeps its own color
// (from its primary stakeholder) rather than inheriting a bucket color.
function bucketizeTasks(tasks) {
  const buckets = { a: [], b: [], c: [] };
  tasks.forEach((t, i) => buckets[BUCKET_KEYS[i % 3]].push(t));
  return buckets;
}

function buildLayout(CW, phases) {
  const half = CW / 2;
  const BUCKET_X = { a: -(half - EDGE_MARGIN), c: half - EDGE_MARGIN };
  BUCKET_X.b = BUCKET_X.c * 0.52;

  const nodes = [];
  const segments = [];
  let prevPhaseY = TOP_MARGIN;

  phases.forEach((phase) => {
    const buckets = bucketizeTasks(phase.tasks);
    const maxTasks = Math.max(...BUCKET_KEYS.map((k) => buckets[k].length), 1);
    const segH = CURVE_LEN * 2 + (maxTasks - 1) * TASK_GAP + SEG_BUFFER;
    const phaseY = prevPhaseY + segH;

    BUCKET_KEYS.forEach((key) => {
      const tasks = buckets[key];
      if (tasks.length === 0) return;
      const n = tasks.length;
      const spanStart = prevPhaseY + CURVE_LEN;
      const spanEnd = phaseY - CURVE_LEN;
      const span = spanEnd - spanStart;
      const taskYs = tasks.map((t, i) => (n === 1 ? (spanStart + spanEnd) / 2 : spanStart + (span * i) / (n - 1)));
      tasks.forEach((task, i) => {
        const visual = getTaskVisual(task);
        nodes.push({ type: "task", x: BUCKET_X[key], y: taskYs[i], task, phase, visual });
      });
      segments.push({
        x1: BUCKET_X[key],
        y0: prevPhaseY,
        y1Top: spanStart,
        y1Bottom: spanEnd,
        y2: phaseY,
        tasks: tasks.map((t) => getTaskVisual(t)),
        taskYs,
      });
    });

    nodes.push({ type: "phase", y: phaseY, phase });
    prevPhaseY = phaseY;
  });

  return { nodes, segments, totalHeight: prevPhaseY + 50 };
}

/**
 * Vertical scrolling metro map driven by phases.json / stakeholders.json.
 *
 * Props:
 *  - onSelectPhase(phase): called when a phase circle is clicked.
 *  - onSelectTask(task, phase): called when a task dot is clicked.
 */
export default function MetroMap({ onSelectPhase, onSelectTask }) {
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

  const layout = useMemo(() => buildLayout(width, sortedPhases), [width]);
  const cx = width / 2;

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: layout.totalHeight }}>
      <svg
        width={width}
        height={layout.totalHeight}
        viewBox={`0 0 ${width} ${layout.totalHeight}`}
        className="absolute left-0 top-0 overflow-visible"
      >
        {layout.segments.map((seg, si) => {
          const lx = cx + seg.x1;
          // One task per segment gets its own color; a bucket with several
          // tasks still draws as a single continuous line (it's one visual
          // "run" through the metro map), colored by its first task.
          const color = seg.tasks[0]?.color ?? "#9CA3AF";
          const d = `M ${cx} ${seg.y0}
                     C ${cx} ${seg.y0 + CURVE_LEN * 0.6}, ${lx} ${seg.y1Top - CURVE_LEN * 0.6}, ${lx} ${seg.y1Top}
                     L ${lx} ${seg.y1Bottom}
                     C ${lx} ${seg.y1Bottom + CURVE_LEN * 0.6}, ${cx} ${seg.y2 - CURVE_LEN * 0.6}, ${cx} ${seg.y2}`;
          return (
            <motion.path
              key={`${si}-${width}`}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.88}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, ease: [0.3, 0.1, 0.2, 1] }}
            />
          );
        })}
      </svg>

      <div className="relative">
        {layout.nodes.map((node, i) => {
          if (node.type === "task") {
            const { visual, task, phase } = node;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectTask?.(task, phase)}
                className="group absolute z-[3] flex w-[128px] -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: cx + node.x, top: node.y }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-transform group-hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.62)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    borderColor: "rgba(255,255,255,0.85)",
                    boxShadow: "0 4px 14px rgba(30,40,70,0.10)",
                  }}
                >
                  <visual.Icon size={18} strokeWidth={1.8} color={visual.color} />
                </div>
                <div className="mt-2 text-center font-body text-xs font-medium leading-tight text-[var(--color-ink)]/60">
                  {task.label}
                  {task.isDummy && <span className="block text-[10px] text-[var(--color-ink)]/35">(placeholder)</span>}
                </div>
              </button>
            );
          }
          if (node.type === "phase") {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectPhase?.(node.phase)}
                className="absolute left-1/2 z-[4] flex h-[172px] w-[172px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border transition-transform hover:scale-[1.04]"
                style={{
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
              </button>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
