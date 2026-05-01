# Syntra Machine Communications Plan

Date: 2026-04-30
Status: recommended current approach

## Recommendation

Do **not** build a helper discovery app yet.

For the travel/demo setup, use:
1. normal LAN IPs as the primary path
2. small machine-specific config files stored in the repo
3. Tailscale as fallback if the local network is troublesome

This is the best tradeoff between reliability, speed, and implementation effort.

## Why not build a helper app yet?

A helper app would add:
- another process to start
- another protocol to debug
- another failure mode during travel/demo setup

Right now, the simpler architecture is better.

The network problem is small enough to solve with configuration.

## Preferred network modes

### Primary
- Both machines on the same LAN
- Use normal private IPs
- Prefer your own 4G router when possible for predictable networking

### Fallback
- Use Tailscale addresses if the LAN is hostile, isolated, or inconsistent

## Configuration approach

Keep two config files:

### 1. Mac mini config
Defines local Cityverse service URLs and the workstation avatar receiver address.

### 2. Workstation notes/config
Defines workstation IP/display notes and how it reaches the Mac mini bridge/audio endpoints.

This can be updated manually when the network changes.

Manual is acceptable here because:
- there are only two machines
- the topology is stable
- the values are easy to inspect and change

## Current needed addresses

### Mac mini needs
- local VC/IOT base URLs if they stay on the mini
- workstation DT base URL if used
- workstation avatar receiver WS address
- profile label (LAN vs Tailscale)

### Workstation needs
- Mac mini IP so Unity can fetch audio from the bridge
- current workstation IP if the Mac bridge must reach the Unity receiver over LAN

## Suggested workflow

### LAN mode
1. Connect both machines to the same network
2. Find workstation IP and Mac mini IP
3. Update Mac mini/workstation config files
4. Start VC/IOT/bridge/OpenClaw on Mac mini
5. Start avatar (and DT if needed) on workstation
6. Verify workstation can hit the Mac bridge `/health` endpoint
7. Verify the Mac bridge can reach the workstation Unity receiver

### Tailscale fallback mode
1. Find workstation Tailscale IP or MagicDNS name
2. Update the Mac mini env file to use that address
3. If needed, use the mini Tailscale address for reverse access back to OpenClaw
4. Run the same verification checks

## Verification commands

From the Mac mini:

```bash
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3002/health
curl http://127.0.0.1:3099/health
```

From the workstation:

```bash
curl http://<mini-ip>:3099/health
```

If using Tailscale:

```bash
curl http://<workstation-tailscale-ip>:3001/health
curl http://<workstation-tailscale-ip>:3002/health
```

## Future upgrade path

Only build a helper/discovery layer if manual config becomes painful.

Trigger conditions would be:
- more than two machines
- frequent automatic network switching
- repeated demo pain from manual IP updates
- a need for zero-touch startup

If that happens later, the smallest sensible upgrade is probably:
- a tiny config generator or updater script
- not a full discovery daemon

## Conclusion

For now:
- use **normal LAN IPs first**
- keep **Tailscale as fallback**
- use **repo-stored config files** for both machines

This is gloriously unromantic, which is usually how reliable systems begin.
