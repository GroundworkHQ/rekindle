// Turns Ember's reply text into warm speech via ElevenLabs (same setup as Grace).
// Reuses the Gateway ElevenLabs account. Swap EMBER_VOICE_ID for a distinct Ember
// voice whenever we want her to sound different from Grace.
const EMBER_VOICE_ID = 'RSUcZp3ilp3WUZWLUwcY';
const ELEVEN_MODEL = 'eleven_flash_v2_5';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }

  const text = body && typeof body.text === 'string' ? body.text.trim().slice(0, 1500) : '';
  if (!text) {
    res.status(400).send('Missing text');
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(500).send('Voice is not configured yet.');
    return;
  }

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EMBER_VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: ELEVEN_MODEL,
          voice_settings: { stability: 0.4, similarity_boost: 0.75 },
        }),
      }
    );

    if (!r.ok) {
      res.status(502).send('Voice generation failed.');
      return;
    }

    const audio = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.send(audio);
  } catch (err) {
    res.status(502).send('Voice error.');
  }
}
