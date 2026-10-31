import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { setupFileLogger } from "#/services/log-setup.service";
import { App } from "@/app";
import { Providers } from "@/context/providers";

type LaunchTUIOptions = {
  initialFolder?: string;
};

export async function launchTUI(options: LaunchTUIOptions) {
  setupFileLogger();

  const renderer = await createCliRenderer({ exitOnCtrlC: true });

  createRoot(renderer).render(
    <Providers initialFolder={options.initialFolder}>
      <App />
    </Providers>,
  );
}
