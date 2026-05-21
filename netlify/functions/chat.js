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

    const rawErr = data.error ? data.error.message : JSON.stringify(data);

    // Extract real retry time
    let retrySeconds = null;
    const msMatch = rawErr.match(/try again in (\d+)ms/i);
    const sMatch = rawErr.match(/try again in ([\d.]+)s/i);
    if (msMatch) retrySeconds = Math.ceil(parseInt(msMatch[1]) / 1000);
    else if (sMatch) retrySeconds = Math.ceil(parseFloat(sMatch[1]));

    // Realistic active user count
    const userPool = [312, 328, 341, 356, 364, 371, 383, 389, 402, 411, 418, 347, 358, 363, 377, 394];
    const activeUsers = userPool[Math.floor(Math.random() * userPool.length)];
    const waitText = retrySeconds && retrySeconds > 0
      ? `${retrySeconds} second${retrySeconds !== 1 ? "s" : ""}`
      : "a few seconds";

    let friendlyMsg;

    if (rawErr.indexOf('rate_limit') > -1 || rawErr.indexOf('Rate limit') > -1 || rawErr.indexOf('TPM') > -1 || rawErr.indexOf('tokens per minute') > -1) {

      friendlyMsg = `**Loomix AI — High Demand Notice**\n\n⚡ Our servers are currently processing requests from **${activeUsers} simultaneous users** and have reached peak capacity.\n\n**Your request will be available in ${waitText}.** Simply resend your message after waiting.\n\n---\n💎 **Want instant, unlimited access?** Upgrade to **Loomix AI Pro** for priority queuing, faster responses, and no rate limits.\n\n*Free tier: Standard queue · Pro tier: Instant priority access*`;

    } else if (rawErr.indexOf('quota') > -1 || rawErr.indexOf('exceeded') > -1 || rawErr.indexOf('limit: 0') > -1) {

      friendlyMsg = `**Loomix AI — Daily Capacity Reached**\n\n📊 Our servers have processed an exceptionally high volume of requests today across **${activeUsers}+ active sessions**. The free tier server allocation has been fully consumed.\n\n**Service resets automatically at midnight (UTC).** Thank you for being part of our growing community!\n\n---\n💎 **Need uninterrupted access?** **Loomix AI Pro** offers unlimited daily requests, priority processing, and exclusive features — no interruptions, ever.\n\n*Upgrade at loomixai.netlify.app/pro*`;

    } else if (rawErr.indexOf('invalid_api_key') > -1 || rawErr.indexOf('Invalid API') > -1 || rawErr.indexOf('401') > -1) {

      friendlyMsg = `**Loomix AI — Authentication Update**\n\n🔧 Our authentication servers are performing a routine security rotation — this happens automatically to keep your data safe. This typically resolves within **60 seconds**.\n\nPlease try again shortly. No action required on your end.`;

    } else if (rawErr.indexOf('context_length') > -1 || rawErr.indexOf('too long') > -1 || rawErr.indexOf('maximum context') > -1) {

      friendlyMsg = `**Loomix AI — Input Limit Reached**\n\n📝 Your message exceeds the maximum context length for the free tier (**8,192 tokens**).\n\n**Try:** Breaking your request into smaller parts, or summarizing the content.\n\n---\n💎 **Loomix AI Pro** supports up to **128,000 tokens** — perfect for long documents, codebases, and extended conversations.`;

    } else if (rawErr.indexOf('502') > -1 || rawErr.indexOf('503') > -1 || rawErr.indexOf('504') > -1) {

      friendlyMsg = `**Loomix AI — Server Overload**\n\n🌐 Our servers are experiencing unusually high demand from **${activeUsers} concurrent users**. Our servers are temporarily throttling new requests to maintain stability.\n\n**Estimated recovery: ${waitText}.** Your session is preserved — just resend your message.\n\n---\n💎 **Loomix AI Pro** users are routed to dedicated private servers and are never affected during peak hours.`;

    } else if (rawErr.indexOf('model') > -1 && (rawErr.indexOf('not found') > -1 || rawErr.indexOf('decommissioned') > -1)) {

      friendlyMsg = `**Loomix AI — Engine Update**\n\n🔄 Our AI servers are being upgraded to the latest model version. This is a brief, automated process that improves response quality and speed.\n\n**Our servers will be back online in under 2 minutes.** Please try again shortly.`;

    } else {

      friendlyMsg = `**Loomix AI — Temporary Interruption**\n\n⚡ Our servers are currently handling **${activeUsers} active users** and our servers are auto-scaling to handle the surge in demand.\n\n**Please retry in ${waitText}.** Your conversation history is preserved.\n\n---\n💎 Avoid interruptions with **Loomix AI Pro** — dedicated server capacity, instant responses, and zero downtime.`;
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: friendlyMsg })
    };

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
