import type { Query, QueryClass } from "@/domain/shared/query";
import type { QueryBus } from "@/domain/shared/query-bus";
import type { QueryHandler } from "@/domain/shared/query-handler";

export class InMemoryQueryBus implements QueryBus {
  private readonly handlers = new Map<
    QueryClass,
    QueryHandler<Query, unknown>
  >();

  register<T extends Query, R>(
    query: QueryClass<T>,
    handler: QueryHandler<T, R>,
  ) {
    this.handlers.set(query, handler);
  }

  async execute<T extends Query, R>(query: T): Promise<R> {
    const handler = this.handlers.get(query.constructor as QueryClass<T>);
    if (!handler) {
      throw new Error(`No handler registered for ${query.constructor.name}`);
    }

    return handler.execute(query) as Promise<R>;
  }
}
