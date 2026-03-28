// src/a2ui/parser.test.ts
import { describe, it, expect } from "vitest";
import { parseAgentResponse } from "./parser.js";

const DELIMITER = "---a2ui_JSON---";

const SAMPLE_MESSAGES = [
  { version: "v0.9", createSurface: { surfaceId: "s1", catalogId: "c1" } },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "s1",
      components: [{ id: "root", component: "Text", text: "Hello" }],
    },
  },
];

describe("parseAgentResponse", () => {
  it("returns text only when there is no delimiter", () => {
    const raw = "Here is some plain text from the agent.";
    const result = parseAgentResponse(raw);
    expect(result.text).toBe(raw);
    expect(result.a2uiMessages).toBeNull();
  });

  it("parses a valid JSON array after the delimiter", () => {
    const raw = `Here is the analysis.\n${DELIMITER}\n${JSON.stringify(SAMPLE_MESSAGES)}`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe("Here is the analysis.");
    expect(result.a2uiMessages).toEqual(SAMPLE_MESSAGES);
  });

  it("falls back to text-only on malformed JSON", () => {
    const raw = `Some text.\n${DELIMITER}\n[this is not { valid JSON`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe(raw.trim());
    expect(result.a2uiMessages).toBeNull();
  });

  it("strips markdown ```json code fences before parsing", () => {
    const fenced = "```json\n" + JSON.stringify(SAMPLE_MESSAGES) + "\n```";
    const raw = `Analysis here.\n${DELIMITER}\n${fenced}`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe("Analysis here.");
    expect(result.a2uiMessages).toEqual(SAMPLE_MESSAGES);
  });

  it("strips plain ``` code fences before parsing", () => {
    const fenced = "```\n" + JSON.stringify(SAMPLE_MESSAGES) + "\n```";
    const raw = `Analysis here.\n${DELIMITER}\n${fenced}`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe("Analysis here.");
    expect(result.a2uiMessages).toEqual(SAMPLE_MESSAGES);
  });

  it("falls back to text-only when JSON is not an array", () => {
    const raw = `Some text.\n${DELIMITER}\n{"version":"v0.9"}`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe(raw.trim());
    expect(result.a2uiMessages).toBeNull();
  });

  it("trims whitespace from the text portion", () => {
    const raw = `  Leading whitespace.  \n${DELIMITER}\n${JSON.stringify(SAMPLE_MESSAGES)}`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe("Leading whitespace.");
  });

  it("handles empty text before the delimiter", () => {
    const raw = `${DELIMITER}\n${JSON.stringify(SAMPLE_MESSAGES)}`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe("");
    expect(result.a2uiMessages).toEqual(SAMPLE_MESSAGES);
  });

  it("parses a complex TimeSeriesChart payload from the prompt example", () => {
    const chartMessages = [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "trends",
          catalogId: "neighborhood-scout-v1",
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "trends",
          components: [
            {
              id: "root",
              component: "Card",
              children: ["chart"],
            },
            {
              id: "chart",
              component: "TimeSeriesChart",
              title: "Williamsburg — 12 Month Trends",
              xAxisKey: "month",
              series: [
                { dataKey: "rent", label: "Avg Rent ($)", color: "#6366f1" },
                { dataKey: "safety", label: "Safety Score", color: "#22c55e" },
                {
                  dataKey: "walkability",
                  label: "Walk Score",
                  color: "#f59e0b",
                },
              ],
              data: { path: "/trends/data" },
            },
          ],
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "trends",
          path: "/trends",
          value: {
            data: [
              {
                month: "Apr 2025",
                rent: 2800,
                safety: 7.2,
                walkability: 8.5,
              },
              {
                month: "May 2025",
                rent: 2850,
                safety: 7.3,
                walkability: 8.5,
              },
              {
                month: "Jun 2025",
                rent: 2900,
                safety: 7.1,
                walkability: 8.6,
              },
            ],
          },
        },
      },
    ];

    const raw = `Here are the trends.\n${DELIMITER}\n${JSON.stringify(chartMessages)}`;
    const result = parseAgentResponse(raw);
    expect(result.text).toBe("Here are the trends.");
    expect(result.a2uiMessages).toEqual(chartMessages);
  });
});
