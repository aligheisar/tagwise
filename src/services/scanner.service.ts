import { scanFolder } from "taglib-wasm/folder";
import { mapScanResult } from "@/lib/taglib/mapper";
import type { ScanOptions } from "@/lib/taglib/types";
import {
  type LibraryRepository,
  normalizeRoot,
} from "@/repositories/library.repository";
import type { FilesystemService } from "./filesystem.service";

class ScannerService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly filesystem: FilesystemService,
  ) {}

  async scan(root: string, options?: ScanOptions): Promise<void> {
    const normalizedRoot = normalizeRoot(root);
    const cachedLibrary = await this.libraryRepository.load(normalizedRoot);

    if (cachedLibrary) {
      const changed = await this.filesystem.hasChangedSince(
        normalizedRoot,
        cachedLibrary.cachedAt,
      );
      if (!changed) {
        return;
      }
    }

    const result = await scanFolder(normalizedRoot, {
      continueOnError: options?.continueOnError ?? true,
      includeProperties: false,
      recursive: options?.recursive ?? true,
      signal: options?.signal,
    });

    const scanResult = mapScanResult(result);

    await this.libraryRepository.save({
      cachedAt: new Date(),
      items: scanResult.items,
      root: normalizedRoot,
    });
  }
}

export { ScannerService };
