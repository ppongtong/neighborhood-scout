// web/src/a2ui/DataModelStore.test.ts
import { describe, it, expect, vi } from "vitest";
import { DataModelStore } from "./DataModelStore";

describe("DataModelStore", () => {
  describe("resolve", () => {
    it("returns undefined for a path that does not exist", () => {
      const store = new DataModelStore();
      expect(store.resolve("/budget/score")).toBeUndefined();
    });

    it("resolves a top-level key", () => {
      const store = new DataModelStore();
      store.update("/name", "Williamsburg");
      expect(store.resolve("/name")).toBe("Williamsburg");
    });

    it("resolves a nested path", () => {
      const store = new DataModelStore();
      store.update("/budget", { score: 7.5, verdict: "Affordable" });
      expect(store.resolve("/budget/score")).toBe(7.5);
      expect(store.resolve("/budget/verdict")).toBe("Affordable");
    });

    it("resolves the root when path is '/'", () => {
      const store = new DataModelStore();
      store.update("/", { a: 1 });
      expect(store.resolve("/")).toEqual({ a: 1 });
    });

    it("returns undefined when an intermediate segment is missing", () => {
      const store = new DataModelStore();
      store.update("/budget", { score: 8 });
      expect(store.resolve("/budget/details/note")).toBeUndefined();
    });
  });

  describe("update", () => {
    it("creates intermediate objects for deep paths", () => {
      const store = new DataModelStore();
      store.update("/trends/data/0/rent", 2800);
      expect(store.resolve("/trends/data/0/rent")).toBe(2800);
    });

    it("overwrites an existing value", () => {
      const store = new DataModelStore();
      store.update("/score", 5);
      store.update("/score", 9);
      expect(store.resolve("/score")).toBe(9);
    });

    it("replaces the entire data model when path is '/'", () => {
      const store = new DataModelStore();
      store.update("/old", "value");
      store.update("/", { fresh: true });
      expect(store.resolve("/fresh")).toBe(true);
      expect(store.resolve("/old")).toBeUndefined();
    });

    it("replaces the entire data model when path is undefined", () => {
      const store = new DataModelStore();
      store.update("/x", 1);
      store.update(undefined, { y: 2 });
      expect(store.resolve("/y")).toBe(2);
      expect(store.resolve("/x")).toBeUndefined();
    });

    it("deletes a key when value is undefined", () => {
      const store = new DataModelStore();
      store.update("/budget", { score: 7 });
      store.update("/budget", undefined);
      expect(store.resolve("/budget")).toBeUndefined();
    });
  });

  describe("subscribe / notify", () => {
    it("calls the listener after update", () => {
      const store = new DataModelStore();
      const listener = vi.fn();
      store.subscribe(listener);
      store.update("/score", 8);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("calls the listener for each update", () => {
      const store = new DataModelStore();
      const listener = vi.fn();
      store.subscribe(listener);
      store.update("/a", 1);
      store.update("/b", 2);
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("unsubscribes correctly and stops receiving notifications", () => {
      const store = new DataModelStore();
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);
      store.update("/x", 1);
      unsubscribe();
      store.update("/x", 2);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("supports multiple independent subscribers", () => {
      const store = new DataModelStore();
      const a = vi.fn();
      const b = vi.fn();
      store.subscribe(a);
      store.subscribe(b);
      store.update("/val", 42);
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it("reflects updated value when listener reads it", () => {
      const store = new DataModelStore();
      let seen: any;
      store.subscribe(() => { seen = store.resolve("/score"); });
      store.update("/score", 9.5);
      expect(seen).toBe(9.5);
    });
  });
});
