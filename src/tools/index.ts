export const functionDeclarations = [
  {
    name: "calculate_budget_fit",
    description:
      "Calculates how well a neighborhood fits within a user budget based on local cost of living data.",
    parameters: {
      type: "object",
      properties: {
        neighborhood: {
          type: "string",
          description: "The name of the neighborhood",
        },
        user_budget: {
          type: "number",
          description: "The users monthly budget for housing and living",
        },
        average_rent: {
          type: "number",
          description:
            "The average rent in the neighborhood (fetch from search or maps)",
        },
      },
      required: ["neighborhood", "user_budget", "average_rent"],
    },
  },
  {
    name: "save_favorite",
    description: "Saves a neighborhood to the users list of favorites.",
    parameters: {
      type: "object",
      properties: {
        neighborhood: {
          type: "string",
          description: "The name of the neighborhood",
        },
        reason: { type: "string", description: "Why the user liked it" },
      },
      required: ["neighborhood", "reason"],
    },
  },
  {
    name: "get_neighborhood_trends",
    description:
      "Returns 12 months of historical trend data for a neighborhood including rent, safety score, and walkability score. Use this when the user asks about trends, changes over time, or historical data for a neighborhood.",
    parameters: {
      type: "object",
      properties: {
        neighborhood: {
          type: "string",
          description: "The name of the neighborhood",
        },
        metrics: {
          type: "array",
          items: { type: "string", enum: ["rent", "safety", "walkability"] },
          description: "Which metrics to include (defaults to all)",
        },
        trend_data: {
          type: "array",
          description:
            "12 months of historical data points fetched from search. Each object contains a month label and available metric values.",
          items: {
            type: "object",
            properties: {
              month: { type: "string", description: "Month label, e.g. 'Mar 2025'" },
              average_rent: { type: "number", description: "Average monthly rent in USD" },
              safety: { type: "number", description: "Safety score 0–10" },
              walkability: { type: "number", description: "Walkability score 0–10" },
            },
            required: ["month"],
          },
        },
      },
      required: ["neighborhood"],
    },
  },
  {
    name: "generate_comparison_matrix",
    description:
      "Generates a comparison matrix between multiple neighborhoods across different metrics like safety, transit, and cost.",
    parameters: {
      type: "object",
      properties: {
        neighborhoods: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              safety_score: { type: "number" },
              transit_score: { type: "number" },
              affordability_score: { type: "number" },
            },
          },
        },
      },
      required: ["neighborhoods"],
    },
  },
];

export async function handleToolCall(name: string, args: any) {
  console.log(`[Tool Call] Executing: ${name}`, args);
  switch (name) {
    case "calculate_budget_fit": {
      const { user_budget, average_rent } = args;

      const rawScore = (user_budget / average_rent) * 100;
      const score = Math.max(0, Math.min(10, rawScore / 20));

      const verdict =
        score > 7.5
          ? "Highly Affordable"
          : score > 6
            ? "Affordable"
            : score >= 5
              ? "Moderate"
              : score >= 4
                ? "Expensive"
                : "Unaffordable";

      return {
        neighborhood: args.neighborhood,
        score: score.toFixed(1),
        verdict,
      };
    }
    case "save_favorite":
      return {
        status: "success",
        message: `${args.neighborhood} saved to favorites!`,
      };
    case "get_neighborhood_trends": {
      const { neighborhood, trend_data, metrics = ["rent", "safety", "walkability"] } = args;

      if (!trend_data?.length) {
        return { neighborhood, metrics, data: [] };
      }

      const data = trend_data.map((point: any) => {
        const out: Record<string, any> = { month: point.month };
        if (metrics.includes("rent") && point.average_rent != null) out.rent = point.average_rent;
        if (metrics.includes("safety") && point.safety != null) out.safety = point.safety;
        if (metrics.includes("walkability") && point.walkability != null) out.walkability = point.walkability;
        return out;
      });

      return { neighborhood, metrics, data };
    }
    case "generate_comparison_matrix":
      return { matrix: args.neighborhoods }; // The model will use this to generate the final response
    default:
      throw new Error(`Tool ${name} not found`);
  }
}

export function getAffordability(
  userBudget: number,
  averageRent: number,
): string {
  const ratio = (averageRent / userBudget) * 100;

  if (ratio <= 60) return "Highly Affordable";
  if (ratio <= 80) return "Affordable";
  if (ratio <= 100) return "Moderate";
  if (ratio <= 125) return "Expensive";
  return "Unaffordable";
}
