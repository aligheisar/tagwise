import { toast } from "@opentui-ui/toast";
import { type ReactNode, useEffect, useState } from "react";
import { cacheService } from "#/containers/cache.container";
import { logger } from "#/utils/logger";
import { librariesContext } from "@/context/libraries-context";
import type { ContextValues } from "@/types/libraries-context";

const LibrariesProvider = ({ children }: { children: ReactNode }) => {
  const [libraries, setLibraries] = useState<ContextValues["libraries"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fn = async () => {
      try {
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
    };

    fn();
  }, []);

  const contextValues: ContextValues = { isLoading, libraries: libraries };

  return (
    <librariesContext.Provider value={contextValues}>
      {children}
    </librariesContext.Provider>
  );
};

export { LibrariesProvider };
