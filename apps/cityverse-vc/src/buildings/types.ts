export type BuildingType = 'villa' | 'apartment' | 'office' | 'retail' | 'civic' | 'utility' | 'industrial'
export type ScheduleClass = 'residential' | 'office' | 'retail' | 'civic' | 'infrastructure' | 'industrial'

export interface Building {
  id: string
  label: string
  type: BuildingType
  scheduleClass: ScheduleClass
  baseDemandKw: number
  weatherSensitivity: number
  occupancyCapacity: number
}
