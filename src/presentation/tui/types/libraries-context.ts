import type { CachedLibrarySummary } from "#/repositories/library.repository";
import type { Library } from "#/types/library";

type ContextValues = {
  libraries: CachedLibrarySummary[];
  currentRoot: Library["root"] | null;
  currentLibrary: Library | null;
  revalidate: () => Promise<void>;
  selectLibrary: (root: Library["root"]) => Promise<void>;
  clearLibrary: () => void;
  isLoading: boolean;
};

export type { ContextValues };
