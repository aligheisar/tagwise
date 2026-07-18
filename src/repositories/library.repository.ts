import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Library } from "@/types/library";

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
  return path.resolve(root);
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

class LibraryRepository {
  private readonly cacheDir =
    process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache");
  private readonly librariesDir = path.join(
    this.cacheDir,
    "tagwise",
    "libraries",
  );
  private readonly memoryCache = new Map<string, Library>();

  private fileForRoot(root: string): string {
    return path.join(this.librariesDir, `${rootToFilename(root)}.json`);
  }

  async save(library: Library): Promise<void> {
    await mkdir(this.librariesDir, { recursive: true });

    const normalizedRoot = normalizeRoot(library.root);
    const data = { ...library, root: normalizedRoot };

    await writeFile(
      this.fileForRoot(normalizedRoot),
      JSON.stringify(data),
      "utf8",
    );

    this.memoryCache.set(normalizedRoot, data);
  }

  async load(root: string): Promise<Library | null> {
    const normalizedRoot = normalizeRoot(root);

    const cached = this.memoryCache.get(normalizedRoot);
    if (cached) return cached;

    try {
      const json = await readFile(this.fileForRoot(root), "utf8");
      const data = JSON.parse(json) as Library;
      data.cachedAt = new Date(data.cachedAt);
      data.root = normalizeRoot(data.root);
      this.memoryCache.set(data.root, data);
      return data;
    } catch {
      return null;
    }
  }

  async exists(root: string): Promise<boolean> {
    try {
      await stat(this.fileForRoot(root));
      return true;
    } catch {
      return false;
    }
  }

  async delete(root: string): Promise<void> {
    await rm(this.fileForRoot(root), { force: true });
    this.memoryCache.delete(normalizeRoot(root));
  }

  async listRoots(): Promise<string[]> {
    try {
      const files = await readdir(this.librariesDir);
      return files
        .filter((f) => f.endsWith(".json"))
        .map((f) => filenameToRoot(f.replace(".json", "")));
    } catch {
      return [];
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
