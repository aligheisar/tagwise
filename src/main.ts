import { createContainer } from "@/containers";
import { createCLI } from "@/presentation/cli";
import { launchTUI } from "@/presentation/tui";

const container = createContainer();

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
      filesystem: container.filesystem,
      initialFolder: expandPath(folderArg),
      libraryRepository: container.libraryRepository,
      producerNames: [...container.producers.keys()],
      producers: container.producers,
      scannerService: container.scannerService,
      tagWriter: container.tagWriter,
    });
  } else if (args.length === 0) {
    launchTUI({
      filesystem: container.filesystem,
      libraryRepository: container.libraryRepository,
      producerNames: [...container.producers.keys()],
      producers: container.producers,
      scannerService: container.scannerService,
      tagWriter: container.tagWriter,
    });
  } else {
    createCLI(
      container.scannerService,
      container.runService,
      container.cacheService,
      [...container.producers.keys()],
    ).parse();
  }
} else {
  createCLI(
    container.scannerService,
    container.runService,
    container.cacheService,
    [...container.producers.keys()],
  ).parse();
}
