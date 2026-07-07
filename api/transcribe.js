module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { audio, mimeType = 'audio/webm' } = req.body || {};
  if (!audio) return res.status(400).json({ error: 'No audio provided' });

  try {
    const buffer = Buffer.from(audio, 'base64');
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';

    const form = new FormData();
    form.append('file', new Blob([buffer], { type: mimeType }), `recording.${ext}`);
    form.append('model', 'gpt-4o-mini-transcribe');
    form.append('language', 'en');
    // Biases the model toward job-search vocabulary so acoustically-similar terms
    // (e.g. "product manager" vs "project manager") resolve the way job seekers mean them.
    form.append('prompt', 'Job titles: Product Manager, Software Engineer, Data Scientist, UX Designer, Marketing Manager, Sales Executive, Financial Analyst. Industries: fintech, edtech, healthtech, crypto, SaaS, e-commerce.');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY_Joe_Bone}`
      },
      body: form
    });

    if (!response.ok) {
      console.error('OpenAI transcription error:', await response.text());
      return res.status(200).json({ error: "Couldn't hear that — try typing instead." });
    }

    const data = await response.json();
    const transcript = (data.text || '').trim();
    if (!transcript) return res.status(200).json({ error: "Didn't catch that — try again." });

    return res.status(200).json({ transcript });

  } catch (e) {
    console.error('Transcribe handler error:', e);
    return res.status(200).json({ error: "Couldn't hear that — try typing instead." });
  }
};
