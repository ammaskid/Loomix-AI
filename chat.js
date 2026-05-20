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

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured on server. Please contact admin." }),
      };
    }

    const body = JSON.parse(event.body);
    const messages = body.messages || [];

    const contents = [];
    const systemPrompt = "You are Loomix AI, an advanced intelligent assistant. You are helpful, knowledgeable, creative, and conversational. Never mention Gemini, Google, or any underlying technology. You are Loomix AI. Always respond in a friendly, clear, and engaging way. Support markdown formatting in responses.";

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        const parts = [];
        if (i === 0 && msg.content) {
          parts.push({ text: systemPrompt + "\n\n" + msg.content });
        } else if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (msg.image) {
          parts.push({ inlineData: { mimeType: msg.image.mimeType, data: msg.image.data } });
        }
        if (msg.fileText) {
          parts.push({ text: "\n\n[File content]:\n" + msg.fileText });
        }
        if (parts.length > 0) contents.push({ role: "user", parts });
      } else {
        contents.push({ role: "model", parts: [{ text: msg.content }] });
      }
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error && data.error.message ? data.error.message : "Loomix AI engine error.";
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: errMsg }),
      };
    }

    const text =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
        ? data.candidates[0].content.parts[0].text
        : "No response generated.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error: " + err.message }),
    };
  }
};
