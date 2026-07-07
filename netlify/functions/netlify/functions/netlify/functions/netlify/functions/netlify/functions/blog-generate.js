exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const { topic, category, tone, length } = JSON.parse(event.body);
    if (!topic) return { statusCode: 400, body: JSON.stringify({ error: "Topic is required" }) };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }) };

    const wordTarget = length === "short" ? "500-700" : length === "long" ? "1200-1500" : "800-1000";

    const system = `You are the content writer for Randerix AI Studio, Pakistan's first AI-powered architecture platform. Write SEO-optimized, practical, locally-relevant blog articles about architecture, construction, and interior design for Pakistani audience. You know Pakistani building costs, material brands, NOC processes, marla/kanal terminology, and local city contexts.

CRITICAL: Respond with ONLY valid JSON, no markdown, no backticks. Use this exact structure:
{"title":"<text>","title_urdu":"<text>","category":"<text>","read_time":"<text>","excerpt":"<text>","sections":[{"heading":"<text>","content":"<text>"}],"key_takeaways":["<t1>","<t2>","<t3>","<t4>"],"urdu_summary":"<text>","tags":["<tag1>","<tag2>","<tag3>","<tag4>"]}

Write ${wordTarget} words. Use ${tone || "professional yet approachable"} tone. Include real Pakistani details: price ranges, brand names (Berger, ICI Dulux, Lucky Cement, Interwood), city-specific notes.`;

    const prompt = `Write a complete blog article on: "${topic}". Category: ${category || "Architecture Tips"}. Respond with ONLY the JSON object.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, system, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message }) };

    let raw = data.content?.[0]?.text || "{}";
    raw = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error: " + err.message }) };
  }
};
