// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TailscaleContext, TailscaleProvider } from "./tailscale";

function Reader() {
  const { useTailscale, setUseTailscale } = useContext(TailscaleContext);
  return (
    <button type="button" data-testid="value" onClick={() => setUseTailscale(!useTailscale)}>
      {String(useTailscale)}
    </button>
  );
}

describe("utils/contexts/tailscale", () => {
  it("initializes from localStorage", () => {
    localStorage.setItem("homepage-use-tailscale-links", "true");

    render(
      <TailscaleProvider>
        <Reader />
      </TailscaleProvider>,
    );

    expect(screen.getByTestId("value")).toHaveTextContent("true");
  });

  it("defaults to false when localStorage is empty", () => {
    localStorage.removeItem("homepage-use-tailscale-links");

    render(
      <TailscaleProvider>
        <Reader />
      </TailscaleProvider>,
    );

    expect(screen.getByTestId("value")).toHaveTextContent("false");
  });

  it("persists the setting when it changes", async () => {
    localStorage.removeItem("homepage-use-tailscale-links");

    render(
      <TailscaleProvider>
        <Reader />
      </TailscaleProvider>,
    );

    fireEvent.click(screen.getByTestId("value"));

    expect(screen.getByTestId("value")).toHaveTextContent("true");
    await waitFor(() => expect(localStorage.getItem("homepage-use-tailscale-links")).toBe("true"));
  });

  it("renders off before mount so hydration matches the server", () => {
    localStorage.setItem("homepage-use-tailscale-links", "true");

    const markup = renderToStaticMarkup(
      <TailscaleProvider>
        <Reader />
      </TailscaleProvider>,
    );

    expect(markup).toContain(">false<");
  });

  it("honors an explicit initial value", () => {
    localStorage.setItem("homepage-use-tailscale-links", "true");

    render(
      <TailscaleProvider initialUseTailscale={false}>
        <Reader />
      </TailscaleProvider>,
    );

    expect(screen.getByTestId("value")).toHaveTextContent("false");
  });
});
