import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ProducerScaffoldDetails = {
  title: string;
  version: string;
  description?: string;
};

type ProducerScaffoldResult = {
  filePath: string;
  name: string;
  typesFilePath: string;
};

/** Converts a producer title into a filesystem-safe producer identifier. */
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

/** Generates the TypeScript source for a new producer module. */
function createProducerSource(
  name: string,
  details: ProducerScaffoldDetails,
): string {
  return `import { defineProducer } from "../producer-types";
import type { ProducerOperation } from "../producer-types";

const producer = defineProducer({
  name: ${JSON.stringify(name)},
  title: ${JSON.stringify(details.title.trim())},
  version: ${JSON.stringify(details.version.trim())},
  ${details.description ? `description: ${JSON.stringify(details.description.trim())},\n` : ""}
  // Example: args: [{ key: "separator", title: "Separator", type: "string", default: ", " }],
  async produce(library, args) {
    const operations: ProducerOperation[] = [];

    // For the example above: const separator = args.separator ?? ", ";
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
});

export default producer;
`;
}

const producerArgumentTypeSource = `export type ProducerArgument<
  SelectOptions extends readonly { label: string; value: string }[] =
    readonly { label: string; value: string }[],
> =
  | {
      key: string;
      title: string;
      description?: string;
      type: "string";
      default?: string;
      required?: boolean;
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "number";
      default?: number;
      required?: boolean;
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "boolean";
      default: boolean;
      required?: boolean;
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "select";
      options: SelectOptions;
      default: SelectOptions[number]["value"];
      required?: boolean;
    };`;

const producerArgumentValueTypeSource = `type ProducerArgumentValue<Argument extends ProducerArgument> =
  Argument extends { type: "number" }
    ? number
    : Argument extends { type: "boolean" }
      ? boolean
      : Argument extends {
            options: readonly { value: infer Value extends string }[];
            type: "select";
          }
        ? Value
        : string;`;

const producerArgumentsTypeSource = `export type ProducerArguments<
  Arguments extends readonly ProducerArgument[] | null = null,
> = Arguments extends readonly ProducerArgument[]
  ? {
      [Argument in Arguments[number] as Argument extends { required: true }
        ? Argument["key"]
        : Argument extends { default: unknown }
          ? Argument["key"]
          : never]: ProducerArgumentValue<Argument>;
    } & {
      [Argument in Arguments[number] as Argument extends { required: true }
        ? never
        : Argument extends { default: unknown }
          ? never
          : Argument["key"]]?: ProducerArgumentValue<Argument>;
    }
  : Record<string, string | number | boolean>;`;

const validProducerArgumentsTypeSource = `type ValidProducerArguments<
  Arguments extends readonly ProducerArgument[],
> = {
  [Index in keyof Arguments]: Arguments[Index] extends {
    default: infer Default;
    options: infer Options extends readonly { label: string; value: string }[];
    type: "select";
  }
    ? Default extends Options[number]["value"]
      ? Arguments[Index]
      : never
    : Arguments[Index];
};`;

const producerTypeSource = `export type Producer<
  Arguments extends readonly ProducerArgument[] | null = null,
> = {
  name: string;
  title: string;
  version: string;
  description?: string;
  args?: Arguments extends readonly ProducerArgument[]
    ? Arguments
    : readonly ProducerArgument[];
  produce(
    library: ProducerLibrary,
    args: ProducerArguments<Arguments>
  ): Promise<ProducerOperation[]>;
};`;

const defineProducerFunctionSource = `export function defineProducer<
  const Arguments extends readonly ProducerArgument[] = readonly [],
>(
  producer: Producer<Arguments> & {
    args?: Arguments & ValidProducerArguments<Arguments>;
  },
): Producer<Arguments>;
export function defineProducer(producer: Producer): Producer {
  return producer;
}`;

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

/** Generates the shared type declarations used by scaffolded producers. */
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
  tags: Record<string, string | string[] | number>;
  description?: string;
};

export type ProducerOperation = RenameOperation | TagUpdateOperation;

${producerArgumentTypeSource}

${producerArgumentValueTypeSource}

