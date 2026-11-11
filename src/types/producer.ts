import type { ReadonlyLibrary } from "#/types/library";
import type { Operation } from "#/types/operation";

type ProducerArgument =
  | {
      default?: string;
      description?: string;
      key: string;
      title: string;
      type: "string";
    }
  | {
      default?: number;
      description?: string;
      key: string;
      title: string;
      type: "number";
    }
  | {
      default?: boolean;
      description?: string;
      key: string;
      title: string;
      type: "boolean";
    }
  | {
      default?: string;
      description?: string;
      key: string;
      options: { label: string; value: string }[];
      title: string;
      type: "select";
    };

type ProducerArguments = Record<string, string | number | boolean>;
type ProducerArgumentInputValues = Record<string, string | boolean>;

interface Producer {
  args?: ProducerArgument[];
  description?: string;
  name: string;
  produce(
    library: ReadonlyLibrary,
    args?: ProducerArguments,
  ): Promise<Operation[]>;
  title: string;
  version: string;
}

export type {
  Producer,
  ProducerArgument,
  ProducerArgumentInputValues,
  ProducerArguments,
};
