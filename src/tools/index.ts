export const functionDeclarations = [
  {
    name: 'calculate_budget_fit',
    description: 'Calculates how well a neighborhood fits within a user budget based on local cost of living data.',
    parameters: {
      type: 'object',
      properties: {
        neighborhood: { type: 'string', description: 'The name of the neighborhood' },
        user_budget: { type: 'number', description: 'The users monthly budget for housing and living' },
        average_rent: { type: 'number', description: 'The average rent in the neighborhood (fetch from search or maps)' },
      },
      required: ['neighborhood', 'user_budget', 'average_rent'],
    },
  },
  {
    name: 'save_favorite',
    description: 'Saves a neighborhood to the users list of favorites.',
    parameters: {
      type: 'object',
      properties: {
        neighborhood: { type: 'string', description: 'The name of the neighborhood' },
        reason: { type: 'string', description: 'Why the user liked it' },
      },
      required: ['neighborhood', 'reason'],
    },
  },
  {
    name: 'generate_comparison_matrix',
    description: 'Generates a comparison matrix between multiple neighborhoods across different metrics like safety, transit, and cost.',
    parameters: {
      type: 'object',
      properties: {
        neighborhoods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              safety_score: { type: 'number' },
              transit_score: { type: 'number' },
              affordability_score: { type: 'number' },
            },
          },
        },
      },
      required: ['neighborhoods'],
    },
  },
];

export async function handleToolCall(name: string, args: any) {
  console.log(`[Tool Call] Executing: ${name}`, args);
  switch (name) {
    case 'calculate_budget_fit': {
      const { user_budget, average_rent } = args;
      const score = Math.max(0, Math.min(100, (user_budget / (average_rent * 1.5)) * 100));
      return { 
        neighborhood: args.neighborhood,
        score: score.toFixed(1), 
        verdict: score > 70 ? 'Highly Affordable' : score > 40 ? 'Moderate' : 'Expensive' 
      };
    }
    case 'save_favorite':
      return { status: 'success', message: `${args.neighborhood} saved to favorites!` };
    case 'generate_comparison_matrix':
      return { matrix: args.neighborhoods }; // The model will use this to generate the final response
    default:
      throw new Error(`Tool ${name} not found`);
  }
}
