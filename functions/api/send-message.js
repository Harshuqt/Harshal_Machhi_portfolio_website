/**
 * Cloudflare Pages Function
 * Handles form submissions securely.
 * 1. Verifies Turnstile Token
 * 2. Sends Data to Discord
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;
    const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY;
    // Optional: Add TURNSTILE_SITE_KEY to backend env vars to verify the token belongs to us
    const TURNSTILE_SITE_KEY = env.TURNSTILE_SITE_KEY; 

    if (!DISCORD_WEBHOOK_URL || !TURNSTILE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Server configuration error." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse the incoming JSON request
    const body = await request.json();
    const { fullName, email, phone, message, "cf-turnstile-response": token } = body;

    // 1. Verify Turnstile Token
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing verification token." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Call Cloudflare Verify API
    const verifyFormData = new FormData();
    verifyFormData.append('secret', TURNSTILE_SECRET_KEY);
    verifyFormData.append('response', token);
    verifyFormData.append('remoteip', request.headers.get('CF-Connecting-IP'));

    const verifyResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyFormData,
    });
    
    const verifyOutcome = await verifyResult.json();
    if (!verifyOutcome.success) {
      return new Response(JSON.stringify({ error: "Verification failed." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Send to Discord
    if (!fullName || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const discordPayload = {
      embeds: [{
        title: "🚀 New Portfolio Contact",
        color: 0x10b981, 
        fields: [
          { name: "👤 Full Name", value: fullName, inline: true },
          { name: "📧 Email", value: email, inline: true },
          { name: "📱 Phone", value: phone || "Not Provided", inline: true },
          { name: "📝 Message", value: message }
        ],
        footer: { text: "Verified via Cloudflare Turnstile" },
        timestamp: new Date().toISOString()
      }]
    };

    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (discordResponse.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Discord integration failed." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}