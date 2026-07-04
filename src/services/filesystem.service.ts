import { existsSync } from "node:fs";
import { readdir, rename, stat } from "node:fs/promises";
import path from "node:path";

class FilesystemService {
  async rename(oldPath: string, newPath: string): Promise<void> {
    await rename(oldPath, newPath);
  }

  async exists(filePath: string): Promise<boolean> {
    return existsSync(filePath);
  }

  async hasChangedSince(dir: string, since: Date): Promise<boolean> {
    const visited = new Set<string>();

    async function walk(current: string): Promise<boolean> {
      if (visited.has(current)) return false;
      visited.add(current);

      try {
        const entries = await readdir(current, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(current, entry.name);
          try {
            const fileStat = await stat(fullPath);
            if (fileStat.mtime > since) return true;
            if (entry.isDirectory() && (await walk(fullPath))) return true;
          } catch (_err) {}
        }
      } catch (_err) {
        return false;
      }

      return false;
    }

    return walk(dir);
  }
}

export { FilesystemService };
