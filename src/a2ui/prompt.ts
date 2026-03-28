import { SCOUT_CATALOG } from "./catalog.js";
import { A2UI_SCHEMA } from "./schema.js";

/**
 * Builds the system prompt for the A2UI enhancement.
 * Includes catalog definitions, usage rules, and few-shot examples.
 */
export function buildA2UISystemPrompt(): string {
  return `
## A2UI Response Format

When your response would benefit from structured UI (scores, comparisons, 
forms, cards), you MUST include A2UI JSON in your response.

Your response format:
1. First part: conversational text (Markdown)
2. Delimiter: ---a2ui_JSON---
3. Second part: a JSON array of A2UI messages

Available components (catalog: ${SCOUT_CATALOG.catalogId}):
${SCOUT_CATALOG.components.map((c) => `- ${c}`).join("\n")}

### When to use A2UI:
- Budget calculation results → ScoreCard with ProgressBar
- Neighborhood comparisons → Comparison layout with scored rows
- "Save favorite" confirmation → Card with success state
- Asking for budget input → Form with TextField and Slider
- Neighborhood overview → NeighborhoodCard with Image, Chips, scores
- Trend/historical data → TimeSeriesChart (custom component) with data-bound series

### When NOT to use A2UI (plain text is fine):
- General conversation, greetings
- Long-form neighborhood descriptions/reports
- Clarifying questions

### Example 1: Budget Score Card
After calculate_budget_fit returns { neighborhood: "Williamsburg", score: "7.5", verdict: "Affordable" }:

---a2ui_JSON---
[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "budget-result",
      "catalogId": "${SCOUT_CATALOG.catalogId}"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "budget-result",
      "components": [
        {
          "id": "root",
          "component": "Card",
          "children": ["title", "score-row", "verdict"]
        },
        {
          "id": "title",
          "component": "Text",
          "text": "Budget Fit: Williamsburg",
          "variant": "h2"
        },
        {
          "id": "score-row",
          "component": "Row",
          "children": ["score-bar", "score-label"]
        },
        {
          "id": "score-bar",
          "component": "ProgressBar",
          "value": { "path": "/budget/score" },
          "max": 10
        },
        {
          "id": "score-label",
          "component": "Text",
          "text": { "path": "/budget/scoreDisplay" },
          "variant": "h1"
        },
        {
          "id": "verdict",
          "component": "Chip",
          "label": { "path": "/budget/verdict" },
          "variant": "success"
        }
      ]
    }
  },
  {
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "budget-result",
      "path": "/budget",
      "value": {
        "neighborhood": "Williamsburg",
        "score": 7.5,
        "scoreDisplay": "7.5 / 10",
        "verdict": "Affordable"
      }
    }
  }
]

### Example 2: Comparison Layout
After generate_comparison_matrix returns:
{ "matrix": [
  { "name": "Williamsburg", "safety_score": 8, "transit_score": 9, "affordability_score": 6 },
  { "name": "Bushwick", "safety_score": 6, "transit_score": 7, "affordability_score": 9 }
]}:

---a2ui_JSON---
[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "comparison",
      "catalogId": "${SCOUT_CATALOG.catalogId}"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "comparison",
      "components": [
        {
          "id": "root",
          "component": "Card",
          "children": ["header-row", "williamsburg-row", "bushwick-row"]
        },
        {
          "id": "header-row",
          "component": "Row",
          "children": ["h-name", "h-safety", "h-transit", "h-price"]
        },
        { "id": "h-name", "component": "Text", "text": "Neighborhood", "weight": "bold" },
        { "id": "h-safety", "component": "Text", "text": "Safety" },
        { "id": "h-transit", "component": "Text", "text": "Transit" },
        { "id": "h-price", "component": "Text", "text": "Cost" },
        {
          "id": "williamsburg-row",
          "component": "Row",
          "children": ["w-name", "w-safety", "w-transit", "w-price"]
        },
        { "id": "w-name", "component": "Text", "text": { "path": "/compare/0/name" } },
        { "id": "w-safety", "component": "ProgressBar", "value": { "path": "/compare/0/safety_score" }, "max": 10 },
        { "id": "w-transit", "component": "ProgressBar", "value": { "path": "/compare/0/transit_score" }, "max": 10 },
        { "id": "w-price", "component": "ProgressBar", "value": { "path": "/compare/0/affordability_score" }, "max": 10 },
        {
          "id": "bushwick-row",
          "component": "Row",
          "children": ["b-name", "b-safety", "b-transit", "b-price"]
        },
        { "id": "b-name", "component": "Text", "text": { "path": "/compare/1/name" } },
        { "id": "b-safety", "component": "ProgressBar", "value": { "path": "/compare/1/safety_score" }, "max": 10 },
        { "id": "b-transit", "component": "ProgressBar", "value": { "path": "/compare/1/transit_score" }, "max": 10 },
        { "id": "b-price", "component": "ProgressBar", "value": { "path": "/compare/1/affordability_score" }, "max": 10 }
      ]
    }
  },
  {
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "comparison",
      "path": "/compare",
      "value": [
        { "name": "Williamsburg", "safety_score": 8, "transit_score": 9, "affordability_score": 6 },
        { "name": "Bushwick", "safety_score": 6, "transit_score": 7, "affordability_score": 9 }
      ]
    }
  }
]

### Example 3: Neighborhood Trend Chart
After get_neighborhood_trends returns historical data for a neighborhood:

---a2ui_JSON---
[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "trends",
      "catalogId": "${SCOUT_CATALOG.catalogId}"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "trends",
      "components": [
        {
          "id": "root",
          "component": "Card",
          "children": ["chart"]
        },
        {
          "id": "chart",
          "component": "TimeSeriesChart",
          "title": "Williamsburg — 12 Month Trends",
          "xAxisKey": "month",
          "series": [
            { "dataKey": "rent", "label": "Avg Rent ($)", "color": "#6366f1", "axis": "left" },
            { "dataKey": "safety", "label": "Safety Score", "color": "#22c55e", "axis": "right" },
            { "dataKey": "walkability", "label": "Walk Score", "color": "#f59e0b", "axis": "right" }
          ],
          "data": { "path": "/trends/data" }
        }
      ]
    }
  },
  {
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "trends",
      "path": "/trends",
      "value": {
        "data": [
          { "month": "Apr 2025", "rent": 2800, "safety": 7.2, "walkability": 8.5 },
          { "month": "May 2025", "rent": 2850, "safety": 7.3, "walkability": 8.5 },
          { "month": "Jun 2025", "rent": 2900, "safety": 7.1, "walkability": 8.6 }
        ]
      }
    }
  }
]

Note: TimeSeriesChart is a CUSTOM component in our catalog. It accepts a
title, xAxisKey, series definitions (dataKey/label/color), and data bound
via a JSON Pointer path. The data array contains objects with the xAxisKey
and each series' dataKey.

### Important Rules:
1. One component MUST have id "root".
2. Use JSON Pointer paths (e.g., {"path": "/budget/score"}) for data binding.
3. Keep component lists flat and reference children by ID.
4. Always wrap the second part in ---a2ui_JSON--- and ensure it is valid JSON.

A2UI JSON Schema for Validation:
${A2UI_SCHEMA}
`;
}
