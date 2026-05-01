import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import net from 'node:net'
import fs from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const mqttUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883'
const mqttHost = process.env.MQTT_HOST ?? '127.0.0.1'
const mqttPort = Number.parseInt(process.env.MQTT_PORT ?? '1883', 10)
const mosquittoConfig = process.env.MOSQUITTO_CONFIG ?? '/opt/homebrew/etc/mosquitto/mosquitto.conf'
const mosquittoBin = process.env.MOSQUITTO_BIN ?? '/opt/homebrew/opt/mosquitto/sbin/mosquitto'
const startMqttBroker = process.env.START_MQTT_BROKER !== '0'
const host = process.env.HOST ?? '0.0.0.0'
const vcPort = process.env.VC_PORT ?? '3001'
const iotPort = process.env.IOT_PORT ?? '3002'
const avatarBridgeHost = process.env.AVATAR_BRIDGE_HOST ?? host
const avatarBridgePort = process.env.AVATAR_BRIDGE_PORT ?? '3099'
const avatarWsUrl = process.env.AVATAR_WS_URL ?? 'ws://127.0.0.1:8787/avatar'
const avatarBridgePublicBaseUrl = process.env.AVATAR_BRIDGE_PUBLIC_BASE_URL ?? `http://127.0.0.1:${avatarBridgePort}`
const startAvatarBridge = process.env.START_AVATAR_BRIDGE !== '0'

const children = []

function attachLifecycle(name, child) {
  child.on('exit', (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`
    console.log(`[start-all] ${name} exited with ${reason}`)
    shutdown(`${name} exited`)
  })

  children.push(child)
  return child
}

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

  return attachLifecycle(name, child)
}

function spawnAvatarBridge() {
  const child = spawn('node', ['voice/bridge/avatar-bridge.mjs'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      AVATAR_BRIDGE_HOST: avatarBridgeHost,
      AVATAR_BRIDGE_PORT: avatarBridgePort,
      AVATAR_WS_URL: avatarWsUrl,
      AVATAR_BRIDGE_PUBLIC_BASE_URL: avatarBridgePublicBaseUrl,
    },
  })

  return attachLifecycle('Avatar Bridge', child)
}

function isPortOpen(hostname, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: hostname, port })
    const done = (open) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(open)
    }

    socket.setTimeout(1000)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })
}

function spawnMosquitto() {
  if (!fs.existsSync(mosquittoBin)) {
    throw new Error(`Mosquitto binary not found: ${mosquittoBin}`)
  }

  const args = fs.existsSync(mosquittoConfig)
    ? ['-c', mosquittoConfig]
    : ['-p', String(mqttPort)]

  const child = spawn(mosquittoBin, args, {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
    },
  })

  return attachLifecycle('MQTT Broker', child)
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

async function main() {
  console.log(`[start-all] MQTT_URL=${mqttUrl}`)

  if (startMqttBroker) {
    const mqttAlreadyRunning = await isPortOpen(mqttHost, mqttPort)
    if (mqttAlreadyRunning) {
      console.log(`[start-all] MQTT broker already listening on ${mqttHost}:${mqttPort}, skipping broker start`)
    } else {
      console.log(`[start-all] starting MQTT broker on ${mqttHost}:${mqttPort}`)
      console.log(`[start-all] Mosquitto binary ${mosquittoBin}`)
      if (fs.existsSync(mosquittoConfig)) {
        console.log(`[start-all] Mosquitto config ${mosquittoConfig}`)
      } else {
        console.log('[start-all] Mosquitto config not found, falling back to default port-only startup')
      }
      spawnMosquitto()
    }
  } else {
    console.log('[start-all] START_MQTT_BROKER=0, skipping MQTT broker startup')
  }

  console.log(`[start-all] starting VC on port ${vcPort}`)
  console.log(`[start-all] starting IOT on port ${iotPort}`)
  if (startAvatarBridge) {
    console.log(`[start-all] starting Avatar Bridge on port ${avatarBridgePort}`)
    console.log(`[start-all] Avatar Bridge Unity WS target ${avatarWsUrl}`)
  } else {
    console.log('[start-all] START_AVATAR_BRIDGE=0, skipping Avatar Bridge')
  }

  spawnApp('VC', 'cityverse-vc', vcPort)
  spawnApp('IOT', 'cityverse-iot', iotPort)
  if (startAvatarBridge) {
    spawnAvatarBridge()
  }
}

main().catch((error) => {
  console.error('[start-all] failed to start services', error)
  process.exit(1)
})
