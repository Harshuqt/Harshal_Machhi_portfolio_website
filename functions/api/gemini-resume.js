import { HARSHAL_PROFILE } from '../context.js';
import { callLlmWithFallback } from '../utils/llm-client.js';
import { verifyTurnstile } from '../utils/turnstile.js';
import { logToDiscord } from '../utils/logger.js';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { jobDescription, token } = body; // Expect token from frontend

    // 1. Verify Turnstile
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const verification = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);

    if (!verification.success) {
      return new Response(JSON.stringify({ error: verification.error }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!jobDescription) {
      return new Response(JSON.stringify({ error: "Job description is required." }), { status: 400 });
    }

    const systemInstruction = `You are an expert technical recruiter. Analyze the resume against the JD strictly.
    Return ONLY a JSON response matching this schema:
    {
      "match_score": Number (0-100),
      "key_strengths": [String],
      "missing_critical_skills": [String],
      "verdict": "1-sentence summary",
      "growth_plan": "Short encouraging sentence if score < 60, else null"
    }`;

    const prompt = `
      ${systemInstruction}
      RESUME: ${HARSHAL_PROFILE}
      JOB DESCRIPTION: ${jobDescription}
    `;

    let text = await callLlmWithFallback(env, prompt, true);

    // Cleanup potential markdown if the model ignores the JSON-only instruction
    if (text) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // LOGGING: Parse the JSON result to log useful info
    if (context.waitUntil) {
      try {
        const result = JSON.parse(text);
        const score = result.match_score || "N/A";
        const verdict = result.verdict || "No verdict provided";

        context.waitUntil(
          logToDiscord(
            env.DISCORD_RESUME_WEBHOOK_URL,
            "📄 New Resume Analysis",
            [
              { name: "Input Job Description", value: jobDescription.substring(0, 500) + (jobDescription.length > 500 ? "..." : "") },
              { name: "Match Score", value: `${score}/100`, inline: true },
              { name: "Verdict", value: verdict, inline: true }
            ],
            request,
            'RESUME'
          )
        );
      } catch (logErr) {
        console.error("Logging parse error:", logErr);
        // Even if parsing fails, try to log the raw text if possible, or just ignore to not break flow
      }
    }

    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Resume Error:", err);
    return new Response(JSON.stringify({ error: "Failed to analyze resume.", details: err.message }), { status: 500 });
  }
}