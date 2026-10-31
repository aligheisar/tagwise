import { describe, expect, test } from "bun:test";
import { RenamerProducer } from "../src/lib/producers/renamer";
import { RemixTagProducer } from "../src/lib/producers/remix-tag";
import {
  buildTree,
  computeVisibleNodes,
} from "../src/presentation/tui/components/tree-view";
import { getOperationChanges } from "../src/presentation/tui/lib/operation-changes";
import { isPathWithinRoot } from "../src/utils/path";

describe("isPathWithinRoot", () => {
  test("accepts descendants and rejects the root and paths outside it", () => {
    expect(isPathWithinRoot("/music", "/music/album/song.mp3")).toBe(true);
    expect(isPathWithinRoot("/music", "/music")).toBe(false);
    expect(isPathWithinRoot("/music", "/music-old/song.mp3")).toBe(false);
    expect(isPathWithinRoot("/music", "/etc/passwd")).toBe(false);
  });
});

describe("review tree and producer safety", () => {
  test("includes root-level file operations in the review tree", () => {
    const operations = [
      {
        id: "rename-1",
        operation: {
          id: "op-1",
          newPath: "/music/track renamed.mp3",
          oldPath: "/music/track.mp3",
          type: "rename" as const,
        },
        status: "accepted" as const,
      },
    ];

    const visible = computeVisibleNodes(
      operations,
      new Set(["/music"]),
      "/music",
    );

    expect(
      visible.some((node) => {
        if (node.type !== "leaf") return false;
        return node.node.group.operations.some(
          ({ operation }) =>
            operation.type === "rename" &&
            operation.oldPath === "/music/track.mp3",
        );
      }),
    ).toBe(true);
  });

  test("skips blank titles and preserves metadata text for tag updates", async () => {
    const blankLibrary = {
      cachedAt: new Date(),
      items: [
        {
          path: "/music/track.mp3",
          status: "ok" as const,
          tags: { title: ["   "] },
        },
      ],
      root: "/music",
    };

    const renamer = new RenamerProducer();
    const remix = new RemixTagProducer();

    await expect(renamer.produce(blankLibrary)).resolves.toEqual([]);

    const remixLibrary = {
      ...blankLibrary,
      items: [
        {
          path: "/music/another.mp3",
          status: "ok" as const,
          tags: { title: ["Hello / World!"] },
        },
      ],
    };

    await expect(remix.produce(remixLibrary)).resolves.toEqual([
      {
        id: "remix-tag-/music/another.mp3",
        path: "/music/another.mp3",
        tags: { title: "Hello / World! (Remix)" },
        type: "tag-update",
      },
    ]);
  });

  test("buildTree keeps root-level operations under a visible root node", () => {
    const op = {
      id: "rename-1",
      operation: {
        id: "op-1",
        newPath: "/music/track renamed.mp3",
        oldPath: "/music/track.mp3",
        type: "rename" as const,
      },
      status: "accepted" as const,
    };

    const tree = buildTree([op], "/music");

    expect(tree).toHaveLength(1);
    expect(tree[0]?.path).toBe("/music");
    expect(tree[0]?.leafChildren).toHaveLength(1);
  });

  test("counts direct and descendant operations and hides empty folders", () => {
    const makeOperation = (id: string, filePath: string) => ({
      id,
      operation: {
        id,
        path: filePath,
        tags: { title: id },
        type: "tag-update" as const,
      },
      status: "accepted" as const,
    });
    const tree = buildTree(
      [
        makeOperation("album-track", "/music/album/track.mp3"),
        makeOperation("album-track-tags", "/music/album/track.mp3"),
        makeOperation("disc-track", "/music/album/disc/track.mp3"),
        makeOperation("single", "/music/single.mp3"),
      ],
      "/music",
    );
    const root = tree[0];
    const album = root?.children.find(
      (folder) => folder.displayName === "album",
    );
    const disc = album?.children.find(
      (folder) => folder.displayName === "disc",
    );

    expect(root?.operationCount).toBe(4);
    expect(album?.operationCount).toBe(3);
    expect(disc?.operationCount).toBe(1);
    expect(root?.children.map((folder) => folder.displayName)).toEqual([
      "album",
    ]);
    expect(root?.leafChildren).toHaveLength(1);
    expect(buildTree([], "/music")).toEqual([]);
  });

  test("groups ordered changes by original file and omits unchanged groups", () => {
    const operations = [
      {
        id: "tag-update-0",
        operation: {
          id: "add-remix-song",
          path: "/music/song.mp3",
          tags: { title: "Song (Remix)" },
          type: "tag-update" as const,
          metadata: {
            filePath: "/music/song.mp3",
            previousTags: { title: ["Song"] },
            producerName: "add-remix",
          },
        },
        status: "accepted" as const,
      },
      {
        id: "tag-update-1",
        operation: {
          id: "remove-remix-song",
          path: "/music/song.mp3",
          tags: { title: "Song" },
          type: "tag-update" as const,
          metadata: {
            filePath: "/music/song.mp3",
            previousTags: { title: ["Song (Remix)"] },
            producerName: "remove-remix",
          },
        },
        status: "accepted" as const,
      },
    ];
    const tree = buildTree(operations, "/music");
    const group = tree[0]?.leafChildren[0]?.group;

    expect(tree[0]?.leafChildren).toHaveLength(1);
    expect(group?.operations).toHaveLength(2);
    expect(group && getOperationChanges(group)).toEqual([
      {
        after: "Song (Remix)",
        before: "Song",
        field: "title",
        id: "tag-update-0:title",
        producer: "add-remix",
      },
      {
        after: "Song",
        before: "Song (Remix)",
        field: "title",
        id: "tag-update-1:title",
        producer: "remove-remix",
      },
    ]);
  });
});
