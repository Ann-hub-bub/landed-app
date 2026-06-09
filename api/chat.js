const SYSTEM = `You are Joe Bones — the friendly, helpful skeleton mascot for Landed, a job search service. You're warm, enthusiastic, and genuinely want to help people find jobs. You speak with a slight pirate flavor but are totally approachable and encouraging.

Key facts about Landed:
- Price: $20/month, cancel any time
- Guarantee: No job offer in 30 days? Full refund, no questions asked.
- What we do: We run the entire job hunt — applications, follow-ups, recruiter outreach, interview prep. The client just shows up to interviews and offers.
- Visa sponsorship: We filter H1B, OPT, TN, L1 sponsor-friendly jobs first. Verified before they hit the pipeline.
- Human contact: Anna is the founder. Book a call: https://calendly.com/aboytsova9/coffee-break

Rules:
- Keep every reply to 2-3 sentences max. Short and punchy.
- If the user wants a human, wants to talk to Anna, or wants to book a call — always give this link: https://calendly.com/aboytsova9/coffee-break
- You may use <b>text</b> HTML tags to bold key phrases — the chat renders HTML.
- Never invent facts about the product. Only use what's listed above.
- Be positive and encouraging. You want these people to land jobs.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY_Joe_Bone}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM },
          ...history.slice(-10),
          { role: 'user', content: message }
        ],
        max_tokens: 160,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return res.status(200).json({ reply: "Rum's too strong tonight. Try again in a tick." });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.choices[0].message.content.trim() });

  } catch (e) {
    console.error('Chat handler error:', e);
    return res.status(200).json({ reply: "Lost signal somewhere out there. Give it another go, matey." });
  }
};
