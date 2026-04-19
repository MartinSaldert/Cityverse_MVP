import { spawn } from 'node:child_process'

const child = spawn('pnpm', ['--filter', '@cityverse/contracts', 'build', '&&', 'pnpm', '--filter', '@cityverse/vc', 'build'], {
  shell: true,
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  if (code !== 0) process.exit(code ?? 1)

  const child2 = spawn('pnpm', ['--filter', '@cityverse/iot', 'build'], {
    shell: true,
    stdio: 'inherit',
    env: process.env,
  })

  child2.on('exit', (code2) => process.exit(code2 ?? 0))
})
