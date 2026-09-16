# RAECO AI Map V1.2

Interactive AEC AI discovery prototype for AAL Innovation.

## Version

Current version: `1.2.0`

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
