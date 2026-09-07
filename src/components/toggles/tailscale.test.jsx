// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TailscaleContext } from "utils/contexts/tailscale";

import TailscaleToggle from "./tailscale";

function renderToggle(useTailscale, setUseTailscale, hasTailscaleLinks = true) {
  return render(
    <TailscaleContext.Provider value={{ useTailscale, setUseTailscale }}>
      <TailscaleToggle hasTailscaleLinks={hasTailscaleLinks} />
    </TailscaleContext.Provider>,
  );
}

describe("components/toggles/tailscale", () => {
  it("turns tailscale links on when clicked", () => {
    const setUseTailscale = vi.fn();
    renderToggle(false, setUseTailscale);

    fireEvent.click(screen.getByRole("button"));
    expect(setUseTailscale).toHaveBeenCalledWith(true);
  });

  it("turns tailscale links off when clicked", () => {
    const setUseTailscale = vi.fn();
    renderToggle(true, setUseTailscale);

    fireEvent.click(screen.getByRole("button"));
    expect(setUseTailscale).toHaveBeenCalledWith(false);
  });

  it("renders nothing when no service defines a tailscale href", () => {
    renderToggle(false, vi.fn(), false);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("stays reachable when the mode is on but no service defines a tailscale href", () => {
    renderToggle(true, vi.fn(), false);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("labels the toggle for screen readers", () => {
    renderToggle(false, vi.fn());

    expect(screen.getByRole("button")).toHaveTextContent("tailscaleLinks.toggle");
  });
});
