import { stat } from "node:fs/promises";
import { type FolderScanOptions, scanFolder } from "taglib-wasm/folder";

import {
  type LibraryRepository,
  normalizeRoot,
} from "#/repositories/library.repository";
import { logger } from "#/utils/logger";
import type { FilesystemService } from "./filesystem.service";

class ScannerService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly filesystem: FilesystemService,
  ) {}

  async scan(root: string, options?: FolderScanOptions): Promise<void> {
    const normalizedRoot = normalizeRoot(root);

    try {
      const rootStat = await stat(normalizedRoot);
      if (!rootStat.isDirectory()) {
        throw new Error(`Library path is not a directory: ${normalizedRoot}`);
      }

      const cachedLibrary = await this.libraryRepository.load(normalizedRoot);
      if (cachedLibrary) {
        const changed = await this.filesystem.hasChangedSince(
          normalizedRoot,
          cachedLibrary.cachedAt,
        );
        if (!changed) {
          logger.info("Using unchanged cached library", {
            root: normalizedRoot,
          });
          return;
        }
      }

      const result = await scanFolder(normalizedRoot, {
        continueOnError: options?.continueOnError ?? true,
        includeProperties: false,
        recursive: options?.recursive ?? true,
        signal: options?.signal,
      });

      await this.libraryRepository.save({
        cachedAt: new Date(),
        items: result.items,
        root: normalizedRoot,
      });
      logger.info("Scanned library", {
        durationMs: result.duration,
        files: result.items.length,
        root: normalizedRoot,
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        logger.error("Library scan failed", { error, root: normalizedRoot });
      }
      throw error;
    }
  }
}

export { ScannerService };
