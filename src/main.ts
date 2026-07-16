import { createCLI } from "@/presentation/cli";
import { launchTUI } from "@/presentation/tui";
import { expandPath } from "@/utils/path";

const program = createCLI();

program.action((_, command) => {
  const folder = command.args[0];
  const isPath = folder && /^(\/|\.\/|\.\.\/|~)/.test(folder);

  launchTUI({
    initialFolder: isPath ? expandPath(folder) : undefined,
  });
});

program.parse();
