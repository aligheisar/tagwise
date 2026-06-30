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
import type { Library } from "@/domain/media-item/entity";
import type { LibraryRepository } from "@/domain/media-item/repository";

function normalizeRoot(root: string): string {
  return path.resolve(root);
}

function rootToFilename(root: string): string {
  return normalizeRoot(root)
    .replace(/^\//, "")
    .replaceAll("/", "__")
    .replaceAll(".", "_");
}

function filenameToRoot(filename: string): string {
  return `/${filename.replaceAll("__", "/").replaceAll("_", ".")}`;
}

class CacheLibraryRepository implements LibraryRepository {
  private readonly cacheDir =
    process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache");
  private readonly librariesDir = path.join(
    this.cacheDir,
    "tagwise",
    "libraries",
  );

  private fileForRoot(root: string): string {
    return path.join(this.librariesDir, `${rootToFilename(root)}.json`);
  }

  async save(library: Library) {
    await mkdir(this.librariesDir, { recursive: true });

    const normalizedRoot = normalizeRoot(library.root);
    const data = { ...library, root: normalizedRoot };

    await writeFile(
      this.fileForRoot(normalizedRoot),
      JSON.stringify(data, null, 2),
      "utf8",
    );
  }

  async load(root: string) {
    try {
      const json = await readFile(this.fileForRoot(root), "utf8");
      const data = JSON.parse(json) as Library;
      data.cachedAt = new Date(data.cachedAt);
      data.root = normalizeRoot(data.root);
      return data;
    } catch {
      return null;
    }
  }

  async exists(root: string) {
    try {
      await stat(this.fileForRoot(root));
      return true;
    } catch {
      return false;
    }
  }

  async delete(root: string) {
    await rm(this.fileForRoot(root), { force: true });
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

export { CacheLibraryRepository, normalizeRoot };
