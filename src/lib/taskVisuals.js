import { Ruler, HardHat, Pencil, User, Settings, Package, Calculator, Layers, Hammer, Clipboard, FileText, Building2 } from "lucide-react";
import stakeholders from "../data/stakeholders.json";
import phases from "../data/phases.json";

// 12 stakeholders, 12 distinct icons — no two roles share a glyph.
export const STAKEHOLDER_ICONS = {
  ruler: Ruler,
  hardhat: HardHat,
  pencil: Pencil,
  user: User,
  gear: Settings,
  package: Package,
  calculator: Calculator,
  layers: Layers,
  hammer: Hammer,
  clipboard: Clipboard,
  file: FileText,
  building: Building2,
};

export const INDUSTRY_COLORS = {
  "real-estate": "#EB8588",
  architecture: "#E9A7FA",
  engineering: "#ACE0FD",
  construction: "#99E4B3",
  operation: "#A1ACD1",
};

export const INDUSTRY_LABELS = {
  "real-estate": "Real Estate",
  architecture: "Architecture",
  engineering: "Engineering",
  construction: "Construction",
  operation: "Operation",
};

export const INDUSTRY_ORDER = ["real-estate", "architecture", "engineering", "construction", "operation"];

export function getIndustryColor(industryId) {
  return INDUSTRY_COLORS[industryId] ?? "#9CA3AF";
}

const stakeholderById = Object.fromEntries(stakeholders.map((s) => [s.id, s]));

/**
 * A task's line/dot color on the metro map comes from its primary
 * stakeholder's INDUSTRY (one of 5 RAECO colors) — not the stakeholder
 * individually. The icon still identifies the specific stakeholder role.
 */
export function getTaskVisual(task) {
  const primaryId = task.stakeholders?.[0];
  const s = stakeholderById[primaryId];
  return {
    stakeholderId: primaryId ?? "unassigned",
    stakeholderLabel: s?.label ?? "Unassigned",
    industryId: s?.industry ?? "construction",
    color: getIndustryColor(s?.industry),
    Icon: STAKEHOLDER_ICONS[s?.icon] ?? User,
  };
}

export function getStakeholder(id) {
  return stakeholderById[id];
}

export function findPhase(phaseId) {
  return phases.find((p) => p.id === phaseId);
}

export function findTask(phaseId, taskId) {
  const phase = findPhase(phaseId);
  return phase?.tasks.find((t) => t.id === taskId);
}

export function scenarioInvolvesStakeholder(scenario, stakeholderId) {
  if (!stakeholderId || stakeholderId === "all") return true;
  return scenario?.stakeholders?.includes(stakeholderId);
}

export function taskInvolvesStakeholder(task, stakeholderId) {
  if (!stakeholderId || stakeholderId === "all") return true;
  return task?.stakeholders?.includes(stakeholderId);
}

export function filterTaskForStakeholder(task, stakeholderId) {
  if (!task || !stakeholderId || stakeholderId === "all") return task;
  return task;
}

export function filterPhaseForStakeholder(phase, stakeholderId) {
  if (!phase || !stakeholderId || stakeholderId === "all") return phase;

  return {
    ...phase,
    tasks: (phase.tasks ?? [])
      .filter((task) => taskInvolvesStakeholder(task, stakeholderId))
      .map((task) => filterTaskForStakeholder(task, stakeholderId)),
  };
}

export function filterPhasesForStakeholder(phasesList, stakeholderId, { keepEmpty = false } = {}) {
  const filtered = phasesList.map((phase) => filterPhaseForStakeholder(phase, stakeholderId));
  if (!stakeholderId || stakeholderId === "all" || keepEmpty) return filtered;
  return filtered.filter((phase) => phase.tasks.length > 0);
}

export const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
