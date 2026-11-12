import type { ReadonlyLibrary } from "#/types/library";
import type { Operation } from "#/types/operation";

type SelectOption = { label: string; value: string };
type ProducerArgument<
  SelectOptions extends readonly SelectOption[] = readonly SelectOption[],
> =
  | {
      default?: string;
      description?: string;
      key: string;
      required?: boolean;
      title: string;
      type: "string";
    }
  | {
      default?: number;
      description?: string;
      key: string;
      required?: boolean;
      title: string;
      type: "number";
    }
  | {
      default: boolean;
      description?: string;
      key: string;
      required?: boolean;
      title: string;
      type: "boolean";
    }
  | {
      default: SelectOptions[number]["value"];
      description?: string;
      key: string;
      options: SelectOptions;
      required?: boolean;
      title: string;
      type: "select";
    };

type ProducerArgumentValue<Argument extends ProducerArgument> =
  Argument extends { type: "number" }
    ? number
    : Argument extends { type: "boolean" }
      ? boolean
      : Argument extends {
            options: readonly { value: infer Value extends string }[];
            type: "select";
          }
        ? Value
        : string;

type ProducerArguments<
  Arguments extends readonly ProducerArgument[] | null = null,
> = Arguments extends readonly ProducerArgument[]
  ? {
      [Argument in Arguments[number] as Argument extends { required: true }
        ? Argument["key"]
        : Argument extends { default: unknown }
          ? Argument["key"]
          : never]: ProducerArgumentValue<Argument>;
    } & {
      [Argument in Arguments[number] as Argument extends { required: true }
        ? never
        : Argument extends { default: unknown }
          ? never
          : Argument["key"]]?: ProducerArgumentValue<Argument>;
    }
  : Record<string, string | number | boolean>;

type ValidProducerArguments<Arguments extends readonly ProducerArgument[]> = {
  [Index in keyof Arguments]: Arguments[Index] extends {
    default: infer Default;
    options: infer Options extends readonly SelectOption[];
    type: "select";
  }
    ? Default extends Options[number]["value"]
      ? Arguments[Index]
      : never
    : Arguments[Index];
};

type ProducerArgumentInputValues = Record<string, string | boolean>;

type ProducerOperationValue<SpecificOperation> =
  SpecificOperation extends Operation
    ? Omit<SpecificOperation, "producedBy"> & { producedBy?: string }
    : never;
type ProducerOperation = ProducerOperationValue<Operation>;

interface Producer<
  Arguments extends readonly ProducerArgument[] | null = null,
> {
  args?: Arguments extends readonly ProducerArgument[]
    ? Arguments
    : readonly ProducerArgument[];
  description?: string;
  name: string;
  produce(
    library: ReadonlyLibrary,
    args: ProducerArguments<Arguments>,
  ): Promise<ProducerOperation[]>;
  title: string;
  version: string;
}

/** Defines a producer and infers the argument types from its definitions. */
function defineProducer<
  const Arguments extends readonly ProducerArgument[] = readonly [],
>(
  producer: Producer<Arguments> & {
    args?: Arguments & ValidProducerArguments<Arguments>;
  },
): Producer<Arguments>;
function defineProducer(producer: Producer): Producer {
  return producer;
}

export type {
  Producer,
  ProducerArgument,
  ProducerArgumentInputValues,
  ProducerArguments,
  ProducerOperation,
};
export { defineProducer };
