import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  createProducerFile,
  createProducerSource,
  createProducerTypesSource,
  producerNameFromTitle,
} from "../src/services/producer-scaffold.service";
import { defineProducer } from "../src/types/producer";

let temporaryDirectory = "";

const previousProducerArgumentTypeSource = `export type ProducerArgument =
  | {
      key: string;
      title: string;
      description?: string;
      type: "string";
      default?: string;
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "number";
      default?: number;
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "boolean";
      default?: boolean;
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "select";
      options: { label: string; value: string }[];
      default?: string;
    };`;
const previousProducerArgumentsTypeSource =
  "export type ProducerArguments = Record<string, string | number | boolean>;";
const previousProducerTypeSource = `export type Producer = {
  name: string;
  title: string;
  version: string;
  description?: string;
  args?: ProducerArgument[];
  produce(
    library: ProducerLibrary,
    args?: ProducerArguments
  ): Promise<ProducerOperation[]>;
};`;
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
    expect(source).toContain("async produce(library, args)");
    expect(source).not.toContain("producedBy");
    expect(source).toContain(
      'import { defineProducer } from "../producer-types"',
    );
    expect(source).toContain(
      'args: [{ key: "separator", title: "Separator", type: "string", default: ", " }]',
    );
    expect(source).toContain(
      'import type { ProducerOperation } from "../producer-types"',
    );
    expect(source).not.toContain("type ProducerLibraryItem");
    expect(sharedTypes).toContain("export type ProducerLibraryItem");
    expect(sharedTypes).toContain("export type ProducerArguments<");
    expect(sharedTypes).toContain("export type ProducerArgument");
    expect(sharedTypes).toContain("export function defineProducer");
    expect(sharedTypes).toContain(
      "args?: Arguments extends readonly ProducerArgument[]",
    );
    expect(sharedTypes).toContain(": readonly ProducerArgument[]");
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
    expect(migratedTypes).toContain("export type ProducerArgument<");
    expect(migratedTypes).toContain("export type ProducerArguments<");
    expect(migratedTypes).toContain(
      "args?: Arguments extends readonly ProducerArgument[]",
    );
    expect(migratedTypes).toContain("args: ProducerArguments<Arguments>");
    expect(migratedTypes).not.toContain(
      "produce(library: ProducerLibrary): Promise<ProducerOperation[]>;",
    );
  });

  test("does not scaffold when customized types omit defineProducer", async () => {
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

    await expect(
      createProducerFile(producerDirectory, {
        title: "Test Producer",
        version: "1.0.0",
      }),
    ).rejects.toThrow(
      "does not export defineProducer. Add a value export named defineProducer",
    );

    expect(await readFile(typesFilePath, "utf8")).toBe(customizedTypes);
    await expect(
      readFile(path.join(producerDirectory, "test-producer.ts"), "utf8"),
    ).rejects.toThrow();
  });

  test("migrates the previous argument type declarations", async () => {
    temporaryDirectory = await mkdtemp(
      path.join(os.tmpdir(), "tagwise-producer-scaffold-"),
    );
    const producerDirectory = path.join(temporaryDirectory, "producers");
    const typesFilePath = path.join(temporaryDirectory, "producer-types.ts");
    const customTypes = "export type UserSetting = { enabled: boolean };";
    await writeFile(
      typesFilePath,
      [
        customTypes,
        previousProducerArgumentTypeSource,
        previousProducerArgumentsTypeSource,
        previousProducerTypeSource,
      ].join("\n\n"),
      "utf8",
    );

    await createProducerFile(producerDirectory, {
      title: "Test Producer",
      version: "1.0.0",
    });

    const migratedTypes = await readFile(typesFilePath, "utf8");
    expect(migratedTypes).toContain(customTypes);
    expect(migratedTypes).toContain("type ProducerArgumentValue<");
    expect(migratedTypes).toContain("args: ProducerArguments<Arguments>");
    expect(migratedTypes).toContain("export function defineProducer");
    expect(migratedTypes).not.toContain(previousProducerTypeSource);
  });

  test("defines producers with correct runtime shape", () => {
    const producer = defineProducer({
      name: "typed-producer",
      title: "Typed Producer",
      version: "1.0.0",
      args: [
        { key: "separator", title: "Separator", type: "string", default: ", " },
        { key: "fallback", title: "Fallback", type: "string", required: true },
        { key: "limit", title: "Limit", type: "number", required: true },
        { key: "enabled", title: "Enabled", type: "boolean", default: false },
        {
          key: "mode",
          title: "Mode",
          type: "select",
          options: [
            { label: "Combine", value: "combine" },
            { label: "Split", value: "split" },
          ],
          default: "combine",
        },
      ],
      async produce(_library, args) {
        void args;
        return [];
      },
    });

    expect(producer.args).toHaveLength(5);
    expect(producer.name).toBe("typed-producer");
    expect(producer.title).toBe("Typed Producer");
    expect(producer.version).toBe("1.0.0");

    const separatorArg = producer.args![0];
    expect(separatorArg.key).toBe("separator");
    expect(separatorArg.type).toBe("string");
    expect(separatorArg.default).toBe(", ");

    const limitArg = producer.args![2];
    expect(limitArg.key).toBe("limit");
    expect(limitArg.type).toBe("number");
    expect((limitArg as { required?: boolean }).required).toBe(true);

    const modeArg = producer.args![4] as {
      key: string;
      type: "select";
      options: readonly { label: string; value: string }[];
      default: string;
    };
    expect(modeArg.type).toBe("select");
    expect(modeArg.options).toEqual([
      { label: "Combine", value: "combine" },
      { label: "Split", value: "split" },
    ]);
    expect(modeArg.default).toBe("combine");
  });

  test("generates source that includes all argument shapes in template", () => {
    const source = createProducerSource("example", {
      title: "Example",
      version: "1.0.0",
    });

    expect(source).toContain('name: "example"');
    expect(source).toContain('title: "Example"');
    expect(source).toContain('version: "1.0.0"');
    expect(source).toContain("async produce(library, args)");
    expect(source).toContain('import { defineProducer } from "../producer-types"');
    expect(source).toContain(
      'import type { ProducerOperation } from "../producer-types"',
    );
    expect(source).not.toContain("producedBy");

    const typesSource = createProducerTypesSource();
    expect(typesSource).toContain("export type ProducerArgument<");
    expect(typesSource).toContain("export type ProducerArguments<");
    expect(typesSource).toContain("export function defineProducer");
    expect(typesSource).toContain("export type SongTags");
    expect(typesSource).toContain("export type ProducerLibraryItem");
  });
});
