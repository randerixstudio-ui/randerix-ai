exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const { size, beds, family, floors, req } = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }) };

    const system = `You are an expert Pakistani architect at Randerix AI Studio. CRITICAL: Respond with ONLY valid JSON, no markdown, no backticks. Use this exact structure:
{"plot_size":"<text>","total_covered_area_sqft":<number>,"ground_floor":[{"room":"<name>","room_urdu":"<urdu>","size_sqft":"<dim>"}],"upper_floor":[{"room":"<name>","room_urdu":"<urdu>","size_sqft":"<dim>"}],"optimization_tips":["<tip1>","<tip2>","<tip3>"],"common_mistakes":["<m1>","<m2>"],"summary_urdu":"<text>","summary_english":"<text>"}`;

    const prompt = `Design floor plan for: Plot: ${size}, Bedrooms: ${beds}, Family: ${family}, Floors: ${floors}, Requirements: ${req || "Standard family home"}. Respond with ONLY the JSON object.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, system, messages: [{ role: "user", content: prompt }] }),
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
