import type { LibraryRepository } from "@/domain/media-item/repository";
import type { Operation } from "@/domain/operation/entity";
import type { Producer } from "@/domain/producer/entity";
import type { CommandHandler } from "@/domain/shared/command-handler";
import type { FilesystemPort, TagWriterPort } from "@/domain/shared/ports";
import { normalizeRoot } from "@/infrastructure/cache/library-repository";
import type { RunCommand } from "./command";

type ProducerRegistry = Map<string, Producer>;

export class RunHandler implements CommandHandler<RunCommand> {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly producers: ProducerRegistry,
    private readonly filesystem: FilesystemPort,
    private readonly tagWriter: TagWriterPort,
  ) {}

  async execute(command: RunCommand) {
    const root = normalizeRoot(command.root);
    const library = await this.libraryRepository.load(root);
    if (!library) {
      console.error(
        "No cached library found. Run 'tagwise scan <folder>' first.",
      );
      return;
    }

    const producer = this.producers.get(command.producerName);
    if (!producer) {
      console.error(`Unknown producer: ${command.producerName}`);
      return;
    }

    const operations = await producer.produce(library);

    if (operations.length === 0) {
      console.log("No operations to perform.");
      return;
    }

    console.log(`${operations.length} operation(s) to execute:`);

    for (const op of operations) {
      await this.executeOperation(op);
    }
  }

  private async executeOperation(operation: Operation) {
    switch (operation.type) {
      case "rename":
        console.log(`  rename: ${operation.oldPath} -> ${operation.newPath}`);
        await this.filesystem.rename(operation.oldPath, operation.newPath);
        break;
      case "tag-update":
        console.log(`  tag-update: ${operation.path}`);
        await this.tagWriter.updateTags([
          { path: operation.path, tags: operation.tags },
        ]);
        break;
    }
  }
}
