// src/a2ui/parser.ts
const A2UI_DELIMITER = "---a2ui_JSON---";

export interface ParsedAgentResponse {
  text: string;
  a2uiMessages: any[] | null;
}

export function parseAgentResponse(raw: string): ParsedAgentResponse {
  const delimiterIndex = raw.indexOf(A2UI_DELIMITER);

  if (delimiterIndex === -1) {
    return { text: raw.trim(), a2uiMessages: null };
  }

  const text = raw.substring(0, delimiterIndex).trim();
  const jsonPart = raw.substring(delimiterIndex + A2UI_DELIMITER.length).trim();

  try {
    // Strip markdown code fences if present
    const cleaned = jsonPart
      .replace(/^```(?:json?)?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();
    const messages = JSON.parse(cleaned);

    if (!Array.isArray(messages)) {
      console.warn("A2UI: Expected array, got:", typeof messages);
      return { text: raw.trim(), a2uiMessages: null };
    }

    return { text, a2uiMessages: messages };
  } catch (err) {
    console.warn("A2UI: Failed to parse JSON, falling back to text-only:", err);
    return { text: raw.trim(), a2uiMessages: null };
  }
}
