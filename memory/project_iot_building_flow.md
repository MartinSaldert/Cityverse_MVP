---
name: IOT building flow implementation
description: Building telemetry moved onto VC -> MQTT -> IOT -> Unity path (2026-04-20); Unity now reads buildings from IOT, not VC
type: project
---

Building state now travels VC -> MQTT -> IOT -> Unity, matching the real-world architecture intent.

**Why:** Martin explicitly wants the system to mirror real city -> IOT broker -> digital twin. The previous direct Unity -> VC path was architectural cheating.

**How to apply:** Unity BuildingsApiClient points to IOT (port 3002) at /buildings/current. VC publishes building telemetry to `cityverse/buildings/telemetry` every 2s. IOT ingests and exposes /buildings/current and /buildings/summary. VC building routes kept for operator UI/debugging only.
