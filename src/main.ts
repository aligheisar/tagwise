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

// Infrastructure
const scanner = new TaglibScanner();
const tagWriter = new TaglibTagWriter();
const filesystem = new NodeFilesystem();
const libraryRepository = new CacheLibraryRepository();

// Producers — add new producers here
const producers = new Map([
  ["renamer", new RenamerProducer()],
  ["remix", new RemixTagProducer()],
]);

// Application
const commandBus = new InMemoryCommandBus();
commandBus.register(
  ScanLibraryCommand,
  new ScanLibraryHandler(scanner, libraryRepository, filesystem),
);
commandBus.register(
  RunCommand,
  new RunHandler(libraryRepository, producers, filesystem, tagWriter),
);

// Presentation
const cli = createCLI(commandBus, [...producers.keys()], libraryRepository);
cli.parse();
