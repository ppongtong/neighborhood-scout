// web/src/a2ui/DataModelStore.ts
type Listener = () => void;

export class DataModelStore {
  private data: Record<string, any> = {};
  private listeners: Set<Listener> = new Set();

  // Resolve a JSON Pointer path like "/budget/score"
  resolve(path: string): any {
    if (!path || path === "/") return this.data;
    const segments = path.split("/").filter(Boolean);
    let current: any = this.data;
    for (const seg of segments) {
      if (current == null) return undefined;
      current = current[seg];
    }
    return current;
  }

  // Apply an updateDataModel message (upsert semantics)
  update(path: string | undefined, value: any): void {
    if (!path || path === "/") {
      this.data = value ?? {};
      this.notify();
      return;
    }
    const segments = path.split("/").filter(Boolean);
    let current: any = this.data;
    for (let i = 0; i < segments.length - 1; i++) {
      if (!(segments[i] in current)) current[segments[i]] = {};
      current = current[segments[i]];
    }
    const last = segments[segments.length - 1];
    if (value === undefined) {
      delete current[last];
    } else {
      current[last] = value;
    }
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}
