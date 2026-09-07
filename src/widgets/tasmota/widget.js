const widget = {
  api: "{url}/{endpoint}",
  mappings: {
    status: {
      endpoint: "cm?cmnd=Power",
      validate: ["POWER"],
    },
    // POST-only so the relay cannot be flipped by a bare navigation or image
    // load; Tasmota registers /cm for any method, so the forwarded call works.
    toggle: {
      endpoint: "cm?cmnd=Power%20Toggle",
      method: "POST",
      validate: ["POWER"],
    },
  },
};

export default widget;
