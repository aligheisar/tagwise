import { access, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { config } from "#/config";
import { logger } from "#/utils/logger";

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

class FilesystemService {
  async rename(oldPath: string, newPath: string): Promise<void> {
    if (oldPath === newPath) return;

    const destinationExists = await this.exists(newPath);
    if (destinationExists) {
      throw new Error(`Refusing to overwrite existing file: ${newPath}`);
    }

    await rename(oldPath, newPath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return false;
      throw error;
    }
  }

  async hasChangedSince(dir: string, since: Date): Promise<boolean> {
    const visited = new Set<string>();

    async function walk(current: string): Promise<boolean> {
      if (visited.has(current)) return false;
      visited.add(current);

      const entries = await readdir(current, { withFileTypes: true }).catch(
        (error: unknown) => {
          if (isNodeError(error) && error.code === "ENOENT") return null;
          throw error;
        },
      );
      if (!entries) return true;

      const batchSize = config.filesystemConcurrency;
      for (let offset = 0; offset < entries.length; offset += batchSize) {
        const batch = entries.slice(offset, offset + batchSize);
        const stats = await Promise.all(
          batch.map(async (entry) => {
            const fullPath = path.join(current, entry.name);
            try {
              return {
                entry,
                fullPath,
                stat: await stat(fullPath),
              };
            } catch (error) {
              if (isNodeError(error) && error.code === "ENOENT") return null;
              throw error;
            }
          }),
        );

        for (const result of stats) {
          if (!result) return true;
          if (result.stat.mtime > since) return true;
          if (result.entry.isDirectory() && (await walk(result.fullPath))) {
            return true;
          }
        }
      }

      return false;
    }

    try {
      return await walk(dir);
    } catch (error) {
      logger.error("Failed to check library for changes", {
        directory: dir,
        error,
      });
      throw error;
    }
  }
}

export { FilesystemService };
