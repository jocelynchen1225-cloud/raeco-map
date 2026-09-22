import { useRef, useState, useEffect } from "react";
import { Sparkles, Bot, Cpu, Wand2, ScanEye, BrainCircuit, Workflow, Boxes, Mail } from "lucide-react";
import { INDUSTRY_ORDER, INDUSTRY_LABELS, getIndustryColor } from "../lib/taskVisuals";

// Placeholder icon set — swap for real AI-tool logos once available. Reused
// across industries on purpose (this block is a "coming preview", not a
// literal tool directory).
const PLACEHOLDER_ICONS = [Sparkles, Bot, Cpu, Wand2, ScanEye, BrainCircuit, Workflow, Boxes];

// image1 preview board — deliberately kept self-contained so no other page
// styling/behaviour is affected.  The denser 8×5 layout keeps every tile the
// same size while giving the bent industry groups a single continuous frame.
//
//   R R R R C C C C
//   R R C C C C E E
//   A A A A E E E E
//   A A A A E E E E
//   O O O O O O O O
const CELLS = {
  "real-estate": [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1]],
  construction: [[0,4],[0,5],[0,6],[0,7],[1,2],[1,3],[1,4],[1,5]],
  architecture: [[2,0],[2,1],[2,2],[2,3],[3,0],[3,1],[3,2],[3,3]],
  engineering: [[1,6],[1,7],[2,4],[2,5],[2,6],[2,7],[3,4],[3,5],[3,6],[3,7]],
  operation: [[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7]],
};

const COLS = 8;
const ROWS = 5;
const REGION_GAP = 5;
const FRAME_PAD = 10;
const LABEL_H = 18;
const TILE_GAP = 9;
const BOARD_SCALE = 0.75; // image1 is 25% smaller than the previous version

// Build one outline for a polyomino from its occupied grid cells.  This is the
// important bit: bent red/green/blue groups are no longer separate rectangles,
// so their frame cannot visually break at the bend.
function regionPath(cells, slot) {
  const occupied = new Set(cells.map(([r, c]) => `${r},${c}`));
  const x0 = (c) => c * slot;
  const y0 = (r) => r * slot;
  const x1 = (c) => (c + 1) * slot;
  const y1 = (r) => (r + 1) * slot;
  const edges = [];

  cells.forEach(([r, c]) => {
    if (!occupied.has(`${r-1},${c}`)) edges.push([[x0(c),y0(r)],[x1(c),y0(r)]]);
    if (!occupied.has(`${r},${c+1}`)) edges.push([[x1(c),y0(r)],[x1(c),y1(r)]]);
    if (!occupied.has(`${r+1},${c}`)) edges.push([[x1(c),y1(r)],[x0(c),y1(r)]]);
    if (!occupied.has(`${r},${c-1}`)) edges.push([[x0(c),y1(r)],[x0(c),y0(r)]]);
  });

  const key = ([x,y]) => `${x},${y}`;
  const next = new Map(edges.map(([a,b]) => [key(a), b]));
  const first = edges[0][0];
  const points = [first];
  let cur = first;
  for (let i = 0; i < edges.length + 2; i += 1) {
    const n = next.get(key(cur));
    if (!n || key(n) === key(first)) break;
    points.push(n);
    cur = n;
  }
  return `M ${points.map(([x,y]) => `${x},${y}`).join(" L ")} Z`;
}

