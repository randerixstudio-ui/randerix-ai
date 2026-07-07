exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const { image_base64, media_type, notes } = JSON.parse(event.body);
    if (!image_base64) return { statusCode: 400, body: JSON.stringify({ error: "No image provided" }) };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY missing" }) };

    const system = `You are an expert Pakistani architect at Randerix AI Studio. Interpret a hand-drawn floor plan sketch and convert it to a structured digital plan. CRITICAL: Respond with ONLY valid JSON, no markdown, no backticks. Use this exact structure:
{"interpretation_notes":"<text>","plot_size_estimate":"<text>","rooms":[{"room":"<name>","room_urdu":"<urdu>","size_sqft":"<dim>","position":"<location>"}],"layout_grid":{"cols":<2-4>,"rows":<1-4>,"cells":[{"room":"<name>","col_span":<1-2>,"row_span":<1-2>,"col_start":<0-indexed>,"row_start":<0-indexed>}]},"elevation_concept":{"style":"<text>","facade_description":"<text>","materials":["<m1>","<m2>","<m3>"],"key_features":["<f1>","<f2>","<f3>"]},"summary_english":"<text>","summary_urdu":"<text>"}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media_type || "image/jpeg", data: image_base64 } },
            { type: "text", text: `Interpret this hand-drawn floor plan sketch. ${notes ? "Client notes: " + notes : ""} Respond with ONLY the JSON object.` }
          ]
        }]
      }),
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
