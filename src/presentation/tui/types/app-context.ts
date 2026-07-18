import type { Dispatch, RefObject, SetStateAction } from "react";
import type { UseOperationsReturn } from "#/hooks/use-operations";
import type { Screen } from "#/types/screen";

type ContextValues = {
  folder: string | null;
  scanError: string | null;
  operations: UseOperationsReturn;
  screen: Screen;
  setScreen: Dispatch<SetStateAction<Screen>>;
  abortScan: () => void;
  scanController: RefObject<AbortController>;
  handleScan: (folder: string) => Promise<void>;
  handleSelectCached: (root: string) => Promise<void>;
  handleProducerConfirm: (selectedProducers: Set<string>) => Promise<void>;
  handleApplyFromReview: () => void;
};

export type { ContextValues };
