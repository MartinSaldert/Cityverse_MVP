import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const appDir = path.join(root, 'apps', 'cityverse-vc')

const child = spawn('node', ['dist/main.js'], {
  cwd: appDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT ?? '3001',
    HOST: process.env.HOST ?? '0.0.0.0',
    MQTT_URL: process.env.MQTT_URL ?? 'mqtt://localhost:1883',
  },
})

child.on('exit', (code) => process.exit(code ?? 0))
