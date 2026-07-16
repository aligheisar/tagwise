import { RemixTagProducer } from "@/lib/producers/remix-tag";
import { RenamerProducer } from "@/lib/producers/renamer";
import { LibraryRepository } from "@/repositories/library.repository";
import { FilesystemService } from "@/services/filesystem.service";
import { RunService } from "@/services/run.service";
import { TagWriterService } from "@/services/tag-writer.service";

const libraryRepository = new LibraryRepository();
const filesystem = new FilesystemService();
const tagWriter = new TagWriterService();

const producers = new Map([
  ["renamer", new RenamerProducer()],
  ["remix", new RemixTagProducer()],
]);

const runService = new RunService(
  libraryRepository,
  filesystem,
  producers,
  tagWriter,
);

export { runService };
