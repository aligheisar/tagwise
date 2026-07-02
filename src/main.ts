import { InMemoryCommandBus } from "@/application/buses/in-memory-command-bus";
import { InMemoryQueryBus } from "@/application/buses/in-memory-query-bus";
import { ListCachesHandler } from "@/application/manage-cache/list/handler";
import { ListCachesQuery } from "@/application/manage-cache/list/query";
import { PurgeCacheCommand } from "@/application/manage-cache/purge/command";
import { PurgeCacheHandler } from "@/application/manage-cache/purge/handler";
import { ShowCacheHandler } from "@/application/manage-cache/show/handler";
import { ShowCacheQuery } from "@/application/manage-cache/show/query";
import { RunCommand } from "@/application/run/command";
import { RunHandler } from "@/application/run/handler";
import { ScanLibraryCommand } from "@/application/scan-library/command";
import { ScanLibraryHandler } from "@/application/scan-library/handler";
import { CacheLibraryRepository } from "@/infrastructure/cache/library-repository";
import { NodeFilesystem } from "@/infrastructure/filesystem/fs-adapter";
import { RemixTagProducer } from "@/infrastructure/producers/remix-tag";
import { RenamerProducer } from "@/infrastructure/producers/renamer";
import { TaglibScanner } from "@/infrastructure/taglib/scanner";
import { TaglibTagWriter } from "@/infrastructure/taglib/tag-writer";
import { createCLI } from "@/presentation/cli";
import { launchTUI } from "@/presentation/tui";

const scanner = new TaglibScanner();
const tagWriter = new TaglibTagWriter();
const filesystem = new NodeFilesystem();
const libraryRepository = new CacheLibraryRepository();

const producers = new Map([
  ["renamer", new RenamerProducer()],
  ["remix", new RemixTagProducer()],
]);

const commandBus = new InMemoryCommandBus();
const queryBus = new InMemoryQueryBus();

commandBus.register(
  ScanLibraryCommand,
  new ScanLibraryHandler(scanner, libraryRepository, filesystem),
);
commandBus.register(
  RunCommand,
  new RunHandler(libraryRepository, producers, filesystem, tagWriter),
);
commandBus.register(
  PurgeCacheCommand,
  new PurgeCacheHandler(libraryRepository),
);

queryBus.register(ListCachesQuery, new ListCachesHandler(libraryRepository));
queryBus.register(ShowCacheQuery, new ShowCacheHandler(libraryRepository));

const args = process.argv.slice(2);
const hasSubcommand = [
  "scan",
  "run",
  "cache",
  "completion",
  "--help",
  "-h",
  "--version",
  "-v",
].some((cmd) => args.includes(cmd));

function expandPath(p: string): string {
  if (p.startsWith("~")) {
    return p.replace("~", process.env.HOME ?? "");
  }
  return p;
}

if (!hasSubcommand) {
  const folderArg = args[0];
  const isPath =
    folderArg &&
    (folderArg.startsWith("/") ||
      folderArg.startsWith("./") ||
      folderArg.startsWith("../") ||
      folderArg.startsWith("~"));

  if (isPath) {
    launchTUI({
      commandBus,
      filesystem,
      initialFolder: expandPath(folderArg),
      libraryRepository,
      producerNames: [...producers.keys()],
      producers,
      tagWriter,
    });
  } else if (args.length === 0) {
    launchTUI({
      commandBus,
      filesystem,
      libraryRepository,
      producerNames: [...producers.keys()],
      producers,
      tagWriter,
    });
  } else {
    createCLI(commandBus, queryBus, [...producers.keys()]).parse();
  }
} else {
  createCLI(commandBus, queryBus, [...producers.keys()]).parse();
}
