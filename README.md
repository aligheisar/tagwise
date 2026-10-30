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
```

With no command, Tagwise starts the terminal interface. The TUI lets you scan
or select a cached library, review producers' proposed changes, and choose
which changes to apply.

## Configuration

All settings are optional and can be set as environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `XDG_CACHE_HOME` | `~/.cache` | Base directory for cached library scans. Tagwise stores its data in `tagwise/libraries` beneath this path. |
| `TAGWISE_FILESYSTEM_CONCURRENCY` | `32` | Maximum filesystem entries checked concurrently while looking for library changes (1–256). |
| `TAGWISE_TAG_WRITE_CONCURRENCY` | `8` | Maximum parallel tag writes within a batch (1–256). |
| `TAGWISE_TAG_WRITE_BATCH_SIZE` | `128` | Number of tag updates submitted in one batch (1–4096). |

Cache files are written atomically with owner-only permissions. Remove an
individual cache with `bun run src/main.ts cache purge <folder>`, or clear all
caches with `bun run src/main.ts cache purge`.

## Development

```bash
bun run test
bun run typecheck
bun run check
bun run audit:dependencies
```

`bun run audit:dependencies` checks installed dependencies for known advisories
at every severity. Run it regularly and update affected dependencies
when compatible fixes are available.
