import { Command } from "commander";
import type { CacheService } from "@/services/cache.service";
import type { RunService } from "@/services/run.service";
import type { ScannerService } from "@/services/scanner.service";

const COMPLETION_SCRIPT = `#!/bin/bash
_tagwise_completions() {
  local cur prev commands producers cache_subs
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  commands="scan run cache completion"
  producers="renamer remix"
  cache_subs="list show purge"

  if [[ \${cur} == -* ]]; then
    COMPREPLY=( $(compgen -W "--help --version" -- \${cur}) )
    return 0
  fi

  case \${COMP_CWORD} in
    1) COMPREPLY=( $(compgen -W "\${commands}" -- \${cur}) ) ;;
    2)
      case "\${COMP_WORDS[1]}" in
        run) COMPREPLY=( $(compgen -W "\${producers}" -- \${cur}) ) ;;
        scan) _tagwise_complete_folders "\${cur}" ;;
        cache) COMPREPLY=( $(compgen -W "\${cache_subs}" -- \${cur}) ) ;;
      esac
      ;;
    3)
      case "\${COMP_WORDS[1]}" in
        run) _tagwise_complete_folders "\${cur}" ;;
        cache)
          case "\${COMP_WORDS[2]}" in
            show|purge) _tagwise_complete_folders "\${cur}" ;;
          esac
          ;;
      esac
      ;;
  esac
}

_tagwise_complete_folders() {
  local cur="$1"
  local dir
  if [[ -z "\${cur}" ]]; then
    dir="."
  else
    dir="$(dirname "\${cur}")"
  fi
  local folders=$(find "\${dir}" -maxdepth 1 -type d -name "$(basename \${cur})*" 2>/dev/null | sed "s|^\${dir}/||")
  COMPREPLY=( $(compgen -W "\${folders}" -- \${cur}) )
}

complete -F _tagwise_completions tagwise
`;

async function cacheList(cacheService: CacheService) {
  const result = await cacheService.list();

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

async function cacheShow(cacheService: CacheService, folder: string) {
  const result = await cacheService.show(folder);

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

async function cachePurge(cacheService: CacheService, folder?: string) {
  await cacheService.purge(folder);

  if (folder) {
    console.log(`Purged cache for: ${folder}`);
  } else {
    console.log("Purged all cached libraries.");
  }
}

export function createCLI(
  scannerService: ScannerService,
  runService: RunService,
  cacheService: CacheService,
  producerNames: string[],
): Command {
  const program = new Command();
  program
    .name("tagwise")
    .description("Music library tag management tool")
    .version("0.1.0");

  program
    .command("scan")
    .description("Scan a folder and cache the library")
    .argument("<folder>", "Path to the music folder")
    .action(async (folder: string) => {
      await scannerService.scan(folder);
    });

  program
    .command("run")
    .description("Run a producer on a cached library")
    .argument(
      "<producer>",
      `Producer to run (${producerNames.join(", ")})`,
      (value) => {
        if (!producerNames.includes(value)) {
          throw new Error(
            `Unknown producer: ${value}. Available: ${producerNames.join(", ")}`,
          );
        }
        return value;
      },
    )
    .argument("<folder>", "Path to the music folder")
    .action(async (producer: string, folder: string) => {
      await scannerService.scan(folder);
      await runService.run(producer, folder);
    });

  const cache = program.command("cache").description("Manage cached libraries");

  cache
    .command("list")
    .description("List all cached libraries")
    .action(async () => {
      await cacheList(cacheService);
    });

  cache
    .command("show")
    .description("Show details of a cached library")
    .argument("<folder>", "Path to the music folder")
    .action(async (folder: string) => {
      await cacheShow(cacheService, folder);
    });

  cache
    .command("purge")
    .description("Delete cached library (all or specific folder)")
    .argument("[folder]", "Path to the music folder (omit to purge all)")
    .action(async (folder?: string) => {
      await cachePurge(cacheService, folder);
    });

  program
    .command("completion")
    .description("Output shell completion script")
    .action(() => {
      process.stdout.write(COMPLETION_SCRIPT);
    });

  return program;
}
