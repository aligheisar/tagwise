import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { LibraryRepository } from "../src/repositories/library.repository";
import type { Library } from "../src/types/library";

let temporaryDirectory = "";

afterEach(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    temporaryDirectory = "";
  }
});

async function createRepository(): Promise<{
  repository: LibraryRepository;
  root: string;
}> {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "tagwise-test-"));
  const root = path.join(temporaryDirectory, "music");
  return {
    repository: new LibraryRepository(temporaryDirectory),
    root,
  };
}

describe("LibraryRepository", () => {
  test("persists and restores cached scan errors", async () => {
    const { repository, root } = await createRepository();
    const cachedAt = new Date("2026-01-02T03:04:05.000Z");
    const library: Library = {
      cachedAt,
      items: [
        {
          error: new Error("unsupported audio data"),
          path: path.join(root, "broken.mp3"),
          status: "error",
        },
      ],
      root,
    };

    await repository.save(library);
    const loaded = await repository.load(root);

    expect(loaded?.cachedAt).toEqual(cachedAt);
    expect(loaded?.items[0]?.status).toBe("error");
    if (loaded?.items[0]?.status === "error") {
      expect(loaded.items[0].error).toBeInstanceOf(Error);
      expect(loaded.items[0].error.message).toBe("unsupported audio data");
    }
  });

  test("reads the disk version rather than returning stale in-memory data", async () => {
    const { repository, root } = await createRepository();
    await repository.save({ cachedAt: new Date(0), items: [], root });
    const cacheDirectory = path.join(
      temporaryDirectory,
      "tagwise",
      "libraries",
    );
    const [filename] = await readdir(cacheDirectory);
    expect(filename).toBeDefined();
    await writeFile(
      path.join(cacheDirectory, filename as string),
      JSON.stringify({
        cachedAt: new Date("2026-06-01T00:00:00.000Z"),
        items: [],
        root,
      }),
    );

    const loaded = await repository.load(root);
    expect(loaded?.cachedAt.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  test("returns null for a missing entry and rejects corrupted cache data", async () => {
    const { repository, root } = await createRepository();
    expect(await repository.load(root)).toBeNull();

    await repository.save({ cachedAt: new Date(), items: [], root });
    const cacheDirectory = path.join(
      temporaryDirectory,
      "tagwise",
      "libraries",
    );
    const [filename] = await readdir(cacheDirectory);
    expect(filename).toBeDefined();
    await writeFile(path.join(cacheDirectory, filename as string), "{invalid");

    await expect(repository.load(root)).rejects.toThrow(
      `Could not read cached library for ${root}`,
    );
  });
});
