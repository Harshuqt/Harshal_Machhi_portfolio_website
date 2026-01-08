import { HARSHAL_PROFILE } from '../context.js';
import { callLlmWithFallback } from '../utils/llm-client.js';
import { verifyTurnstile } from '../utils/turnstile.js';
import { logToDiscord } from '../utils/logger.js';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { question, token } = body; // Expect token from frontend

    // 1. Verify Turnstile
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const verification = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);

    if (!verification.success) {
      return new Response(JSON.stringify({ error: verification.error }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required." }), { status: 400 });
    }

    const prompt = `
      You are Harshal's AI Portfolio Assistant. Answer the following question based strictly on Harshal's profile below.
      
      Profile:
      ${HARSHAL_PROFILE}

      User Question: "${question}"

      Guidelines:
      - Be professional, enthusiastic, and concise.
      - Highlight his hands-on experience with Oracle Cloud, secure Docker networking, and AI Ops if relevant.
      - Use 'Harshal' or 'He' when referring to him.
    `;

    const answer = await callLlmWithFallback(env, prompt, false);

    // LOGGING: Send to Discord in background (non-blocking)
    if (context.waitUntil) {
      context.waitUntil(
        logToDiscord(
          env.DISCORD_CHAT_WEBHOOK_URL,
          "💬 New Chat Interaction",
          [
            { name: "User Question", value: question.substring(0, 1024) },
            { name: "AI Answer", value: answer.substring(0, 1024) }
          ],
          request,
          'CHAT'
        )
      );
    }

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to chat.", details: err.message }), { status: 500 });
  }
}