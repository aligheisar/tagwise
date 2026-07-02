import type { LibraryRepository } from "@/domain/media-item/repository";
import type { QueryHandler } from "@/domain/shared/query-handler";
import type { CacheShowResult } from "@/domain/shared/result";
import { normalizeRoot } from "@/infrastructure/cache/library-repository";
import type { ShowCacheQuery } from "./query";

export class ShowCacheHandler
  implements QueryHandler<ShowCacheQuery, CacheShowResult>
{
  constructor(private readonly libraryRepository: LibraryRepository) {}

  async execute(query: ShowCacheQuery): Promise<CacheShowResult> {
    const root = normalizeRoot(query.folder);
    const library = await this.libraryRepository.load(root);

    if (!library) return null;

    return {
      cachedAt: library.cachedAt,
      items: library.items.map((i) => ({
        error: i.status === "error" ? i.error : undefined,
        path: i.path,
        status: i.status,
      })),
      root: library.root,
    };
  }
}
