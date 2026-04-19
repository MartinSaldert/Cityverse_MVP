export function renderHomePage(): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Cityverse VC</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; background: #10151c; color: #e6edf3; }
    h1, h2 { margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(280px, 1fr)); gap: 16px; }
    .card { background: #18212b; padding: 16px; border-radius: 10px; }
    label { display: block; margin: 8px 0 4px; }
    input, button { width: 100%; padding: 8px; border-radius: 6px; border: none; box-sizing: border-box; }
    button { margin-top: 10px; cursor: pointer; background: #3b82f6; color: white; }
    .button-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
    .button-row button { margin-top: 0; }
    .inline-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Cityverse VC Operator UI</h1>
  <p>Austere, but alive. Which is enough for now.</p>

  <div class="grid">
    <div class="card">
      <h2>Simulation Clock</h2>
      <pre id="clock">Loading...</pre>

      <label>Simulation speed</label>
      <input id="speed" type="number" step="0.1" value="1" />
      <button onclick="setSpeed()">Set Speed</button>

      <div class="button-row">
        <button onclick="setQuickSpeed(1)">1x</button>
        <button onclick="setQuickSpeed(5)">5x</button>
        <button onclick="setQuickSpeed(10)">10x</button>
        <button onclick="setQuickSpeed(30)">30x</button>
      </div>

      <label>Simulation date</label>
      <input id="simDate" type="date" />

      <label>Simulation time</label>
      <input id="simClockTime" type="time" step="1" />

      <div class="inline-row">
        <button onclick="setDateTimeFromFields()">Set Date + Time</button>
        <button onclick="loadDateTimeFieldsFromClock()">Load Current</button>
      </div>

      <label>Simulation time (ISO override)</label>
      <input id="simTime" type="text" placeholder="2026-01-15T12:00:00.000Z" />
      <button onclick="setTime()">Set ISO Time</button>

      <div class="inline-row">
        <button onclick="post('/api/clock/pause')">Pause</button>
        <button onclick="post('/api/clock/resume')">Resume</button>
      </div>
    </div>

    <div class="card">
      <h2>Weather</h2>
      <pre id="weather">Loading...</pre>
    </div>

    <div class="card">
      <h2>Energy + City</h2>
      <pre id="energy">Loading...</pre>
      <pre id="city">Loading...</pre>
    </div>

    <div class="card">
      <h2>Weather Nudges</h2>
      <label>Pressure bias (hPa)</label>
      <input id="pressureBias" type="number" step="1" value="0" />
      <label>Cloud bias (0..1-ish)</label>
      <input id="cloudBias" type="number" step="0.1" value="0" />
      <label>Wind bias (m/s)</label>
      <input id="windBias" type="number" step="0.5" value="0" />
      <label>Temperature bias (°C)</label>
      <input id="tempBias" type="number" step="0.5" value="0" />
      <label>Humidity bias (0..1-ish)</label>
      <input id="humidityBias" type="number" step="0.1" value="0" />
      <button onclick="applyWeatherNudges()">Apply Weather Nudges</button>
    </div>
  </div>

  <script>
    let lastClockData = null

    async function fetchJson(url) {
      const res = await fetch(url)
      return await res.json()
    }

    async function post(url, body) {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      await refresh()
    }

    async function setSpeed() {
      const speed = Number(document.getElementById('speed').value)
      await post('/api/clock/speed', { speed })
    }

    async function setQuickSpeed(speed) {
      document.getElementById('speed').value = String(speed)
      await post('/api/clock/speed', { speed })
    }

    async function setTime() {
      const simTime = document.getElementById('simTime').value
      await post('/api/clock/time', { simTime })
    }

    async function setDateTimeFromFields() {
      const date = document.getElementById('simDate').value
      const time = document.getElementById('simClockTime').value
      if (!date || !time) return
      const simTime = new Date(date + 'T' + time + 'Z').toISOString()
      document.getElementById('simTime').value = simTime
      await post('/api/clock/time', { simTime })
    }

    function loadDateTimeFieldsFromClock() {
      if (!lastClockData) return
      const d = new Date(lastClockData.simTime)
      document.getElementById('simDate').value = d.toISOString().slice(0, 10)
      document.getElementById('simClockTime').value = d.toISOString().slice(11, 19)
      document.getElementById('simTime').value = d.toISOString()
      document.getElementById('speed').value = String(lastClockData.speed)
    }

    async function applyWeatherNudges() {
      await post('/api/weather/nudge', {
        pressureBias: Number(document.getElementById('pressureBias').value),
        cloudBias: Number(document.getElementById('cloudBias').value),
        windBias: Number(document.getElementById('windBias').value),
        tempBias: Number(document.getElementById('tempBias').value),
        humidityBias: Number(document.getElementById('humidityBias').value)
      })
    }

    async function refresh() {
      const [clock, weather, energy, city] = await Promise.all([
        fetchJson('/api/clock'),
        fetchJson('/api/weather/current'),
        fetchJson('/api/energy/current'),
        fetchJson('/api/city/current')
      ])
      lastClockData = clock.data
      document.getElementById('clock').textContent = JSON.stringify(clock.data, null, 2)
      document.getElementById('weather').textContent = JSON.stringify(weather.data, null, 2)
      document.getElementById('energy').textContent = JSON.stringify(energy.data, null, 2)
      document.getElementById('city').textContent = JSON.stringify(city.data, null, 2)
      if (!document.getElementById('simDate').value) {
        loadDateTimeFieldsFromClock()
      }
    }

    setInterval(refresh, 2000)
    refresh()
  </script>
</body>
</html>`
}
