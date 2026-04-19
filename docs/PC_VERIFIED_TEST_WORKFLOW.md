# Cityverse MVP, Verified PC Test Workflow

Date verified: 2026-04-19
Status: manually verified on Martin's Windows PC

## Purpose

This document records the test workflow that actually worked on the Windows PC.
It is intentionally practical and reflects the path that was proven, not the path one might have hoped would work in a cleaner universe.

## Key environment facts

### Source location on the Mac side
- network share path: `\\192.168.1.197\workspace-main\projects\Cityverse_MVP`
- mapped Windows drive path: `G:\projects\Cityverse_MVP`

### Verified local mirror location on the PC
- `D:\Martin\Kunder\City_Verse\Sandbox_1\Mac_Mirror\Cityverse_MVP`

### Important constraint
The repo should **not** be installed and run directly from the SMB share for normal Windows testing.

Why:
- `pnpm` workspace symlinks fail on the SMB path
- mapped drive and UNC path both hit permission or symlink problems
- syncing source to a local mirror and installing locally works reliably

## Verified workflow

### Step 1, sync source from Mac share to local PC mirror

```powershell
robocopy \\192.168.1.197\workspace-main\projects\Cityverse_MVP D:\Martin\Kunder\City_Verse\Sandbox_1\Mac_Mirror\Cityverse_MVP /MIR /XD node_modules .git dist
```

Notes:
- excludes `node_modules`
- excludes `.git`
- excludes `dist`
- this avoids copying symlink-heavy or disposable folders from the share

### Step 2, go to the local mirror

```powershell
cd D:\Martin\Kunder\City_Verse\Sandbox_1\Mac_Mirror\Cityverse_MVP
```

### Step 3, install dependencies locally

```powershell
pnpm install
```

### Step 4, build locally

```powershell
pnpm build
```

Expected:
- contracts build succeeds
- VC build succeeds
- IOT build succeeds

### Step 5, start Mosquitto broker

PowerShell launch command that worked:

```powershell
& "C:\Program Files\mosquitto\mosquitto.exe" -p 1883
```

Notes:
- plain `mosquitto -p 1883` failed because Mosquitto was not on PATH in that shell
- PowerShell requires `&` when invoking a quoted executable path

### Step 6, start VC in a separate PowerShell window

```powershell
cd D:\Martin\Kunder\City_Verse\Sandbox_1\Mac_Mirror\Cityverse_MVP
pnpm start:vc
```

Expected:
- VC available at `http://localhost:3001`

### Step 7, start IOT in another PowerShell window

```powershell
cd D:\Martin\Kunder\City_Verse\Sandbox_1\Mac_Mirror\Cityverse_MVP
pnpm start:iot
```

Expected:
- IOT available at `http://localhost:3002`

### Step 8, verify in browser

Verified URLs to check:
- `http://localhost:3001/`
- `http://localhost:3001/health`
- `http://localhost:3001/api/weather/current`
- `http://localhost:3001/api/energy/current`
- `http://localhost:3001/api/city/current`
- `http://localhost:3002/health`
- `http://localhost:3002/weather/current`
- `http://localhost:3002/energy/current`
- `http://localhost:3002/city/current`

Result from the verified run:
- all tests checked out OK

## Known failure modes observed before the working path

### 1. `corepack enable` permission problem
Observed:
- attempted writes under `C:\Program Files\nodejs`
- failed with `EPERM`

Conclusion:
- skip `corepack enable` if `pnpm` is already available

### 2. `pnpm install` on `G:` failed with symlink and access errors
Observed:
- `EACCES`
- `UNKNOWN` file open errors
- workspace symlink failures

Conclusion:
- do not run workspace install from the SMB share or mapped drive

### 3. robocopy of share including `node_modules` failed
Observed:
- server-side copy errors on dependency folders

Conclusion:
- sync source only, never dependency folders

### 4. Mosquitto command not found
Observed:
- executable installed but not on PATH

Conclusion:
- use explicit executable path with PowerShell call operator

## Recommended repeat workflow

When code changes on the Mac/share:

```powershell
robocopy \\192.168.1.197\workspace-main\projects\Cityverse_MVP D:\Martin\Kunder\City_Verse\Sandbox_1\Mac_Mirror\Cityverse_MVP /MIR /XD node_modules .git dist
```

Then from the local mirror:

```powershell
cd D:\Martin\Kunder\City_Verse\Sandbox_1\Mac_Mirror\Cityverse_MVP
pnpm build
```

Then start broker, VC, and IOT as above.

## Short conclusion

The verified Windows test path is:
- sync source from SMB share to local mirror
- install and run locally
- use explicit Mosquitto executable path if PATH is missing

This is less elegant than direct network execution, but it works, which is a quality architecture occasionally values.
