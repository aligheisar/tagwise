# Copilot instructions for Tagwise

## Build, test, and lint

Use Bun for all project commands; the repo is configured as a Bun + TypeScript ESM application.

- Install dependencies: `bun install`
- Run the app: `bun run start` or `bun run src/main.ts`
- Lint: `bun run check`
- Auto-fix lint/format issues: `bun run check:fix`
- Type-check: `bun run typecheck`
- Format files with Biome: `bun run format`
- Full test suite: `bun run test`
- Targeted suites:
  - `bun run test:unit`
  - `bun run test:integration`
  - `bun run test:e2e`
- Coverage: `bun run test:coverage`

Run a single test file directly with Bun:

```bash
bun test tests/path.test.ts
bun test tests/producer-loader.test.ts
bun test tests/cli.integration.test.ts
```

For a single named case in a file:

```bash
bun test tests/producer-loader.test.ts --filter "loads valid ESM modules"
```

## Repository architecture

The project combines a CLI and a terminal UI around a common library/producer pipeline.

- `src/main.ts` is the entry point. It parses the CLI and either launches the TUI or executes a specific subcommand.
- `src/presentation/cli.ts` defines the command surface with `@optique/*` primitives (`scan`, `cache`, `producer`, and `version`).
- `src/presentation/tui/` contains the React/OpenTUI screens and hooks for the interactive review/apply workflow.
- `src/services/` contains orchestration logic for scanning folders, loading producers, running the producer pipeline, and applying operations.
- `src/repositories/` stores persisted state and cached library data; `LibraryRepository` is the main persistence boundary for scanned music folders.
- `src/lib/` contains the mutable library model and operation-state helpers used by the producer pipeline and review flow.
- `src/types/` defines the library, producer, and operation contracts.
- `src/config.ts` centralizes cache/config directory resolution from environment variables (`XDG_CACHE_HOME`, `XDG_CONFIG_HOME`, and `TAGWISE_*` concurrency settings).

The app flow is:

1. Scan a folder to build a `Library` snapshot.
2. Cache the snapshot in `~/.cache/tagwise/libraries` or `$XDG_CACHE_HOME/tagwise/libraries`.
3. Load user/built-in producers from `$XDG_CONFIG_HOME/tagwise/producers`.
4. Run the producer pipeline against a mutable snapshot and collect operations.
5. Review/apply the operations through the TUI or CLI workflow.

## Key codebase conventions

- This repo uses strict TypeScript (`strict: true`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`) and Bun’s ESM runtime.
- Prefer `node:*` imports for filesystem and path work, and keep the repo’s path alias conventions intact: `#/` resolves to `src/*`, and `@/` resolves to `src/presentation/tui/*`.
- Keep the layering clean: presentation code should call services and repositories, not do filesystem or domain logic inline.
- Custom producers are trusted local code. They must default-export an object with a non-empty `name` and an async `produce(library)` function; invalid modules are skipped, but valid ones continue to run.
- Producer modules return arrays of operations such as `rename` and `tag-update`; they do not write files directly. The pipeline in `src/services/producer-pipeline.service.ts` validates no-op updates and adds producer metadata before the operations are reviewed/applied.
- Cache entries are stored as normalized paths using a stable root-to-filename encoding and are written atomically with restricted permissions. Preserve the existing path normalization behavior when working in the cache and filesystem code.
- Biome is the source of formatting and linting rules. In practice this means imports and object keys are kept sorted, and the repo expects the auto-organized import style that `biome check` enforces.
- User-facing configuration and file paths use the XDG directories by default, and path expansion (`~`) is handled consistently before filesystem operations.

## Project-specific rules from the repo docs

- Tagwise scans music folders and lets the user review proposed tag/name changes before applying them.
- User producers live in `$XDG_CONFIG_HOME/tagwise/producers` and can be scaffolded with `bun run src/main.ts producer create`.
- Built-in producers and valid user producers remain available even when some custom modules are broken.
- The TUI is the main review interface; CLI commands are mainly for scanning, viewing cached libraries, and managing producers.
