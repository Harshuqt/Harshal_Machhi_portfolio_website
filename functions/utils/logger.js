/**
 * Utility to parse device details from User-Agent
 * @param {string} userAgent 
 * @returns {object} { browser, os, deviceType }
 */
function parseUserAgent(userAgent) {
    if (!userAgent) return { browser: 'Unknown', os: 'Unknown', deviceType: 'Unknown' };

    let browser = 'Unknown Browser';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown OS';
    if (userAgent.includes('Win')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'MacOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS';

    let deviceType = 'Desktop';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        deviceType = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceType = 'Tablet';
    }

    return { browser, os, deviceType };
}

/**
 * Sends a log message to a Discord Webhook
 * @param {string} webhookUrl - The specific Discord Webhook URL
 * @param {string} title - Title of the Embed
 * @param {Array} fields - Array of {name, value, inline} objects
 * @param {Request} request - The original Cloudflare Request object (for extracting IP/UA)
 * @param {string} type - 'CHAT' or 'RESUME' (controls color)
 */
export async function logToDiscord(webhookUrl, title, fields, request, type = 'CHAT') {
    if (!webhookUrl) {
        console.warn(`[Logger] No Webhook URL provided for ${type}. Logging skipped.`);
        return;
    }

    try {
        const ip = request.headers.get('CF-Connecting-IP') || 'Unknown IP';
        const country = request.headers.get('CF-IPCountry') || 'Unknown Country';
        const userAgent = request.headers.get('User-Agent') || '';
        const { browser, os, deviceType } = parseUserAgent(userAgent);

        // Define colors: Green for Chat, Purple for Resume
        const color = type === 'RESUME' ? 0x8b5cf6 : 0x10b981;

        // Add Metadata field automatically
        const metadataField = {
            name: "🕵️ User Metadata",
            value: `**IP:** ${ip} (${country})\n**Device:** ${deviceType} (${os})\n**Browser:** ${browser}`,
            inline: false
        };

        const payload = {
            embeds: [{
                title: title,
                color: color,
                fields: [...fields, metadataField], // Append metadata at the end
                timestamp: new Date().toISOString(),
                footer: { text: "Portfolio AI Logger v1.0" }
            }]
        };

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

    } catch (err) {
        console.error(`[Logger] Failed to log to Discord: ${err.message}`);
    }
}
