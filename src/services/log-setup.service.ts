import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "#/config";
import { setLogSink } from "#/utils/logger";

function setupFileLogger(): void {
  setLogSink(() => {});
  try {
    const logDirectory = path.join(config.cacheDir, "tagwise", "logs");
    void mkdir(logDirectory, { mode: 0o700, recursive: true })
      .then(() => {
        const logStream = createWriteStream(
          path.join(logDirectory, "tagwise.log"),
          { flags: "a", mode: 0o600 },
        );
        logStream.on("error", () => {});
        setLogSink((line) => {
          logStream.write(line);
        });
      })
      .catch(() => {
        setLogSink(() => {});
      });
  } catch {
    setLogSink(() => {});
  }
}

export { setupFileLogger };
