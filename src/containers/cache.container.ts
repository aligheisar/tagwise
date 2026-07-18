import { libraryRepository } from "@/containers/repository.container";
import { CacheService } from "@/services/cache.service";

const cacheService = new CacheService(libraryRepository);

export { cacheService };
