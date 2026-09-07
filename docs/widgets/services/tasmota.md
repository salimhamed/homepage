---
title: Tasmota
description: Tasmota Widget Configuration
---

Learn more about [Tasmota](https://tasmota.github.io/docs/).

Shows a power switch for a Tasmota device. The state is read from the device's
HTTP command interface and clicking the switch toggles the relay.

The device must allow unauthenticated commands from the homepage host, or have
its web admin password disabled for command access.

```yaml
widget:
  type: tasmota
  url: http://tasmota.host.or.ip
  refreshInterval: 10000 # optional, in milliseconds, defaults to 10000, minimum 1000
```
