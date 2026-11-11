import { getDefaultProducerArguments } from "#/lib/producer-arguments";
import type {
  Producer,
  ProducerArgument,
  ProducerArgumentInputValues,
  ProducerArguments,
} from "#/types/producer";

function toProducerArgumentInputValues(
  producer: Producer,
): ProducerArgumentInputValues {
  return Object.fromEntries(
    Object.entries(getDefaultProducerArguments(producer.args)).map(
      ([key, value]) => [
        key,
        typeof value === "boolean" ? value : String(value),
      ],
    ),
  );
}

function resolveProducerArgumentValues(
  producer: Producer,
  values: ProducerArgumentInputValues,
): ProducerArguments {
  return Object.fromEntries(
    (producer.args ?? []).map((argument: ProducerArgument) => {
      const value = values[argument.key];
      if (argument.type === "number") {
        const number = Number(value);
        if (
          typeof value !== "string" ||
          value.trim() === "" ||
          !Number.isFinite(number)
        ) {
          throw new Error(`"${argument.title}" must be a valid number`);
        }
        return [argument.key, number];
      }
      if (argument.type === "boolean") {
        return [argument.key, value === true];
      }
      if (
        argument.type === "select" &&
        !argument.options.some((option) => option.value === value)
      ) {
        throw new Error(`Choose a valid option for "${argument.title}"`);
      }
      return [argument.key, value ?? ""];
    }),
  );
}

export { resolveProducerArgumentValues, toProducerArgumentInputValues };
