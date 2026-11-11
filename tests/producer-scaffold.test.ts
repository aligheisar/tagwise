import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  createProducerFile,
  producerNameFromTitle,
} from "../src/services/producer-scaffold.service";

let temporaryDirectory = "";

const legacyProducerTypeSource = `export type Producer = {
  name: string;
  title: string;
  version: string;
  description?: string;
  produce(library: ProducerLibrary): Promise<ProducerOperation[]>;
};`;

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
    const producerDirectory = path.join(temporaryDirectory, "producers");

    const created = await createProducerFile(producerDirectory, {
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
    expect(source).toContain("async produce(library, args = {})");
    expect(source).toContain(
      'import type { Producer, ProducerOperation } from "../producer-types"',
    );
    expect(source).not.toContain("type ProducerLibraryItem");
    expect(sharedTypes).toContain("export type ProducerLibraryItem");
    expect(sharedTypes).toContain("export type ProducerArguments");
    expect(sharedTypes).toContain("export type ProducerArgument");
    expect(sharedTypes).toContain("export type SongTags");
    expect(sharedTypes).toContain(
      "tags: Record<string, string | string[] | number>",
    );
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

  test("migrates generated producer types while preserving user content", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-producer-scaffold-"),
    );
    const producerDirectory = path.join(temporaryDirectory, "producers");
    const typesFilePath = path.join(temporaryDirectory, "producer-types.ts");
    const customTypes = `export type UserSetting = { enabled: boolean };`;
    await writeFile(
      typesFilePath,
      `${customTypes}\n\n${legacyProducerTypeSource}\n`,
      "utf8",
    );

    await createProducerFile(producerDirectory, {
      title: "Test Producer",
      version: "1.0.0",
    });

    const migratedTypes = await readFile(typesFilePath, "utf8");
    expect(migratedTypes).toContain(customTypes);
    expect(migratedTypes).toContain("export type ProducerArgument =");
    expect(migratedTypes).toContain("export type ProducerArguments =");
    expect(migratedTypes).toContain("args?: ProducerArgument[];");
    expect(migratedTypes).toContain("args?: ProducerArguments");
    expect(migratedTypes).not.toContain(
      "produce(library: ProducerLibrary): Promise<ProducerOperation[]>;",
    );
  });

  test("leaves customized producer types untouched", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-producer-scaffold-"),
    );
    const producerDirectory = path.join(temporaryDirectory, "producers");
    const typesFilePath = path.join(temporaryDirectory, "producer-types.ts");
    const customizedTypes = legacyProducerTypeSource.replace(
      "  name: string;",
      "  name: string;\n  customField: boolean;",
    );
    await writeFile(typesFilePath, customizedTypes, "utf8");

    await createProducerFile(producerDirectory, {
      title: "Test Producer",
      version: "1.0.0",
    });

    expect(await readFile(typesFilePath, "utf8")).toBe(customizedTypes);
  });
});
