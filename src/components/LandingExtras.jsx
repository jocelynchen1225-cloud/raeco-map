import { useRef, useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { INDUSTRY_ORDER, INDUSTRY_LABELS, getIndustryColor } from "../lib/taskVisuals";

const TOOL_LOGOS = {
  "real-estate": [
    { name: "Autodesk Forma", logo: "/tool-logos/autodesk-forma.png" },
    { name: "Maket", logo: "/tool-logos/maket.png" },
    { name: "Finch", logo: "/tool-logos/finch.png" },
    { name: "Higharc", logo: "/tool-logos/higharc.svg" },
    { name: "qbiq", logo: "/tool-logos/qbiq.png" },
    { name: "PermitFlow", logo: "/tool-logos/permitflow.png" },
  ],
  construction: [
    { name: "OpenSpace", logo: "/tool-logos/openspace.png" },
    { name: "Buildots", logo: "/tool-logos/buildots.webp" },
    { name: "Doxel", logo: "/tool-logos/doxel.png" },
    { name: "Dusty Robotics", logo: "/tool-logos/dusty-robotics.png" },
    { name: "Alice Technologies", logo: "/tool-logos/alice-technologies.png" },
    { name: "nPlan", logo: "/tool-logos/nplan.png" },
    { name: "Outbuild", logo: "/tool-logos/outbuild.png" },
    { name: "Constructable", logo: "/tool-logos/constructable.ico" },
  ],
  architecture: [
    { name: "Snaptrude", logo: "/tool-logos/snaptrude.png" },
    { name: "SWAPP", logo: "/tool-logos/swapp-ai.png" },
    { name: "Veras", logo: "/tool-logos/veras.jpg" },
    { name: "Drawer AI", logo: "/tool-logos/drawer-ai.svg" },
    { name: "Homestyler", logo: "/tool-logos/homestyler.ico" },
    { name: "Planner 5D", logo: "/tool-logos/planner5d.ico" },
    { name: "Kujiale", logo: "/tool-logos/kujiale.png" },
    { name: "Artificial Studio", logo: "/tool-logos/artificial-studio.ico" },
  ],
  engineering: [
    { name: "Augmenta", logo: "/tool-logos/augmenta.png" },
    { name: "Allplan", logo: "/tool-logos/allplan.png" },
    { name: "One Click LCA", logo: "/tool-logos/one-click-lca.png" },
    { name: "Parspec", logo: "/tool-logos/parspec.png" },
    { name: "Beam AI", logo: "/tool-logos/beam-ai.png" },
    { name: "Firmus", logo: "/tool-logos/firmus.png" },
    { name: "Tekla", logo: "/tool-logos/tekla.ico" },
    { name: "Civils AI", logo: "/tool-logos/civils-ai.ico" },
    { name: "Kreo", logo: "/tool-logos/kreo.png" },
    { name: "Clearstory", logo: "/tool-logos/clearstory.png" },
  ],
  operation: [
    { name: "Empoli AI", logo: "/tool-logos/empoli-ai.png" },
    { name: "Adaptis", logo: "/tool-logos/adaptis.png" },
    { name: "Endra", logo: "/tool-logos/endra.png" },
    { name: "Enlaye", logo: "/tool-logos/enlaye.png" },
    { name: "Document Crunch", logo: "/tool-logos/document-crunch.png" },
    { name: "Briq", logo: "/tool-logos/briq.png" },
    { name: "Pixelcut", logo: "/tool-logos/pixelcut.ico" },
    { name: "Helonic Articulate", logo: "/tool-logos/helonic-articulate.png" },
  ],
};

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
const REGION_GAP = 3;
const FRAME_PAD = 6;
const LABEL_H = 18;
const TILE_GAP = 5;
const BOARD_SCALE = 0.97; // nearly fill the host width (matches the stats row above)
const CORNER_RADIUS = 10; // matches the rounded-lg (8px) corners used on the stat cards

// Walk the occupied grid cells of a polyomino into an ordered list of outline
// vertices. Bent red/green/blue groups are no longer separate rectangles, so
// their frame cannot visually break at the bend.
function regionOutlinePoints(cells, slot) {
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
  return points;
}

// Rounds every corner of a straight-edge polygon outline — convex AND
// concave (reflex) corners alike — by clipping `radius` units off each edge
// on either side of the vertex and bridging the gap with a quadratic curve
// through the original corner point. Works for any axis-aligned polygon, so
// it naturally also softens the inner notches where an industry's shape bends.
function roundedPolygonPath(points, radius) {
  const n = points.length;
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  const entries = [];
  const exits = [];
  for (let i = 0; i < n; i += 1) {
    const prev = points[(i - 1 + n) % n];
    const cur = points[i];
    const nxt = points[(i + 1) % n];
    const rIn = Math.min(radius, dist(prev, cur) / 2);
    const rOut = Math.min(radius, dist(cur, nxt) / 2);
    entries.push(lerp(cur, prev, rIn / Math.max(dist(prev, cur), 1e-6)));
    exits.push(lerp(cur, nxt, rOut / Math.max(dist(cur, nxt), 1e-6)));
  }

  let d = `M ${entries[0][0]},${entries[0][1]} `;
  for (let i = 0; i < n; i += 1) {
    d += `Q ${points[i][0]},${points[i][1]} ${exits[i][0]},${exits[i][1]} `;
    d += `L ${entries[(i + 1) % n][0]},${entries[(i + 1) % n][1]} `;
  }
  d += "Z";
  return d;
}

function regionPath(cells, slot, radius = 0) {
  const points = regionOutlinePoints(cells, slot);
  if (!radius) return `M ${points.map(([x, y]) => `${x},${y}`).join(" L ")} Z`;
  return roundedPolygonPath(points, radius);
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
    CELLS[id].map(([r,c], i) => ({ id, r, c, tool: TOOL_LOGOS[id][i % TOOL_LOGOS[id].length] }))
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
                  d={regionPath(CELLS[id], slot, CORNER_RADIUS)}
                  fill={`${color}30`}
                  stroke="#fff"
                  strokeWidth={REGION_GAP * 2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path
                  d={regionPath(CELLS[id], slot, CORNER_RADIUS)}
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

        {allTiles.map(({ id, r, c, tool }) => {
          const color = getIndustryColor(id);
          const isTopRow = r === Math.min(...CELLS[id].map(([rr]) => rr));
          // Every tile is an identical square. Top-row labels float in the frame
          // margin rather than changing tile height, so no tile can stretch.
          const square = tile;
          const tileTop = isTopRow
            ? r * step + FRAME_PAD + LABEL_H
            : r * step + (slot - square) / 2;
          return (
            <div
              key={`${id}-${r}-${c}-${tool.name}`}
              className="absolute z-10 flex flex-col items-center justify-center"
              title={tool.name}
              aria-label={tool.name}
              style={{
                left: c * step + (slot - square) / 2,
                top: tileTop,
                width: square,
                height: square,
                minWidth: square,
                minHeight: square,
                padding: Math.max(2, square * 0.05),
              }}
            >
              <div
                className="flex shrink-0 items-center justify-center"
                style={{
                  height: square * 0.56,
                  width: square,
                }}
              >
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="object-contain"
                  draggable="false"
                  style={{
                    maxHeight: square * 0.56,
                    maxWidth: square * 0.9,
                  }}
                />
              </div>
              <span
                className="mt-1.5 block w-full overflow-hidden text-center font-body font-semibold leading-tight text-[var(--color-ink)]/75"
                style={{
                  display: "-webkit-box",
                  fontSize: Math.max(7.5, square * 0.145),
                  minHeight: Math.max(14, square * 0.32),
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}
              >
                {tool.name}
              </span>
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
    <div className="mx-auto flex max-w-4xl flex-col gap-20 px-6 pb-24 pt-16 md:px-0">
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
