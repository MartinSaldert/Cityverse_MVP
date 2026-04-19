import { buildServer } from './server.js'

async function main() {
  const app = buildServer()
  const port = Number(process.env.PORT ?? 3002)
  const host = process.env.HOST ?? '0.0.0.0'

  try {
    await app.listen({ port, host })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

main()
