# Network Config Files

These files support the current two-machine Cityverse travel/demo setup.

## Files

- `mac-mini.cityverse.env.example`
  - how the Mac mini reaches workstation-host Cityverse services
- `workstation.cityverse.env.example`
  - notes/current values for the workstation-host side

## Recommended usage

Copy the examples:

```bash
cp config/network/mac-mini.cityverse.env.example config/network/mac-mini.cityverse.env
cp config/network/workstation.cityverse.env.example config/network/workstation.cityverse.env
```

Then edit them for the current network.

## Primary mode

Use normal LAN IPs first.

## Fallback mode

If the venue LAN is awkward, use Tailscale addresses instead.

## Important rule

The Mac mini's `CITYVERSE_*_BASE_URL` values must point to the workstation address visible from the mini.

They must **not** use `localhost` unless the corresponding service is running on the mini itself.
