import { EMBER_SYSTEM_PROMPT } from './_ember-prompt.js';

// Mints a short-lived xAI realtime ephemeral token so the browser can connect
// directly to the Grok voice agent without ever seeing the real API key.
// Also returns the Ember instructions + voice so the prompt stays server-side
// as the single source of truth (the client passes them in session.update).
const EMBER_VOICE = 'Carina';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    res.status(500).send('Voice is not configured yet.');
    return;
  }

  try {
    const r = await fetch('https://api.x.ai/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_after: { seconds: 600 } }),
    });

    if (!r.ok) {
      res.status(502).send('Could not start voice session.');
      return;
    }

    const data = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      token: data.value,
      expires_at: data.expires_at,
      voice: EMBER_VOICE,
      instructions: EMBER_SYSTEM_PROMPT,
    });
  } catch (err) {
    res.status(502).send('Voice session error.');
  }
}
