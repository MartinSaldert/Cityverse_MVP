#!/usr/bin/env node

import { spawn } from 'node:child_process';

function usage() {
  console.error('Usage: node scripts/syntra-avatar-turn.mjs <message...>');
  process.exit(1);
}

function tryParseJsonObject(stdout) {
  const jsonStart = stdout.indexOf('{');
  if (jsonStart === -1) return null;

  const candidate = stdout.slice(jsonStart).trim();
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function runOpenClawAgent(message) {
  return new Promise((resolve, reject) => {
    const args = ['agent', '--agent', process.env.SYNTRA_AGENT_ID ?? 'syntra', '--json', '--message', message];

    if (process.env.SYNTRA_SESSION_ID) {
      args.push('--session-id', process.env.SYNTRA_SESSION_ID);
    }

    if (process.env.SYNTRA_THINKING) {
      args.push('--thinking', process.env.SYNTRA_THINKING);
    }

    if (process.env.SYNTRA_TIMEOUT_SECONDS) {
      args.push('--timeout', process.env.SYNTRA_TIMEOUT_SECONDS);
    }

    const child = spawn('openclaw', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    let parsedResult = null;

    const settleSuccess = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
      if (!child.killed) child.kill('SIGTERM');
    };

    const settleError = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
      if (!child.killed) child.kill('SIGTERM');
    };

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
      const parsed = tryParseJsonObject(stdout);
      if (parsed) {
        parsedResult = parsed;
        settleSuccess(parsed);
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', settleError);
    child.on('exit', (code, signal) => {
      if (settled) return;

      if (parsedResult) {
        settleSuccess(parsedResult);
        return;
      }

      if (code !== 0 && signal !== 'SIGTERM') {
        settleError(new Error(stderr.trim() || `openclaw agent exited with code ${code ?? 'unknown'}`));
        return;
      }

      const parsed = tryParseJsonObject(stdout);
      if (parsed) {
        settleSuccess(parsed);
        return;
      }

      settleError(new Error(`Could not parse openclaw JSON output.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`));
    });
  });
}

function extractReplyText(result) {
  const meta = result?.result?.meta ?? {};
  const visible = meta.finalAssistantVisibleText?.trim();
  if (visible) return visible;

  const payloadTexts = (result?.result?.payloads ?? [])
    .map((payload) => payload?.text?.trim())
    .filter(Boolean);

  if (payloadTexts.length > 0) {
    return payloadTexts.join('\n\n');
  }

  throw new Error('No assistant reply text found in openclaw agent JSON output');
}

async function speakText(text) {
  const bridgeBaseUrl = process.env.AVATAR_BRIDGE_BASE_URL ?? 'http://127.0.0.1:3099';
  const response = await fetch(`${bridgeBaseUrl}/speak`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      text,
      utteranceId: `syntra-${Date.now()}`,
      expression: process.env.AVATAR_EXPRESSION ?? 'relaxed',
      emotionWeight: Number.parseFloat(process.env.AVATAR_EMOTION_WEIGHT ?? '0.5'),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Bridge /speak failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function main() {
  const message = process.argv.slice(2).join(' ').trim();
  if (!message) usage();

  const result = await runOpenClawAgent(message);
  const replyText = extractReplyText(result);
  const bridgeResult = await speakText(replyText);

  process.stdout.write(`${replyText}\n`);
  process.stderr.write(`${JSON.stringify({ bridgeResult }, null, 2)}\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
