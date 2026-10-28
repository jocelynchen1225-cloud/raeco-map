import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { APP_STATES, initialAppContext } from "./state/appStates";
import NavBar from "./components/NavBar";
import HeroState from "./components/HeroState";
import MetroMapState from "./components/MetroMapState";
import TaskDetailOverlay from "./components/TaskDetailOverlay";
import SolutionDetailStatic from "./components/SolutionDetailStatic";
import ChatBubbleWidget from "./components/ChatBubbleWidget";
import AIToolsPage from "./components/tools/AIToolsPage";
import { findPhase, findTask, filterPhasesForStakeholder, filterTaskForStakeholder, sortedPhases } from "./lib/taskVisuals";

// Chat bubble is intentionally withheld until the user has picked a task and
// landed on the scenario-card screen — it shouldn't compete for attention on
// the hero/stakeholder/map screens.
const STATES_WITH_CHAT = [APP_STATES.TASK_DETAIL_STATIC, APP_STATES.SOLUTION_DETAIL_STATIC, APP_STATES.AI_TOOLS];
const SAVED_SCENARIOS_KEY = "raeco.savedScenarioIds";
const SAVED_TOOLS_KEY = "raeco.savedToolIds";

function loadSavedIds(key) {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set();
  }
}

export default function App() {
  const [ctx, setCtx] = useState(initialAppContext);
  const [focusPhase, setFocusPhase] = useState(null); // phase currently zoomed into on the metro map
  const [savedScenarioIds, setSavedScenarioIds] = useState(() => loadSavedIds(SAVED_SCENARIOS_KEY));
  const [savedToolIds, setSavedToolIds] = useState(() => loadSavedIds(SAVED_TOOLS_KEY));
  const [favoriteToast, setFavoriteToast] = useState(null);

  // Every screen transition starts scrolled to the top, regardless of where
  // the previous screen (or the metro map behind an overlay) was scrolled to.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [ctx.state]);

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
  const backToStakeholderSelection = () => {
    setFocusPhase(null);
    setCtx((prev) => ({
      ...prev,
      state: APP_STATES.METRO_MAP,
      selectedStakeholderId: null,
      selectedPhaseId: null,
      selectedTaskId: null,
      selectedScenarioId: null,
    }));
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  };

  const activeTask =
    ctx.selectedPhaseId && ctx.selectedTaskId ? findTask(ctx.selectedPhaseId, ctx.selectedTaskId) : null;
  const activePhase = ctx.selectedPhaseId ? findPhase(ctx.selectedPhaseId) : null;
  const activeVisibleTask = filterTaskForStakeholder(activeTask, ctx.selectedStakeholderId);
  const taskUseCaseCount = activeVisibleTask?.scenarios?.length ?? 0;
  const taskHasVisibleUseCases = (task) =>
    (filterTaskForStakeholder(task, ctx.selectedStakeholderId)?.scenarios?.length ?? 0) > 0;
  const visibleTaskSequence = filterPhasesForStakeholder(sortedPhases, ctx.selectedStakeholderId).flatMap((phase) =>
    (phase.tasks ?? []).map((task) => ({ phase, task }))
  );
  const activeTaskIndex = visibleTaskSequence.findIndex(
    ({ phase, task }) => phase.id === ctx.selectedPhaseId && task.id === ctx.selectedTaskId
  );
  const previousTaskEntry =
    activeTaskIndex >= 0
      ? visibleTaskSequence
          .slice(0, activeTaskIndex)
          .reverse()
          .find(({ task }) => taskHasVisibleUseCases(task))
      : null;
  const nextTaskEntry =
    activeTaskIndex >= 0
      ? visibleTaskSequence.slice(activeTaskIndex + 1).find(({ task }) => taskHasVisibleUseCases(task))
      : null;
  const activeScenarioIndex =
    activeVisibleTask?.scenarios?.findIndex((scenario) => scenario.id === ctx.selectedScenarioId) ?? -1;
  const previousScenario = activeScenarioIndex > 0 ? activeVisibleTask.scenarios[activeScenarioIndex - 1] : null;
  const nextScenario =
    activeScenarioIndex >= 0 && activeScenarioIndex < (activeVisibleTask?.scenarios?.length ?? 0) - 1
      ? activeVisibleTask.scenarios[activeScenarioIndex + 1]
      : null;

  const goToTaskEntry = (entry) => {
    if (!entry) return;
    setCtx((prev) => ({
      ...prev,
      state: APP_STATES.TASK_DETAIL_STATIC,
      selectedPhaseId: entry.phase.id,
      selectedTaskId: entry.task.id,
      selectedScenarioId: null,
    }));
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  };

  useEffect(() => {
    window.localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify([...savedScenarioIds]));
  }, [savedScenarioIds]);

  useEffect(() => {
    window.localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify([...savedToolIds]));
  }, [savedToolIds]);

  const toggleSavedScenario = (scenarioId) => {
    setSavedScenarioIds((prev) => {
      const next = new Set(prev);
      const willSave = !next.has(scenarioId);
      if (willSave) {
        next.add(scenarioId);
        setFavoriteToast("Saved. You can export your saved pain point use case report later.");
      } else {
        next.delete(scenarioId);
        setFavoriteToast("Removed from saved use cases.");
      }
      window.clearTimeout(toggleSavedScenario.toastTimer);
      toggleSavedScenario.toastTimer = window.setTimeout(() => setFavoriteToast(null), 2400);
      return next;
    });
  };

  const toggleSavedTool = (toolId) => {
    setSavedToolIds((prev) => {
      const next = new Set(prev);
      const willSave = !next.has(toolId);
      if (willSave) {
        next.add(toolId);
        setFavoriteToast("Added to report. You can export your saved tools report later.");
      } else {
        next.delete(toolId);
        setFavoriteToast("Removed from report.");
      }
      window.clearTimeout(toggleSavedTool.toastTimer);
      toggleSavedTool.toastTimer = window.setTimeout(() => setFavoriteToast(null), 2400);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <NavBar
        activeLink={
          ctx.state === APP_STATES.AI_TOOLS
            ? "AI Tools"
            : ctx.state === APP_STATES.METRO_MAP
              ? "Use Cases"
              : null
        }
        onHome={backToHero}
        onNavigate={(link) => {
          if (link === "AI Tools") {
            setFocusPhase(null);
            goTo(APP_STATES.AI_TOOLS);
          }
        }}
      />

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
            onBackToStakeholderSelection={backToStakeholderSelection}
          />
        )}

        {ctx.state === APP_STATES.TASK_DETAIL_STATIC && (
          <TaskDetailOverlay
            key="task-detail-static"
            phase={activePhase}
            task={activeTask}
            selectedStakeholderId={ctx.selectedStakeholderId}
            savedScenarioIds={savedScenarioIds}
            onToggleSavedScenario={toggleSavedScenario}
            onBack={() => goTo(APP_STATES.METRO_MAP)}
            onPreviousTask={() => goToTaskEntry(previousTaskEntry)}
            onNextTask={() => goToTaskEntry(nextTaskEntry)}
            hasPreviousTask={Boolean(previousTaskEntry)}
            hasNextTask={Boolean(nextTaskEntry)}
            onExploreScenario={(scenario) =>
              goTo(APP_STATES.SOLUTION_DETAIL_STATIC, { selectedScenarioId: scenario.id })
            }
          />
        )}

        {ctx.state === APP_STATES.SOLUTION_DETAIL_STATIC && (
          <SolutionDetailStatic
            key="solution-detail-static"
            phase={activePhase}
            task={activeVisibleTask}
            scenario={activeVisibleTask?.scenarios?.find((s) => s.id === ctx.selectedScenarioId)}
            savedScenarioIds={savedScenarioIds}
            onToggleSavedScenario={toggleSavedScenario}
            onBack={() => goTo(APP_STATES.TASK_DETAIL_STATIC)}
            onPreviousUseCase={() => {
              if (!previousScenario) return;
              goTo(APP_STATES.SOLUTION_DETAIL_STATIC, { selectedScenarioId: previousScenario.id });
              requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
            }}
            onNextUseCase={() => {
              if (!nextScenario) return;
              goTo(APP_STATES.SOLUTION_DETAIL_STATIC, { selectedScenarioId: nextScenario.id });
              requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
            }}
            hasPreviousUseCase={Boolean(previousScenario)}
            hasNextUseCase={Boolean(nextScenario)}
          />
        )}
        {ctx.state === APP_STATES.AI_TOOLS && (
          <AIToolsPage key="ai-tools" savedToolIds={savedToolIds} onToggleSavedTool={toggleSavedTool} />
        )}
      </AnimatePresence>

      {STATES_WITH_CHAT.includes(ctx.state) && (
        <ChatBubbleWidget
          key={ctx.state}
          variant={ctx.state === APP_STATES.AI_TOOLS ? "tools" : "scenarios"}
          autoOpenDelayMs={ctx.state === APP_STATES.TASK_DETAIL_STATIC && taskUseCaseCount > 3 ? 5000 : 10000}
          openAfterScrollBottom={ctx.state === APP_STATES.TASK_DETAIL_STATIC && taskUseCaseCount > 3}
        />
      )}
      {favoriteToast && (
        <div className="fixed bottom-8 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-white/85 bg-white/90 px-5 py-3 font-body text-sm font-bold text-[var(--color-brand)] shadow-[0_18px_46px_rgba(25,52,160,0.18)] backdrop-blur-xl">
          {favoriteToast}
        </div>
      )}
    </div>
  );
}
