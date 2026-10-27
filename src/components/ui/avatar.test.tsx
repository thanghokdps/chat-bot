// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar, initials } from "./avatar";

afterEach(cleanup);

describe("initials", () => {
  it("takes the first letters of up to two words", () => {
    expect(initials("Andrew Neilson")).toBe("AN");
    expect(initials("andrew")).toBe("AN");
    expect(initials("  ")).toBe("?");
  });
});

describe("Avatar", () => {
  const google = "https://lh3.googleusercontent.com/a/photo=s96-c";

  it("loads provider photos without a Referer, which Google rejects from other sites", () => {
    const { container } = render(<Avatar name="Thang Ho" image={google} size={28} />);
    expect(container.querySelector("img")?.getAttribute("referrerpolicy")).toBe("no-referrer");
  });

  it("falls back to initials when the photo fails to load", () => {
    const { container } = render(<Avatar name="Thang Ho" image={google} size={28} />);
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("TH")).toBeTruthy();
  });
});
