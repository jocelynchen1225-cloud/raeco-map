import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { APP_STATES, initialAppContext } from "./state/appStates";
import NavBar from "./components/NavBar";
import HeroState from "./components/HeroState";
import MetroMapState from "./components/MetroMapState";
import TaskDetailOverlay from "./components/TaskDetailOverlay";
import SolutionDetailStatic from "./components/SolutionDetailStatic";
import ChatBubbleWidget from "./components/ChatBubbleWidget";
import { findTask } from "./lib/taskVisuals";

// Chat bubble is intentionally withheld until the user has picked a task and
// landed on the scenario-card screen — it shouldn't compete for attention on
// the hero/stakeholder/map screens.
const STATES_WITH_CHAT = [APP_STATES.TASK_DETAIL_STATIC, APP_STATES.SOLUTION_DETAIL_STATIC];
const SAVED_SCENARIOS_KEY = "raeco.savedScenarioIds";

function loadSavedScenarioIds() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(SAVED_SCENARIOS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export default function App() {
  const [ctx, setCtx] = useState(initialAppContext);
  const [focusPhase, setFocusPhase] = useState(null); // phase currently zoomed into on the metro map
  const [savedScenarioIds, setSavedScenarioIds] = useState(loadSavedScenarioIds);
  const [favoriteToast, setFavoriteToast] = useState(null);

  const goTo = (state, patch = {}) => setCtx((prev) => ({ ...prev, ...patch, state }));
  const backToHero = () => {
    setFocusPhase(null);
    setCtx((prev) => ({
      ...prev,
      state: APP_STATES.HERO,
      selectedStakeholderId: null,
      selectedPhaseId: null,
      selectedTaskId: null,
      selectedScenarioId: null,
    }));
  };

  const activeTask =
    ctx.selectedPhaseId && ctx.selectedTaskId ? findTask(ctx.selectedPhaseId, ctx.selectedTaskId) : null;

  useEffect(() => {
    window.localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify([...savedScenarioIds]));
  }, [savedScenarioIds]);

  const toggleSavedScenario = (scenarioId) => {
    setSavedScenarioIds((prev) => {
      const next = new Set(prev);
      const willSave = !next.has(scenarioId);
      if (willSave) {
        next.add(scenarioId);
        setFavoriteToast("Saved. You can export your saved pain point scenario report later.");
      } else {
        next.delete(scenarioId);
        setFavoriteToast("Removed from saved scenarios.");
      }
      window.clearTimeout(toggleSavedScenario.toastTimer);
      toggleSavedScenario.toastTimer = window.setTimeout(() => setFavoriteToast(null), 2400);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <NavBar />

      <AnimatePresence mode="wait">
        {ctx.state === APP_STATES.HERO && (
          <HeroState key="hero" onSelectRoleAndTask={() => goTo(APP_STATES.METRO_MAP)} />
        )}

        {ctx.state === APP_STATES.METRO_MAP && (
          <MetroMapState
            key="metro-map"
            selectedStakeholderId={ctx.selectedStakeholderId}
            onSelectStakeholder={(id) => setCtx((prev) => ({ ...prev, selectedStakeholderId: id }))}
            focusPhase={focusPhase}
            onFocusPhase={setFocusPhase}
            onSelectTask={(task, phase) =>
              goTo(APP_STATES.TASK_DETAIL_STATIC, { selectedPhaseId: phase.id, selectedTaskId: task.id })
            }
            onBack={backToHero}
          />
        )}

        {ctx.state === APP_STATES.TASK_DETAIL_STATIC && (
          <TaskDetailOverlay
            key="task-detail-static"
            task={activeTask}
            savedScenarioIds={savedScenarioIds}
            onToggleSavedScenario={toggleSavedScenario}
            onBack={() => goTo(APP_STATES.METRO_MAP)}
            onExploreScenario={(scenario) =>
              goTo(APP_STATES.SOLUTION_DETAIL_STATIC, { selectedScenarioId: scenario.id })
            }
          />
        )}

        {ctx.state === APP_STATES.SOLUTION_DETAIL_STATIC && (
          <SolutionDetailStatic
            key="solution-detail-static"
            task={activeTask}
            scenario={activeTask?.scenarios?.find((s) => s.id === ctx.selectedScenarioId)}
            savedScenarioIds={savedScenarioIds}
            onToggleSavedScenario={toggleSavedScenario}
            onBack={() => goTo(APP_STATES.TASK_DETAIL_STATIC)}
          />
        )}
      </AnimatePresence>

      {STATES_WITH_CHAT.includes(ctx.state) && <ChatBubbleWidget />}
      {favoriteToast && (
        <div className="fixed bottom-8 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-white/85 bg-white/90 px-5 py-3 font-body text-sm font-bold text-[var(--color-brand)] shadow-[0_18px_46px_rgba(25,52,160,0.18)] backdrop-blur-xl">
          {favoriteToast}
        </div>
      )}
    </div>
  );
}
