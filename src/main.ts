import { InMemoryCommandBus } from "@/application/buses/in-memory-command-bus";
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
commandBus.register(
  ScanLibraryCommand,
  new ScanLibraryHandler(scanner, libraryRepository, filesystem),
);
commandBus.register(
  RunCommand,
  new RunHandler(libraryRepository, producers, filesystem, tagWriter),
);

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
    createCLI(commandBus, [...producers.keys()], libraryRepository).parse();
  }
} else {
  createCLI(commandBus, [...producers.keys()], libraryRepository).parse();
}
