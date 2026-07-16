"use client";

import { type ReactNode, useEffect, useState } from "react";
import { cacheService } from "@/containers/cache.container";
import { librariesContext } from "@/presentation/tui/context/libraries-context";
import type { ContextValues } from "@/presentation/tui/types/libraries-context";

const LibrariesProvider = ({ children }: { children: ReactNode }) => {
  const [libraries, setLibraries] = useState<ContextValues["libraries"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fn = async () => {
      const result = await cacheService.list();

      setLibraries(result.libraries);
      setIsLoading(false);
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
