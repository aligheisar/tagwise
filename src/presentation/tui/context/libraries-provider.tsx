import { toast } from "@opentui-ui/toast";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { cacheService } from "#/containers/cache.container";
import type { Library } from "#/types/library";
import { logger } from "#/utils/logger";
import { librariesContext } from "@/context/libraries-context";
import type { ContextValues } from "@/types/libraries-context";

const LibrariesProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<ContextValues["isLoading"]>(true);
  const [libraries, setLibraries] = useState<ContextValues["libraries"]>([]);
  const [currentRoot, setCurrentRoot] =
    useState<ContextValues["currentRoot"]>(null);
  const [currentLibrary, setCurrentLibrary] =
    useState<ContextValues["currentLibrary"]>(null);

  const fetchCurrentLibrary = useCallback(async (root: Library["root"]) => {
    const lib = await cacheService.get(root);
    setCurrentLibrary(lib);
  }, []);

  const fetchLibraries = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await cacheService.list();

      setLibraries(result.libraries);
    } catch (error) {
      logger.error("Could not list cached libraries", { error });
      toast(
        `Could not list cached libraries: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLibrary = useCallback(() => {
    setCurrentRoot(null);
  }, []);

  const selectLibrary = useCallback(
    async (root: Library["root"]) => {
      setCurrentRoot(root);
      await fetchLibraries();
    },
    [fetchLibraries],
  );

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  useEffect(() => {
    if (!currentRoot) {
      setCurrentLibrary(null);
      return;
    }

    fetchCurrentLibrary(currentRoot);
  }, [fetchCurrentLibrary, currentRoot]);

  const contextValues: ContextValues = {
    clearLibrary,
    currentLibrary,
    currentRoot,
    isLoading,
    libraries,
    revalidate: fetchLibraries,
    selectLibrary,
  };

  return (
    <librariesContext.Provider value={contextValues}>
      {children}
    </librariesContext.Provider>
  );
};

export { LibrariesProvider };
