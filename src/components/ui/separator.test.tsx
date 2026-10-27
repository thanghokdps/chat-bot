// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Separator } from "./separator";

afterEach(cleanup);

describe("Separator", () => {
  it("is decorative by default and reports its orientation for styling", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const rule = container.firstElementChild as HTMLElement;
    expect(rule.getAttribute("role")).toBe("none");
    expect(rule.getAttribute("data-orientation")).toBe("vertical");
  });
});
