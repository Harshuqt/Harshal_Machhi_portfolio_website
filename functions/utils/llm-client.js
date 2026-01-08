import { getLlmConfigs } from './gemini.js';

function createPayload(provider, model, prompt, isJsonMode = false) {
    if (provider === "litellm") {
        // OpenAI Format
        return {
            model: model,
            messages: [{ role: "user", content: prompt }],
            // LiteLLM/OpenAI JSON mode is usually response_format: { type: "json_object" }
            // but for simplicity/compatibility we rely on the system prompt instruction.
            ...(isJsonMode ? { response_format: { type: "json_object" } } : {})
        };
    } else {
        // Google Format
        return {
            contents: [{ parts: [{ text: prompt }] }],
            ...(isJsonMode ? { generationConfig: { responseMimeType: "application/json" } } : {})
        };
    }
}

async function parseResponse(provider, response) {
    const data = await response.json();
    
    if (provider === "litellm") {
        return data.choices?.[0]?.message?.content || null;
    } else {
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
}

/**
 * Main function to call LLM with automatic fallback.
 * @param {Object} env - Cloudflare environment variables
 * @param {String} prompt - The prompt to send
 * @param {Boolean} isJsonMode - Whether to request JSON output
 */
export async function callLlmWithFallback(env, prompt, isJsonMode = false) {
    const configs = getLlmConfigs(env);
    let lastError = null;

    for (const config of configs) {
        try {
            // console.log(`Attempting connection to ${config.name}...`); // Debugging
            
            const payload = createPayload(config.provider, config.model, prompt, isJsonMode);
            
            const response = await fetch(config.url, {
                method: "POST",
                headers: config.headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${config.name} API Error ${response.status}: ${errorText}`);
            }

            const text = await parseResponse(config.provider, response);
            
            if (text) {
                return text; // Success! Return the text immediately.
            } else {
                throw new Error(`${config.name} returned empty response.`);
            }

        } catch (err) {
            console.warn(`[LLM Fallback] ${config.name} failed: ${err.message}`);
            lastError = err;
            // The loop continues to the next config automatically
        }
    }

    // If we exit the loop, all providers failed
    throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
}