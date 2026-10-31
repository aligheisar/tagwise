import type { Producer } from "#/types/producer";

export class ProducerRepository {
  private producers = new Map<string, Producer>();

  register(producer: Producer): void {
    if (this.producers.has(producer.name)) {
      throw new Error(`Producer "${producer.name}" is already registered`);
    }
    this.producers.set(producer.name, producer);
  }

  get(name: string): Producer | undefined {
    return this.producers.get(name);
  }

  getAll(): Producer[] {
    return Array.from(this.producers.values());
  }

  has(name: string): boolean {
    return this.producers.has(name);
  }
}
