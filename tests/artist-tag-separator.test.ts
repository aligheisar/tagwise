import { describe, expect, test } from "bun:test";
import { ArtistTagSeparatorProducer } from "../src/lib/producers/artist-tag-separator";
import type { Library } from "../src/types/library";

function createLibrary(items: Library["items"]): Library {
  return { cachedAt: new Date(), items, root: "/music" };
}

describe("ArtistTagSeparatorProducer", () => {
  test("splits comma-separated values while preserving order", async () => {
    const producer = new ArtistTagSeparatorProducer("split");
    const operations = await producer.produce(
      createLibrary([
        {
          path: "/music/track.flac",
          status: "ok",
          tags: {
            artist: ["Artist One, Artist Two"],
            albumArtist: ["Album Artist"],
          },
        },
      ] as Library["items"]),
    );

    expect(operations).toEqual([
      {
        id: "split-artist-tags-/music/track.flac",
        path: "/music/track.flac",
        producedBy: "split-artist-tags",
        tags: { artist: ["Artist One", "Artist Two"] },
        type: "tag-update",
      },
    ]);
  });

  test("splits, deduplicates, and sorts MP3 comma- and semicolon-separated values", async () => {
    const producer = new ArtistTagSeparatorProducer("split");
    const operations = await producer.produce(
      createLibrary([
        {
          path: "/music/track.MP3",
          status: "ok",
          tags: {
            artist: ["Artist Two; Artist One, Artist Two"],
            albumArtist: ["Album Artist One; Album Artist Two"],
          },
        },
      ] as Library["items"]),
    );

    expect(operations[0]).toMatchObject({
      tags: {
        artist: ["Artist One", "Artist Two"],
        albumArtist: ["Album Artist One", "Album Artist Two"],
      },
    });
  });

  test("combines multi-value artist tags into a comma-separated value", async () => {
    const producer = new ArtistTagSeparatorProducer("combine");
    const operations = await producer.produce(
      createLibrary([
        {
          path: "/music/track.m4a",
          status: "ok",
          tags: {
            artist: ["Artist One", "Artist Two"],
            albumArtist: ["Album Artist"],
          },
        },
      ] as Library["items"]),
    );

    expect(operations[0]).toMatchObject({
      tags: { artist: "Artist One, Artist Two" },
    });
  });

  test("combines values with the configured join character", async () => {
    const producer = new ArtistTagSeparatorProducer("combine");
    const operations = await producer.produce(
      createLibrary([
        {
          path: "/music/track.flac",
          status: "ok",
          tags: { artist: ["Artist One", "Artist Two"] },
        },
      ] as Library["items"]),
      { separator: " / " },
    );

    expect(operations[0]?.type).toBe("tag-update");
    if (operations[0]?.type === "tag-update") {
      expect(operations[0].tags.artist).toBe("Artist One / Artist Two");
    }
  });

  test("ignores unsupported formats, errored items, and unchanged tags", async () => {
    const producer = new ArtistTagSeparatorProducer("split");
    const operations = await producer.produce(
      createLibrary([
        {
          path: "/music/unchanged.flac",
          status: "ok",
          tags: { artist: ["Artist One"] },
        },
        {
          path: "/music/unsupported.ogg",
          status: "ok",
          tags: { artist: ["Artist One, Artist Two"] },
        },
        {
          path: "/music/error.mp3",
          status: "error",
          error: new Error("Unreadable"),
        },
      ] as Library["items"]),
    );

    expect(operations).toEqual([]);
  });
});
