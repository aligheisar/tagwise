export type CachedLibrarySummary = {
  root: string;
  itemCount: number;
  okCount: number;
  errorCount: number;
  cachedAt: Date;
};

export type CachedLibraryDetail = {
  root: string;
  cachedAt: Date;
  items: Array<{
    path: string;
    status: "ok" | "error";
    error?: string;
  }>;
};

export type CacheListResult = {
  libraries: CachedLibrarySummary[];
  total: number;
};

export type CacheShowResult = CachedLibraryDetail | null;
