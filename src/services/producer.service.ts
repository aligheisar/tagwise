import { getProducerArgumentDefaults } from "#/lib/producer-arguments";
import type { ProducerRepository } from "#/repositories/producer.repository";
import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer, ProducerArguments } from "#/types/producer";

class ProducerService {
  /** Creates a service backed by the producer repository. */
  constructor(private readonly producerRepository: ProducerRepository) {}

  /** Runs a producer with its declared defaults and adds producer metadata. */
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

  /** Returns all registered producers. */
  getAll(): Producer[] {
    return this.producerRepository.getAll();
  }
}

export { ProducerService };
