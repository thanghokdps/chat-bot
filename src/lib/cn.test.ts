import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("keeps a token font size next to a text colour", () => {
    expect(cn("text-13 text-white")).toBe("text-13 text-white");
  });

  it("lets a later class of the same group win, tokens included", () => {
    expect(cn("h-12.5 rounded-full text-15", "h-15 rounded-panel text-13")).toBe("h-15 rounded-panel text-13");
    expect(cn("shadow-composer", false, "shadow-send")).toBe("shadow-send");
  });
});
