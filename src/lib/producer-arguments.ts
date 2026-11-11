import type {
  Producer,
  ProducerArgument,
  ProducerArguments,
} from "#/types/producer";

function getDefaultProducerArguments(
  definitions: readonly ProducerArgument[] = [],
): ProducerArguments {
  return Object.fromEntries(
    definitions.map((argument) => {
      if (argument.default !== undefined) {
        return [argument.key, argument.default];
      }
      if (argument.type === "number") {
        return [argument.key, 0];
      }
      return [argument.key, ""];
    }),
  );
}

function getProducerArgumentDefaults(producer: Producer): ProducerArguments {
  return getDefaultProducerArguments(producer.args);
}

export { getDefaultProducerArguments, getProducerArgumentDefaults };
