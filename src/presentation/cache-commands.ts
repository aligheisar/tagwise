import type { CacheLibraryRepository } from "@/infrastructure/cache/library-repository";
import { normalizeRoot } from "@/infrastructure/cache/library-repository";

export async function cacheList(repository: CacheLibraryRepository) {
  const roots = await repository.listRoots();

  if (roots.length === 0) {
    console.log("No cached libraries.");
    return;
  }

  console.log(`Cached libraries (${roots.length}):\n`);

  for (const root of roots) {
    const library = await repository.load(root);
    if (!library) continue;

    const itemCount = library.items.length;
    const okCount = library.items.filter((i) => i.status === "ok").length;
    const errorCount = itemCount - okCount;

    console.log(`  ${root}`);
    console.log(
      `    ${itemCount} file(s) (${okCount} ok, ${errorCount} errors)`,
    );
    console.log(`    cached at: ${library.cachedAt.toISOString()}`);
    console.log();
  }
}

export async function cacheShow(
  repository: CacheLibraryRepository,
  folder: string,
) {
  const root = normalizeRoot(folder);
  const library = await repository.load(root);

  if (!library) {
    console.error(`No cache found for: ${root}`);
    process.exit(1);
  }

  const okItems = library.items.filter((i) => i.status === "ok");
  const errorItems = library.items.filter((i) => i.status === "error");

  console.log(`Root:       ${library.root}`);
  console.log(`Cached at:  ${library.cachedAt.toISOString()}`);
  console.log(`Total:      ${library.items.length} file(s)`);
  console.log(`OK:         ${okItems.length}`);
  console.log(`Errors:     ${errorItems.length}`);

  if (errorItems.length > 0) {
    console.log("\nErrors:");
    for (const item of errorItems) {
      console.log(`  ${item.path}: ${item.error}`);
    }
  }
}

export async function cachePurge(
  repository: CacheLibraryRepository,
  folder?: string,
) {
  if (folder) {
    const root = normalizeRoot(folder);
    const existed = await repository.exists(root);
    await repository.delete(root);
    if (existed) {
      console.log(`Purged cache for: ${root}`);
    } else {
      console.log(`No cache found for: ${root}`);
    }
    return;
  }

  const roots = await repository.listRoots();
  if (roots.length === 0) {
    console.log("No cached libraries to purge.");
    return;
  }

  for (const root of roots) {
    await repository.delete(root);
    console.log(`Purged: ${root}`);
  }
  console.log(`\nPurged ${roots.length} cached library(ies).`);
}
