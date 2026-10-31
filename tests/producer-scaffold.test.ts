import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  createProducerFile,
  producerNameFromTitle,
} from "../src/services/producer-scaffold.service";

let temporaryDirectory = "";

afterEach(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    temporaryDirectory = "";
  }
});

describe("producer scaffolding", () => {
  test("converts titles to safe producer names", () => {
    expect(producerNameFromTitle("My New Producer!")).toBe("my-new-producer");
    expect(() => producerNameFromTitle(" !!! ")).toThrow(
      "Producer title must contain a letter or number",
    );
  });

  test("writes a self-contained typed producer module", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-producer-scaffold-"),
    );

    const created = await createProducerFile(temporaryDirectory, {
      description: "Adds a test tag",
      title: "Test Producer",
      version: "0.2.0",
    });
    const source = await readFile(created.filePath, "utf8");
    const sharedTypes = await readFile(created.typesFilePath, "utf8");

    expect(created.name).toBe("test-producer");
    expect(source).toContain('name: "test-producer"');
    expect(source).toContain('title: "Test Producer"');
    expect(source).toContain('type: "tag-update"');
    expect(source).toContain(
      'import type { Producer, ProducerOperation } from "../producer-types"',
    );
    expect(source).not.toContain("type ProducerLibraryItem");
    expect(sharedTypes).toContain("export type ProducerLibraryItem");
    expect(sharedTypes).toContain("export type SongTags");
    for (const tag of [
      "title",
      "artist",
      "album",
      "comment",
      "genre",
      "year",
      "track",
      "date",
      "albumArtist",
      "composer",
      "conductor",
      "copyright",
      "encodedBy",
      "isrc",
      "lyricist",
      "titleSort",
      "artistSort",
      "albumSort",
      "albumArtistSort",
      "composerSort",
      "label",
      "subtitle",
      "producer",
      "originalArtist",
      "originalAlbum",
      "originalDate",
      "acoustidFingerprint",
      "acoustidId",
      "musicbrainzTrackId",
      "musicbrainzReleaseId",
      "musicbrainzArtistId",
      "musicbrainzReleaseGroupId",
      "replayGainTrackGain",
      "replayGainTrackPeak",
      "replayGainAlbumGain",
      "replayGainAlbumPeak",
      "appleSoundCheck",
      "discNumber",
      "totalTracks",
      "totalDiscs",
      "bpm",
      "compilation",
      "pictures",
      "ratings",
      "lyrics",
      "chapters",
      "bext",
      "bextData",
      "ixml",
    ]) {
      expect(sharedTypes).toContain(`${tag}?:`);
    }
  });

  test("does not overwrite registered producers or existing files", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-producer-scaffold-"),
    );
    const details = {
      description: "Test",
      title: "Duplicate Producer",
      version: "1.0.0",
    };

    await expect(
      createProducerFile(temporaryDirectory, details, ["duplicate-producer"]),
    ).rejects.toThrow('Producer "duplicate-producer" is already registered');

    await createProducerFile(temporaryDirectory, details);
    await expect(
      createProducerFile(temporaryDirectory, details),
    ).rejects.toThrow("Producer file already exists");
  });
});
