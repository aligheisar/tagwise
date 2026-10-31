import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { config } from "#/config";
import { setLogSink } from "#/utils/logger";
import { App } from "@/app";
import { Providers } from "@/context/providers";

type LaunchTUIOptions = {
  initialFolder?: string;
};

export async function launchTUI(options: LaunchTUIOptions) {
  const logDirectory = path.join(config.cacheDir, "tagwise", "logs");
  setLogSink(() => {});
  try {
    await mkdir(logDirectory, { mode: 0o700, recursive: true });
    const logStream = createWriteStream(
      path.join(logDirectory, "tagwise.log"),
      { flags: "a", mode: 0o600 },
    );
    logStream.on("error", () => {});
    setLogSink((line) => {
      logStream.write(line);
    });
  } catch {
    setLogSink(() => {});
  }

  const renderer = await createCliRenderer({ exitOnCtrlC: true });

  createRoot(renderer).render(
    <Providers initialFolder={options.initialFolder}>
      <App />
    </Providers>,
  );
}
