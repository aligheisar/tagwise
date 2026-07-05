import { createContainer } from "@/containers";
import { createCLI } from "@/presentation/cli";
import { launchTUI } from "@/presentation/tui";

function expandPath(p: string): string {
  return p.startsWith("~") ? p.replace("~", process.env.HOME ?? "") : p;
}

const container = createContainer();
const program = createCLI(
  container.scannerService,
  container.runService,
  container.cacheService,
  [...container.producers.keys()],
);

program.action((_, command) => {
  const folder = command.args[0];
  const isPath = folder && /^(\/|\.\/|\.\.\/|~)/.test(folder);

  launchTUI({
    filesystem: container.filesystem,
    initialFolder: isPath ? expandPath(folder) : undefined,
    libraryRepository: container.libraryRepository,
    producerNames: [...container.producers.keys()],
    producers: container.producers,
    scannerService: container.scannerService,
    tagWriter: container.tagWriter,
  });
});

program.parse();
