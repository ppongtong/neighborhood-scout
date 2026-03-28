import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import "dotenv/config";
import { InteractionsAPI } from "./lib/interactions-api.js";
import { functionDeclarations, handleToolCall } from "./tools/index.js";
import { buildA2UISystemPrompt } from "./a2ui/prompt.js";
import { parseAgentResponse } from "./a2ui/parser.js";

const app = express();
const port = process.env.PORT || 3001;
const API_KEY = process.env.GOOGLE_API_KEY || "";
const MODEL = "gemini-3-flash-preview";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api/", limiter);
}

const api = new InteractionsAPI(API_KEY);

const toolConfig = {
  model: MODEL,
  tools: {
    googleSearchGrounding: true,
    googleMapsGrounding: true,
    functionDeclarations: functionDeclarations,
  },
  systemInstruction: `You are Neighborhood Scout, a premium neighborhood evaluation agent.
  Your goal is to help users decide where to live or visit by orchestrating live data.
  Guidelines:
  1. Always prioritize real-time data from Google Maps and Google Search.
  2. If the user mentions a budget, use 'calculate_budget_fit'.
  3. If the user wants to save a neighborhood, use 'save_favorite'.
  4. If the user asks to compare multiple neighborhoods, use 'generate_comparison_matrix'.
  5. If the user asks about trends, historical changes, or how a neighborhood has evolved over time, first search for 12 months of historical data (rent prices, safety scores, walkability scores), then call 'get_neighborhood_trends' with the trend_data you found from search. Each data point should have a month label and available metric values (average_rent in USD, safety 0-10, walkability 0-10).

${buildA2UISystemPrompt()}`,
};

function withParsed(result: any) {
  const textBlocks = result.outputs?.filter((o: any) => o.type === "text") || [];
  const rawText = textBlocks.map((b: any) => b.text).join("\n\n");
  const { text, a2uiMessages } = parseAgentResponse(rawText);
  return { ...result, parsed: { text, a2uiMessages } };
}

// Start interaction
app.post("/api/start", async (req, res) => {
  const { input } = req.body;
  try {
    const result = await api.startInteraction({ ...toolConfig, input });
    res.json(withParsed(result));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Follow-up message
app.post("/api/message", async (req, res) => {
  const { input } = req.body;
  try {
    const result = await api.sendMessage({ ...toolConfig, input });
    res.json(withParsed(result));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit tool results
app.post("/api/tool-results", async (req, res) => {
  const { results } = req.body;
  try {
    const result = await api.sendToolResults({ ...toolConfig, results });
    res.json(withParsed(result));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// A2UI user action — button clicks from surfaces flow back to the agent
app.post("/api/user-action", async (req, res) => {
  const { action } = req.body;
  // action = { name: "save_favorite", context: { neighborhood: "Williamsburg" } }
  const input = `User clicked "${action.name}" with context: ${JSON.stringify(action.context)}`;
  try {
    const result = await api.sendMessage({ ...toolConfig, input });
    res.json(withParsed(result));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute individual tool locally
app.post("/api/execute-tool", async (req, res) => {
  const { name, args } = req.body;
  try {
    const result = await handleToolCall(name, args);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Neighborhood Scout backend running at http://localhost:${port}`);
});
