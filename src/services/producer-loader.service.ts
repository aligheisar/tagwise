import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Producer } from "#/types/producer";

type ProducerLoadError = {
  filePath: string;
  message: string;
};

type ProducerLoadResult = {
  producers: Producer[];
  errors: ProducerLoadError[];
};

/** Checks whether an unknown value is a valid producer argument definition. */
function isProducerArgument(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const argument = value as Record<string, unknown>;
  if (
    typeof argument.key !== "string" ||
    argument.key.trim().length === 0 ||
    typeof argument.title !== "string" ||
    argument.title.trim().length === 0 ||
    (argument.description !== undefined &&
      typeof argument.description !== "string") ||
    (argument.required !== undefined && typeof argument.required !== "boolean")
  ) {
    return false;
  }

  if (argument.type === "string") {
    return (
      argument.default === undefined || typeof argument.default === "string"
    );
  }
  if (argument.type === "number") {
    return (
      argument.default === undefined ||
      (typeof argument.default === "number" &&
        Number.isFinite(argument.default))
    );
  }
  if (argument.type === "boolean") {
    return typeof argument.default === "boolean";
  }
  if (argument.type === "select") {
    if (
      !Array.isArray(argument.options) ||
      argument.options.length === 0 ||
      !argument.options.every(
        (option) =>
          typeof option === "object" &&
          option !== null &&
          typeof option.label === "string" &&
          option.label.trim().length > 0 &&
          typeof option.value === "string",
      ) ||
      typeof argument.default !== "string" ||
      !argument.options.some((option) => option.value === argument.default)
    ) {
      return false;
    }
    return true;
  }
  return false;
}

/** Checks whether an unknown module export satisfies the producer contract. */
function isProducer(value: unknown): value is Producer {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const argsAreValid =
    candidate.args === undefined ||
    (Array.isArray(candidate.args) &&
      candidate.args.every(isProducerArgument) &&
      new Set(candidate.args.map((argument) => argument.key)).size ===
        candidate.args.length);
  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.produce === "function" &&
    argsAreValid &&
    (candidate.description === undefined ||
      typeof candidate.description === "string") &&
    (candidate.title === undefined || typeof candidate.title === "string") &&
    (candidate.version === undefined || typeof candidate.version === "string")
  );
}

/** Loads valid producer modules and records errors for modules that fail. */
async function loadProducers(directory: string): Promise<ProducerLoadResult> {
  let entries: Dirent[];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return { errors: [], producers: [] };
    }
    throw error;
  }

  const producers: Producer[] = [];
  const errors: ProducerLoadError[] = [];
  const files = entries
    .filter((entry) => entry.isFile() && /\.(?:js|mjs|ts)$/.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const file of files) {
    const filePath = path.join(directory, file.name);
    try {
      const loaded = (await import(pathToFileURL(filePath).href)) as {
        default?: unknown;
      };
      if (!isProducer(loaded.default)) {
        throw new Error(
          "Expected a default export with a non-empty name and produce() function",
        );
      }
      producers.push(loaded.default);
    } catch (error) {
      errors.push({
        filePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { errors, producers };
}

export type { ProducerLoadError, ProducerLoadResult };
export { isProducer, isProducerArgument, loadProducers };