function TetrisBoard() {
  const wrapRef = useRef(null);
  const [hostWidth, setHostWidth] = useState(900);

  useEffect(() => {
    if (!wrapRef.current) return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setHostWidth(w);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const width = hostWidth * BOARD_SCALE;
  const slot = width / COLS;
  const tile = slot - FRAME_PAD * 2 - LABEL_H - TILE_GAP;
  const boardH = ROWS * slot;
  const step = slot;
  const allTiles = INDUSTRY_ORDER.flatMap((id) =>
    CELLS[id].map(([r,c], i) => ({ id, r, c, iconIndex: i + INDUSTRY_ORDER.indexOf(id) * 3 }))
  );

  return (
    <div ref={wrapRef} className="relative mx-auto w-full">
      <div className="relative mx-auto" style={{ width, height: boardH }}>
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={boardH} aria-hidden="true">
          {INDUSTRY_ORDER.map((id) => {
            const color = getIndustryColor(id);
            return (
              <g key={`${id}-frame`}>
                {/* White under-stroke creates a small, consistent gap between puzzle pieces. */}
                <path
                  d={regionPath(CELLS[id], slot)}
                  fill={`${color}30`}
                  stroke="#fff"
                  strokeWidth={REGION_GAP * 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path
                  d={regionPath(CELLS[id], slot)}
                  fill={`${color}30`}
                  stroke={`${color}80`}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {INDUSTRY_ORDER.map((id) => {
          const color = getIndustryColor(id);
          const [r, c] = CELLS[id].reduce((best, cur) =>
            cur[0] < best[0] || (cur[0] === best[0] && cur[1] < best[1]) ? cur : best
          );
          return (
            <span
              key={`${id}-label`}
              className="absolute z-20 rounded-full px-2 py-0.5 font-body text-[8px] font-bold uppercase tracking-wide"
              style={{ left: c * step + FRAME_PAD, top: r * step + FRAME_PAD, background: `${color}60`, color: "var(--color-ink)" }}
            >
              {INDUSTRY_LABELS[id]}
            </span>
          );
        })}

        {allTiles.map(({ id, r, c, iconIndex }) => {
          const color = getIndustryColor(id);
          const Icon = PLACEHOLDER_ICONS[iconIndex % PLACEHOLDER_ICONS.length];
          const isTopRow = r === Math.min(...CELLS[id].map(([rr]) => rr));
          // Every tile is an identical square. Top-row labels float in the frame
          // margin rather than changing tile height, so no tile can stretch.
          const square = tile;
          const tileTop = isTopRow
            ? r * step + FRAME_PAD + LABEL_H
            : r * step + (slot - square) / 2;
          const radius = Math.max(7, square * 0.09);
          return (
            <div
              key={`${id}-${r}-${c}`}
              className="absolute z-10 flex items-center justify-center"
              style={{
                left: c * step + (slot - square) / 2,
                top: tileTop,
                width: square,
                height: square,
                minWidth: square,
                minHeight: square,
                borderRadius: radius,
                background: color,
              }}
            >
              <Icon size={Math.max(13, square * 0.28)} strokeWidth={1.8} color="#fff" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CASE_STUDIES = [
  {
    tag: "Placeholder · Architecture",
    title: "A mid-size architecture practice",
    body: "Drawing-revision checks were eating hours every week. An AI-assisted comparison workflow cut manual cross-checking dramatically, freeing the team to spend that time on design instead.",
  },
  {
    tag: "Placeholder · Construction",
    title: "A general contractor",
    body: "Site safety issues were only caught after manual walkthroughs, often too late. Real-time AI video analysis now flags risks as they happen, moving incident reporting earlier in the process.",
  },
  {
    tag: "Placeholder · Real Estate",
    title: "A property developer",
    body: "Feasibility cost estimates used to wait on finance teams for multiple review rounds. AI-assisted cost modeling now gives the team a first-pass number at the land-decision stage.",
  },
];

export default function LandingExtras() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-20 px-6 pb-24 pt-16 md:px-0">
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-body text-2xl font-bold text-[var(--color-brand)]">A preview of what's inside</h2>
          <p className="mt-2 font-body text-sm text-[var(--color-ink)]/60">
            AI solutions across all five RAECO industries — explore your role to see the full map.
          </p>
        </div>
        <TetrisBoard />
      </section>

      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-body text-2xl font-bold text-[var(--color-brand)]">Case studies</h2>
          <p className="mt-2 font-body text-sm text-[var(--color-ink)]/60">
            Placeholder stories — real client case studies will replace these.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CASE_STUDIES.map((cs) => (
            <div
              key={cs.title}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--color-hairline)] bg-white p-6"
            >
              <span className="w-fit rounded-full bg-[var(--color-paper-dim)] px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink)]/50">
                {cs.tag}
              </span>
              <h3 className="font-body text-base font-bold text-[var(--color-ink)]">{cs.title}</h3>
              <p className="font-body text-sm leading-relaxed text-[var(--color-ink)]/70">{cs.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 rounded-[28px] bg-[var(--color-brand)] px-8 py-14 text-center">
        <Mail size={28} color="#fff" />
        <h2 className="font-body text-2xl font-bold text-white">Want to talk it through?</h2>
        <p className="max-w-md font-body text-sm text-white/80">
          Leave your details and the AAL Innovation team will follow up to walk through an AI
          adoption plan tailored to your project.
        </p>
        <a
          href="mailto:team@aalinnovationai.com"
          className="mt-2 rounded-full bg-white px-6 py-2.5 font-body text-sm font-semibold text-[var(--color-brand)]"
        >
          team@aalinnovationai.com
        </a>
      </section>
    </div>
  );
}
