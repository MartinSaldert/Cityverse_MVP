// Unit tests for the latitude-based daylight calculator.
// Imports from dist — run after building the VC app.
import test from 'node:test'
import assert from 'node:assert/strict'

import { computeDaylightHours, getCalendarContext } from '../apps/cityverse-vc/dist/weather/calendar.js'

const STOCKHOLM_LAT = 59.3293
const TOKYO_LAT     = 35.6762

// Summer solstice ≈ day 172, winter solstice ≈ day 355
const SUMMER_SOLSTICE_DAY = 172
const WINTER_SOLSTICE_DAY = 355
const EQUINOX_DAY         = 80   // spring equinox ≈ March 21

test('Stockholm has longer days in summer than winter', () => {
  const summer = computeDaylightHours(STOCKHOLM_LAT, SUMMER_SOLSTICE_DAY)
  const winter = computeDaylightHours(STOCKHOLM_LAT, WINTER_SOLSTICE_DAY)
  assert.ok(summer > winter, `summer (${summer.toFixed(1)}h) should exceed winter (${winter.toFixed(1)}h)`)
})

test('Stockholm summer solstice daylight is plausibly long (≥16h)', () => {
  const h = computeDaylightHours(STOCKHOLM_LAT, SUMMER_SOLSTICE_DAY)
  assert.ok(h >= 16, `expected ≥16h, got ${h.toFixed(1)}h`)
})

test('Stockholm winter solstice daylight is plausibly short (≤9h)', () => {
  const h = computeDaylightHours(STOCKHOLM_LAT, WINTER_SOLSTICE_DAY)
  assert.ok(h <= 9, `expected ≤9h, got ${h.toFixed(1)}h`)
})

test('Equinox gives roughly 12h daylight at both latitudes', () => {
  const stockholm = computeDaylightHours(STOCKHOLM_LAT, EQUINOX_DAY)
  const tokyo     = computeDaylightHours(TOKYO_LAT,     EQUINOX_DAY)
  assert.ok(Math.abs(stockholm - 12) < 1.5, `Stockholm equinox: ${stockholm.toFixed(1)}h, expected ~12h`)
  assert.ok(Math.abs(tokyo     - 12) < 1.5, `Tokyo equinox: ${tokyo.toFixed(1)}h, expected ~12h`)
})

test('Stockholm has more summer daylight than Tokyo', () => {
  const stockholm = computeDaylightHours(STOCKHOLM_LAT, SUMMER_SOLSTICE_DAY)
  const tokyo     = computeDaylightHours(TOKYO_LAT,     SUMMER_SOLSTICE_DAY)
  assert.ok(stockholm > tokyo, `Stockholm (${stockholm.toFixed(1)}h) should exceed Tokyo (${tokyo.toFixed(1)}h) in summer`)
})

test('daylightFactor is 0 at midnight regardless of season', () => {
  const midnightSummer = getCalendarContext('2026-06-21T00:00:00.000Z', STOCKHOLM_LAT)
  const midnightWinter = getCalendarContext('2026-12-21T00:00:00.000Z', STOCKHOLM_LAT)
  assert.equal(midnightSummer.daylightFactor, 0)
  assert.equal(midnightWinter.daylightFactor, 0)
})

test('daylightFactor is >0 at solar noon in summer', () => {
  const noonSummer = getCalendarContext('2026-06-21T12:00:00.000Z', STOCKHOLM_LAT)
  assert.ok(noonSummer.daylightFactor > 0, 'noon in summer should have daylight')
})

test('sunrise < 12 < sunset for mid-latitude in summer', () => {
  const ctx = getCalendarContext('2026-06-21T12:00:00.000Z', STOCKHOLM_LAT)
  assert.ok(ctx.sunrise < 12, `sunrise ${ctx.sunrise.toFixed(2)} should be before noon`)
  assert.ok(ctx.sunset  > 12, `sunset ${ctx.sunset.toFixed(2)} should be after noon`)
})

test('winter context has shorter daylightHours than summer context', () => {
  const summer = getCalendarContext('2026-06-21T12:00:00.000Z', STOCKHOLM_LAT)
  const winter = getCalendarContext('2026-12-21T12:00:00.000Z', STOCKHOLM_LAT)
  assert.ok(summer.daylightHours > winter.daylightHours,
    `summer (${summer.daylightHours.toFixed(1)}h) should exceed winter (${winter.daylightHours.toFixed(1)}h)`)
})
