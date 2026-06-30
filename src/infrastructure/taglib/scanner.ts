import { scanFolder } from "taglib-wasm/folder";
import type { ScannerPort } from "@/domain/shared/ports";
import { mapScanResult } from "./mapper";

export class TaglibScanner implements ScannerPort {
  async scan(
    root: string,
    options?: {
      recursive?: boolean;
      continueOnError?: boolean;
      signal?: AbortSignal;
    },
  ) {
    const result = await scanFolder(root, {
      continueOnError: options?.continueOnError ?? true,
      includeProperties: false,
      recursive: options?.recursive ?? true,
      signal: options?.signal,
    });
    return mapScanResult(result);
  }
}
