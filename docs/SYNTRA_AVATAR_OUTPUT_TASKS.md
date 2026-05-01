# Syntra Avatar Output Tasks

Date: 2026-04-30
Status: active working task list

## Track 1 — Planning and contracts
- [ ] finalize output-only first-slice scope
- [ ] define bridge ↔ avatar payload schema
- [ ] define local port/transport choice
- [ ] define failure behavior and logging expectations

## Track 2 — Bridge implementation
- [ ] choose location for Avatar Voice Bridge code
- [ ] implement local service skeleton
- [ ] implement test endpoint/input path
- [ ] implement static WAV or test-audio trigger path
- [ ] add TTS hook point

## Track 3 — Unity avatar implementation
- [ ] inspect `Unity_Projects/Avatar/Avatar_1` audio/lipsync path
- [ ] add minimal receiver component
- [ ] accept speak payload
- [ ] load/play audio
- [ ] verify lipsync still works
- [ ] add optional expression/state hooks if cheap

## Track 4 — Syntra runtime wiring
- [ ] identify clean reply relay path from Syntra/OpenClaw
- [ ] connect Syntra reply text to bridge
- [ ] verify text chat still works without avatar path
- [ ] verify avatar path failure does not block chat

## Track 5 — Demo polish
- [ ] consider subtitles/captions
- [ ] shorten spoken replies by default
- [ ] choose initial TTS voice
- [ ] decide later whether STT is worth adding in noisy environments
