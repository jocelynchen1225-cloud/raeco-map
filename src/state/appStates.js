// The whole product is one page that moves through these states —
// no route changes, so the blur/zoom transitions between them stay continuous.
export const APP_STATES = {
  HERO: "hero",                     // State 0 — landing hero + stats + CTA
  STAKEHOLDER_SELECT: "stakeholder_select", // State 1 — blurred map + role picker overlay
  METRO_MAP: "metro_map",           // State 2 — full unlocked network map (data-driven SVG build)
  GLOBAL_MAP_STATIC: "global_map_static",   // State 2b — static reference-image map with hotspots
  PHASE_DETAIL_STATIC: "phase_detail_static", // State 3b — static phase-zoom image with hotspots
  TASK_DETAIL_STATIC: "task_detail_static",   // State 4b — scenario cards over blurred phase image
  SOLUTION_DETAIL_STATIC: "solution_detail_static", // State 5b — pain point / AI solution / tool detail
  PHASE_ZOOM: "phase_zoom",         // State 3 — zoomed into one phase's tasks
  TASK_DETAIL: "task_detail",       // State 4 — scenario / AI tool detail popup
};

// Shared selection context that persists as the user moves through states.
export const initialAppContext = {
  state: APP_STATES.HERO,
  selectedStakeholderId: null,
  selectedPhaseId: null,
  selectedTaskId: null,
  selectedScenarioId: null,
};
