import path from "node:path";
import type { Library } from "#/types/library";
import type { Operation } from "#/types/operation";
import type { Producer, ProducerArguments } from "#/types/producer";

type ArtistTagMode = "split" | "combine";

const artistFields = ["artist", "albumArtist"] as const;
const supportedExtensions = new Set([".flac", ".mp3", ".m4a", ".mp4"]);

/** Splits artist values by format-specific separators and normalizes MP3 values. */
function splitValues(values: readonly string[], isMp3: boolean): string[] {
  const separator = isMp3 ? /[,;]/ : /,/;
  const split = values.flatMap((value) =>
    value
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean),
  );
  return isMp3 ? [...new Set(split)].sort() : split;
}

class ArtistTagSeparatorProducer implements Producer {
  readonly description: string;
  readonly name: string;
  readonly title: string;
  readonly version = "1.0.0";
  readonly args?: Producer["args"];

  /** Creates a split or combine producer with its registered display metadata. */
  constructor(private readonly mode: ArtistTagMode) {
    this.name = `${mode}-artist-tags`;
    this.title = mode === "split" ? "Split Artist Tags" : "Combine Artist Tags";
    this.description =
      mode === "split"
        ? "Split comma-separated artist and album artist tags into multiple values."
        : "Join multiple artist and album artist values with commas.";
    if (mode === "combine") {
      this.args = [
        {
          default: ", ",
          description: "Text inserted between artist values.",
          key: "separator",
          title: "Join character",
          type: "string",
        },
      ];
    }
  }

  /** Proposes artist tag updates for supported files without changing the library. */
  produce(
    library: Library,
    args: ProducerArguments = {},
  ): Promise<Operation[]> {
    const operations: Operation[] = [];

    for (const item of library.items) {
      if (item.status === "error") continue;

      const extension = path.extname(item.path).toLowerCase();
      if (!supportedExtensions.has(extension)) continue;

      const isMp3 = extension === ".mp3";
      const tags: Record<string, string | string[]> = {};

      for (const field of artistFields) {
        const values = item.tags[field];
        if (!values?.length) continue;

        if (this.mode === "split") {
          const split = splitValues(values, isMp3);
          if (
            split.length !== values.length ||
            split.some((value, index) => value !== values[index])
          ) {
            tags[field] = split;
          }
        } else if (values.length > 1) {
          const separator =
            typeof args.separator === "string" ? args.separator : ", ";
          tags[field] = values.join(separator);
        }
      }

      if (Object.keys(tags).length === 0) continue;

      operations.push({
        id: `${this.name}-${item.path}`,
        path: item.path,
        producedBy: this.name,
        tags,
        type: "tag-update",
      });
    }

    return Promise.resolve(operations);
  }
}

export { ArtistTagSeparatorProducer };
