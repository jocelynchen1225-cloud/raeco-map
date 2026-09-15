import { Ruler, HardHat, Pencil, User, Settings, Package, Calculator } from "lucide-react";
import stakeholders from "../data/stakeholders.json";
import phases from "../data/phases.json";

export const STAKEHOLDER_ICONS = {
  ruler: Ruler,
  hardhat: HardHat,
  pencil: Pencil,
  user: User,
  gear: Settings,
  package: Package,
  calculator: Calculator,
};

const stakeholderById = Object.fromEntries(stakeholders.map((s) => [s.id, s]));

/**
 * A task's line/dot color and icon on the metro map are derived from its
 * "primary" stakeholder — the first id in `task.stakeholders` — rather than
 * a fixed lane, since real tasks can involve any mix of the 6 roles.
 */
export function getTaskVisual(task) {
  const primaryId = task.stakeholders?.[0];
  const s = stakeholderById[primaryId];
  return {
    stakeholderId: primaryId ?? "unassigned",
    stakeholderLabel: s?.label ?? "Unassigned",
    color: s?.color ?? "#9CA3AF",
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

export const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
