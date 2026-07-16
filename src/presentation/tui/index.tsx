import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "#/app";
import { Providers } from "#/context/providers";

type LaunchTUIOptions = {
  initialFolder?: string;
};

export async function launchTUI(options: LaunchTUIOptions) {
  const renderer = await createCliRenderer({ exitOnCtrlC: false });

  createRoot(renderer).render(
    <Providers>
      <App initialFolder={options.initialFolder} />
    </Providers>,
  );
}
