import { afterEach, describe, expect, test } from "bun:test";
import { logger, setLogSink } from "../src/utils/logger";

afterEach(() => {
  setLogSink(null);
});

describe("logger output sink", () => {
  test("sends structured log lines to the configured sink", () => {
    const lines: string[] = [];
    setLogSink((line) => {
      lines.push(line);
    });

    logger.info("TUI event", { screen: "review" });

    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({
      level: "info",
      message: "TUI event",
      screen: "review",
    });
  });
});
