# AAL AEC Network Map — MVP scaffold

## Run locally
```
npm install
npm run dev
```

## What's built (State 0)
- `src/state/appStates.js` — the state-machine enum (`hero → stakeholder_select → metro_map → phase_zoom → task_detail`) and shared selection context. This is what drives the single-page transitions instead of routing.
- `src/data/stakeholders.json` — the 13 stakeholders with their color-line category (owner/architect/engineer/consultant/contractor/supplier), reused everywhere the map renders — no static images.
- `src/data/phases.json` — the 7 lifecycle phases. `construction-document` has real task + scenario data (from the working file); the other 6 are flagged `"isDummy": true` so they're easy to find and replace later.
- `src/data/aiTools.json` — AI tool entries referenced by scenarios (e.g. SWAPP AI).
- `src/components/HeroState.jsx` — State 0 UI: headline, stat ledger, and the CTA button wired to `onSelectRoleAndTask`, which advances `App.jsx`'s state machine to `STAKEHOLDER_SELECT`.
- `src/components/StakeholderSelectStatePlaceholder.jsx` — confirms the transition works; this is where the blurred map + liquid-glass stakeholder picker (State 1) gets built next.

## Next steps
1. Build State 1 (stakeholder picker overlay + background blur of a placeholder Metro Map).
2. Build the real Metro Map canvas (State 2) using `react-zoom-pan-pinch` for pan/zoom, rendering `phases.json` + `stakeholders.json` as SVG nodes/lines instead of a static image.
3. Wire State 3 (phase zoom) and State 4 (task/scenario detail popup + the "We're listening" lead-capture chat bubble).
