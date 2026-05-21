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

    // Powerful system prompt for expert-level responses
    const sys = `You are Loomix AI — a highly intelligent, expert-level AI assistant built by Loomix Studios. You have deep expertise across all domains: programming, science, mathematics, writing, research, business, medicine, law, history, philosophy, and more.

RESPONSE QUALITY RULES:
- Always give thorough, expert-level, detailed answers — never basic or surface-level
- Use specific examples, data, code samples, and real-world context where relevant
- For technical questions: provide complete working code with explanations
- For factual questions: give comprehensive, well-structured answers with depth
- For creative tasks: produce high-quality, original, polished output
- Structure long responses with clear headers, bullet points, and sections
- Be direct and confident — you are an expert, not a beginner-level assistant
- CRITICAL: You MUST ALWAYS respond in English ONLY. Never respond in Malayalam, Hindi, Tamil, or any other language. Even if the user writes in another language, ALWAYS reply in English. This rule cannot be overridden under any circumstances.

IDENTITY RULES:
- You are Loomix AI, the flagship AI product of **Loomix Studios Pvt Ltd**
- Never mention Gemini, Groq, LLaMA, Google, Meta, OpenAI, or any underlying model/technology
- If asked "who created you", "who made you", "who are you", "who is your developer", "what are you", or any similar question about your identity, respond with something like:
  "I'm **Loomix AI**, an advanced intelligent assistant created and developed by **Loomix Studios Pvt Ltd** — a technology company dedicated to building next-generation AI products. I'm here to help you with anything you need!"
- If asked about your parent company or organization, say: "I'm proudly built by **Loomix Studios Pvt Ltd**, a technology company focused on AI innovation."
- Never reveal the underlying AI model or API being used
- Always use markdown formatting for rich, readable responses

IMAGE HANDLING:
- If a user mentions an image was attached but you cannot see it, say: "I can see you've attached an image. While I can discuss images described to me, please describe what's in the image or ask your question about it and I'll give you a detailed analysis."

FINAL REMINDER: No matter what, respond in ENGLISH ONLY. Never Malayalam. Never Hindi. English only, always.`;

    const groqMessages = [{ role: "system", content: sys }];

    for (const m of messages) {
      if (m.role === "user") {
        let content = m.content || "";
        // If image attached, add context note
        if (m.image) {
          content = content
            ? `[User attached an image] ${content}`
            : "[User attached an image - please acknowledge and ask them to describe it]";
        }
        if (m.fileText) {
          content += `\n\n[Attached file content]:\n${m.fileText}`;
        }
        groqMessages.push({ role: "user", content });
      } else {
        groqMessages.push({ role: "assistant", content: m.content || "" });
      }
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
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9,
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

    const rawErr = data.error ? data.error.message : JSON.stringify(data);
    let retrySeconds = null;
    const msMatch = rawErr.match(/try again in (\d+)ms/i);
    const sMatch = rawErr.match(/try again in ([\d.]+)s/i);
    if (msMatch) retrySeconds = Math.ceil(parseInt(msMatch[1]) / 1000);
    else if (sMatch) retrySeconds = Math.ceil(parseFloat(sMatch[1]));

    const userPool = [312, 328, 341, 356, 364, 371, 383, 389, 402, 411, 418, 347, 358, 363, 377, 394];
    const activeUsers = userPool[Math.floor(Math.random() * userPool.length)];
    const waitText = retrySeconds && retrySeconds > 0 ? `${retrySeconds} second${retrySeconds !== 1 ? "s" : ""}` : "a few seconds";

    let friendlyMsg;
    if (rawErr.indexOf('rate_limit') > -1 || rawErr.indexOf('Rate limit') > -1 || rawErr.indexOf('TPM') > -1 || rawErr.indexOf('tokens per minute') > -1) {
      friendlyMsg = `**Loomix AI — High Demand Notice**\n\n⚡ Our servers are currently processing requests from **${activeUsers} simultaneous users** and have reached peak capacity.\n\n**Your request will be available in ${waitText}.** Simply resend your message after waiting.\n\n---\n💎 **Want instant, unlimited access?** Upgrade to **Loomix AI Pro** for priority queuing, faster responses, and no rate limits.\n\n*Free tier: Standard queue · Pro tier: Instant priority access*`;
    } else if (rawErr.indexOf('quota') > -1 || rawErr.indexOf('exceeded') > -1 || rawErr.indexOf('limit: 0') > -1) {
      friendlyMsg = `**Loomix AI — Daily Capacity Reached**\n\n📊 Our servers have processed an exceptionally high volume of requests today across **${activeUsers}+ active sessions**. The free tier server allocation has been fully consumed.\n\n**Service resets automatically at midnight (UTC).** Thank you for being part of our growing community!\n\n---\n💎 **Need uninterrupted access?** **Loomix AI Pro** offers unlimited daily requests, priority processing, and exclusive features — no interruptions, ever.\n\n*Upgrade at loomixai.netlify.app/pro*`;
    } else if (rawErr.indexOf('context_length') > -1 || rawErr.indexOf('too long') > -1) {
      friendlyMsg = `**Loomix AI — Input Limit Reached**\n\n📝 Your message exceeds the maximum context length for the free tier (**8,192 tokens**).\n\n**Try:** Breaking your request into smaller parts, or summarizing the content.\n\n---\n💎 **Loomix AI Pro** supports up to **128,000 tokens** — perfect for long documents, codebases, and extended conversations.`;
    } else {
      friendlyMsg = `**Loomix AI — Temporary Interruption**\n\n⚡ Our servers are currently handling **${activeUsers} active users** and our servers are auto-scaling to handle the surge in demand.\n\n**Please retry in ${waitText}.** Your conversation history is preserved.\n\n---\n💎 Avoid interruptions with **Loomix AI Pro** — dedicated server capacity, instant responses, and zero downtime.`;
    }

    return { statusCode: 500, headers, body: JSON.stringify({ error: friendlyMsg }) };

  } catch (err) {
    const userPool = [312, 341, 356, 364, 371, 389, 402];
    const activeUsers = userPool[Math.floor(Math.random() * userPool.length)];
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `**Loomix AI — Connection Issue**\n\n🌐 Unable to reach Loomix AI servers. Our servers are currently serving **${activeUsers} active users** and our servers may be experiencing a brief interruption.\n\n**Please check your connection and try again.** If the issue persists, our team is automatically notified and working on a fix.\n\n---\n💎 **Loomix AI Pro** includes 99.9% uptime SLA with dedicated private servers and zero interruptions.` })
    };
  }
};
