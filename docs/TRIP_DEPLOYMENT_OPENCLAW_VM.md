# Trip Deployment: OpenClaw in Linux VM, Syntra/Unity on Laptop

Date saved: 2026-04-30
Status: fallback deployment plan (superseded as preferred plan)

## Note

This document describes the **earlier VM-on-laptop travel plan**.

It is no longer the preferred runtime architecture after the deployment decision changed on **April 30, 2026**.

### Current preferred plan

Use:

- `docs/SYNTRA_MAC_MINI_TRAVEL_ARCHITECTURE.md`
- `docs/SYNTRA_AGENT_DESIGN.md`
- `docs/SYNTRA_TRAVEL_SETUP_CHECKLIST.md`

Current preferred topology:

```text
Mac mini
  - OpenClaw Gateway
  - Syntra agent
  - Cityverse skill
  - Avatar Voice Bridge
  - Unity Avatar / 3D display runtime

Laptop
  - VC
  - IOT
  - DT / Cityverse Unity scene
```

## When this VM plan is still useful

This document remains relevant as a fallback if:

- the Mac mini is unavailable
- cross-machine LAN networking is unreliable
- a one-machine travel/demo configuration becomes necessary

In that fallback case, the runtime is:

```text
Laptop host OS
  - VC
  - IOT
  - Unity DT / Cityverse scene
  - Unity Avatar project
  - Avatar Voice Bridge

Linux VM on same laptop
  - OpenClaw Gateway
  - OpenClaw agents/sessions
  - Cityverse OpenClaw skill
  - model credentials / provider config
```

## Why this fallback is acceptable

This keeps all runtime pieces on one physical machine while avoiding the laptop OpenClaw install problem.

The important architectural boundary still remains intact:

- OpenClaw remains the operator brain.
- Cityverse skill remains the Syntra control interface.
- VC/IOT/DT remain the source of truth.
- Unity DT visualizes the city.
- Unity Avatar speaks/listens/renders.
- Avatar Voice Bridge routes STT/TTS and avatar commands.

## Networking rule

`127.0.0.1` / `localhost` means different things depending on which side uses it.

### On laptop host OS

Laptop-host services can use normal localhost:

```text
VC:              http://127.0.0.1:3001
IOT:             http://127.0.0.1:3002
Unity DT:        local app/process
Unity Avatar:    local app/process
Avatar Bridge:   http://127.0.0.1:3099 or ws://127.0.0.1:<port>
```

### Inside Linux VM

Inside the VM, `127.0.0.1` means the VM, not the laptop host.

So OpenClaw inside the VM must reach host services using the VM's host-gateway address.

Possible host addresses depend on VM technology:

```text
host.docker.internal      Docker-like setups
host.containers.internal  Podman-like setups
10.0.2.2                  common NAT gateway in VirtualBox/UTM-style NAT
<host-only adapter IP>    host-only networking
<laptop LAN IP>           bridged networking
```

## Cityverse skill config inside VM

The Cityverse skill should not use localhost for VC/IOT when running inside the VM.

Use environment variables in the VM, for example:

```bash
export CITYVERSE_VC_BASE_URL="http://10.0.2.2:3001"
export CITYVERSE_IOT_BASE_URL="http://10.0.2.2:3002"
export CITYVERSE_DT_BASE_URL="http://10.0.2.2:3003"
```

Replace `10.0.2.2` with the actual laptop-host address as seen from the VM.

## OpenClaw Gateway access from laptop host

Best option: configure VM port forwarding:

```text
Laptop 127.0.0.1:18789  →  Linux VM :18789
```

Then laptop browser / Avatar Voice Bridge can reach OpenClaw at:

```text
http://127.0.0.1:18789
ws://127.0.0.1:18789
```

Alternative: bind OpenClaw Gateway in the VM to the VM network interface and connect from laptop host using:

```text
http://<vm-ip>:18789
ws://<vm-ip>:18789
```

If binding beyond loopback, configure Gateway auth. Do not expose an unauthenticated gateway.

## Recommended startup order

1. Start laptop-host Syntra services:
   - VC on `3001`
   - IOT on `3002`
2. Start Unity DT / Cityverse scene.
3. Start Unity Avatar project/executable.
4. Start Avatar Voice Bridge on laptop host.
5. Start Linux VM.
6. Inside VM, start OpenClaw Gateway.
7. Verify VM can reach laptop-host VC/IOT.
8. Verify laptop browser can reach OpenClaw Gateway.
9. Verify Avatar Voice Bridge can reach OpenClaw Gateway and Unity Avatar.

## First verification commands

From laptop host:

```bash
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3002/health
```

From Linux VM, using the guessed host address:

```bash
curl http://10.0.2.2:3001/health
curl http://10.0.2.2:3002/health
```

If that fails, discover the host address before debugging OpenClaw. Networking first; wizardry second.

From laptop host to OpenClaw Gateway, if port-forwarded:

```bash
curl http://127.0.0.1:18789/healthz
```

## Avatar voice path in fallback setup

Output path:

```text
OpenClaw in VM
  → outbound reply/event
Avatar Voice Bridge on laptop host
  → TTS audio file
Unity Avatar on laptop host
  → audio playback + existing lipsync
```

Input path later:

```text
Microphone on laptop host
  → Avatar Voice Bridge STT
  → OpenClaw Gateway in VM
  → Cityverse skill/tools
  → TTS reply
  → Unity Avatar speaks
```

## Important constraints

- Unity DT and Unity Avatar remain laptop-host processes.
- OpenClaw runs inside Linux VM only.
- Cityverse service URLs in the VM must use the laptop-host gateway/IP, not localhost.
- Laptop-host clients should preferably reach VM OpenClaw through port-forwarded localhost.
- This is now the fallback plan, not the preferred one.

## Fallback first concrete task

Before implementing voice features, identify the VM networking mode and confirm both directions:

1. VM → laptop host VC/IOT works.
2. Laptop host → VM OpenClaw Gateway works.

Once both are verified, continue with:

```text
OpenClaw reply text → Avatar Voice Bridge → Unity Avatar speaks
```
