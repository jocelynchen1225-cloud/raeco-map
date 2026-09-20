#!/usr/bin/env python3
"""
Clean the raw Notion-exported AI Solutions CSV into a human-readable CSV.

This script only performs the first data-preparation step:

raw Notion CSV -> clean CSV

It does not generate frontend JSON. The output is intended to be reviewed,
versioned, and then used by a later build script to produce `phases.json`.
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path


DEFAULT_INPUT = Path(
    "/Users/ye/Desktop/AAL Notion/solu 0825/AI Solutions/"
    "AI Solutions 3902813d724e80a795a0f243ea818d19_all.csv"
)
DEFAULT_OUTPUT = Path("data/clean/clean_ai_solutions.csv")


OUTPUT_COLUMNS = [
    "scenario_name",
    "task_name",
    "stakeholders",
    "pain_points",
    "ai_solutions",
    "solution_types",
    "deployment_models",
    "ai_techniques",
    "description",
    "ai_value",
]


def split_relation_names(value: str | None) -> list[str]:
    """Split a Notion relation/multi-select field and remove Notion URLs.

    Notion CSV relations often look like:

        Name (https://notion...), Another Name (https://notion...)

    A naive comma split is risky because commas may appear inside parentheses.
    This parser splits only on commas outside parentheses, then removes a
    trailing parenthesized URL.
    """
    if not value:
        return []

    parts: list[str] = []
    current: list[str] = []
    depth = 0

    for char in value:
        if char == "(":
            depth += 1
        elif char == ")":
            depth = max(0, depth - 1)

        if char == "," and depth == 0:
            item = "".join(current).strip()
            if item:
                parts.append(item)
            current = []
        else:
            current.append(char)

    item = "".join(current).strip()
    if item:
        parts.append(item)

    return [clean_relation_name(part) for part in parts if clean_relation_name(part)]


def clean_relation_name(value: str) -> str:
    """Remove URLs and normalize whitespace from one relation value."""
    text = value.strip()
    text = re.sub(r"\s*\(https?://[^)]*\)\s*$", "", text)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return strip_notion_duplicate_suffix(text)


def strip_notion_duplicate_suffix(value: str) -> str:
    """Remove duplicate suffixes that Notion sometimes appends to names.

    Example:
        "Tool Name (1)" -> "Tool Name"

    URL parentheses are removed earlier. This only removes purely numeric
    suffixes, so names with meaningful parentheses are preserved.
    """
    return re.sub(r"\s*\(\d+\)\s*$", "", value).strip()


def normalize_text(value: str | None) -> str:
    """Normalize ordinary free-text cells while preserving their content."""
    if not value:
        return ""
    text = value.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def join_values(values: list[str]) -> str:
    """Use a readable delimiter for clean CSV multi-value fields."""
    seen: set[str] = set()
    deduped: list[str] = []
    for value in values:
        key = value.casefold()
        if value and key not in seen:
            seen.add(key)
            deduped.append(value)
    return " | ".join(deduped)


def first_value(values: list[str]) -> str:
    return values[0] if values else ""


def read_rows(input_path: Path) -> list[dict[str, str]]:
    with input_path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def clean_row(row: dict[str, str]) -> dict[str, str]:
    tool_names = split_relation_names(row.get("Tool Name"))
    techniques = split_relation_names(row.get("AI Techniques"))
    deployment_models = split_relation_names(row.get("Deployment model"))
    pain_points = split_relation_names(row.get("PainPoints"))
    scenarios = split_relation_names(row.get("Scenarios"))
    solution_types = split_relation_names(row.get("Solution Type"))
    stakeholders = split_relation_names(row.get("Stakeholders") or row.get("stakeholders"))
    tasks = split_relation_names(row.get("Task"))

    return {
        "scenario_name": first_value(scenarios),
        "task_name": first_value(tasks),
        "stakeholders": join_values(stakeholders),
        "pain_points": join_values(pain_points),
        "ai_solutions": join_values(tool_names),
        "solution_types": join_values(solution_types),
        "deployment_models": join_values(deployment_models),
        "ai_techniques": join_values(techniques),
        "description": normalize_text(row.get("Description")),
        "ai_value": normalize_text(row.get("Key Capability")),
    }


def row_key(row: dict[str, str]) -> tuple[str, ...]:
    """Deduplicate repeated export rows without merging different content."""
    return tuple(row.get(column, "").casefold() for column in OUTPUT_COLUMNS)


def clean_csv(input_path: Path, output_path: Path) -> dict[str, int]:
    raw_rows = read_rows(input_path)
    clean_rows: list[dict[str, str]] = []
    seen: set[tuple[str, ...]] = set()

    for raw in raw_rows:
        cleaned = clean_row(raw)

        # Drop entirely empty rows or rows without a meaningful scenario/task/tool.
        if not any(cleaned.values()):
            continue
        if not (cleaned["scenario_name"] or cleaned["task_name"] or cleaned["ai_solutions"]):
            continue

        key = row_key(cleaned)
        if key in seen:
            continue
        seen.add(key)
        clean_rows.append(cleaned)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(clean_rows)

    return {
        "raw_rows": len(raw_rows),
        "clean_rows": len(clean_rows),
        "dropped_or_deduped_rows": len(raw_rows) - len(clean_rows),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Clean raw Notion AI Solutions CSV into clean_ai_solutions.csv."
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"Raw Notion CSV path. Default: {DEFAULT_INPUT}",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Clean CSV output path. Default: {DEFAULT_OUTPUT}",
    )
    args = parser.parse_args()

    stats = clean_csv(args.input, args.output)
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")
    print(f"Raw rows: {stats['raw_rows']}")
    print(f"Clean rows: {stats['clean_rows']}")
    print(f"Dropped/deduped rows: {stats['dropped_or_deduped_rows']}")


if __name__ == "__main__":
    main()
