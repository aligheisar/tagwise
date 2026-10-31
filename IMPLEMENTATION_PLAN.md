# Modular Architecture Implementation Plan

## Goals

- Keep producer generation, operation review, and filesystem effects in small,
  independently testable modules.
- Load trusted user-authored producer modules from the XDG config directory.
- Project producer proposals through a fake library and preserve operation
  order through review and apply.
- Make help available on every TUI screen and adopt termcn OpenTUI components.
- Provide unit, integration, and end-to-end test commands with CI enforcement.

## Progress

- [x] Extract operation review state transitions and statistics into a pure
  reducer.
- [x] Move apply orchestration behind injected filesystem and tag-writing
  functions; execute accepted operations in their declared sequence.
- [x] Extract sequential producer execution and project each proposal into an
  isolated fake-library snapshot before invoking the next producer.
- [x] Resolve user producer modules from
  `$XDG_CONFIG_HOME/tagwise/producers` (default `~/.config/tagwise/producers`),
  validate module exports, and isolate invalid plugins from built-ins.
- [x] Add global screen-aware help routing and global operation movement with
  visible sequence numbers.
- [x] Split Bun tests into unit, integration, and CLI end-to-end commands, add
  coverage reporting, and run each level in CI.
- [ ] Integrate termcn registry components. The documented shadcn registry
  command was attempted, but the environment could not establish TLS
  connections to the registry; do not disable certificate checks.
- [ ] Add a terminal-driven TUI end-to-end test for help, producer selection,
  review movement, rejection, and apply.
- [ ] Add a user producer example and expand documentation for ordering,
  projection, and plugin authoring.
- [ ] Add review-time preview replay for changed acceptance and operation order
  if a projected-library preview is exposed in the review UI.

## Module Boundaries

- `src/lib/operations/`: pure operation review state and ordering rules.
- `src/services/producer-pipeline.service.ts`: sequential producer orchestration
  over fake-library snapshots.
- `src/services/producer-loader.service.ts`: ESM discovery and contract checks
  for trusted user producer modules.
- `src/services/operation-apply.service.ts`: ordered, validated operation
  execution through injected adapters.
- `src/containers/`: composition of built-in producers, user plugins, and
  infrastructure services.
- `src/presentation/tui/`: screen rendering and input handling only; application
  logic stays outside React hooks where practical.

## Verification Gates

Run `bun run test:unit`, `bun run test:integration`, and `bun run test:e2e` for
focused failures, or `bun run test` for the aggregate suite. Run
`bun run test:coverage`, `bun run typecheck`, `bun run check`, and
`bun run audit:dependencies` before merging. CI runs all three test levels plus
type, style, and dependency checks.