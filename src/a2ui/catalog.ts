// src/a2ui/catalog.ts
export const SCOUT_CATALOG = {
  catalogId: "neighborhood-scout-v1",
  // Standard A2UI components (from basic catalog)
  components: [
    "Text", // Labels, headings, descriptions
    "Card", // Container for grouped content
    "Column", // Vertical layout
    "Row", // Horizontal layout
    "Button", // Actions (save favorite, compare, etc.)
    "TextField", // User input (budget, neighborhood name)
    "Slider", // Budget range input
    "Image", // Neighborhood photos
    "ProgressBar", // Score visualization (affordability, safety, transit)
    "Chip", // Tags (walkable, family-friendly, nightlife)
    "Divider", // Visual separator
  ],
  // Custom domain-specific components (Scout catalog extensions)
  customComponents: {
    TimeSeriesChart: {
      description:
        "Renders a multi-line timeseries chart for neighborhood trend data.",
      properties: {
        title: { type: "string", description: "Chart title" },
        xAxisKey: {
          type: "string",
          description: "Key in each data point for the x-axis (e.g. 'month')",
        },
        series: {
          type: "array",
          description:
            "Array of { dataKey, label, color } defining each line in the chart",
          items: {
            type: "object",
            properties: {
              dataKey: {
                type: "string",
                description: "Key in data points for this series values",
              },
              label: { type: "string", description: "Legend label" },
              color: { type: "string", description: "Hex color for the line" },
              axis: {
                type: "string",
                enum: ["left", "right"],
                description: "Which y-axis to use. Use 'left' for dollar values, 'right' for 0-10 scores. Defaults to 'left'.",
              },
            },
          },
        },
        data: {
          description:
            "Data binding path to an array of data points. Bound via { path: '/trends/data' }",
        },
      },
    },
  },
};
