// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const service = {
  widget: { type: "tasmota", service_group: "group", service_name: "plug", index: 0 },
};

describe("widgets/tasmota/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ POWER: "ON" }) }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("polls the status endpoint every 10s by default", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() });

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI).toHaveBeenCalledWith(service.widget, "status", { refreshInterval: 10000 });
  });

  it("honors a configured refreshInterval", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() });

    const configured = { widget: { ...service.widget, refreshInterval: 30000 } };
    renderWithProviders(<Component service={configured} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI).toHaveBeenCalledWith(configured.widget, "status", { refreshInterval: 30000 });
  });

  it("clamps a sub-second refreshInterval", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() });

    const configured = { widget: { ...service.widget, refreshInterval: 1 } };
    renderWithProviders(<Component service={configured} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI).toHaveBeenCalledWith(configured.widget, "status", { refreshInterval: 1000 });
  });

  it("renders a disabled switch while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() });

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("tasmota.power")).toBeInTheDocument();
  });

  it("reflects the reported power state", () => {
    useWidgetAPI.mockReturnValue({ data: { POWER: "ON" }, error: undefined, mutate: vi.fn() });

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toBeEnabled();
    expect(screen.getByText("tasmota.on")).toBeInTheDocument();
  });

  it("posts the toggle command and seeds the returned state on click", async () => {
    const mutate = vi.fn();
    useWidgetAPI.mockReturnValue({ data: { POWER: "OFF" }, error: undefined, mutate });

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => expect(mutate).toHaveBeenCalledWith({ POWER: "ON" }, { revalidate: false }));
    expect(fetch).toHaveBeenCalledWith("/api/services/proxy?group=group&service=plug&index=0&endpoint=toggle", {
      method: "POST",
    });
  });

  it("surfaces a rejected toggle instead of reporting success", async () => {
    const mutate = vi.fn();
    useWidgetAPI.mockReturnValue({ data: { POWER: "OFF" }, error: undefined, mutate });
    fetch.mockResolvedValue({ ok: false, json: async () => ({ error: "Unsupported method" }) });

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => expect(mutate).toHaveBeenCalledWith({ error: "Unsupported method" }, { revalidate: false }));
  });

  it("falls back to a refetch when the toggle response is unusable", async () => {
    const mutate = vi.fn();
    useWidgetAPI.mockReturnValue({ data: { POWER: "OFF" }, error: undefined, mutate });
    fetch.mockRejectedValue(new Error("network down"));

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => expect(mutate).toHaveBeenCalledWith());
  });

  it("renders the error container on error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "boom" }, mutate: vi.fn() });

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getAllByText(/widget.api_error/)[0]).toBeInTheDocument();
  });
});
