import type { Library } from "@/domain/media-item/entity";

interface LibraryRepository {
  delete(root: string): Promise<void>;
  exists(root: string): Promise<boolean>;
  listRoots(): Promise<string[]>;
  load(root: string): Promise<Library | null>;
  save(library: Library): Promise<void>;
}

export type { LibraryRepository };
