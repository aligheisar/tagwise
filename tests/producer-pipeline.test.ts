import { describe, expect, test } from "bun:test";
import { runProducerPipeline } from "../src/services/producer-pipeline.service";
import type { Library } from "../src/types/library";
import type { Producer } from "../src/types/producer";

describe("runProducerPipeline", () => {
  test("projects each proposal before passing the library to the next producer", async () => {
    const library = {
      cachedAt: new Date("2026-01-01T00:00:00Z"),
      items: [
        {
          path: "/music/track.mp3",
          status: "ok",
          tags: { title: ["Original"], track: 1, year: 2020 },
        },
      ],
      root: "/music",
    } as Library;
    let secondProducerPath: string | undefined;
    let secondProducerTitle: string | undefined;

    const renameProducer: Producer = {
      name: "renamer",
      produce: async () => [
        {
          id: "rename-track",
          newPath: "/music/renamed.mp3",
          oldPath: "/music/track.mp3",
          type: "rename",
        },
      ],
    };
    const tagProducer: Producer = {
      name: "tagger",
      produce: async (snapshot) => {
        const item = snapshot.items[0];
        if (item?.status === "ok") {
          secondProducerPath = item.path;
          secondProducerTitle = item.tags.title?.[0];
        }
        return [
          {
            id: "tag-track",
            path: "/music/renamed.mp3",
            tags: { album: "Projected", year: 2024 },
            type: "tag-update",
          },
        ];
      },
    };

    const result = await runProducerPipeline(library, [
      renameProducer,
      tagProducer,
    ]);
    const projectedItem = result.projectedLibrary.items[0];

    expect(secondProducerPath).toBe("/music/renamed.mp3");
    expect(secondProducerTitle).toBe("Original");
    expect(projectedItem?.status).toBe("ok");
    if (projectedItem?.status === "ok") {
      expect(projectedItem.tags.album).toEqual(["Projected"]);
      expect(projectedItem.tags.year).toBe(2024);
      expect(projectedItem.tags.track).toBe(1);
    }
    expect(library.items[0]?.path).toBe("/music/track.mp3");
    expect(result.operations.map(({ type }) => type)).toEqual([
      "rename",
      "tag-update",
    ]);
    expect(result.operations[1]?.metadata).toMatchObject({
      filePath: "/music/track.mp3",
      previousTags: { album: undefined, year: 2020 },
      producerName: "tagger",
    });
  });

  test("records each producer's previous tag values and omits no-op files", async () => {
    const library = {
      cachedAt: new Date(),
      items: [
        {
          path: "/music/song.mp3",
          status: "ok",
          tags: { title: ["Song"] },
        },
        {
          path: "/music/unchanged.mp3",
          status: "ok",
          tags: { title: ["Already tagged"] },
        },
      ],
      root: "/music",
    } as Library;
    const addRemix: Producer = {
      name: "add-remix",
      produce: async (snapshot) =>
        snapshot.items
          .filter(
            (item) => item.status === "ok" && item.path.endsWith("song.mp3"),
          )
          .map((item) => ({
            id: "add-remix-song",
            path: item.path,
            tags: { title: "Song (Remix)" },
            type: "tag-update" as const,
          })),
    };
    const removeRemix: Producer = {
      name: "remove-remix",
      produce: async (snapshot) =>
        snapshot.items
          .filter(
            (item) => item.status === "ok" && item.path.endsWith("song.mp3"),
          )
          .map((item) => ({
            id: "remove-remix-song",
            path: item.path,
            tags: { title: "Song" },
            type: "tag-update" as const,
          })),
    };
    const noOpProducer: Producer = {
      name: "no-op",
      produce: async () => [
        {
          id: "unchanged-title",
          path: "/music/unchanged.mp3",
          tags: { title: "Already tagged" },
          type: "tag-update",
        },
      ],
    };

    const result = await runProducerPipeline(library, [
      addRemix,
      removeRemix,
      noOpProducer,
    ]);

    expect(result.operations).toHaveLength(2);
    expect(result.operations.map((operation) => operation.metadata)).toEqual([
      {
        filePath: "/music/song.mp3",
        previousTags: { title: ["Song"] },
        producerName: "add-remix",
      },
      {
        filePath: "/music/song.mp3",
        previousTags: { title: ["Song (Remix)"] },
        producerName: "remove-remix",
      },
    ]);
  });

  test("fails when a producer proposes a change that cannot be projected", async () => {
    const library = {
      cachedAt: new Date(),
      items: [],
      root: "/music",
    } as Library;
    const producer: Producer = {
      name: "invalid",
      produce: async () => [
        {
          id: "missing",
          newPath: "/music/new.mp3",
          oldPath: "/music/missing.mp3",
          type: "rename",
        },
      ],
    };

    await expect(runProducerPipeline(library, [producer])).rejects.toThrow(
      "Rename source not found in preview",
    );
  });
});
