// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./radio-group";

afterEach(cleanup);

describe("RadioGroup", () => {
  it("checks the current value and reports a new pick", () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup value="gray" onValueChange={onValueChange} aria-label="Background">
        <RadioGroupItem value="gray" aria-label="gray" />
        <RadioGroupItem value="pink" aria-label="pink" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Background" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "gray" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "pink" }));
    expect(onValueChange).toHaveBeenCalledWith("pink");
  });
});
