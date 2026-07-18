import { access, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";

class FilesystemService {
  async rename(oldPath: string, newPath: string): Promise<void> {
    await rename(oldPath, newPath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async hasChangedSince(dir: string, since: Date): Promise<boolean> {
    const visited = new Set<string>();

    async function walk(current: string): Promise<boolean> {
      if (visited.has(current)) return false;
      visited.add(current);

      try {
        const entries = await readdir(current, { withFileTypes: true });
        const stats = await Promise.allSettled(
          entries.map((entry) => {
            const fullPath = path.join(current, entry.name);
            return stat(fullPath).then((s) => ({ entry, fullPath, stat: s }));
          }),
        );

        for (const result of stats) {
          if (result.status === "fulfilled") {
            const { entry, fullPath, stat: fileStat } = result.value;
            if (fileStat.mtime > since) return true;
            if (entry.isDirectory() && (await walk(fullPath))) return true;
          }
        }
      } catch {
        return false;
      }

      return false;
    }

    return walk(dir);
  }
}

export { FilesystemService };
