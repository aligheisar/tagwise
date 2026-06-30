import { Command } from "commander";
import { RunCommand } from "@/application/run/command";
import { ScanLibraryCommand } from "@/application/scan-library/command";
import type { CommandBus } from "@/domain/shared/command-bus";
import type { CacheLibraryRepository } from "@/infrastructure/cache/library-repository";
import {
  cacheList,
  cachePurge,
  cacheShow,
} from "@/presentation/cache-commands";

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

export function createCLI(
  commandBus: CommandBus,
  producerNames: string[],
  libraryRepository: CacheLibraryRepository,
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
      await commandBus.execute(new ScanLibraryCommand(folder));
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
      await commandBus.execute(new RunCommand(producer, folder));
    });

  const cache = program.command("cache").description("Manage cached libraries");

  cache
    .command("list")
    .description("List all cached libraries")
    .action(async () => {
      await cacheList(libraryRepository);
    });

  cache
    .command("show")
    .description("Show details of a cached library")
    .argument("<folder>", "Path to the music folder")
    .action(async (folder: string) => {
      await cacheShow(libraryRepository, folder);
    });

  cache
    .command("purge")
    .description("Delete cached library (all or specific folder)")
    .argument("[folder]", "Path to the music folder (omit to purge all)")
    .action(async (folder?: string) => {
      await cachePurge(libraryRepository, folder);
    });

  program
    .command("completion")
    .description("Output shell completion script")
    .action(() => {
      process.stdout.write(COMPLETION_SCRIPT);
    });

  return program;
}
