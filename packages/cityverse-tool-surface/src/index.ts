import type { CityverseConfig } from '../../cityverse-operator/dist/index.js'
import type { ToolEnvelope } from './envelope.js'

import { handleSystemStatus } from './tools/system.js'
import {
  handleVcGetState, handleVcGetClock, handleVcGetWeather,
  handleVcGetEnergy, handleVcGetCity, handleVcGetBuildings,
  handleVcPause, handleVcResume, handleVcSetSpeed, handleVcSetTime,
  handleVcWeatherNudge,
} from './tools/vc.js'
import {
  handleIotGetWeather, handleIotGetEnergy, handleIotGetCity,
  handleIotGetBuildings, handleIotGetOpsSummary,
} from './tools/iot.js'
import {
  handleAnalysisCaptureBaseline, handleAnalysisProjectBranch, handleAnalysisCompare,
} from './tools/analysis.js'
import { handleDocsSearch } from './tools/docs.js'

export type { ToolEnvelope } from './envelope.js'
export { blockedEnvelope } from './envelope.js'

export {
  handleSystemStatus,
  handleVcGetState, handleVcGetClock, handleVcGetWeather,
  handleVcGetEnergy, handleVcGetCity, handleVcGetBuildings,
  handleVcPause, handleVcResume, handleVcSetSpeed, handleVcSetTime,
  handleVcWeatherNudge,
  handleIotGetWeather, handleIotGetEnergy, handleIotGetCity,
  handleIotGetBuildings, handleIotGetOpsSummary,
  handleAnalysisCaptureBaseline, handleAnalysisProjectBranch, handleAnalysisCompare,
  handleDocsSearch,
}

// ToolHandler is the uniform signature for every entry in CITYVERSE_TOOLS.
// input is whatever the calling agent passes; config allows override in tests.
export type ToolHandler = (
  input: Record<string, unknown>,
  config?: CityverseConfig,
) => Promise<ToolEnvelope>

export const CITYVERSE_TOOLS: Record<string, ToolHandler> = {
  // System
  'cityverse.system.status': handleSystemStatus,

  // VC reads
  'cityverse.vc.get_state': handleVcGetState,
  'cityverse.vc.get_clock': handleVcGetClock,
  'cityverse.vc.get_weather': handleVcGetWeather,
  'cityverse.vc.get_energy': handleVcGetEnergy,
  'cityverse.vc.get_city': handleVcGetCity,
  'cityverse.vc.get_buildings': handleVcGetBuildings,

  // VC control
  'cityverse.vc.pause': handleVcPause,
  'cityverse.vc.resume': handleVcResume,
  'cityverse.vc.set_speed': handleVcSetSpeed,
  'cityverse.vc.set_time': handleVcSetTime,
  'cityverse.vc.weather_nudge': handleVcWeatherNudge,

  // IOT reads
  'cityverse.iot.get_weather': handleIotGetWeather,
  'cityverse.iot.get_energy': handleIotGetEnergy,
  'cityverse.iot.get_city': handleIotGetCity,
  'cityverse.iot.get_buildings': handleIotGetBuildings,
  'cityverse.iot.get_ops_summary': handleIotGetOpsSummary,

  // Analysis
  'cityverse.analysis.capture_baseline': handleAnalysisCaptureBaseline,
  'cityverse.analysis.project_branch': handleAnalysisProjectBranch,
  'cityverse.analysis.compare': handleAnalysisCompare,

  // Docs
  'cityverse.docs.search': handleDocsSearch,
}

export const TOOL_NAMES = Object.keys(CITYVERSE_TOOLS) as (keyof typeof CITYVERSE_TOOLS)[]
