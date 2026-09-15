import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const phases = JSON.parse(readFileSync(path.join(root, "src/data/phases.json"), "utf-8"));
const stakeholders = JSON.parse(readFileSync(path.join(root, "src/data/stakeholders.json"), "utf-8"));

// ---- layout math, mirrored from src/components/metroLayout.js ----
const HUB_RADIUS = 62;
const COL_GAP = 360;
const ROW_GAP = 400;
const MARGIN_X = 190;
const MARGIN_TOP = 230;
const TASK_FAN_MARGIN = 210;

const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
const ROW1 = sortedPhases.slice(0, 4);
const ROW2 = sortedPhases.slice(4, 8);

const ROW1_Y = MARGIN_TOP;
const ROW2_Y = MARGIN_TOP + ROW_GAP;
const CANVAS_WIDTH = MARGIN_X * 2 + COL_GAP * 3;
const CANVAS_HEIGHT = ROW2_Y + TASK_FAN_MARGIN + 170;

function getHubPositions() {
  const row1Hubs = ROW1.map((phase, i) => ({
    phase, x: MARGIN_X + i * COL_GAP, y: ROW1_Y, taskDir: "up",
  }));
  const row2Hubs = ROW2.map((phase, i) => ({
    phase, x: MARGIN_X + (ROW2.length - 1 - i) * COL_GAP, y: ROW2_Y, taskDir: "down",
  }));
  return [...row1Hubs, ...row2Hubs];
}

const CATEGORY_ORDER = ["owner", "architect", "engineer", "consultant", "contractor", "supplier"];
const STAKEHOLDER_LINES = CATEGORY_ORDER.map((category) => {
  const rep = stakeholders.find((s) => s.category === category);
  return { category, color: rep?.color ?? "#999" };
});

const AI_SOLVABILITY_COLORS = { easy: "#2FAE6E", customized: "#F5A623", "not-solvable": "#E23E6B" };

const OFFSET_STEP = 14;
const NEAR_FACTOR = 0.3;
const JOG = 36;

function passThroughHub(points, hub, dy, dirSign) {
  const farY = hub.y + dy;
  const nearY = hub.y + dy * NEAR_FACTOR;
  points.push({ x: hub.x - dirSign * (HUB_RADIUS + JOG), y: farY });
  points.push({ x: hub.x - dirSign * HUB_RADIUS, y: nearY });
  points.push({ x: hub.x + dirSign * HUB_RADIUS, y: nearY });
  points.push({ x: hub.x + dirSign * (HUB_RADIUS + JOG), y: farY });
}

function buildStakeholderLinePath(hubs, lineIndex, totalLines) {
  const rank = lineIndex - (totalLines - 1) / 2;
  const dy = rank * OFFSET_STEP;
  const dx = rank * OFFSET_STEP;

  const row1 = hubs.slice(0, 4);
  const row2 = hubs.slice(4, 8);
  const [h0, h1, h2, h3] = row1;
  const [h4, h5, h6, h7] = row2;

  const points = [];
  points.push({ x: 0, y: h0.y + dy });
  passThroughHub(points, h0, dy, 1);
  passThroughHub(points, h1, dy, 1);
  passThroughHub(points, h2, dy, 1);

  const nearY1 = h3.y + dy * NEAR_FACTOR;
  points.push({ x: h3.x - HUB_RADIUS - JOG, y: h3.y + dy });
  points.push({ x: h3.x - HUB_RADIUS, y: nearY1 });

  const colX = h3.x + dx;
  points.push({ x: colX, y: nearY1 });
  points.push({ x: colX, y: h3.y + HUB_RADIUS + JOG });
  points.push({ x: colX, y: h4.y - HUB_RADIUS - JOG });

  const nearY2 = h4.y + dy * NEAR_FACTOR;
  points.push({ x: colX, y: nearY2 });
  points.push({ x: h4.x - HUB_RADIUS, y: nearY2 });
  points.push({ x: h4.x - HUB_RADIUS - JOG, y: h4.y + dy });

  passThroughHub(points, h5, dy, -1);
  passThroughHub(points, h6, dy, -1);
  passThroughHub(points, h7, dy, -1);
  points.push({ x: 0, y: h7.y + dy });

  return "M " + points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");
}

function getTaskNodePositions(hub, taskCount) {
  const maxSpread = COL_GAP * 0.72;
  const spacing = taskCount > 1 ? Math.min(120, maxSpread / (taskCount - 1)) : 0;
  const baseDistance = HUB_RADIUS + 85;
  const zigzagStep = 48;
  const dirY = hub.taskDir === "up" ? -1 : 1;
  const startX = hub.x - ((taskCount - 1) * spacing) / 2;
  return Array.from({ length: taskCount }, (_, i) => {
    const distance = baseDistance + (i % 2 === 1 ? zigzagStep : 0);
    return { x: startX + i * spacing, y: hub.y + dirY * distance };
  });
}

