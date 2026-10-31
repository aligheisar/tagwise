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

function isProducer(value: unknown): value is Producer {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.produce === "function" &&
    (candidate.description === undefined ||
      typeof candidate.description === "string") &&
    (candidate.version === undefined || typeof candidate.version === "string")
  );
}

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
export { isProducer, loadProducers };
