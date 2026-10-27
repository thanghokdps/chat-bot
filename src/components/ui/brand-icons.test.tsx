// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppleMark, GoogleMark } from "./brand-icons";

afterEach(cleanup);

describe("brand icons", () => {
  it("are hidden from assistive tech, since the button text names the provider", () => {
    for (const Mark of [GoogleMark, AppleMark]) {
      const { container } = render(<Mark />);
      expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
      cleanup();
    }
  });
});
