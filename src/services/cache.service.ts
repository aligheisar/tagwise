import type {
  CacheListResult,
  CacheShowResult,
  LibraryRepository,
} from "#/repositories/library.repository";
import { normalizeRoot } from "#/repositories/library.repository";
import type { Library } from "#/types/library";

export class CacheService {
  constructor(private readonly libraryRepository: LibraryRepository) {}

  async list(): Promise<CacheListResult> {
    const roots = await this.libraryRepository.listRoots();
    const libraries = await Promise.all(
      roots.map((root) => this.libraryRepository.load(root)),
    );

    const summaries: CacheListResult["libraries"] = [];

    for (let i = 0; i < libraries.length; i++) {
      const library = libraries[i];
      const root = roots[i];
      if (!library || !root) continue;

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

  async get(root: string): Promise<Library | null> {
    const lib = await this.libraryRepository.load(root);

    return lib;
  }

  async show(folder: string): Promise<CacheShowResult> {
    const root = normalizeRoot(folder);
    const library = await this.libraryRepository.load(root);

    if (!library) return null;

    return {
      cachedAt: library.cachedAt,
      items: library.items.map((i) => ({
        error: i.status === "error" ? i.error.message : undefined,
        path: i.path,
        status: i.status,
      })),
      root: library.root,
    };
  }

  async purge(folder?: string): Promise<void> {
    if (folder) {
      const root = normalizeRoot(folder);
      await this.libraryRepository.delete(root);
      return;
    }

    const roots = await this.libraryRepository.listRoots();
    for (const root of roots) {
      await this.libraryRepository.delete(root);
    }
  }
}
