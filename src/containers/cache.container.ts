import { LibraryRepository } from "@/repositories/library.repository";
import { CacheService } from "@/services/cache.service";

const libraryRepository = new LibraryRepository();

const cacheService = new CacheService(libraryRepository);

export { cacheService };
