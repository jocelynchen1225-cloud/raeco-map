// Builds src/data/toolDirectory.json for the AI Tools page.
//
//   data/clean/clean_ai_solutions.csv  ->  src/data/toolDirectory.json
//
// Run after re-cleaning the Notion export:
//   node scripts/build-tool-directory.mjs
//
// One CSV row = one AI tool applied to one scenario (a "use case").
// The same tool appears in several rows, so 154 use cases map to 45 tools.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSV_PATH = path.join(root, "data/clean/clean_ai_solutions.csv");
const OUT_PATH = path.join(root, "src/data/toolDirectory.json");
const LOGO_DIR = path.join(root, "public/tool-logos");

const stakeholders = JSON.parse(fs.readFileSync(path.join(root, "src/data/stakeholders.json"), "utf8"));
const phases = JSON.parse(fs.readFileSync(path.join(root, "src/data/phases.json"), "utf8"));

// ---- minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF) ----
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((v) => v.trim()));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.replace(/^\uFEFF/, "").trim(), (r[i] ?? "").trim()])));
}

const split = (v) => (v ? v.split("|").map((s) => s.trim()).filter(Boolean) : []);
const slug = (s) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---- lookups ----
const stakeholderByLabel = Object.fromEntries(stakeholders.map((s) => [s.label.toLowerCase(), s]));
const taskIndex = {};
for (const p of phases) for (const t of p.tasks) taskIndex[t.label.toLowerCase()] = { taskId: t.id, phaseId: p.id };

// Logo files are matched by slug; a few names need a hand mapping.
const logoFiles = fs.readdirSync(LOGO_DIR);
const LOGO_OVERRIDES = {
  "Firmus (Acquired by Bluebeam)": "firmus.png",
  "Helonic(Articulate)": "helonic-articulate.png",
  "Civils.ai": "civils-ai.ico",
  Higharc: "higharc.svg",
};
function findLogo(name) {
  if (LOGO_OVERRIDES[name]) return `/tool-logos/${LOGO_OVERRIDES[name]}`;
  const s = slug(name);
  const hit = logoFiles.find((f) => f.replace(/\.[^.]+$/, "") === s);
  return hit ? `/tool-logos/${hit}` : null;
}

// Tool names as shown on the site (the CSV keeps Notion's spelling).
const DISPLAY_NAMES = {
  "Firmus (Acquired by Bluebeam)": "Firmus",
  "Helonic(Articulate)": "Helonic (Articulate)",
  karmen: "Karmen",
};

// ---- build ----
const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
const warnings = new Set();

const useCases = rows.map((r, i) => {
  const task = taskIndex[r.task_name.toLowerCase()];
  if (!task) warnings.add(`task not in phases.json: ${r.task_name}`);
  const sIds = split(r.stakeholders).map((label) => {
    const s = stakeholderByLabel[label.toLowerCase()];
    if (!s) warnings.add(`stakeholder not in stakeholders.json: ${label}`);
    return s?.id;
  }).filter(Boolean);
  return {
    id: `uc-${i + 1}`,
    toolId: slug(r.ai_solutions),
    scenario: r.scenario_name,
    task: r.task_name,
    taskId: task?.taskId ?? null,
    phaseId: task?.phaseId ?? null,
    stakeholders: sIds,
    painPoints: split(r.pain_points),
    solutionTypes: split(r.solution_types),
    deploymentModels: split(r.deployment_models),
    aiTechniques: split(r.ai_techniques),
    description: r.description,
    aiValue: r.ai_value,
  };
});

const uniq = (arr) => [...new Set(arr)];
const industryOf = Object.fromEntries(stakeholders.map((s) => [s.id, s.industry]));

const toolsById = {};
rows.forEach((r, i) => {
  const id = slug(r.ai_solutions);
  (toolsById[id] ??= { id, rawName: r.ai_solutions, useCaseIds: [] }).useCaseIds.push(useCases[i].id);
});

const tools = Object.values(toolsById).map((t) => {
  const ucs = t.useCaseIds.map((id) => useCases.find((u) => u.id === id));
  // Industry weight = how often the tool's use cases name a stakeholder from that industry.
  const weight = {};
  ucs.forEach((u) => u.stakeholders.forEach((s) => { weight[industryOf[s]] = (weight[industryOf[s]] ?? 0) + 1; }));
  const industries = Object.entries(weight).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const logo = findLogo(t.rawName);
  if (!logo) warnings.add(`no logo: ${t.rawName}`);
  return {
    id: t.id,
    name: DISPLAY_NAMES[t.rawName] ?? t.rawName,
    logo,
    primaryIndustry: industries[0] ?? "construction",
    industries,
    useCaseIds: t.useCaseIds,
    tasks: uniq(ucs.map((u) => u.task)),
    phases: uniq(ucs.map((u) => u.phaseId).filter(Boolean)),
    stakeholders: uniq(ucs.flatMap((u) => u.stakeholders)),
    painPoints: uniq(ucs.flatMap((u) => u.painPoints)),
    solutionTypes: uniq(ucs.flatMap((u) => u.solutionTypes)),
    deploymentModels: uniq(ucs.flatMap((u) => u.deploymentModels)),
    aiTechniques: uniq(ucs.flatMap((u) => u.aiTechniques)),
    headline: ucs[0].aiValue,
    website: null, // to be filled from Notion later
  };
}).sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(OUT_PATH, JSON.stringify({ generatedFrom: "data/clean/clean_ai_solutions.csv", tools, useCases }, null, 2));
console.log(`use cases: ${useCases.length}, tools: ${tools.length}`);
for (const w of [...warnings].sort()) console.log("  ! " + w);
