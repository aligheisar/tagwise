import { RemixTagProducer } from "@/lib/producers/remix-tag";
import { RenamerProducer } from "@/lib/producers/renamer";
import { LibraryRepository } from "@/repositories/library.repository";
import { CacheService } from "@/services/cache.service";
import { FilesystemService } from "@/services/filesystem.service";
import { RunService } from "@/services/run.service";
import { ScannerService } from "@/services/scanner.service";
import { TagWriterService } from "@/services/tag-writer.service";

export function createContainer() {
  const libraryRepository = new LibraryRepository();
  const filesystem = new FilesystemService();
  const tagWriter = new TagWriterService();

  const producers = new Map([
    ["renamer", new RenamerProducer()],
    ["remix", new RemixTagProducer()],
  ]);

  const scannerService = new ScannerService(libraryRepository, filesystem);
  const runService = new RunService(
    libraryRepository,
    filesystem,
    producers,
    tagWriter,
  );
  const cacheService = new CacheService(libraryRepository);

  return {
    cacheService,
    filesystem,
    libraryRepository,
    producers,
    runService,
    scannerService,
    tagWriter,
  };
}