${producerArgumentsTypeSource}

${validProducerArgumentsTypeSource}

${producerTypeSource}

${defineProducerFunctionSource}
`;
}

/** Migrates known generated type declarations without overwriting custom source. */
function migrateProducerTypesSource(source: string): string | undefined {
  const lineEnding = source.includes("\r\n") ? "\r\n" : "\n";
  const normalizedSource = source.replace(/\r\n/g, "\n");
  const replaceExactlyOnce = (
    value: string,
    previous: string,
    current: string,
  ): string | undefined => {
    const index = value.indexOf(previous);
    if (
      index === -1 ||
      value.indexOf(previous, index + previous.length) !== -1
    ) {
      return undefined;
    }

    return (
      value.slice(0, index) + current + value.slice(index + previous.length)
    );
  };
  const restoreLineEndings = (value: string) =>
    lineEnding === "\n" ? value : value.replace(/\n/g, lineEnding);

  const legacyIndex = normalizedSource.indexOf(legacyProducerTypeSource);

  // The old scaffold had no markers, so only migrate its exact generated declaration.
  if (legacyIndex !== -1) {
    if (
      normalizedSource.indexOf(
        legacyProducerTypeSource,
        legacyIndex + legacyProducerTypeSource.length,
      ) !== -1
    ) {
      return undefined;
    }

    const hasType = (name: string) =>
      new RegExp(
        `\\b(?:export\\s+)?(?:type|interface)\\s+${name}\\b|\\bimport\\b[^;]*\\b${name}\\b`,
      ).test(normalizedSource);
    if (hasType("ProducerArgument") || hasType("ProducerArguments")) {
      return undefined;
    }

    const replacement = [
      producerArgumentTypeSource,
      producerArgumentValueTypeSource,
      producerArgumentsTypeSource,
      producerTypeSource,
      defineProducerFunctionSource,
    ].join("\n\n");
    const migratedLegacySource = replaceExactlyOnce(
      normalizedSource,
      legacyProducerTypeSource,
      replacement,
    );
    if (migratedLegacySource !== undefined) {
      return restoreLineEndings(migratedLegacySource);
    }
  }

  let migratedSource = normalizedSource;
  const previousTypes: [string, string][] = [
    [
      previousProducerArgumentTypeSource,
      `${producerArgumentTypeSource}\n\n${producerArgumentValueTypeSource}`,
    ],
    [previousProducerArgumentsTypeSource, producerArgumentsTypeSource],
    [
      previousProducerTypeSource,
      `${producerTypeSource}\n\n${defineProducerFunctionSource}`,
    ],
  ];
  for (const [previous, current] of previousTypes) {
    const nextSource = replaceExactlyOnce(migratedSource, previous, current);
    if (nextSource === undefined) return undefined;
    migratedSource = nextSource;
  }

  return restoreLineEndings(migratedSource);
}

/** Creates or safely migrates a producer types file when possible. */
async function writeTypesFileIfMissing(filePath: string): Promise<void> {
  try {
    await writeFile(filePath, createProducerTypesSource(), {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      const existingSource = await readFile(filePath, "utf8");
      const migratedSource = migrateProducerTypesSource(existingSource);
      if (migratedSource !== undefined) {
        await writeFile(filePath, migratedSource, { encoding: "utf8" });
      }
      return;
    }
    throw error;
  }
}

/** Checks whether a types file exports the runtime scaffold helper. */
function providesDefineProducer(source: string): boolean {
  return (
    /^\s*export\s+function\s+defineProducer\b/m.test(source) ||
    /^\s*export\s+(?:const|let|var)\s+defineProducer\b/m.test(source) ||
    /^\s*export\s*\{[^}]*\bdefineProducer\b[^}]*\}/m.test(source)
  );
}

/** Creates a producer file and its shared declarations when needed. */
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
  const typesSource = await readFile(typesFilePath, "utf8");
  if (!providesDefineProducer(typesSource)) {
    throw new Error(
      `Cannot scaffold producer because "${typesFilePath}" does not export defineProducer. Add a value export named defineProducer to this file before scaffolding.`,
    );
  }
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
