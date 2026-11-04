## Concepts

- **Producer**: a function that takes a song library tags and returns changes. Example: `add-remix-producer` appends `" (Remix)"` to the title.
- **Pipeline**: an ordered list of producer *instances* for the current session. Order matters, because each producer sees the output of the previous one.
- **Review**: shows the proposed changes per song and per folder. Nothing is written to disk here.
- **Apply**: the only step that writes to files.

---

## 1. Fixes

**Navigation and input**
- [x] No cache list available: focus the folder path input on start.
- [x] `h` on a tree item: collapse the nearest open folder above and move the selection to it.
- [x] Fix path input in the CLI (file and folder completions misbehave).
- [x] Case insensitive autocomplete for scan folder input.

**Review tab**
- [x] Accepting or rejecting a folder cascades to all subfolders and files.
- [x] Accepting or rejecting on folder itself should cascades to all folders and files
- [x] Redesign the song info rows:
  - the title is the primary
  - the index moves to the end of the row with muted color
  - other info should be muted too

**Producers**
- [x] Add List and Purge for Producers in cli.

---

## 2. Features

### 2.1 Producer registry and parameters (foundation)

Define every producer once, with a declarative parameter schema. The CLI, the TUI and the completions are all generated from it.

```ts
defineProducer({
  id: "remove-from-title",
  label: "Remove text from title",
  params: {
    text: { type: "string", label: "Text", default: " (Remix)" },
    trim: { type: "boolean", label: "Trim result", default: true },
  },
  run: (tags, { text, trim }) => ({ title: /* ... */ }),
});
```

- [ ] Replace the hand-written completions with ones generated from the registry (producer ids, param names, enum values).
- [ ] Every producer, built-in or custom, can declare params.
- [ ] CLI: `--text ' (Remix)' --trim`.
- [ ] TUI: auto-generated config modal with one widget per param type (`string` → input, `boolean` → checkbox, `enum` → select, `number` → number input).
- [ ] A custom producer is a saved preset: a base producer plus fixed args plus a name.

### 2.2 Pipeline screen (TUI)

- [ ] The producer select screen starts empty. Users add producers from a picker, and each one opens its config modal.
- [ ] The same producer can be added more than once with different args (for example, two `remove-from-title` steps).
- [ ] Reorder and remove steps, and show each step's args inline (`remove-from-title · text=" (Remix)", trim`).
- [ ] Each step gets an instance id, so it is not confused with the producer id.

### 2.3 Custom producer management (TUI)

- [ ] Create a producer from the TUI, using the same config modal as 2.1.
- [ ] Remove a custom producer, with a confirmation.

### 2.4 Cache

- [ ] `p`: purge the selected cache item.
- [ ] `P`: purge all items, with a confirmation that shows the count.

### 2.5 Apply screen

- [ ] Progress bar showing done/total, the current file, and errors collected so far.
- [ ] Show a summary at the end (changed, skipped, failed).

---

## 3. Vision

### 3.1 AI producer

An OpenAI-compatible endpoint, so it works with Ollama, LM Studio, vLLM and hosted APIs. Configurable from both the CLI and the TUI.

**Setup and instructions**
- [ ] Config: base URL, model, API key (env var or config file), timeout.
- [ ] A producer with free-text instructions, for example "remove any watermark like 'sound-snap' from tags".
- [ ] Instruction templates (clean watermarks, fix casing, normalize featuring) plus saved instructions for reuse.

**How it works**
- [ ] The AI never touches files. It works on the in-memory tags after the earlier producers have run, so producer order is respected (an AI step after an artist-changing step sees the new artist).
- [ ] Use tool calling instead of parsing free text. The model returns structured changes, for example `set_tags(id, { field: value })`, and only for songs it actually changes.
- [ ] Send tags in a compact text format (TSV or one line per song with a stable id).
- [ ] Batch by token budget, so large libraries are paginated automatically.
- [ ] Diff the output against the original to produce the change set, and validate it (unknown ids, unknown fields and empty values are rejected).
- [ ] Some tasks need the whole library (for example, normalizing artist name variants). Consider a first pass that sends only the distinct values of a field.

**Dry run**
- [ ] From the song detail modal, run the AI producer on that single song and show the proposed diff before committing to a full run.
- [ ] Cache results by (instructions, input tags, model) so repeat runs are free.

### 3.2 Lyrics producer (lrclib.org)

- [ ] Fetch lyrics by title, artist, album and duration.
- [ ] Prefer synced lyrics, with a plain-text fallback.
- [ ] Decide where to store the result: the lyrics tag or a `.lrc` sidecar file.
- [ ] Rate limiting and caching of both hits and misses.

### 3.3 Folder tools

- [ ] Two-pane TUI to compare folders: missing files, duplicates and tag differences.
- [ ] Rename and move files from a tag-based pattern (`{artist}/{album}/{track} {title}`).

### 3.4 Before and after fields

- [ ] A field view (artist, album) that lists each distinct original value next to the new one.
- [ ] Merge variants into one canonical value (for example "Beyonce" and "Beyoncé"), applied to every affected song.

---

## Suggested order

1. Fixes (small wins, and they remove daily friction).
2. 2.1 Registry and params, then 2.2 Pipeline screen. Everything else depends on these.
3. 2.3 to 2.5 (cache, custom producers, apply progress).
4. Vision items, starting with 3.4 (cheap) and 3.2 (a self-contained producer). Then 3.1 (AI), which builds on the registry, the pipeline and the in-memory tag overlay.

## Open questions

- Should presets live in one config file or one file per producer?
- For lyrics, is a sidecar `.lrc` file preferable to embedding in the tag?
- Should the AI producer be allowed to change fields other than the ones the user selects for it?