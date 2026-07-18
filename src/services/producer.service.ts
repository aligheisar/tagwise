import type { LibraryRepository } from "@/repositories/library.repository";
import { normalizeRoot } from "@/repositories/library.repository";
import type { ProducerRepository } from "@/repositories/producer.repository";
import type { OperationService } from "@/services/operation.service";
import type { Producer } from "@/types/producer";

class ProducerService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly producerRepository: ProducerRepository,
    private readonly operationService: OperationService,
  ) {}

  async run(producerName: string, root: string): Promise<void> {
    const normalizedRoot = normalizeRoot(root);
    const library = await this.libraryRepository.load(normalizedRoot);
    if (!library) {
      throw new Error(
        "No cached library found. Run 'tagwise scan <folder>' first.",
      );
    }

    const producer = this.producerRepository.get(producerName);
    if (!producer) {
      throw new Error(`Unknown producer: ${producerName}`);
    }

    const operations = await producer.produce(library);

    if (operations.length === 0) {
      console.log("No operations to perform.");
      return;
    }

    console.log(`${operations.length} operation(s) to execute:`);
    this.operationService.add(...operations);
  }

  getAll(): Producer[] {
    return this.producerRepository.getAll();
  }
}

export { ProducerService };
