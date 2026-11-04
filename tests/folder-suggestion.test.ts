import { describe, expect, test, mock } from "bun:test";
import { getFolderSuggestions } from "../src/services/folder-suggestion.service";

mock.module("node:fs/promises", () => ({
  readdir: async () => [
    { name: "music", isDirectory: () => true },
    { name: "Music", isDirectory: () => true },
    { name: "MUSIC", isDirectory: () => true },
  ],
}));

describe("getFolderSuggestions", () => {
  test("returns case-insensitive suggestions", async () => {
    const suggestions = await getFolderSuggestions("MUSIC");
    expect(suggestions).toContain("music/");
    expect(suggestions).toContain("Music/");
    expect(suggestions).toContain("MUSIC/");
  });
});
