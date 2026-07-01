import { ListCachesQuery } from "@/application/manage-cache/list/query";
import { PurgeCacheCommand } from "@/application/manage-cache/purge/command";
import { ShowCacheQuery } from "@/application/manage-cache/show/query";
import type { CommandBus } from "@/domain/shared/command-bus";
import type { QueryBus } from "@/domain/shared/query-bus";
import type { CacheListResult, CacheShowResult } from "@/domain/shared/result";

export async function cacheList(queryBus: QueryBus) {
  const result = await queryBus.execute<ListCachesQuery, CacheListResult>(
    new ListCachesQuery(),
  );

  if (result.total === 0) {
    console.log("No cached libraries.");
    return;
  }

  console.log(`Cached libraries (${result.total}):\n`);

  for (const lib of result.libraries) {
    console.log(`  ${lib.root}`);
    console.log(
      `    ${lib.itemCount} file(s) (${lib.okCount} ok, ${lib.errorCount} errors)`,
    );
    console.log(`    cached at: ${lib.cachedAt.toISOString()}`);
    console.log();
  }
}

export async function cacheShow(queryBus: QueryBus, folder: string) {
  const result = await queryBus.execute<ShowCacheQuery, CacheShowResult>(
    new ShowCacheQuery(folder),
  );

  if (!result) {
    console.error(`No cache found for: ${folder}`);
    process.exit(1);
  }

  const okItems = result.items.filter((i) => i.status === "ok");
  const errorItems = result.items.filter((i) => i.status === "error");

  console.log(`Root:       ${result.root}`);
  console.log(`Cached at:  ${result.cachedAt.toISOString()}`);
  console.log(`Total:      ${result.items.length} file(s)`);
  console.log(`OK:         ${okItems.length}`);
  console.log(`Errors:     ${errorItems.length}`);

  if (errorItems.length > 0) {
    console.log("\nErrors:");
    for (const item of errorItems) {
      console.log(`  ${item.path}: ${item.error}`);
    }
  }
}

export async function cachePurge(commandBus: CommandBus, folder?: string) {
  await commandBus.execute(new PurgeCacheCommand(folder));

  if (folder) {
    console.log(`Purged cache for: ${folder}`);
  } else {
    console.log("Purged all cached libraries.");
  }
}
