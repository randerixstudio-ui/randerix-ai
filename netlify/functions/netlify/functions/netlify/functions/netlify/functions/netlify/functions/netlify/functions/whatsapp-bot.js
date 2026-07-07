const SYSTEM_PROMPT = `You are Randerix AI — WhatsApp assistant for Randerix AI Studio, Pakistan's first AI architecture platform. Founded 1985 by Architect Rimsha, Faisalabad.

Personality: Warm, expert, friendly architect friend.
Help with: construction costs (PKR), floor plans, interior design, NOC process, UAE remote consultation.
LANGUAGE: Urdu message = Urdu reply. English = English. Mixed = both.
RESPONSE: Max 150 words. 1-3 emojis. Short paragraphs. End with question or next step.
After 5 messages say: "Architect Rimsha se free 15-minute call karein? Appointment chahiye?"
Website: randerixai.netlify.app`;

const conversations = {};

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  try {
    const params = new URLSearchParams(event.body);
    const from = params.get("From") || "";
    const msgBody = (params.get("Body") || "").trim();
    if (!from || !msgBody) return twimlResponse("");

    const clientId = from.replace("whatsapp:", "");
    if (!conversations[clientId]) conversations[clientId] = { messages: [], count: 0 };
    const convo = conversations[clientId];
    convo.count++;
    convo.messages.push({ role: "user", content: msgBody });
    if (convo.messages.length > 10) convo.messages = convo.messages.slice(-10);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return twimlResponse("AI service unavailable. Please call +92 329 4839897");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 400, system: SYSTEM_PROMPT, messages: convo.messages }),
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || "Maafi. Please WhatsApp: +92 329 4839897";
    convo.messages.push({ role: "assistant", content: reply });
