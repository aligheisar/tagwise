import { describe, expect, test } from "bun:test";
import { readPositiveInteger } from "../src/config";

describe("readPositiveInteger", () => {
  test("uses the fallback when the variable is unset", () => {
    expect(readPositiveInteger("TAGWISE_TEST_LIMIT", 4, 10)).toBe(4);
  });

  test("accepts a positive integer within the limit", () => {
    const previous = process.env.TAGWISE_TEST_LIMIT;
    process.env.TAGWISE_TEST_LIMIT = "6";
    try {
      expect(readPositiveInteger("TAGWISE_TEST_LIMIT", 4, 10)).toBe(6);
    } finally {
      if (previous === undefined) delete process.env.TAGWISE_TEST_LIMIT;
      else process.env.TAGWISE_TEST_LIMIT = previous;
    }
  });

  test("rejects malformed or out-of-range values", () => {
    const previous = process.env.TAGWISE_TEST_LIMIT;
    try {
      for (const value of ["0", "-1", "1.5", "11", "nope"]) {
        process.env.TAGWISE_TEST_LIMIT = value;
        expect(() => readPositiveInteger("TAGWISE_TEST_LIMIT", 4, 10)).toThrow(
          "TAGWISE_TEST_LIMIT must be an integer",
        );
      }
    } finally {
      if (previous === undefined) delete process.env.TAGWISE_TEST_LIMIT;
      else process.env.TAGWISE_TEST_LIMIT = previous;
    }
  });
});
