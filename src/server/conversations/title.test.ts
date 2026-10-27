import { describe, expect, it } from "vitest";
import { cleanModelTitle, provisionalTitle } from "./title";

describe("titles", () => {
  it("truncates long prompts like the design's sidebar", () => {
    expect(provisionalTitle("Create a chatbot gpt using python language what will be step for that")).toBe(
      "Create a chatbot gpt using python langua...",
    );
    expect(provisionalTitle("  What is UX Audit?  ")).toBe("What is UX Audit?");
    expect(provisionalTitle("   ")).toBe("New chat");
  });

  it("strips quotes and trailing punctuation from model titles", () => {
    expect(cleanModelTitle('"Create Chatbot GPT."')).toBe("Create Chatbot GPT");
    expect(cleanModelTitle("  ")).toBeNull();
  });
});
