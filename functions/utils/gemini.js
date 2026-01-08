export function getLlmConfigs(env) {
  const apiKey = env.GEMINI_API_KEY;
  const litellmBaseUrl = env.LITELLM_BASE_URL;
  const litellmApiKey = env.LITELLM_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const configs = [];

  // 1. Primary: Custom LiteLLM Proxy (OpenAI Compatible)
  // Only add this config if the URL is valid and NOT a placeholder
  if (litellmBaseUrl && !litellmBaseUrl.includes("your-litellm-server") && litellmBaseUrl.trim() !== "") {
    const cleanBase = litellmBaseUrl.replace(/\/$/, '');
    configs.push({
      name: "LiteLLM Proxy",
      provider: "litellm",
      url: `${cleanBase}/v1/chat/completions`,
      // Use env variable if available, otherwise default to a known working model tag
      // Note: Your LiteLLM server likely maps generic names like 'gemini-1.5-flash' to specific endpoints
      model: env.LITELLM_MODEL || "gemini/gemini-2.5-flash",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${litellmApiKey || "sk-1234"}`
      }
    });
  }

  // 2. Fallback: Official Google Gemini API (Native)
  // This uses the v1beta endpoint structure
  configs.push({
    name: "Google Official",
    provider: "google",
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    model: "gemini-2.5-flash",
    headers: { "Content-Type": "application/json" }
  });

  return configs;
}