import { existsSync } from "node:fs";
import { readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import type { FilesystemPort } from "@/domain/shared/ports";

export class NodeFilesystem implements FilesystemPort {
  async rename(oldPath: string, newPath: string) {
    await rename(oldPath, newPath);
  }

  async exists(filePath: string) {
    return existsSync(filePath);
  }

  async hasChangedSince(dir: string, since: Date): Promise<boolean> {
    async function walk(current: string): Promise<boolean> {
      const entries = await readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        const fileStat = await stat(fullPath);
        if (fileStat.mtime > since) return true;
        if (entry.isDirectory() && (await walk(fullPath))) return true;
      }
      return false;
    }

    return walk(dir);
  }
}
