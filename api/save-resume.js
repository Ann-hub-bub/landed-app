// Forwards resumes uploaded in the landing-page demo to Anna's Google Drive
// via a Google Apps Script Web App, which also emails her a notification.
const GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwxkga9p2Iy-6Zg4_lrpW9qO01HKd6aEtfPaxGdbEGwvVDnIdVsLN20c3Dyz0Q7RhWI/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { filename, mimeType, base64, timestamp } = req.body || {};
  if (!filename || !base64) return res.status(400).json({ error: 'Missing file' });

  if (!GAS_WEBHOOK_URL || GAS_WEBHOOK_URL.startsWith('REPLACE_WITH')) {
    console.error('save-resume: GAS_WEBHOOK_URL not configured yet');
    return res.status(200).json({ ok: false });
  }

  try {
    const resp = await fetch(GAS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'resume',
        filename,
        mimeType: mimeType || 'application/octet-stream',
        base64,
        timestamp: timestamp || new Date().toISOString()
      })
    });
    if (!resp.ok) console.error('save-resume: Apps Script responded', resp.status);
    return res.status(200).json({ ok: resp.ok });
  } catch (e) {
    console.error('save-resume handler error:', e);
    return res.status(200).json({ ok: false });
  }
};
