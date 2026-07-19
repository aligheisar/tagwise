import type { CachedLibrarySummary } from "#/repositories/library.repository";

type ContextValues = {
  libraries: CachedLibrarySummary[];
  isLoading: boolean;
};

export type { ContextValues };
