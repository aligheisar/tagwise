import { getProducerArgumentDefaults } from "#/lib/producer-arguments";
import type { ProducerRepository } from "#/repositories/producer.repository";
import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer, ProducerArguments } from "#/types/producer";

class ProducerService {
  constructor(private readonly producerRepository: ProducerRepository) {}

  async run(
    producerName: string,
    library: Library,
    args?: ProducerArguments,
  ): Promise<Operation[]> {
    const producer = this.producerRepository.get(producerName);
    if (!producer) {
      throw new Error(`Unknown producer: ${producerName}`);
    }

    const operations = await producer.produce(library, {
      ...getProducerArgumentDefaults(producer),
      ...args,
    });
    return operations.map((operation) => ({
      ...operation,
      producedBy: producer.name,
    }));
  }

  getAll(): Producer[] {
    return this.producerRepository.getAll();
  }
}

export { ProducerService };
