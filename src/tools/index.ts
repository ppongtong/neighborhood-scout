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
