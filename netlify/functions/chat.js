exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const GROQ_KEY = "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";

    const { messages } = JSON.parse(event.body);
    const sys = "You are Loomix AI, an advanced intelligent assistant. Never mention Gemini, Groq, Google, or any underlying technology. You are Loomix AI. Be helpful, friendly, and use markdown formatting.";

    const groqMessages = [{ role: "system", content: sys }];
    for (const m of messages) {
      groqMessages.push({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content || ""
      });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_KEY
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: groqMessages,
        max_tokens: 2048,
        temperature: 0.9
      }),
    });

    const data = await res.json();

    if (res.ok && data.choices && data.choices[0] && data.choices[0].message) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: data.choices[0].message.content })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: data.error ? data.error.message : JSON.stringify(data) })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error: " + err.message })
    };
  }
};
