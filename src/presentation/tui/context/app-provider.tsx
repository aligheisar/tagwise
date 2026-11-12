import { toast } from "@opentui-ui/toast";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLibraries } from "#/presentation/tui/hooks/use-libraries";
import {
  generateOperations,
  scanLibrary,
  selectCachedLibrary,
} from "#/services/tui-workflow.service";
import type { ProducerArguments } from "#/types/producer";
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
  const {
    revalidate: revalidateLibraries,
    selectLibrary,
    currentRoot,
    clearLibrary,
  } = useLibraries();

  const toggleHelp = useCallback(() => {
    setHelpOpen((open) => !open);
  }, []);

  const handleScan = useCallback(
    async (folder: string) => {
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

        selectLibrary(folder);
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
        clearLibrary();
        setScreen({ type: "welcome" });
      } finally {
        await revalidateLibraries();
      }
    },
    [revalidateLibraries, selectLibrary, clearLibrary],
  );

  useEffect(() => {
    if (initialFolder) {
      void handleScan(initialFolder);
    }
  }, [handleScan, initialFolder]);

  const abortScan = useCallback(async () => {
    scanController.current.abort();
    scanController.current = new AbortController();
    clearLibrary();
    setScreen({ type: "welcome" });
  }, [clearLibrary]);

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

        selectLibrary(root);
        setScreen({ type: "producer-select" });
      } catch (error) {
        logger.error("Could not load cached library", { error, root });
        toast(
          `Could not load cached library: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [handleScan, selectLibrary],
  );

  const handleProducerConfirm = useCallback(
    async (
      selectedProducers: string[],
      producerArguments: Record<string, ProducerArguments>,
    ) => {
      if (!currentRoot) return;

      try {
        const result = await generateOperations(
          currentRoot,
          selectedProducers,
          producerArguments,
        );

        if (!result.ok) {
          toast(result.error);
          clearLibrary();
          setScreen({ type: "welcome" });
          return;
        }

        logger.info("Generated operations for review", {
          count: result.operations.length,
          producers: selectedProducers,
          root: currentRoot,
        });
        ops.setRawOperations(result.operations);
        setScreen({ type: "review" });
      } catch (error) {
        logger.error("Could not generate library operations", {
          error,
          root: currentRoot,
        });
        toast(
          `Could not generate operations: ${error instanceof Error ? error.message : String(error)}`,
        );
        setScreen({ type: "welcome" });
      }
    },
    [currentRoot, ops.setRawOperations, clearLibrary],
  );

  const handleApplyFromReview = useCallback(() => {
    setScreen({ type: "apply" });
  }, []);

  const contextValues: ContextValues = {
    abortScan,
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
