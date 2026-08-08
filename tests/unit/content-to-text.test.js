import { describe, expect, it } from "vitest";

import {
  contentToText,
  requireText,
} from "../../backend/utils/content-to-text.js";

describe("contentToText", () => {
  it("preserves string content", () => {
    expect(contentToText("hello")).toBe("hello");
  });

  it("joins text blocks and ignores non-text blocks", () => {
    expect(
      contentToText([
        { type: "text", text: "first" },
        { type: "image", url: "ignored" },
        { type: "text", text: "second" },
      ]),
    ).toBe("first\nsecond");
  });

  it("normalizes missing content to an empty string", () => {
    expect(contentToText(undefined)).toBe("");
  });
});

describe("requireText", () => {
  it("trims a valid response", () => {
    expect(requireText("  answer  ", "Agent")).toBe("answer");
  });

  it.each([undefined, "", "   ", []])("rejects empty content %#", (content) => {
    expect(() => requireText(content, "Agent")).toThrow(
      "Agent produced an empty response.",
    );
  });
});
