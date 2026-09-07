import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("tasmota widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
    expect(widget.api).toBe("{url}/{endpoint}");
    expect(widget.proxyHandler).toBeUndefined();
  });

  it("maps status and toggle onto Tasmota power commands", () => {
    expect(widget.mappings.status.endpoint).toBe("cm?cmnd=Power");
    expect(widget.mappings.toggle.endpoint).toBe("cm?cmnd=Power%20Toggle");
    expect(widget.mappings.status.validate).toEqual(["POWER"]);
    expect(widget.mappings.toggle.validate).toEqual(["POWER"]);
  });

  it("accepts the toggle over POST only", () => {
    expect(widget.mappings.status.method).toBeUndefined();
    expect(widget.mappings.toggle.method).toBe("POST");
  });
});
