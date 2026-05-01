const bridgeBaseUrl = process.env.AVATAR_BRIDGE_BASE_URL ?? 'http://127.0.0.1:3099';
const audioFile = process.env.AVATAR_TEST_AUDIO;

const payload = {
  text: process.env.AVATAR_TEST_TEXT ?? 'Hello Martin. Syntra to avatar transport is awake.',
  utteranceId: `demo-${Date.now()}`,
  expression: process.env.AVATAR_TEST_EXPRESSION ?? 'relaxed',
  emotionWeight: Number.parseFloat(process.env.AVATAR_TEST_EMOTION_WEIGHT ?? '0.5'),
};

if (audioFile) payload.audioFile = audioFile;

const response = await fetch(`${bridgeBaseUrl}/speak`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(payload),
});

const text = await response.text();
console.log(text);

if (!response.ok) process.exit(1);
