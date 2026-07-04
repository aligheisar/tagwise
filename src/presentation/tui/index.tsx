import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "#/app";
import type { Producer } from "@/lib/producers/types";
import { Providers } from "@/presentation/tui/context/providers";
import type { LibraryRepository } from "@/repositories/library.repository";
import type { FilesystemService } from "@/services/filesystem.service";
import type { ScannerService } from "@/services/scanner.service";
import type { TagWriterService } from "@/services/tag-writer.service";

type LaunchTUIOptions = {
  scannerService: ScannerService;
  producerNames: string[];
  producers: Map<string, Producer>;
  libraryRepository: LibraryRepository;
  filesystem: FilesystemService;
  tagWriter: TagWriterService;
  initialFolder?: string;
};

export async function launchTUI(options: LaunchTUIOptions) {
  const renderer = await createCliRenderer({ exitOnCtrlC: false });

  createRoot(renderer).render(
    <Providers>
      <App
        filesystem={options.filesystem}
        initialFolder={options.initialFolder}
        libraryRepository={options.libraryRepository}
        producerNames={options.producerNames}
        producers={options.producers}
        scannerService={options.scannerService}
        tagWriter={options.tagWriter}
      />
    </Providers>,
  );
}
