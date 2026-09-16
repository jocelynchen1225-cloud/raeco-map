import { useState } from "react";
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

export default function App() {
  const [ctx, setCtx] = useState(initialAppContext);
  const [focusPhase, setFocusPhase] = useState(null); // phase currently zoomed into on the metro map

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
            onBack={() => goTo(APP_STATES.TASK_DETAIL_STATIC)}
          />
        )}
      </AnimatePresence>

      {STATES_WITH_CHAT.includes(ctx.state) && <ChatBubbleWidget />}
    </div>
  );
}
