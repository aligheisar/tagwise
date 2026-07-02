import type { Query } from "@/domain/shared/query";

export class ShowCacheQuery implements Query {
  constructor(public readonly folder: string) {}
}
