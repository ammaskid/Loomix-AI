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
    // Try Gemini first, then Groq as fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    const { messages } = JSON.parse(event.body);
    const sys = "You are Loomix AI, an advanced intelligent assistant. Never mention Gemini, Groq, Google, or any underlying technology. You are Loomix AI. Be helpful, friendly, and use markdown formatting.";

    // Try Gemini
    if (geminiKey) {
      const contents = [];
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        if (m.role === "user") {
          const parts = [{ text: i === 0 ? sys + "\n\n" + (m.content || "") : (m.content || "") }];
          if (m.image) parts.push({ inlineData: { mimeType: m.image.mimeType, data: m.image.data } });
          if (m.fileText) parts.push({ text: "\n\n[File]:\n" + m.fileText });
          contents.push({ role: "user", parts });
        } else {
          contents.push({ role: "model", parts: [{ text: m.content }] });
        }
      }
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + geminiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.9, maxOutputTokens: 2048 } }),
        }
      );
      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { statusCode: 200, headers, body: JSON.stringify({ response: data.candidates[0].content.parts[0].text }) };
      }
    }

    // Try Groq as fallback
    if (groqKey) {
      const groqMessages = [{ role: "system", content: sys }];
      for (const m of messages) {
        groqMessages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content || "" });
      }
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + groqKey },
        body: JSON.stringify({ model: "llama3-8b-8192", messages: groqMessages, max_tokens: 2048, temperature: 0.9 }),
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        return { statusCode: 200, headers, body: JSON.stringify({ response: data.choices[0].message.content }) };
      }
    }

    return { statusCode: 500, headers, body: JSON.stringify({ error: "No API key configured. Please add GEMINI_API_KEY or GROQ_API_KEY in Netlify environment variables." }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error: " + err.message }) };
  }
};
