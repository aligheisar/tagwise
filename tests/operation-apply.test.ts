import { describe, expect, test } from "bun:test";
import { applyOperations } from "../src/services/operation-apply.service";
import type { OperationState } from "../src/lib/operations/operation-state";

describe("applyOperations", () => {
  test("executes accepted operations in their declared order", async () => {
    const calls: string[] = [];
    const operations: OperationState[] = [
      {
        id: "tag-update-0",
        operation: {
          id: "first-tag",
          path: "/music/track.mp3",
          tags: { title: "Before rename" },
          type: "tag-update",
        },
        status: "accepted",
      },
      {
        id: "rename-1",
        operation: {
          id: "rename",
          newPath: "/music/renamed.mp3",
          oldPath: "/music/track.mp3",
          type: "rename",
        },
        status: "accepted",
      },
      {
        id: "tag-update-2",
        operation: {
          id: "second-tag",
          path: "/music/renamed.mp3",
          tags: { album: "After rename" },
          type: "tag-update",
        },
        status: "accepted",
      },
    ];

    const result = await applyOperations(operations, "/music", {
      rename: async (oldPath, newPath) => {
        calls.push(`rename:${oldPath}->${newPath}`);
      },
      updateTags: async (updates) => {
        calls.push(`tags:${updates[0]?.path}`);
        return { errors: [], failed: 0, success: updates.length };
      },
    });

    expect(calls).toEqual([
      "tags:/music/track.mp3",
      "rename:/music/track.mp3->/music/renamed.mp3",
      "tags:/music/renamed.mp3",
    ]);
    expect(result).toEqual({ errors: [], failed: 0, success: 3 });
  });

  test("rejects out-of-root and duplicate targets before calling adapters", async () => {
    const calls: string[] = [];
    const operations: OperationState[] = [
      {
        id: "rename-0",
        operation: {
          id: "first",
          newPath: "/music/renamed.mp3",
          oldPath: "/music/first.mp3",
          type: "rename",
        },
        status: "accepted",
      },
      {
        id: "rename-1",
        operation: {
          id: "duplicate",
          newPath: "/music/renamed.mp3",
          oldPath: "/music/second.mp3",
          type: "rename",
        },
        status: "accepted",
      },
      {
        id: "rename-2",
        operation: {
          id: "outside",
          newPath: "/etc/renamed.mp3",
          oldPath: "/music/outside.mp3",
          type: "rename",
        },
        status: "accepted",
      },
      {
        id: "tag-update-3",
        operation: {
          id: "tag",
          path: "/music/track.mp3",
          tags: { title: "Updated" },
          type: "tag-update",
        },
        status: "accepted",
      },
    ];

    const result = await applyOperations(operations, "/music", {
      rename: async (oldPath, newPath) => {
        calls.push(`rename:${oldPath}->${newPath}`);
      },
      updateTags: async (updates) => {
        calls.push(`tags:${updates.length}`);
        return { errors: [], failed: 0, success: updates.length };
      },
    });

    expect(calls).toEqual([
      "rename:/music/first.mp3->/music/renamed.mp3",
      "tags:1",
    ]);
    expect(result).toEqual({
      errors: [
        "Duplicate rename target: /music/renamed.mp3",
        "Refusing rename outside library root: /etc/renamed.mp3",
      ],
      failed: 2,
      success: 2,
    });
  });

  test("ignores rejected operations and reports unsupported accepted ones", async () => {
    const calls: string[] = [];
    const operations: OperationState[] = [
      {
        id: "rename-0",
        operation: {
          id: "rejected",
          newPath: "/music/renamed.mp3",
          oldPath: "/music/track.mp3",
          type: "rename",
        },
        status: "rejected",
      },
      {
        id: "custom-1",
        operation: { id: "custom", payload: {}, type: "custom" },
        status: "accepted",
      },
    ];

    const result = await applyOperations(operations, "/music", {
      rename: async () => {
        calls.push("rename");
      },
      updateTags: async () => {
        calls.push("tags");
        return { errors: [], failed: 0, success: 0 };
      },
    });

    expect(calls).toEqual([]);
    expect(result).toEqual({
      errors: ["Unsupported operation type: custom"],
      failed: 1,
      success: 0,
    });
  });
});