function wrapLabel(label, maxChars = 15) {
  if (label.length <= maxChars) return [label];
  const words = label.split(" ");
  const lines = [];
  let current = "";
  words.forEach((w) => {
    if ((current + " " + w).trim().length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  });
  if (current.trim()) lines.push(current.trim());
  return lines;
}

// ---- render ----
const hubs = getHubPositions();

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}">`;

svg += `<defs>
  <radialGradient id="hubGlass" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.97" />
    <stop offset="55%" stop-color="#EDEFFB" stop-opacity="0.8" />
    <stop offset="100%" stop-color="#C9D2F0" stop-opacity="0.45" />
  </radialGradient>
  <radialGradient id="hubHalo" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#1934A0" stop-opacity="0.18" />
    <stop offset="100%" stop-color="#1934A0" stop-opacity="0" />
  </radialGradient>
  <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  <filter id="hubGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="14" />
  </filter>
</defs>`;

svg += `<rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#F7F7F5" />`;

// Stakeholder neon lines — two-layer: wide blurred halo underneath, bright core on top
STAKEHOLDER_LINES.forEach((line, i) => {
  const d = buildStakeholderLinePath(hubs, i, STAKEHOLDER_LINES.length);
  svg += `<path d="${d}" fill="none" stroke="${line.color}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" opacity="0.35" filter="url(#softGlow)" />`;
  svg += `<path d="${d}" fill="none" stroke="${line.color}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" opacity="0.95" />`;
});

// Hubs + task branches
hubs.forEach((hub) => {
  const tasks = hub.phase.tasks ?? [];
  const positions = getTaskNodePositions(hub, tasks.length);

  tasks.forEach((task, ti) => {
    const pos = positions[ti];
    const stubY = hub.taskDir === "up" ? hub.y - HUB_RADIUS - 30 : hub.y + HUB_RADIUS + 30;
    const color = task.aiSolvability ? AI_SOLVABILITY_COLORS[task.aiSolvability] : "#B9BFCE";
    const opacity = task.isDummy ? 0.5 : 1;
    const dash = task.isDummy ? ' stroke-dasharray="4 4"' : "";
    const pts = `${hub.x},${hub.taskDir === "up" ? hub.y - HUB_RADIUS : hub.y + HUB_RADIUS} ${hub.x},${stubY} ${pos.x},${stubY} ${pos.x},${pos.y}`;
    svg += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" opacity="${opacity}"${dash} />`;
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="7" fill="white" stroke="${color}" stroke-width="2.5" opacity="${opacity}" />`;

    const lines = wrapLabel(task.label);
    const dir = hub.taskDir;
    const ordered = dir === "up" ? [...lines].reverse() : lines;
    const baseY = dir === "up" ? pos.y - 14 : pos.y + 24;
    svg += `<text x="${pos.x}" y="${baseY}" text-anchor="middle" font-family="Poppins, sans-serif" font-size="10.5" fill="#0D0D0D" opacity="${opacity}">`;
    ordered.forEach((l, li) => {
      const dy = li === 0 ? 0 : dir === "up" ? -12 : 12;
      svg += `<tspan x="${pos.x}" dy="${dy}">${escapeXml(l)}</tspan>`;
    });
    svg += `</text>`;
  });

  // soft ambient halo behind the hub, then the glass circle
  svg += `<circle cx="${hub.x}" cy="${hub.y}" r="${HUB_RADIUS + 18}" fill="url(#hubHalo)" filter="url(#hubGlow)" />`;
  svg += `<circle cx="${hub.x}" cy="${hub.y}" r="${HUB_RADIUS}" fill="url(#hubGlass)" stroke="#1934A0" stroke-width="1.5" />`;

  const labelParts = hub.phase.label.split(" & ");
  svg += `<text x="${hub.x}" y="${hub.y}" text-anchor="middle" dominant-baseline="middle" font-family="Poppins, sans-serif" font-size="12.5" font-weight="600" fill="#1934A0">`;
  labelParts.forEach((l, li) => {
    svg += `<tspan x="${hub.x}" dy="${li === 0 ? -6 : 15}">${escapeXml(l)}</tspan>`;
  });
  svg += `</text>`;
});

svg += `</svg>`;

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const outDir = path.join(root, "scripts-out");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "metro-map.svg"), svg);
console.log(`Written ${path.join(outDir, "metro-map.svg")} (${CANVAS_WIDTH}x${CANVAS_HEIGHT})`);

// also emit the hotspot map (hub id -> % position) so the React overlay can
// stay aligned with this exact render without re-deriving pixel math
const hotspots = hubs.map((hub) => ({
  id: hub.phase.id,
  xPct: (hub.x / CANVAS_WIDTH) * 100,
  yPct: (hub.y / CANVAS_HEIGHT) * 100,
  rPct: (HUB_RADIUS / CANVAS_WIDTH) * 100,
}));
writeFileSync(path.join(root, "src/data/metroHotspots.json"), JSON.stringify(hotspots, null, 2));
console.log("Written src/data/metroHotspots.json");
