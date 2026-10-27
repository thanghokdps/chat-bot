// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./button";

afterEach(cleanup);

describe("Button", () => {
  it("defaults to a non-submitting primary button", () => {
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent)}>
        <Button>Go</Button>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    fireEvent.click(button);
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("bg-primary");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("lets a caller class override the variant's size and radius", () => {
    render(
      <Button variant="card" size="lg" className="h-20 text-13">
        Card
      </Button>,
    );
    const { className } = screen.getByRole("button");
    expect(className).toContain("rounded-card");
    expect(className).not.toContain("rounded-full");
    expect(className).toContain("h-20 text-13");
    expect(className).not.toContain("h-15");
  });

  it("does not fire when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Off
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
