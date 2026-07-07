exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const { size, city, finish, floors, extra } = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }) };

    const system = `You are an expert Pakistani construction cost estimator for Randerix AI Studio. You know current 2025-2026 material and labor costs across Pakistani cities. CRITICAL: Respond with ONLY valid JSON, no markdown, no backticks. Use this exact structure:
{"grey_structure_pkr":<number>,"semi_finished_pkr":<number>,"full_finished_pkr":<number>,"full_luxury_pkr":<number>,"rate_per_sqft_pkr":<number>,"material_cost_percent":<number>,"labor_cost_percent":<number>,"summary_english":"<text>","summary_urdu":"<text>","money_saving_tips":["<tip1>","<tip2>","<tip3>"],"timeline_months":"<text>"}`;

    const prompt = `Calculate construction cost for: Plot: ${size}, City: ${city}, Finishing: ${finish}, Floors: ${floors}, Special: ${extra || "None"}. Respond with ONLY the JSON object.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content: prompt }] }),
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
