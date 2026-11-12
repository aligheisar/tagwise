import type {
  Producer,
  ProducerArgument,
  ProducerArguments,
} from "#/types/producer";

/** Resolves argument defaults and placeholders for required producer arguments. */
function getDefaultProducerArguments(
  definitions: readonly ProducerArgument[] = [],
): ProducerArguments {
  return Object.fromEntries(
    definitions.flatMap((argument) => {
      if (argument.default !== undefined) {
        return [[argument.key, argument.default]];
      }
      if (argument.required) {
        return [[argument.key, argument.type === "number" ? 0 : ""]];
      }
      return [];
    }),
  );
}

/** Returns the defaults declared by a producer, including required placeholders. */
function getProducerArgumentDefaults(producer: Producer): ProducerArguments {
  return getDefaultProducerArguments(producer.args);
}

export { getDefaultProducerArguments, getProducerArgumentDefaults };
