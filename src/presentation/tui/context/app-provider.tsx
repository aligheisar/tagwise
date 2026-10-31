import { toast } from "@opentui-ui/toast";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cacheService } from "#/containers/cache.container";
import { filesystemService } from "#/containers/filesystem.container";
import { producerService } from "#/containers/producer.container";
import { scannerService } from "#/containers/scanner.container";
import { normalizeRoot } from "#/repositories/library.repository";
import { runProducerPipeline } from "#/services/producer-pipeline.service";
import { logger } from "#/utils/logger";
import { appContext } from "@/context/app-context";
import { useOperations } from "@/hooks/use-operations";
import type { ContextValues } from "@/types/app-context";
import type { Screen } from "@/types/screen";

const AppProvider = ({
  children,
  initialFolder,
}: {
  children: ReactNode;
  initialFolder?: string;
}) => {
  const scanController = useRef(new AbortController());
  const [folder, setFolder] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpShortcutEnabled, setHelpShortcutEnabled] = useState(true);
  const [screen, setScreen] = useState<Screen>(
    initialFolder
      ? {
          type: "scanning",
        }
      : { type: "welcome" },
  );

  const ops = useOperations();

  const toggleHelp = useCallback(() => {
    setHelpOpen((open) => !open);
  }, []);

  const handleScan = useCallback(async (folder: string) => {
    setFolder(folder);
    setScreen({ type: "scanning" });

    try {
      scanController.current = new AbortController();
      await scannerService.scan(folder, {
        signal: scanController.current.signal,
      });
      const library = await cacheService.get(normalizeRoot(folder));
      if (!library) {
        toast("Scan completed but library not found in cache");
        setScreen({ type: "welcome" });
        return;
      }

      setScreen({ type: "producer-select" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      logger.error("Scan failed in the terminal interface", {
        error: err,
        root: folder,
      });
      toast(
        `Scan failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setScreen({ type: "welcome" });
    }
  }, []);

  useEffect(() => {
    if (initialFolder) {
      void handleScan(initialFolder);
    }
  }, [handleScan, initialFolder]);

  const abortScan = useCallback(async () => {
    scanController.current.abort();
    scanController.current = new AbortController();
    setFolder(null);
    setScreen({ type: "welcome" });
  }, []);

  const handleSelectCached = useCallback(
    async (root: string) => {
      try {
        const library = await cacheService.get(normalizeRoot(root));
        if (!library) {
          toast("Cached library not found");
          return;
        }

        const hasChanges = await filesystemService.hasChangedSince(
          library.root,
          library.cachedAt,
        );

        if (hasChanges) {
          await handleScan(library.root);
          return;
        }

        setFolder(root);
        setScreen({ type: "producer-select" });
      } catch (error) {
        logger.error("Could not load cached library", { error, root });
        toast(
          `Could not load cached library: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [handleScan],
  );

  const handleProducerConfirm = useCallback(
    async (selectedProducers: string[]) => {
      if (!folder) return;

      try {
        const library = await cacheService.get(normalizeRoot(folder));

        if (!library) {
          toast("Library not found in cache");
          setScreen({ type: "welcome" });
          return;
        }

        const availableProducers = new Map(
          producerService.getAll().map((producer) => [producer.name, producer]),
        );
        const orderedProducers = selectedProducers.map((name) => {
          const producer = availableProducers.get(name);
          if (!producer) throw new Error(`Unknown producer: ${name}`);
          return producer;
        });
        const { operations: allOperations } = await runProducerPipeline(
          library,
          orderedProducers,
        );

        if (allOperations.length === 0) {
          toast("No operations to perform");
          setScreen({ type: "welcome" });
          return;
        }

        logger.info("Generated operations for review", {
          count: allOperations.length,
          producers: selectedProducers,
          root: library.root,
        });
        ops.setRawOperations(allOperations);
        setScreen({ type: "review" });
      } catch (error) {
        logger.error("Could not generate library operations", {
          error,
          root: folder,
        });
        toast(
          `Could not generate operations: ${error instanceof Error ? error.message : String(error)}`,
        );
        setScreen({ type: "welcome" });
      }
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
    helpOpen,
    helpShortcutEnabled,
    operations: ops,
    scanController,
    screen,
    setHelpShortcutEnabled,
    setScreen,
    toggleHelp,
  };

  return (
    <appContext.Provider value={contextValues}>{children}</appContext.Provider>
  );
};

export { AppProvider };
