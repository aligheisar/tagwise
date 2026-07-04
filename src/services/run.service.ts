import type { Operation, Producer } from "@/lib/producers/types";
import type { LibraryRepository } from "@/repositories/library.repository";
import { normalizeRoot } from "@/repositories/library.repository";
import type { FilesystemService } from "./filesystem.service";
import type { TagWriterService } from "./tag-writer.service";

type ProducerRegistry = Map<string, Producer>;

class RunService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly filesystem: FilesystemService,
    private readonly producers: ProducerRegistry,
    private readonly tagWriter: TagWriterService,
  ) {}

  async run(producerName: string, root: string): Promise<void> {
    const normalizedRoot = normalizeRoot(root);
    const library = await this.libraryRepository.load(normalizedRoot);
    if (!library) {
      console.error(
        "No cached library found. Run 'tagwise scan <folder>' first.",
      );
      return;
    }

    const producer = this.producers.get(producerName);
    if (!producer) {
      console.error(`Unknown producer: ${producerName}`);
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

  private async executeOperation(operation: Operation): Promise<void> {
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

export { RunService };
