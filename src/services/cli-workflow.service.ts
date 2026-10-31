import { cacheService } from "#/containers/cache.container";
import { producerService } from "#/containers/producer.container";
import { scannerService } from "#/containers/scanner.container";
import { MutableLibrary } from "#/lib/mutable-library";
import type {
  CacheListResult,
  CacheShowResult,
} from "#/repositories/library.repository";
import { normalizeRoot } from "#/repositories/library.repository";
import { runProducerPipeline } from "#/services/producer-pipeline.service";
import {
  createProducerFile,
  type ProducerScaffoldDetails,
} from "#/services/producer-scaffold.service";
import type { Operation } from "#/types/operation";
import type { Producer } from "#/types/producer";

async function scanLibrary(folder: string): Promise<void> {
  await scannerService.scan(folder);
}

async function getLibraryFromCache(folder: string) {
  const normalized = normalizeRoot(folder);
  return cacheService.get(normalized);
}

async function runProducer(
  folder: string,
  producerName: string,
): Promise<Operation[]> {
  const library = await getLibraryFromCache(folder);
  if (!library) {
    throw new Error(
      "Library not found in cache. Please scan the folder first.",
    );
  }

  const mutableLib = new MutableLibrary(library);
  const operations = await producerService.run(producerName, mutableLib);

  return operations;
}

async function runProducerPipelineForCli(
  folder: string,
  producerNames: string[],
): Promise<Operation[]> {
  const library = await getLibraryFromCache(folder);
  if (!library) {
    throw new Error(
      "Library not found in cache. Please scan the folder first.",
    );
  }

  const availableProducers = new Map(
    producerService.getAll().map((p) => [p.name, p] as const),
  );
  const orderedProducers: Producer[] = [];
  for (const name of producerNames) {
    const producer = availableProducers.get(name);
    if (!producer) {
      throw new Error(`Unknown producer: ${name}`);
    }
    orderedProducers.push(producer);
  }

  const { operations } = await runProducerPipeline(library, orderedProducers);

  return operations;
}

function formatCacheList(result: CacheListResult): string {
  if (result.total === 0) {
    return "No cached libraries.";
  }

  const lines: string[] = [];
  lines.push(`Cached libraries (${result.total}):\n`);

  for (const lib of result.libraries) {
    lines.push(`  ${lib.root}`);
    lines.push(
      `    ${lib.itemCount} file(s) (${lib.okCount} ok, ${lib.errorCount} errors)`,
    );
    lines.push(`    cached at: ${lib.cachedAt.toISOString()}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}

function formatCacheShow(entry: CacheShowResult): string {
  if (!entry) {
    return "No cached library found for that folder.";
  }

  const okItems = entry.items.filter((i) => i.status === "ok");
  const errorItems = entry.items.filter((i) => i.status === "error");

  const lines: string[] = [];
  lines.push(`Root:       ${entry.root}`);
  lines.push(`Cached at:  ${entry.cachedAt.toISOString()}`);
  lines.push(`Total:      ${entry.items.length} file(s)`);
  lines.push(`OK:         ${okItems.length}`);
  lines.push(`Errors:     ${errorItems.length}`);

  if (errorItems.length > 0) {
    lines.push("");
    lines.push("Errors:");
    for (const item of errorItems) {
      lines.push(`  ${item.path}: ${item.error}`);
    }
  }

  return lines.join("\n");
}

async function createProducer(
  directory: string,
  details: ProducerScaffoldDetails,
  registeredNames: string[],
): Promise<{ filePath: string; name: string }> {
  if (!details.title) {
    throw new Error("Producer title is required");
  }
  if (!details.description) {
    throw new Error("Producer description is required");
  }
  return createProducerFile(directory, details, registeredNames);
}

export {
  createProducer,
  formatCacheList,
  formatCacheShow,
  getLibraryFromCache,
  runProducer,
  runProducerPipelineForCli,
  scanLibrary,
};
