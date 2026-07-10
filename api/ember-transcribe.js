// Transcribes recorded mic audio via xAI Grok speech-to-text.
// The frontend records the mic and sends the audio as base64 so we never
// depend on the browser's built-in speech service.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }

  const audioB64 = body && typeof body.audio === 'string' ? body.audio : '';
  const mimeType = (body && typeof body.mimeType === 'string' && body.mimeType) || 'audio/webm';
  if (!audioB64) {
    res.status(400).send('Missing audio');
    return;
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    res.status(500).send('Voice is not configured yet.');
    return;
  }

  // Name the file by container so xAI auto-detects it (webm on Chrome, mp4 on Safari).
  const ext = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a'
    : mimeType.includes('ogg') ? 'ogg'
    : mimeType.includes('wav') ? 'wav'
    : 'webm';

  try {
    const buffer = Buffer.from(audioB64, 'base64');
    const form = new FormData();
    form.append('language', 'en');   // all params must come before `file`
    form.append('file', new Blob([buffer], { type: mimeType }), 'audio.' + ext);

    const r = await fetch('https://api.x.ai/v1/stt', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!r.ok) {
      res.status(502).send('Transcription failed.');
      return;
    }

    const data = await r.json();
    res.status(200).json({ text: (data && data.text) || '' });
  } catch (err) {
    res.status(502).send('Transcription error.');
  }
}
