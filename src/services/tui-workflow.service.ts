import { cacheService } from "#/containers/cache.container";
import { filesystemService } from "#/containers/filesystem.container";
import { producerService } from "#/containers/producer.container";
import { scannerService } from "#/containers/scanner.container";
import { normalizeRoot } from "#/repositories/library.repository";
import { runProducerPipeline } from "#/services/producer-pipeline.service";
import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer } from "#/types/producer";

type ScanResult = { ok: true; library: Library } | { ok: false; error: string };

type SelectCachedResult =
  | { ok: true; library: Library; needsRescan: boolean }
  | { ok: false; error: string };

type GenerateOperationsResult =
  | { ok: true; operations: Operation[] }
  | { ok: false; error: string };

async function scanLibrary(
  folder: string,
  signal?: AbortSignal,
): Promise<ScanResult> {
  try {
    await scannerService.scan(folder, { signal });
    const library = await cacheService.get(normalizeRoot(folder));
    if (!library) {
      return {
        error: "Scan completed but library not found in cache",
        ok: false,
      };
    }
    return { library, ok: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { error: "Scan was cancelled", ok: false };
    }
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      ok: false,
    };
  }
}

async function selectCachedLibrary(root: string): Promise<SelectCachedResult> {
  try {
    const library = await cacheService.get(normalizeRoot(root));
    if (!library) {
      return { error: "Cached library not found", ok: false };
    }

    const hasChanges = await filesystemService.hasChangedSince(
      library.root,
      library.cachedAt,
    );

    return { library, needsRescan: hasChanges, ok: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not load cached library",
      ok: false,
    };
  }
}

async function generateOperations(
  folder: string,
  selectedProducerNames: string[],
): Promise<GenerateOperationsResult> {
  try {
    const library = await cacheService.get(normalizeRoot(folder));
    if (!library) {
      return { error: "Library not found in cache", ok: false };
    }

    const availableProducers = new Map(
      producerService.getAll().map((p) => [p.name, p] as const),
    );
    const orderedProducers: Producer[] = [];
    for (const name of selectedProducerNames) {
      const producer = availableProducers.get(name);
      if (!producer) {
        return { error: `Unknown producer: ${name}`, ok: false };
      }
      orderedProducers.push(producer);
    }

    const { operations } = await runProducerPipeline(library, orderedProducers);

    if (operations.length === 0) {
      return { error: "No operations to perform", ok: false };
    }

    return { ok: true, operations };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not generate operations",
      ok: false,
    };
  }
}

export type { GenerateOperationsResult, ScanResult, SelectCachedResult };
export { generateOperations, scanLibrary, selectCachedLibrary };
