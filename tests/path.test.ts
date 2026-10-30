import { describe, expect, test } from "bun:test";
import { isPathWithinRoot } from "../src/utils/path";

describe("isPathWithinRoot", () => {
  test("accepts descendants and rejects the root and paths outside it", () => {
    expect(isPathWithinRoot("/music", "/music/album/song.mp3")).toBe(true);
    expect(isPathWithinRoot("/music", "/music")).toBe(false);
    expect(isPathWithinRoot("/music", "/music-old/song.mp3")).toBe(false);
    expect(isPathWithinRoot("/music", "/etc/passwd")).toBe(false);
  });
});
