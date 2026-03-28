import React, { useMemo } from "react";
import { useSyncExternalStore } from "react";
import { DataModelStore } from "./DataModelStore";
import * as Components from "./components";

const COMPONENT_MAP: Record<string, React.FC<any>> = {
  Text: Components.ScoutText,
  Card: Components.ScoutCard,
  Button: Components.ScoutButton,
  ProgressBar: Components.ScoutProgressBar,
  Chip: Components.ScoutChip,
  Row: Components.ScoutRow,
  Column: Components.ScoutColumn,
  Divider: Components.ScoutDivider,
  TimeSeriesChart: Components.ScoutTimeSeriesChart,
};

interface A2UIRendererProps {
  messages: any[];
  onAction: (action: { name: string; context: any }) => void;
}

export const A2UIRenderer: React.FC<A2UIRendererProps> = ({
  messages,
  onAction,
}) => {
  const { store, components, rootId } = useMemo(() => {
    const store = new DataModelStore();
    const components: Record<string, any> = {};
    let rootId: string | null = null;

    for (const msg of messages) {
      // createSurface declares the surface and catalog — acknowledged but
      // not acted on since we use a single hardcoded catalog.
      if (msg.createSurface) {
        console.debug(`A2UI: surface "${msg.createSurface.surfaceId}" created (catalog: ${msg.createSurface.catalogId})`);
        continue;
      }

      if (msg.updateComponents) {
        for (const comp of msg.updateComponents.components) {
          components[comp.id] = comp;
        }
        if (!rootId && msg.updateComponents.components.length > 0) {
          rootId = "root" in components ? "root" : msg.updateComponents.components[0].id;
        }
      }
      if (msg.updateDataModel) {
        store.update(msg.updateDataModel.path, msg.updateDataModel.value);
      }
    }

    return { store, components, rootId };
  }, [messages]);

  // Re-render when data model changes
  const version = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.resolve("/") as any,
  );

  if (!rootId) return null;

  const renderComponent = (id: string): React.ReactNode => {
    const comp = components[id];
    if (!comp) return null;

    const ReactComponent = COMPONENT_MAP[comp.component];
    if (!ReactComponent) {
      console.warn(`A2UIRenderer: unknown component "${comp.component}" — skipping`);
      return null;
    }

    const resolvedProps = resolveBindings(comp, store);
    const childIds: string[] = comp.children ?? (comp.child ? [comp.child] : []);
    const children = childIds.map((childId) => renderComponent(childId));

    return (
      <ReactComponent
        key={`${id}-${JSON.stringify(version)}`}
        {...resolvedProps}
        onAction={onAction}
      >
        {children.length > 0 ? children : undefined}
      </ReactComponent>
    );
  };

  return <div className="a2ui-surface">{renderComponent(rootId)}</div>;
};

// Resolve { path: "/some/pointer" } bindings to live data model values
function resolveBindings(comp: any, store: DataModelStore): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(comp)) {
    if (key === "id" || key === "component" || key === "children" || key === "child") continue;
    if (value && typeof value === "object" && "path" in value) {
      resolved[key] = store.resolve((value as { path: string }).path);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}
