import type { LibraryRepository } from "@/domain/media-item/repository";
import type { CommandHandler } from "@/domain/shared/command-handler";
import type { FilesystemPort, ScannerPort } from "@/domain/shared/ports";
import { normalizeRoot } from "@/infrastructure/cache/library-repository";
import type { ScanLibraryCommand } from "./command";

export class ScanLibraryHandler implements CommandHandler<ScanLibraryCommand> {
  constructor(
    private readonly scanner: ScannerPort,
    private readonly libraryRepository: LibraryRepository,
    private readonly filesystem: FilesystemPort,
  ) {}

  async execute(command: ScanLibraryCommand) {
    const root = normalizeRoot(command.root);
    const cachedLibrary = await this.libraryRepository.load(root);

    if (cachedLibrary) {
      const changed = await this.filesystem.hasChangedSince(
        root,
        cachedLibrary.cachedAt,
      );
      if (!changed) {
        return;
      }
    }

    const scanResult = await this.scanner.scan(root, command.options);

    await this.libraryRepository.save({
      cachedAt: new Date(),
      items: scanResult.items,
      root,
    });
  }
}
