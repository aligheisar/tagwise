# fixes
- if no cache list available focus on folder path input.
- closing tree item with `h` close nearest folder above.
- rejection and accept on folder should effect subfolders.
- cli file or folder input completions are not working fine (path input is not good).
- custom producers not showing up in the completions.
- changing the color and order of showing information about a song in review tab (index at end, muted color for non title info).

# features should be added

- progress bar for apply screen.
- use a way to handle completions so no manual completions adding
- producer create for tui.
- purge cache items in tui with `p` and `P` for purging all items with confirmation.
- removing custom producer in tui with confirmation.
- adding dynamic producer that receive inputs (like remove-from-title {text: ' (Remix)', trim: true}).
  - any custom producer should have this feature.
  - so we should make a interface for configuring it in a modal one method for each arg type like input for string, checkbox for boolean.
- producer select screen should be empty and allow to add producer even if it duplicated.
  - this will open the possibility of using producer with deferent args in a session.
  - we should have a empty layout allowing user to add producer with it own modal to configuring it.

# vision (next changes)

- local ai modification producer with custom instructions.
  - we connect to a ai using openai compatible api. configuring using tui and cli.
  - then we add a ai producer that allow to write custom instructions like (remove any watermark in the music tags like 'sound-snap') we can add some templates, and it should save the instructions for later.
  - we must include a dry run for the ai result for single song like when i open detail modal of a song if user selected and configure a ai producer it should be able to dispatch a dry run of ai producer to see what modifications it might do.
  - the ai producer should rely on tool calling.
  - it should see and change tags in a text format and batch mode so we show the hole library (or we might need paginate it for large libraries) with its tags to ai and we want to apply the user instructions and we take the output and compare it with original so we can define what have been changes.
  - the order is matter like other producers. so if we run the ai producer after another producer that change the artist tag we must handle it so the outcome of that send to an llm. (we not going to apply the prev producers on actual file but we only change the tags in the app memory so any modifications apply in the apply screen not in review)
- folder manipulations capabilities with usable tui to compare. 
- lyrics with use of `lrclib.org` as a producer. 
- ability of showing before after of some fields like artist, album and allowing to merge them.



# changes:
- handling some redundancy on backend not tui workflow.
  - presentation layer should only show not decide.