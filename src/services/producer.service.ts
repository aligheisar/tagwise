import type { ProducerRepository } from "#/repositories/producer.repository";
import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer } from "#/types/producer";

class ProducerService {
  constructor(private readonly producerRepository: ProducerRepository) {}

  async run(producerName: string, library: Library): Promise<Operation[]> {
    const producer = this.producerRepository.get(producerName);
    if (!producer) {
      throw new Error(`Unknown producer: ${producerName}`);
    }

    return producer.produce(library);
  }

  getAll(): Producer[] {
    return this.producerRepository.getAll();
  }
}

export { ProducerService };
