import type { Dispatch, RefObject, SetStateAction } from "react";
import type { ProducerArguments } from "#/types/producer";
import type { UseOperationsReturn } from "@/hooks/use-operations";
import type { Screen } from "@/types/screen";

type ContextValues = {
  operations: UseOperationsReturn;
  screen: Screen;
  setScreen: Dispatch<SetStateAction<Screen>>;
  helpOpen: boolean;
  helpShortcutEnabled: boolean;
  setHelpShortcutEnabled: (enabled: boolean) => void;
  toggleHelp: () => void;
  abortScan: () => void;
  scanController: RefObject<AbortController>;
  handleScan: (folder: string) => Promise<void>;
  handleSelectCached: (root: string) => Promise<void>;
  handleProducerConfirm: (
    selectedProducers: string[],
    producerArguments: Record<string, ProducerArguments>,
  ) => Promise<void>;
  handleApplyFromReview: () => void;
};

export type { ContextValues };
