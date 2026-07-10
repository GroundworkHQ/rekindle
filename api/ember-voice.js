// Turns Ember's reply text into warm speech via xAI Grok text-to-speech.
// Voice names come from the xAI Voice Library (console.x.ai -> Voice -> Voice
// Library), NOT the outdated docs (eve/ara/etc. don't exist). Swap EMBER_VOICE
// for any name from the library or a cloned voice_id.
const EMBER_VOICE = 'Carina';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }

  const text = body && typeof body.text === 'string' ? body.text.trim().slice(0, 15000) : '';
  if (!text) {
    res.status(400).send('Missing text');
    return;
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    res.status(500).send('Voice is not configured yet.');
    return;
  }

  try {
    const r = await fetch('https://api.x.ai/v1/tts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: EMBER_VOICE,
        language: 'en',
        output_format: { codec: 'mp3', sample_rate: 24000, bit_rate: 128000 },
        speed: 1.0,
        // Bias synthesis toward starting sooner (0-2, higher = lower latency).
        optimize_streaming_latency: 2,
      }),
    });

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
