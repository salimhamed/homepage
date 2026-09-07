import { render } from "@testing-library/react";

import { SettingsContext } from "utils/contexts/settings";
import { TailscaleContext } from "utils/contexts/tailscale";

export function renderWithProviders(ui, { settings = {}, useTailscale = false } = {}) {
  const value = {
    settings,
    // Most tests don't need to mutate settings; this keeps Container happy.
    setSettings: () => {},
  };

  const tailscaleValue = { useTailscale, setUseTailscale: () => {} };

  return render(
    <SettingsContext.Provider value={value}>
      <TailscaleContext.Provider value={tailscaleValue}>{ui}</TailscaleContext.Provider>
    </SettingsContext.Provider>,
  );
}
