import { createCLI } from "#/presentation/cli";
import { launchTUI } from "#/presentation/tui";
import { logger } from "#/utils/logger";
import { expandPath } from "#/utils/path";

const program = createCLI();

program.action((_, command) => {
  const folder = command.args[0];
  const isPath = folder && /^(\/|\.\/|\.\.\/|~)/.test(folder);

  launchTUI({
    initialFolder: isPath ? expandPath(folder) : undefined,
  });
});

program.parseAsync().catch((error: unknown) => {
  logger.error("Command failed", { error });
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
