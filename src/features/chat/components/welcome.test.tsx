// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_SUGGESTIONS } from "@/dev/fixtures";
import { Welcome } from "./welcome";

afterEach(cleanup);

describe("Welcome", () => {
  it("renders the 3 × 2 grid and sends a card's prompt", () => {
    const onPick = vi.fn();
    render(<Welcome columns={FIXTURE_SUGGESTIONS} onPick={onPick} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Good day! How may I assist you today?");
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Explore",
      "Capabilities",
      "Limitation",
    ]);
    fireEvent.click(screen.getByRole("button", { name: /Make a search engine/ }));
    expect(onPick).toHaveBeenCalledWith("Make a search engine platform like google");
  });
});
