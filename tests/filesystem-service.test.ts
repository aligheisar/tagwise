import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { FilesystemService } from "../src/services/filesystem.service";

describe("FilesystemService.hasChangedSince", () => {
  test("detects changed files and returns false when all mtimes precede the cache", async () => {
    const temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-test-"),
    );
    try {
      const musicDirectory = path.join(temporaryDirectory, "music");
      const nestedDirectory = path.join(musicDirectory, "nested");
      const file = path.join(nestedDirectory, "song.mp3");
      await mkdir(nestedDirectory, { recursive: true });
      await writeFile(file, "audio");

      const service = new FilesystemService();
      const future = new Date(Date.now() + 2_000);
      expect(await service.hasChangedSince(musicDirectory, future)).toBe(false);

      const changedAt = new Date(Date.now() + 4_000);
      await utimes(file, changedAt, changedAt);
      expect(await service.hasChangedSince(musicDirectory, future)).toBe(true);
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });

  test("treats a removed scan root as changed", async () => {
    const temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-test-"),
    );
    const removedDirectory = path.join(temporaryDirectory, "removed");
    await mkdir(removedDirectory);
    await rm(removedDirectory, { recursive: true });
    try {
      await expect(
        new FilesystemService().hasChangedSince(removedDirectory, new Date()),
      ).resolves.toBe(true);
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });
});
