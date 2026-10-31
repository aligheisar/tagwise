import { access, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { logger } from "#/utils/logger";
import { expandPath } from "#/utils/path";

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

async function getFolderSuggestions(input: string): Promise<string[]> {
  if (!input.trim()) return [];

  const expanded = expandPath(input);

  if (expanded.endsWith("/")) {
    try {
      const entries = await readdir(expanded, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory())
        .map((e) => `${expanded}${e.name}/`)
        .slice(0, 10);
    } catch (error) {
      if (!isNodeError(error) || error.code !== "ENOENT") {
        logger.warn("Could not read folder suggestions", {
          directory: expanded,
          error,
        });
      }
      return [];
    }
  }

  const parent = dirname(expanded);
  const prefix = basename(expanded);

  try {
    const entries = await readdir(parent, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name.startsWith(prefix))
      .map((e) => `${join(parent, e.name)}/`)
      .slice(0, 10);
  } catch (error) {
    if (!isNodeError(error) || error.code !== "ENOENT") {
      logger.warn("Could not read folder suggestions", {
        directory: parent,
        error,
      });
    }
    return [];
  }
}

async function validateFolder(path: string): Promise<boolean> {
  try {
    await access(expandPath(path));
    return true;
  } catch {
    return false;
  }
}

export { getFolderSuggestions, validateFolder };
