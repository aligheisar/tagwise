import type { LibraryRepository } from "@/domain/media-item/repository";
import type { QueryHandler } from "@/domain/shared/query-handler";
import type { CacheListResult } from "@/domain/shared/result";
import type { ListCachesQuery } from "./query";

export class ListCachesHandler
  implements QueryHandler<ListCachesQuery, CacheListResult>
{
  constructor(private readonly libraryRepository: LibraryRepository) {}

  async execute(_query: ListCachesQuery): Promise<CacheListResult> {
    const roots = await this.libraryRepository.listRoots();
    const summaries = [];

    for (const root of roots) {
      const library = await this.libraryRepository.load(root);
      if (!library) continue;

      const itemCount = library.items.length;
      const okCount = library.items.filter((i) => i.status === "ok").length;
      const errorCount = itemCount - okCount;

      summaries.push({
        cachedAt: library.cachedAt,
        errorCount,
        itemCount,
        okCount,
        root,
      });
    }

    return { libraries: summaries, total: summaries.length };
  }
}
