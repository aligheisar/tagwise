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
      options: readonly { label: string; value: string }[];
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
      [Argument in Arguments[number] as Argument["key"]]?: ProducerArgumentValue<Argument>;
    }
  : Record<string, string | number | boolean>;

type ProducerArgumentInputValues = Record<string, string | boolean>;

interface Producer<
  Arguments extends readonly ProducerArgument[] | null = null,
> {
  args?: Arguments extends readonly ProducerArgument[]
    ? Arguments
    : ProducerArgument[];
  description?: string;
  name: string;
  produce(
    library: ReadonlyLibrary,
    args?: ProducerArguments<Arguments>,
  ): Promise<Operation[]>;
  title: string;
  version: string;
}

function defineProducer<const Arguments extends readonly ProducerArgument[]>(
  producer: Producer<Arguments> & { args: Arguments },
): Producer<Arguments>;
function defineProducer(producer: Producer): Producer;
function defineProducer(producer: Producer): Producer {
  return producer;
}

export type {
  Producer,
  ProducerArgument,
  ProducerArgumentInputValues,
  ProducerArguments,
};
export { defineProducer };
