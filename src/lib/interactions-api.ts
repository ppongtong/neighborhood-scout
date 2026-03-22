import { GoogleGenAI } from "@google/genai";

export interface ToolDefinition {
  functionDeclarations?: any[];
  googleSearchGrounding?: boolean;
  googleMapsGrounding?: boolean;
}

export class InteractionsAPI {
  private client: GoogleGenAI;
  private lastId?: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API Key is required for InteractionsAPI");
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Official start of an interaction using client.interactions.create.
   */
  async startInteraction(config: {
    model: string;
    tools: ToolDefinition;
    systemInstruction?: string;
    input: string;
  }) {
    try {
      const result = await (this.client as any).interactions.create({
        model: config.model,
        system_instruction: config.systemInstruction,
        tools: this.formatTools(config.tools),
        input: config.input,
      });

      this.lastId = result.id;
      return result;
    } catch (error: any) {
      throw new Error(`Failed to start interaction: ${error.message}`);
    }
  }

  /**
   * Sends a follow-up message using previous_interaction_id for state.
   */
  async sendMessage(config: {
    model: string;
    tools: ToolDefinition;
    systemInstruction?: string;
    input: string;
  }) {
    if (!this.lastId) {
      throw new Error("No active session. Call startInteraction first.");
    }

    try {
      const result = await (this.client as any).interactions.create({
        model: config.model,
        system_instruction: config.systemInstruction,
        tools: this.formatTools(config.tools),
        input: config.input,
        previous_interaction_id: this.lastId,
      });

      this.lastId = result.id;
      return result;
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Submits tool results via the official interactions.create flow.
   */
  async sendToolResults(config: {
    model: string;
    tools: ToolDefinition;
    systemInstruction?: string;
    results: any[];
  }) {
    if (!this.lastId) {
      throw new Error("No active session to submit results to.");
    }

    try {
      // In the Interactions API, tool results are sent as an array of blocks in the input field
      const result = await (this.client as any).interactions.create({
        model: config.model,
        system_instruction: config.systemInstruction,
        tools: this.formatTools(config.tools),
        previous_interaction_id: this.lastId,
        input: config.results.map((res) => ({
          type: "function_result",
          call_id: res.id,
          name: res.name,
          result: res.result,
        })),
      });

      this.lastId = result.id;
      return result;
    } catch (error: any) {
      throw new Error(`Failed to submit tool results: ${error.message}`);
    }
  }

  private formatTools(tools: ToolDefinition, onlyFunctions: boolean = false) {
    const formatted: any[] = [];
    if (tools.googleSearchGrounding) {
      formatted.push({ type: "google_search" });
    }
    // // Note: 'google_maps' and 'google_search' currently cannot be combined in this preview endpoint.
    // if (tools.googleMapsGrounding && !onlyFunctions) {
    //   formatted.push({ type: "google_maps" });
    // }
    if (tools.functionDeclarations) {
      tools.functionDeclarations.forEach((fn) => {
        formatted.push({
          type: "function",
          ...fn,
        });
      });
    }
    return formatted;
  }
}
