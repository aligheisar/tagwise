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
      if (argument.type === "select") {
        return [argument.key, argument.options[0]?.value ?? ""];
      }
      if (argument.type === "number") {
        return [argument.key, 0];
      }
      if (argument.type === "boolean") {
        return [argument.key, false];
      }
      return [argument.key, ""];
    }),
  );
}

function getProducerArgumentDefaults(producer: Producer): ProducerArguments {
  return getDefaultProducerArguments(producer.args);
}

export { getDefaultProducerArguments, getProducerArgumentDefaults };
