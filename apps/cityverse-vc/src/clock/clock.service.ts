export interface ClockState {
  simTime: string   // ISO 8601
  speed: number     // multiplier (1 = realtime, 2 = 2x, 0.5 = half-speed)
  paused: boolean
}

export class SimulationClock {
  private simTime: number   // ms since epoch
  private speed: number
  private paused: boolean
  private lastRealMs: number

  constructor(startTime?: Date) {
    this.simTime = (startTime ?? new Date()).getTime()
    this.speed = 1
    this.paused = false
    this.lastRealMs = Date.now()
  }

  private advance(): void {
    const now = Date.now()
    if (!this.paused) {
      const elapsedReal = now - this.lastRealMs
      this.simTime += elapsedReal * this.speed
    }
    this.lastRealMs = now
  }

  getState(): ClockState {
    this.advance()
    return {
      simTime: new Date(this.simTime).toISOString(),
      speed: this.speed,
      paused: this.paused,
    }
  }

  pause(): ClockState {
    this.advance()
    this.paused = true
    return this.getState()
  }

  resume(): ClockState {
    this.advance()
    this.paused = false
    return this.getState()
  }

  setSpeed(speed: number): ClockState {
    this.advance()
    this.speed = speed
    return this.getState()
  }

  setTime(iso: string): ClockState {
    const t = new Date(iso).getTime()
    if (isNaN(t)) throw new Error(`Invalid ISO date string: ${iso}`)
    this.simTime = t
    this.lastRealMs = Date.now()
    return this.getState()
  }
}
