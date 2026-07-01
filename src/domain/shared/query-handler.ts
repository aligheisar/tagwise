import type { Query } from "@/domain/shared/query";

export interface QueryHandler<T extends Query, R> {
  execute(query: T): Promise<R>;
}
