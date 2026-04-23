import type { Building } from './types.js'

export const buildingRoster: Building[] = [
  { id: 'villa-a',      label: 'Villa A',         type: 'villa',      scheduleClass: 'residential',    baseDemandKw: 18,  weatherSensitivity: 0.90, occupancyCapacity: 4   },
  { id: 'villa-b',      label: 'Villa B',         type: 'villa',      scheduleClass: 'residential',    baseDemandKw: 15,  weatherSensitivity: 0.85, occupancyCapacity: 3   },
  { id: 'apartment-01', label: 'Apartment Block', type: 'apartment',  scheduleClass: 'residential',    baseDemandKw: 240, weatherSensitivity: 0.70, occupancyCapacity: 80  },
  { id: 'office-01',    label: 'Office Building', type: 'office',     scheduleClass: 'office',         baseDemandKw: 350, weatherSensitivity: 0.60, occupancyCapacity: 200 },
  { id: 'retail-01',    label: 'Retail Unit',     type: 'retail',     scheduleClass: 'retail',         baseDemandKw: 120, weatherSensitivity: 0.50, occupancyCapacity: 60  },
  { id: 'school-01',    label: 'School',          type: 'civic',      scheduleClass: 'civic',          baseDemandKw: 110, weatherSensitivity: 0.40, occupancyCapacity: 350 },
  { id: 'utility-01',   label: 'Utility Node',    type: 'utility',    scheduleClass: 'infrastructure', baseDemandKw: 60,  weatherSensitivity: 0.10, occupancyCapacity: 5   },
  { id: 'factory-01',   label: 'Factory',         type: 'industrial', scheduleClass: 'industrial',     baseDemandKw: 820, weatherSensitivity: 0.25, occupancyCapacity: 80  },
]
