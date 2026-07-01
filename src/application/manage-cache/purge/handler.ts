import type { LibraryRepository } from "@/domain/media-item/repository";
import type { CommandHandler } from "@/domain/shared/command-handler";
import { normalizeRoot } from "@/infrastructure/cache/library-repository";
import type { PurgeCacheCommand } from "./command";

export type PurgeResult = {
  purged: string[];
  count: number;
};

export class PurgeCacheHandler implements CommandHandler<PurgeCacheCommand> {
  constructor(private readonly libraryRepository: LibraryRepository) {}

  async execute(command: PurgeCacheCommand): Promise<void> {
    if (command.folder) {
      const root = normalizeRoot(command.folder);
      await this.libraryRepository.delete(root);
      return;
    }

    const roots = await this.libraryRepository.listRoots();
    for (const root of roots) {
      await this.libraryRepository.delete(root);
    }
  }
}
