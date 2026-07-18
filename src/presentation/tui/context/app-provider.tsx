import { type ReactNode, useCallback, useRef, useState } from "react";
import { appContext } from "#/context/app-context";
import { useOperations } from "#/hooks/use-operations";
import type { ContextValues } from "#/types/app-context";
import type { Screen } from "#/types/screen";
import { cacheService } from "@/containers/cache.container";
import { filesystemService } from "@/containers/filesystem.container";
import { operationService } from "@/containers/operation.container";
import { producerService } from "@/containers/producer.container";
import { scannerService } from "@/containers/scanner.container";
import { normalizeRoot } from "@/repositories/library.repository";

const AppProvider = ({
  children,
  initialFolder,
}: {
  children: ReactNode;
  initialFolder?: string;
}) => {
  const scanController = useRef(new AbortController());
  const [folder, setFolder] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>(
    initialFolder
      ? {
          type: "scanning",
        }
      : { type: "welcome" },
  );

  const [scanError, setScanError] = useState<string | null>(null);
  const ops = useOperations();

  const handleScan = useCallback(async (folder: string) => {
    setScanError(null);
    setFolder(folder);
    setScreen({ type: "scanning" });

    try {
      await scannerService.scan(folder, {
        signal: scanController.current.signal,
      });
      const library = await cacheService.get(normalizeRoot(folder));
      if (!library) {
        setScanError("Scan completed but library not found in cache");
        setScreen({ type: "welcome" });
        return;
      }

      setScreen({ type: "producer-select" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setScanError(
        `Scan failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setScreen({ type: "welcome" });
    }
  }, []);

  const abortScan = useCallback(async () => {
    scanController.current.abort();
    setFolder(null);
    setScreen({ type: "welcome" });
  }, []);

  const handleSelectCached = useCallback(
    async (root: string) => {
      const library = await cacheService.get(normalizeRoot(root));
      if (!library) {
        setScanError("Cached library not found");
        return;
      }

      const hasChanges = await filesystemService.hasChangedSince(
        library.root,
        library.cachedAt,
      );

      if (hasChanges) {
        handleScan(library.root);
        return;
      }

      setFolder(root);
      setScreen({ type: "producer-select" });
    },
    [handleScan],
  );

  const handleProducerConfirm = useCallback(
    async (selectedProducers: Set<string>) => {
      if (!folder) return;

      const library = await cacheService.get(normalizeRoot(folder));

      if (!library) {
        setScanError("Library not found in cache");
        setScreen({ type: "welcome" });
        return;
      }

      const selected = Array.from(selectedProducers);

      await Promise.allSettled(
        selected.map((item) => producerService.run(item, folder)),
      );

      const operations = operationService.getAll();

      if (operations.length === 0) {
        setScanError("No operations to perform");
        setScreen({ type: "welcome" });
        return;
      }

      ops.setRawOperations(operations);
      setScreen({ type: "review" });
    },
    [folder, ops.setRawOperations],
  );

  const handleApplyFromReview = useCallback(() => {
    setScreen({ type: "apply" });
  }, []);

  const contextValues: ContextValues = {
    abortScan,
    folder,
    handleApplyFromReview,
    handleProducerConfirm,
    handleScan,
    handleSelectCached,
    operations: ops,
    scanController,
    scanError,
    screen,
    setScreen,
  };

  return (
    <appContext.Provider value={contextValues}>{children}</appContext.Provider>
  );
};

export { AppProvider };
