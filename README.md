# Tagwise

Tagwise scans music folders, reviews proposed tag and filename changes, and
applies the changes you approve.

## Requirements

- Bun 1.3 or later

## Install and run

```bash
bun install
bun run start
```

You can also use the CLI directly:

```bash
bun run src/main.ts scan ~/Music
bun run src/main.ts cache list
bun run src/main.ts run renamer ~/Music
bun run src/main.ts producer create
```

With no command, Tagwise starts the terminal interface. The TUI lets you scan
or select a cached library, review producers' proposed changes, and choose
which changes to apply.

## Configuration

All settings are optional and can be set as environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `XDG_CACHE_HOME` | `~/.cache` | Base directory for cached library scans. Tagwise stores its data in `tagwise/libraries` beneath this path. |
| `XDG_CONFIG_HOME` | `~/.config` | Base directory for user configuration. User producers are loaded from `tagwise/producers` beneath this path. |
| `TAGWISE_FILESYSTEM_CONCURRENCY` | `32` | Maximum filesystem entries checked concurrently while looking for library changes (1–256). |
| `TAGWISE_TAG_WRITE_CONCURRENCY` | `8` | Maximum parallel tag writes within a batch (1–256). |
| `TAGWISE_TAG_WRITE_BATCH_SIZE` | `128` | Number of tag updates submitted in one batch (1–4096). |

Cache files are written atomically with owner-only permissions. Remove an
individual cache with `bun run src/main.ts cache purge <folder>`, or clear all
caches with `bun run src/main.ts cache purge`.

## User producers

Add `.js`, `.mjs`, or `.ts` ESM modules to
`$XDG_CONFIG_HOME/tagwise/producers` (default: `~/.config/tagwise/producers`).
Each module must default-export an object with a unique, non-empty `name`, an
async `produce(library)` function, and optional `description` and `version`
strings. Producers return rename or tag-update operations; they do not apply
filesystem changes directly.

The `library` passed to a producer is a read-only snapshot of the current fake
library. Producers run in the selected order, and later producers see the
projected results of earlier proposals. User producers are trusted local code
and run in the Tagwise process with its permissions. Invalid modules are
reported and skipped; built-in and other valid producers remain available.

Run `bun run src/main.ts producer create` to scaffold a producer. The CLI asks
for its title, version, and description, creates a uniquely named `.ts` file,
and creates `producer-types.ts` beside the `producers` directory with the full
song-tag, library, and operation contracts. The small producer file imports
those types and provides an editable `produce` loop. Fill in the rules and
return operations to preview.

## Development

```bash
bun run test
bun run test:unit
bun run test:integration
bun run test:e2e
bun run test:coverage
bun run typecheck
bun run check
bun run audit:dependencies
```

`bun run audit:dependencies` checks installed dependencies for known advisories
at every severity. Run it regularly and update affected dependencies
when compatible fixes are available.
