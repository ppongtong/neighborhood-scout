import "dotenv/config";
import inquirer from "inquirer";
import chalk from "chalk";
import { InteractionsAPI } from "./lib/interactions-api.js";
import { functionDeclarations, handleToolCall } from "./tools/index.js";

const API_KEY = process.env.GOOGLE_API_KEY || "";
const MODEL = "gemini-3-flash-preview";

async function main() {
  if (!API_KEY) {
    console.error(chalk.red("Error: GOOGLE_API_KEY is not set in .env"));
    process.exit(1);
  }

  console.log(chalk.bold.cyan("\n🏘️  Welcome to Neighborhood Scout 🏘️"));
  console.log(
    chalk.dim(
      "Evaluating neighborhoods with Maps, Search, and local intelligence.\n",
    ),
  );

  const api = new InteractionsAPI(API_KEY);
  let initialized = false;

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
    2. If the user mentions a budget, use 'calculate_budget_fit'.`,
  };

  try {
    let active = true;
    while (active) {
      const { message } = await inquirer.prompt([
        {
          type: "input",
          name: "message",
          message: chalk.green("→"),
          prefix: "",
        },
      ]);

      const input = message.trim();
      if (!input) continue;
      if (["exit", "quit", "bye", "stop"].includes(input.toLowerCase())) {
        console.log(chalk.cyan("\nGoodbye! Good luck with your scouting. 🏘️"));
        active = false;
        continue;
      }

      process.stdout.write(chalk.yellow("🔍 Scouting... "));

      try {
        let currentResult;

        if (!initialized) {
          currentResult = await api.startInteraction({
            ...toolConfig,
            input: input,
          });
          initialized = true;
        } else {
          currentResult = await api.sendMessage({
            ...toolConfig,
            input: input,
          });
        }

        // Official stateful tool handling loop
        while (currentResult.status === "requires_action") {
          const outputs = currentResult.outputs || [];
          const calls = outputs.filter((o: any) => o.type === "function_call");

          if (calls.length === 0) break; // Should not happen if status is requires_action

          const toolResults = [];
          for (const call of calls) {
            process.stdout.write(
              chalk.dim(`\n   [Executing ${call.name}...] `),
            );
            const result = await handleToolCall(call.name, call.arguments);
            toolResults.push({
              name: call.name,
              id: call.id,
              result: result,
            });
          }

          process.stdout.write(chalk.yellow("\n🔍 Refining results... "));
          currentResult = await api.sendToolResults({
            ...toolConfig,
            results: toolResults,
          });
        }

        console.log("\r" + " ".repeat(30) + "\r"); // clear "Scouting..."

        // Extract and display all text blocks from outputs
        const textBlocks =
          currentResult.outputs?.filter((o: any) => o.type === "text") || [];
        if (textBlocks.length > 0) {
          textBlocks.forEach((block: any) => {
            console.log(chalk.white(block.text));
          });
          console.log(""); // final newline
        } else {
          console.log(
            chalk.red("Agent was unable to generate a text response.\n"),
          );
        }
      } catch (err: any) {
        console.log("\r" + " ".repeat(30) + "\r");
        console.error(chalk.red(`Error during interaction: ${err.message}\n`));
      }
    }
  } catch (error: any) {
    console.error(chalk.red(`Initialization Error: ${error.message}`));
  }
}

main().catch((err) => {
  console.error(chalk.red("Fatal Error:"), err);
  process.exit(1);
});
