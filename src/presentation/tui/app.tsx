import { useCallback, useEffect, useRef, useState } from "react";
import { useOperations } from "#/hooks/use-operations";
import { ApplyScreen } from "#/screens/apply";
import { ProducerSelect } from "#/screens/producer-select";
import { ReviewScreen } from "#/screens/review";
import { ScanningScreen } from "#/screens/scanning";
import { WelcomeScreen } from "#/screens/welcome";
import { ScanLibraryCommand } from "@/application/scan-library/command";
import type { LibraryRepository } from "@/domain/media-item/repository";
import type { Operation } from "@/domain/operation/entity";
import type { Producer } from "@/domain/producer/entity";
import type { CommandBus } from "@/domain/shared/command-bus";
import type { FilesystemPort, TagWriterPort } from "@/domain/shared/ports";
import { normalizeRoot } from "@/infrastructure/cache/library-repository";

const PRODUCER_DESCRIPTIONS: Record<string, string> = {
  remix: 'Append "(Remix)" to title tags',
  renamer: "Rename files to match title tag",
};

type AppProps = {
  commandBus: CommandBus;
  producerNames: string[];
  producers: Map<string, Producer>;
  libraryRepository: LibraryRepository;
  filesystem: FilesystemPort;
  tagWriter: TagWriterPort;
  initialFolder?: string;
};

type Screen =
  | { type: "welcome" }
  | { type: "scanning"; folder: string; controller: AbortController }
  | { type: "producer-select"; folder: string }
  | { type: "review"; folder: string; operations: Operation[] }
  | { type: "apply"; folder: string; operations: Operation[] };

export function App({
  commandBus,
  producerNames,
  producers,
  libraryRepository,
  filesystem,
  tagWriter,
  initialFolder,
}: AppProps) {
  const [cachedLibraries, setCachedLibraries] = useState<string[]>([]);
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

  const loadCachedLibraries = useCallback(async () => {
    if ("listRoots" in libraryRepository) {
      const roots = await libraryRepository.listRoots();
      setCachedLibraries(roots);
    }
  }, [libraryRepository]);

  useEffect(() => {
    loadCachedLibraries();
  }, [loadCachedLibraries]);

  const handleScan = useCallback(
    async (folder: string) => {
      setScanError(null);
      await commandBus.execute(
        new ScanLibraryCommand(folder, { signal: controller.current.signal }),
      );
      const library = await libraryRepository.load(normalizeRoot(folder));
      if (!library) {
        throw new Error("Scan completed but library not found in cache");
      }
      setScreen({ folder, type: "producer-select" });
    },
    [commandBus, libraryRepository],
  );

  const handleSelectCached = useCallback(
    async (root: string) => {
      const library = await libraryRepository.load(normalizeRoot(root));
      if (!library) {
        setScanError("Cached library not found");
        return;
      }
      setScreen({ folder: root, type: "producer-select" });
    },
    [libraryRepository],
  );

  const handleProducerConfirm = useCallback(
    async (selectedProducers: string[], folder: string) => {
      const library = await libraryRepository.load(normalizeRoot(folder));
      if (!library) {
        setScanError("Library not found in cache");
        setScreen({ type: "welcome" });
        return;
      }

      const allOperations: Operation[] = [];
      for (const name of selectedProducers) {
        const producer = producers.get(name);
        if (producer) {
          const ops = await producer.produce(library);
          allOperations.push(...ops);
        }
      }

      if (allOperations.length === 0) {
        setScanError("No operations to perform");
        setScreen({ type: "welcome" });
        return;
      }

      setScreen({ folder, operations: allOperations, type: "review" });
    },
    [libraryRepository, producers],
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
    filesystem as { rename: (old: string, newPath: string) => Promise<void> },
    tagWriter as {
      updateTags: (
        updates: { path: string; tags: Record<string, string | number> }[],
      ) => Promise<void>;
    },
  );

  switch (screen.type) {
    case "welcome":
      return (
        <WelcomeScreen
          cachedLibraries={cachedLibraries}
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
          producers={producerNames.map((name) => ({
            description: PRODUCER_DESCRIPTIONS[name] ?? "Unknown producer",
            name,
          }))}
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
