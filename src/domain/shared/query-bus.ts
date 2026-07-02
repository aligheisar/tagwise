import type { Query, QueryClass } from "@/domain/shared/query";
import type { QueryHandler } from "@/domain/shared/query-handler";

export interface QueryBus {
  execute<T extends Query, R>(query: T): Promise<R>;
  register<T extends Query, R>(
    query: QueryClass<T>,
    handler: QueryHandler<T, R>,
  ): void;
}
