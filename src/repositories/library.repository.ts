import { randomUUID } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { FolderScanItem } from "taglib-wasm";
import { config } from "#/config";
import type { Library } from "#/types/library";

type CachedLibrarySummary = {
  root: string;
  itemCount: number;
  okCount: number;
  errorCount: number;
  cachedAt: Date;
};

type CachedLibraryDetail = {
  root: string;
  cachedAt: Date;
  items: Array<{
    path: string;
    status: "ok" | "error";
    error?: string;
  }>;
};

type CacheListResult = {
  libraries: CachedLibrarySummary[];
  total: number;
};

type CacheShowResult = CachedLibraryDetail | null;

function normalizeRoot(root: string): string {
  if (!root.trim()) {
    throw new Error("Library folder path cannot be empty");
  }
  const expandedRoot = root.replace(/^~(?=\/|$)/, os.homedir());
  return path.resolve(expandedRoot);
}

function rootToFilename(root: string): string {
  return normalizeRoot(root)
    .replace(/^\//, "")
    .split("/")
    .map((segment) => Buffer.from(segment).toString("base64url"))
    .join("__");
}

function filenameToRoot(filename: string): string {
  return (
    "/" +
    filename
      .split("__")
      .map((segment) => Buffer.from(segment, "base64url").toString("utf8"))
      .join("/")
  );
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function isFolderScanItem(value: unknown): value is FolderScanItem {
  if (
    typeof value !== "object" ||
    value === null ||
    !("path" in value) ||
    typeof value.path !== "string" ||
    !("status" in value)
  ) {
    return false;
  }

  if (value.status === "ok") {
    return (
      "tags" in value && typeof value.tags === "object" && value.tags !== null
    );
  }
  return (
    value.status === "error" && "error" in value && value.error instanceof Error
  );
}

function parseLibrary(json: string, expectedRoot: string): Library {
  const parsed: unknown = JSON.parse(json, (key, value: unknown) => {
    if (
      key === "error" &&
      typeof value === "object" &&
      value !== null &&
      "name" in value &&
      "message" in value &&
      typeof value.message === "string"
    ) {
      return Object.assign(new Error(value.message), {
        name: typeof value.name === "string" ? value.name : "Error",
      });
    }
    return value;
  });

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("root" in parsed) ||
    typeof parsed.root !== "string" ||
    normalizeRoot(parsed.root) !== expectedRoot ||
    !("cachedAt" in parsed) ||
    (typeof parsed.cachedAt !== "string" &&
      typeof parsed.cachedAt !== "number" &&
      !(parsed.cachedAt instanceof Date)) ||
    !("items" in parsed) ||
    !Array.isArray(parsed.items)
  ) {
    throw new Error("Cache entry has an invalid library shape");
  }

  const cachedAt = new Date(parsed.cachedAt);
  if (Number.isNaN(cachedAt.getTime())) {
    throw new Error("Cache entry has an invalid cachedAt timestamp");
  }

  const items: FolderScanItem[] = [];
  for (const item of parsed.items) {
    if (!isFolderScanItem(item)) {
      throw new Error("Cache entry contains an invalid scan item");
    }
    items.push(item);
  }

  return { cachedAt, items, root: expectedRoot };
}

class LibraryRepository {
  private readonly cacheDir: string;
  private readonly librariesDir: string;

  constructor(cacheDir = config.cacheDir) {
    this.cacheDir = cacheDir;
    this.librariesDir = path.join(cacheDir, "tagwise", "libraries");
  }

  private fileForRoot(root: string): string {
    return path.join(this.librariesDir, `${rootToFilename(root)}.json`);
  }

  async save(library: Library): Promise<void> {
    await mkdir(this.librariesDir, { mode: 0o700, recursive: true });

    const normalizedRoot = normalizeRoot(library.root);
    const data = { ...library, root: normalizedRoot };
    const destination = this.fileForRoot(normalizedRoot);
    const temporary = `${destination}.${randomUUID()}.tmp`;
    const serialized = JSON.stringify(data, (_key, value: unknown) =>
      value instanceof Error
        ? { message: value.message, name: value.name }
        : value,
    );

    try {
      await writeFile(temporary, serialized, { encoding: "utf8", mode: 0o600 });
      await rename(temporary, destination);
    } finally {
      await rm(temporary, { force: true });
    }
  }

  async load(root: string): Promise<Library | null> {
    const normalizedRoot = normalizeRoot(root);

    let json: string;
    try {
      json = await readFile(this.fileForRoot(normalizedRoot), "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return null;
      throw error;
    }

    try {
      return parseLibrary(json, normalizedRoot);
    } catch (error) {
      throw new Error(`Could not read cached library for ${normalizedRoot}`, {
        cause: error,
      });
    }
  }

  async exists(root: string): Promise<boolean> {
    try {
      const fileStat = await stat(this.fileForRoot(root));
      if (!fileStat.isFile()) {
        throw new Error(`Cache entry is not a file: ${this.fileForRoot(root)}`);
      }
      return true;
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return false;
      throw error;
    }
  }

  async delete(root: string): Promise<void> {
    await rm(this.fileForRoot(root), { force: true });
  }

  async listRoots(): Promise<string[]> {
    try {
      const files = await readdir(this.librariesDir);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => filenameToRoot(file.slice(0, -".json".length)));
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return [];
      throw error;
    }
  }
}

export type {
  CachedLibraryDetail,
  CachedLibrarySummary,
  CacheListResult,
  CacheShowResult,
};
export { LibraryRepository, normalizeRoot };
