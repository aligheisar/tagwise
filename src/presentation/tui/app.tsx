import { useCallback, useRef, useState } from "react";
import { useOperations } from "#/hooks/use-operations";
import { ApplyScreen } from "#/screens/apply";
import { ProducerSelect } from "#/screens/producer-select";
import { ReviewScreen } from "#/screens/review";
import { ScanningScreen } from "#/screens/scanning";
import { WelcomeScreen } from "#/screens/welcome";
import { cacheService } from "@/containers/cache.container";
import { scannerService } from "@/containers/scanner.container";
import type { Operation } from "@/lib/producers/types";
import { normalizeRoot } from "@/repositories/library.repository";

const PRODUCER_DESCRIPTIONS: Record<string, string> = {
  remix: 'Append "(Remix)" to title tags',
  renamer: "Rename files to match title tag",
};

type AppProps = {
  initialFolder?: string;
};

type Screen =
  | { type: "welcome" }
  | { type: "scanning"; folder: string; controller: AbortController }
  | { type: "producer-select"; folder: string }
  | { type: "review"; folder: string; operations: Operation[] }
  | { type: "apply"; folder: string; operations: Operation[] };

export function App({ initialFolder }: AppProps) {
  const [_scanError, setScanError] = useState<string | null>(null);
  const controller = useRef(new AbortController());
  const [screen, setScreen] = useState<Screen>(
    initialFolder
      ? {
          controller: controller.current,
          folder: initialFolder,
          type: "scanning",
        }
      : { type: "welcome" },
  );

  const handleScan = useCallback(async (folder: string) => {
    setScanError(null);

    await scannerService.scan(folder, { signal: controller.current.signal });
    const library = await cacheService.get(normalizeRoot(folder));
    if (!library) {
      throw new Error("Scan completed but library not found in cache");
    }

    setScreen({ folder, type: "producer-select" });
  }, []);

  const handleSelectCached = useCallback(async (root: string) => {
    const library = await cacheService.get(normalizeRoot(root));
    if (!library) {
      setScanError("Cached library not found");
      return;
    }
    setScreen({ folder: root, type: "producer-select" });
  }, []);

  const handleProducerConfirm = useCallback(
    async (selectedProducers: string[], folder: string) => {
      const library = await cacheService.get(normalizeRoot(folder));
      if (!library) {
        setScanError("Library not found in cache");
        setScreen({ type: "welcome" });
        return;
      }

      // const allOperations: Operation[] = [];
      // for (const name of selectedProducers) {
      //   const producer = producers.get(name);
      //   if (producer) {
      //     const ops = await producer.produce(library);
      //     allOperations.push(...ops);
      //   }
      // }

      // if (allOperations.length === 0) {
      //   setScanError("No operations to perform");
      //   setScreen({ type: "welcome" });
      //   return;
      // }

      setScreen({ folder, operations: [], type: "review" });
    },
    [],
  );

  const handleApplyFromReview = useCallback(
    (folder: string, operations: Operation[]) => {
      setScreen({ folder, operations, type: "apply" });
    },
    [],
  );

  const opsState = useOperations(
    screen.type === "review" || screen.type === "apply"
      ? screen.operations
      : [],
  );

  switch (screen.type) {
    case "welcome":
      return (
        <WelcomeScreen
          onScan={(path) => {
            setScreen({
              controller: controller.current,
              folder: path,
              type: "scanning",
            });
          }}
          onSelectCached={handleSelectCached}
        />
      );

    case "scanning":
      return (
        <ScanningScreen
          controller={controller.current}
          folderPath={screen.folder}
          onError={(err) => {
            setScanError(err);
            setScreen({ type: "welcome" });
          }}
          onScan={() => handleScan(screen.folder)}
        />
      );

    case "producer-select":
      return (
        <ProducerSelect
          onConfirm={(selected) =>
            handleProducerConfirm(selected, screen.folder)
          }
          producers={[]}
        />
      );

    case "review":
      return (
        <ReviewScreen
          libraryRoot={screen.folder}
          onAcceptAll={opsState.acceptAll}
          onAcceptFolder={opsState.acceptFolder}
          onApply={() =>
            handleApplyFromReview(screen.folder, screen.operations)
          }
          onModify={opsState.modify}
          onRejectAll={opsState.rejectAll}
          onRejectFolder={opsState.rejectFolder}
          onSelect={opsState.select}
          onToggle={opsState.toggle}
          operations={opsState.operations}
          selectedId={opsState.selectedId}
          stats={opsState.stats}
        />
      );

    case "apply":
      return (
        <ApplyScreen
          onCancel={() => setScreen({ type: "welcome" })}
          onConfirm={opsState.apply}
          onError={(err) => {
            setScanError(err);
            setScreen({ type: "welcome" });
          }}
          stats={opsState.stats}
        />
      );

    default:
      return <text>Unknown screen</text>;
  }
}
