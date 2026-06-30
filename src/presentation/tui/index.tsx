import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "#/app";
import type { LibraryRepository } from "@/domain/media-item/repository";
import type { Producer } from "@/domain/producer/entity";
import type { CommandBus } from "@/domain/shared/command-bus";
import type { FilesystemPort, TagWriterPort } from "@/domain/shared/ports";

type LaunchTUIOptions = {
  commandBus: CommandBus;
  producerNames: string[];
  producers: Map<string, Producer>;
  libraryRepository: LibraryRepository;
  filesystem: FilesystemPort;
  tagWriter: TagWriterPort;
  initialFolder?: string;
};

export async function launchTUI(options: LaunchTUIOptions) {
  const renderer = await createCliRenderer({ exitOnCtrlC: false });

  createRoot(renderer).render(
    <App
      commandBus={options.commandBus}
      filesystem={options.filesystem}
      initialFolder={options.initialFolder}
      libraryRepository={options.libraryRepository}
      producerNames={options.producerNames}
      producers={options.producers}
      tagWriter={options.tagWriter}
    />,
  );
}
