import { toast } from "@opentui-ui/toast";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  generateOperations,
  scanLibrary,
  selectCachedLibrary,
} from "#/services/tui-workflow.service";
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
      const result = await scanLibrary(folder, scanController.current.signal);

      if (!result.ok) {
        if (result.error === "Scan was cancelled") return;
        toast(result.error);
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
        const result = await selectCachedLibrary(root);

        if (!result.ok) {
          toast(result.error);
          return;
        }

        if (result.needsRescan) {
          await handleScan(result.library.root);
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
        const result = await generateOperations(folder, selectedProducers);

        if (!result.ok) {
          toast(result.error);
          setScreen({ type: "welcome" });
          return;
        }

        logger.info("Generated operations for review", {
          count: result.operations.length,
          producers: selectedProducers,
          root: folder,
        });
        ops.setRawOperations(result.operations);
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
