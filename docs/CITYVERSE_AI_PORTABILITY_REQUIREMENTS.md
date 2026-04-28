# Cityverse MVP, AI Portability Requirements

Date: 2026-04-28
Status: active guidance

## Purpose

This document defines what “portable” means for the Cityverse AI operator.

The goal is that the Cityverse AI stack can move to another OpenClaw instance without becoming a sad archaeological dig through Martin-specific assumptions.

## Portability target

The portable Cityverse AI bundle should consist primarily of:
- repo-shipped docs
- `openclaw-skill/cityverse/`
- `packages/cityverse-operator/`
- environment/config variables
- stable service contracts and HTTP APIs

The receiving OpenClaw instance should be able to:
- load the skill
- point it at VC/IOT/DT service URLs
- access the same docs bundle
- get the same operator behavior without code edits to machine-specific paths

## Required portable layers

## 1. Skill portability

The skill must:
- live in the repo
- document architecture, safety rules, and capability boundaries
- describe required environment variables
- describe what is live control vs read vs analysis
- avoid depending on local hidden memory or one-off human context

## 2. Operator package portability

The operator package must:
- expose stable TypeScript exports
- use environment-based configuration
- avoid OpenClaw-specific runtime coupling in core logic
- treat HTTP APIs as the integration surface
- resolve repo docs relative to package location when possible

## 3. Documentation portability

Docs must:
- describe config contract clearly
- describe service ownership clearly
- describe unsupported capabilities honestly
- travel with the codebase

## Must not depend on

Do not depend on:
- Martin-specific absolute file paths
- hidden notes outside the repo
- special local shell aliases
- manually remembered install rituals
- Unity project locations hardcoded into operator code
- OpenClaw session history as a required runtime dependency

## Configuration contract

Portable setup should rely on config such as:
- `CITYVERSE_PROFILE`
- `CITYVERSE_VC_BASE_URL`
- `CITYVERSE_IOT_BASE_URL`
- `CITYVERSE_DT_BASE_URL`
- `CITYVERSE_DOCS_ROOT`
- future auth variables if introduced later

Defaults may be convenient for local development, but they must remain overrideable.

## Phase 2 implications

For scenario analysis specifically:
- the analysis engine must live in `@cityverse/operator`
- analysis should not require OpenClaw internals to function
- skill text should describe how to invoke analysis, but not contain the actual business logic
- portable demos/tests should prove the behavior outside a single OpenClaw runtime session

## Testing expectation

A feature is not portable merely because it sounds portable in markdown.

Portable features should ideally be verifiable by:
- package build
- package-level tests
- repo-local demo scripts
- env-based configuration changes

## Short conclusion

If Cityverse AI can only work on Martin’s machine with Martin’s memory and Martin’s directory layout, it is not portable.
It is merely housebroken.
