import { message } from "@optique/core/message";
import { run } from "@optique/run";
import { createCLI, executeCLICommand } from "#/presentation/cli";
import { launchTUI } from "#/presentation/tui";
import { logger } from "#/utils/logger";
import { expandPath } from "#/utils/path";

async function main() {
  const invocation = await run(createCLI(), {
    brief: message`Music library tag management tool`,
    completion: "option",
    help: "option",
    programName: "tagwise",
    termWidth: "auto",
    version: "0.1.0",
  });

  if (typeof invocation === "string" || invocation === undefined) {
    const isPath =
      typeof invocation === "string" && /^(\/|\.\/|\.\.\/|~)/.test(invocation);
    launchTUI({
      initialFolder: isPath ? expandPath(invocation) : undefined,
    });
    return;
  }

  try {
    await executeCLICommand(invocation);
  } catch (error: unknown) {
    logger.error("Command failed", { error });
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
