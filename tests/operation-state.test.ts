import { describe, expect, test } from "bun:test";
import {
  createOperationReviewState,
  getFileOperationGroups,
  getOperationStats,
  operationReviewReducer,
} from "../src/lib/operations/operation-state";

const operations = [
  {
    id: "rename-one",
    newPath: "/music/album/renamed.mp3",
    oldPath: "/music/album/track.mp3",
    type: "rename" as const,
  },
  {
    id: "tags-one",
    path: "/music/single.mp3",
    tags: { title: "Single" },
    type: "tag-update" as const,
  },
];

describe("operation review state", () => {
  test("creates accepted operations with stable positional IDs", () => {
    const state = createOperationReviewState(operations);

    expect(state.operations.map(({ id, status }) => [id, status])).toEqual([
      ["rename-0", "accepted"],
      ["tag-update-1", "accepted"],
    ]);
    expect(state.selectedId).toBeNull();
  });

  test("supports selection, toggle, modification, and derived statistics", () => {
    let state = createOperationReviewState(operations);
    state = operationReviewReducer(state, { type: "select", id: "rename-0" });
    state = operationReviewReducer(state, { type: "toggle", id: "rename-0" });
    state = operationReviewReducer(state, {
      type: "modify",
      id: "tag-update-1",
      value: { tags: { title: "Changed" } },
    });

    expect(state.selectedId).toBe("rename-0");
    expect(state.operations.map(({ status }) => status)).toEqual([
      "rejected",
      "modified",
    ]);
    expect(getOperationStats(state.operations)).toEqual({
      accepted: 0,
      modified: 1,
      rejected: 1,
      total: 2,
    });
  });

  test("applies folder actions and clears selection when reset", () => {
    let state = createOperationReviewState(operations);
    state = operationReviewReducer(state, {
      type: "reject-folder",
      folder: "/music/album",
    });
    state = operationReviewReducer(state, {
      type: "select",
      id: "rename-0",
    });
    state = operationReviewReducer(state, { type: "reset", operations });

    expect(state.operations.map(({ status }) => status)).toEqual([
      "accepted",
      "accepted",
    ]);
    expect(state.selectedId).toBeNull();
  });

  test("moves operations in the global sequence without changing their state", () => {
    const state = createOperationReviewState(operations);
    const moved = operationReviewReducer(state, {
      type: "move",
      id: "tag-update-1",
      direction: -1,
    });

    expect(moved.operations.map(({ id }) => id)).toEqual([
      "tag-update-1",
      "rename-0",
    ]);
    expect(moved.operations.map(({ status }) => status)).toEqual([
      "accepted",
      "accepted",
    ]);
  });

  test("toggles and moves all operations for a file as one group", () => {
    const grouped = [
      ...operations,
      {
        id: "tags-two",
        path: "/music/album/renamed.mp3",
        tags: { title: "Renamed title" },
        type: "tag-update" as const,
        metadata: { filePath: "/music/album/track.mp3" },
      },
    ];
    let state = createOperationReviewState(grouped);
    state = operationReviewReducer(state, {
      type: "toggle-group",
      filePath: "/music/album/track.mp3",
    });
    expect(
      Object.fromEntries(
        state.operations.map(({ id, status }) => [id, status]),
      ),
    ).toEqual({
      "rename-0": "rejected",
      "tag-update-1": "accepted",
      "tag-update-2": "rejected",
    });

    state = operationReviewReducer(state, {
      type: "move-group",
      filePath: "/music/single.mp3",
      direction: -1,
    });
    expect(state.operations.map(({ id }) => id)).toEqual([
      "tag-update-1",
      "rename-0",
      "tag-update-2",
    ]);
  });

  test("numbers file groups contiguously regardless of their operation count", () => {
    const state = createOperationReviewState([
      {
        id: "first-rename",
        newPath: "/music/first-new.mp3",
        oldPath: "/music/first.mp3",
        type: "rename",
        metadata: { filePath: "/music/first.mp3" },
      },
      {
        id: "first-tags",
        path: "/music/first.mp3",
        tags: { title: "First" },
        type: "tag-update",
        metadata: { filePath: "/music/first.mp3" },
      },
      {
        id: "second-tags",
        path: "/music/second.mp3",
        tags: { title: "Second" },
        type: "tag-update",
        metadata: { filePath: "/music/second.mp3" },
      },
    ]);

    expect(
      getFileOperationGroups(state.operations).map(({ order }) => order),
    ).toEqual([0, 1]);
  });
});
