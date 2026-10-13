# RAECO AI Map V1.2

Interactive AEC AI discovery prototype for AAL Innovation.

## Version

Current version: `5.0`

## Version History

### v5.0

- New **AI Tools** page, opened from the navigation bar (`src/components/tools/`).
  - Four donut charts mirroring the Notion views: tools by pain point, pain points by role, pain points by task, tasks by role. Hovering a segment shows a tooltip with a logo preview; clicking a segment (or its legend row) filters the tool list.
  - Tool list in five RAECO columns. A tool appears under every industry whose roles use it, ranked by number of use cases. Secondary filters: search, phase, solution type.
  - Tool detail drawer built from existing data (headline, solution type, deployment, phases, pain points, every use case, AI techniques). Website link shows only when `website` is filled.
  - Chat bubble appears on this page as on the scenario screens; the drawer's CTA opens it.
- New data step: `node scripts/build-tool-directory.mjs` turns `data/clean/clean_ai_solutions.csv` into `src/data/toolDirectory.json` (154 use cases, 45 tools) and reports tools without a logo.
- Fixed the "Knowledege Fragmentation" typo in the CSV, `phases.json` and `TaskDetailOverlay.jsx`. The Notion source still needs the same fix.

### v3.3

- Replaced the placeholder icons in the homepage "A preview of what's inside" section with real AEC tool logos.
- Added the `public/tool-logos/` asset folder for local logo delivery.
- Categorized preview logos by industry/use case across Real Estate, Architecture, Engineering, Construction, and Operation.
- Removed duplicate tools from the preview board so each displayed logo represents a unique tool.
- Replaced the unclear Higharc favicon-style asset with the official Higharc SVG logo and adjusted its tile padding for better visibility.

## What This Version Includes

- Home page with CTA: `EXPLORE BY YOUR ROLE`
- Stakeholder selection screen with 12 real stakeholder roles
- `View All` option to unlock the full metro map without choosing one stakeholder
- Metro map overview driven by normalized RAECO phase/task/stakeholder data
- Phase zoom interaction from the map overview
- Task detail page connected from each phase task node
- Scenario cards populated from the normalized AI solution dataset
- Scenario cards include:
  - scenario number
  - scenario name
  - pain point tags
  - brief description
  - stakeholders
  - AI solutions
  - AI techniques
  - solution/deployment tags
  - clearer `Explore` CTA button
- Empty state for tasks that exist in the phase/task dataset but do not yet have matched scenario rows

## Data Notes

The current data files are:

- `src/data/phases.json`
- `src/data/stakeholders.json`

They include:

- 8 phases
- 51 tasks
- 12 stakeholders
- 136 scenario records

Known task/scenario relationships are generated from the available normalized RAECO data. No placeholder scenario content has been invented for tasks without matched scenario rows.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Build output is generated in:

```bash
dist
```

## Deployment Notes

For Lovable or other static/Vite hosting:

- Framework: Vite / React
- Build command: `npm run build`
- Output directory: `dist`
- Dev command: `npm run dev`
