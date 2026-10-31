import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type ProducerScaffoldDetails = {
  title: string;
  version: string;
  description: string;
};

type ProducerScaffoldResult = {
  filePath: string;
  name: string;
  typesFilePath: string;
};

function producerNameFromTitle(title: string): string {
  const name = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!name) {
    throw new Error("Producer title must contain a letter or number");
  }
  return name;
}

function createProducerSource(
  name: string,
  details: ProducerScaffoldDetails,
): string {
  return `import type { Producer, ProducerOperation } from "../producer-types";

const producer: Producer = {
  name: ${JSON.stringify(name)},
  title: ${JSON.stringify(details.title.trim())},
  version: ${JSON.stringify(details.version.trim())},
  description: ${JSON.stringify(details.description.trim())},

  async produce(library) {
    const operations: ProducerOperation[] = [];

    for (const item of library.items) {
      if (item.status !== "ok") continue;

      const title = item.tags.title?.[0];
      if (!title) continue;

      // Add producer rules here. Example:
      // operations.push({
      //   id: producer.name + ":" + item.path,
      //   type: "tag-update",
      //   path: item.path,
      //   tags: { title: title + " (Example)" },
      // });
    }

    return operations;
  },
};

export default producer;
`;
}

function createProducerTypesSource(): string {
  return `export type SongTags = {
  readonly title?: readonly string[];
  readonly artist?: readonly string[];
  readonly album?: readonly string[];
  readonly comment?: readonly string[];
  readonly genre?: readonly string[];
  readonly year?: number;
  readonly track?: number;
  readonly date?: string | readonly string[];
  readonly albumArtist?: readonly string[];
  readonly composer?: readonly string[];
  readonly conductor?: readonly string[];
  readonly copyright?: readonly string[];
  readonly encodedBy?: readonly string[];
  readonly isrc?: readonly string[];
  readonly lyricist?: readonly string[];
  readonly titleSort?: readonly string[];
  readonly artistSort?: readonly string[];
  readonly albumSort?: readonly string[];
  readonly albumArtistSort?: readonly string[];
  readonly composerSort?: readonly string[];
  readonly label?: readonly string[];
  readonly subtitle?: readonly string[];
  readonly producer?: readonly string[];
  readonly originalArtist?: readonly string[];
  readonly originalAlbum?: readonly string[];
  readonly originalDate?: readonly string[];
  readonly acoustidFingerprint?: readonly string[];
  readonly acoustidId?: readonly string[];
  readonly musicbrainzTrackId?: readonly string[];
  readonly musicbrainzReleaseId?: readonly string[];
  readonly musicbrainzArtistId?: readonly string[];
  readonly musicbrainzReleaseGroupId?: readonly string[];
  readonly replayGainTrackGain?: readonly string[];
  readonly replayGainTrackPeak?: readonly string[];
  readonly replayGainAlbumGain?: readonly string[];
  readonly replayGainAlbumPeak?: readonly string[];
  readonly appleSoundCheck?: readonly string[];
  readonly discNumber?: number;
  readonly totalTracks?: number;
  readonly totalDiscs?: number;
  readonly bpm?: number;
  readonly compilation?: boolean;
  readonly pictures?: readonly unknown[];
  readonly ratings?: readonly unknown[];
  readonly lyrics?: readonly unknown[];
  readonly chapters?: readonly unknown[];
  readonly bext?: Readonly<Record<string, unknown>>;
  readonly bextData?: Uint8Array;
  readonly ixml?: string;
  readonly [customTag: string]: unknown;
};

export type ProducerLibraryItem =
  | {
      readonly path: string;
      readonly status: "ok";
      readonly tags: SongTags;
      readonly properties?: Readonly<Record<string, unknown>>;
      readonly hasCoverArt?: boolean;
      readonly dynamics?: Readonly<Record<string, string | undefined>>;
    }
  | { readonly path: string; readonly status: "error"; readonly error: Error };

export type ProducerLibrary = {
  readonly root: string;
  readonly cachedAt: Date;
  readonly items: readonly ProducerLibraryItem[];
};

export type RenameOperation = {
  id: string;
  type: "rename";
  oldPath: string;
  newPath: string;
  description?: string;
};

export type TagUpdateOperation = {
  id: string;
  type: "tag-update";
  path: string;
  tags: Record<string, string | number>;
  description?: string;
};

export type ProducerOperation = RenameOperation | TagUpdateOperation;

export type Producer = {
  name: string;
  title: string;
  version: string;
  description: string;
  produce(library: ProducerLibrary): Promise<ProducerOperation[]>;
};
`;
}

async function writeTypesFileIfMissing(filePath: string): Promise<void> {
  try {
    await writeFile(filePath, createProducerTypesSource(), {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      return;
    }
    throw error;
  }
}

async function createProducerFile(
  directory: string,
  details: ProducerScaffoldDetails,
  registeredNames: string[] = [],
): Promise<ProducerScaffoldResult> {
  const name = producerNameFromTitle(details.title);
  if (registeredNames.some((registeredName) => registeredName === name)) {
    throw new Error(`Producer "${name}" is already registered`);
  }

  await mkdir(directory, { mode: 0o700, recursive: true });
  const filePath = path.join(directory, `${name}.ts`);
  const typesFilePath = path.join(path.dirname(directory), "producer-types.ts");
  await writeTypesFileIfMissing(typesFilePath);
  try {
    await writeFile(filePath, createProducerSource(name, details), {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      throw new Error(`Producer file already exists: ${filePath}`, {
        cause: error,
      });
    }
    throw error;
  }

  return { filePath, name, typesFilePath };
}

export type { ProducerScaffoldDetails, ProducerScaffoldResult };
export {
  createProducerFile,
  createProducerSource,
  createProducerTypesSource,
  producerNameFromTitle,
};
