# RAECO Data Cleaning Notes

This document explains the first data-cleaning step for the RAECO AI Map content pipeline.

## Purpose

The raw source file is a Notion-exported CSV. It contains useful content, but many fields are exported as Notion relation strings, often including URLs.

The cleaning script converts:

```text
raw Notion CSV
→ clean_ai_solutions.csv
```

It does not directly generate the frontend JSON. It produces a clean, reviewable CSV that can later be transformed into `phases.json`.

## Script

```text
scripts/clean_notion_ai_solutions.py
```

## Default Input

```text
/Users/ye/Desktop/AAL Notion/solu 0825/AI Solutions/AI Solutions 3902813d724e80a795a0f243ea818d19_all.csv
```

## Default Output

```text
data/clean/clean_ai_solutions.csv
```

## How To Run

From the project folder:

```bash
cd "/Users/ye/Desktop/raeco-map-real-content"
python3 scripts/clean_notion_ai_solutions.py
```

With custom paths:

```bash
python3 scripts/clean_notion_ai_solutions.py \
  --input "/path/to/raw.csv" \
  --output "data/clean/clean_ai_solutions.csv"
```

## Output Columns

The clean CSV contains:

```text
scenario_name
task_name
stakeholders
pain_points
ai_solutions
solution_types
deployment_models
ai_techniques
description
ai_value
```

## Cleaning Rules

### 1. Remove Notion URLs

Raw Notion relation values may look like:

```text
Architect (https://www.notion.so/...)
```

The script converts this to:

```text
Architect
```

### 2. Split Relation Fields Safely

Multi-value fields may look like:

```text
Architect (https://...), MEP Engineer (https://...)
```

The script converts this to:

```text
Architect | MEP Engineer
```

It splits on commas only when the comma is outside parentheses, so URLs or names with parentheses do not break the parsing.

### 3. Normalize Whitespace

Repeated spaces, line breaks and non-breaking spaces are collapsed into normal spaces.

### 4. Remove Notion Duplicate Suffixes

If Notion exports duplicate names like:

```text
Tool Name (1)
```

the script converts this to:

```text
Tool Name
```

Only numeric suffixes are removed. Meaningful parentheses are preserved.

### 5. Deduplicate Rows

If the export contains repeated rows with exactly the same cleaned values, only one is kept.

### 6. Preserve Human-Readable Multi-Value Fields

The clean CSV uses:

```text
 |
```

as the multi-value delimiter, because it is easier to review manually in Excel, Numbers or Google Sheets.

Example:

```text
Architect | Main Contractor | Project Manager
```

## Relationship To Frontend JSON

This script is only step 1:

```text
Raw CSV
→ clean_ai_solutions.csv
```

The frontend currently reads:

```text
src/data/phases.json
src/data/stakeholders.json
```

A later build script can transform `clean_ai_solutions.csv` into frontend JSON by matching:

```text
task_name → task id
stakeholders → stakeholder ids
scenario_name → task.scenarios[]
```

## Recommended Update Workflow

When the Notion export is updated:

1. Replace or save the new raw CSV.
2. Run:

```bash
python3 scripts/clean_notion_ai_solutions.py \
  --input "/path/to/new-export.csv" \
  --output "data/clean/clean_ai_solutions.csv"
```

3. Review `data/clean/clean_ai_solutions.csv`.
4. Run the future frontend-data build script to regenerate JSON.
5. Run the app and verify the affected task pages.
