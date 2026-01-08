/**
 * Verifies a Cloudflare Turnstile token.
 * 
 * @param {string} token - The token from the frontend.
 * @param {string} secretKey - The Cloudflare Turnstile Secret Key.
 * @param {string} ip - The client's IP address.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyTurnstile(token, secretKey, ip) {
    if (!token) {
        return { success: false, error: "Missing Turnstile token" };
    }

    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);

    try {
        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const outcome = await result.json();

        if (!outcome.success) {
            console.error('Turnstile verification failed:', outcome['error-codes']);
            return { success: false, error: "Bot check failed" };
        }

        return { success: true };
    } catch (err) {
        console.error('Turnstile verification error:', err);
        return { success: false, error: "Verification server error" };
    }
}
