import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const mqttUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
const host = process.env.HOST ?? '0.0.0.0'
const vcPort = process.env.VC_PORT ?? '3001'
const iotPort = process.env.IOT_PORT ?? '3002'

const children = []

function spawnApp(name, appFolder, port) {
  const child = spawn('node', ['dist/main.js'], {
    cwd: path.join(root, 'apps', appFolder),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port,
      HOST: host,
      MQTT_URL: mqttUrl,
    },
  })

  child.on('exit', (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`
    console.log(`[start-all] ${name} exited with ${reason}`)
    shutdown(`${name} exited`)
  })

  children.push(child)
  return child
}

let shuttingDown = false

function shutdown(reason) {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`[start-all] shutting down, reason: ${reason}`)
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGKILL')
      }
    }
    process.exit(0)
  }, 1500)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

console.log(`[start-all] MQTT_URL=${mqttUrl}`)
console.log(`[start-all] starting VC on port ${vcPort}`)
console.log(`[start-all] starting IOT on port ${iotPort}`)

spawnApp('VC', 'cityverse-vc', vcPort)
spawnApp('IOT', 'cityverse-iot', iotPort)
