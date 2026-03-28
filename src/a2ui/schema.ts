// src/a2ui/schema.ts
// Minimal A2UI v0.9 JSON schema covering only the message types used by Scout.
// Full spec: https://a2ui.org/specification/v0.9-a2ui/
export const A2UI_SCHEMA = JSON.stringify(
  {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://a2ui.org/specification/v0_9/server_to_client.json",
    description: "A2UI v0.9 server-to-client messages (Scout subset)",
    oneOf: [
      { $ref: "#/$defs/CreateSurfaceMessage" },
      { $ref: "#/$defs/UpdateComponentsMessage" },
      { $ref: "#/$defs/UpdateDataModelMessage" },
      { $ref: "#/$defs/DeleteSurfaceMessage" },
    ],
    $defs: {
      CreateSurfaceMessage: {
        type: "object",
        description:
          "Signals the client to create a new surface and begin rendering it.",
        properties: {
          version: { const: "v0.9" },
          createSurface: {
            type: "object",
            properties: {
              surfaceId: {
                type: "string",
                description: "Unique identifier for the UI surface.",
              },
              catalogId: {
                type: "string",
                description:
                  "Identifies the component catalog. Use 'neighborhood-scout-v1'.",
              },
              theme: {
                type: "object",
                description: "Optional theme parameters (e.g. primaryColor).",
                additionalProperties: true,
              },
              sendDataModel: {
                type: "boolean",
                description:
                  "If true, client echoes the full data model in every message. Defaults to false.",
              },
            },
            required: ["surfaceId", "catalogId"],
            additionalProperties: false,
          },
        },
        required: ["version", "createSurface"],
        additionalProperties: false,
      },

      UpdateComponentsMessage: {
        type: "object",
        description:
          "Replaces the component tree of a surface. One component MUST have id 'root'.",
        properties: {
          version: { const: "v0.9" },
          updateComponents: {
            type: "object",
            properties: {
              surfaceId: {
                type: "string",
                description: "Surface to update.",
              },
              components: {
                type: "array",
                minItems: 1,
                description:
                  "Full component list. One entry must have id 'root'.",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Unique component ID within this surface.",
                    },
                    component: {
                      type: "string",
                      description:
                        "Component type name from the Scout catalog (e.g. 'Text', 'Card', 'TimeSeriesChart').",
                    },
                  },
                  required: ["id", "component"],
                  additionalProperties: true,
                },
              },
            },
            required: ["surfaceId", "components"],
            additionalProperties: false,
          },
        },
        required: ["version", "updateComponents"],
        additionalProperties: false,
      },

      UpdateDataModelMessage: {
        type: "object",
        description:
          "Upserts data in a surface's data model. Omit value to delete the key at path.",
        properties: {
          version: { const: "v0.9" },
          updateDataModel: {
            type: "object",
            properties: {
              surfaceId: {
                type: "string",
                description: "Surface whose data model to update.",
              },
              path: {
                type: "string",
                description:
                  "JSON Pointer path (e.g. '/trends/data'). Omit or use '/' to replace entire model.",
              },
              value: {
                description:
                  "Value to set at path. Omit to remove the key at path.",
                additionalProperties: true,
              },
            },
            required: ["surfaceId"],
            additionalProperties: false,
          },
        },
        required: ["version", "updateDataModel"],
        additionalProperties: false,
      },

      DeleteSurfaceMessage: {
        type: "object",
        description:
          "Signals the client to destroy a surface and all its components and data.",
        properties: {
          version: { const: "v0.9" },
          deleteSurface: {
            type: "object",
            properties: {
              surfaceId: {
                type: "string",
                description: "Surface to delete.",
              },
            },
            required: ["surfaceId"],
            additionalProperties: false,
          },
        },
        required: ["version", "deleteSurface"],
        additionalProperties: false,
      },
    },
  },
  null,
  2
);
