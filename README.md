# **Harshal Machhi - AI-Powered Portfolio Website**

A premium, high-performance portfolio website built with **Vite**, **React**, and **Tailwind CSS**. This project features cutting-edge AI integrations including a Gemini-powered Job Description Analyzer and an intelligent Portfolio Assistant, all secured by Cloudflare Turnstile and deployed on Cloudflare Pages.


## **✨ Key Features**
- **🤖 AI Job Description Analyzer**: Leverages Google Gemini API to analyze how well Harshal's skills match a specific Job Description provided by recruiters.
- **💬 Floating AI Portfolio Assistant**: An intelligent chatbot that answers questions about Harshal's professional background and technical skills.
- **🌗 Adaptive Glassmorphism Theme**: A stunning modern UI with seamless Dark and Light mode support, featuring neon emerald accents.
- **🛡️ Enterprise-Grade Security**: Integrated Cloudflare Turnstile bot protection for all AI features and contact forms.
- **📧 Secure Messaging**: Contact form submissions are processed via Cloudflare Functions and delivered directly to Discord via Webhooks.
- **⚡ High Performance**: Optimized build using Vite and deployed globally via Cloudflare's Edge Network.

***

## **📋 Prerequisites**

Before starting, ensure you have the following:

1. **Node.js & npm:** Download from [nodejs.org](https://nodejs.org/) (v18+ recommended)
2. **Git:** Installed and configured ([git-scm.com](https://git-scm.com/))
3. **GitHub Account:** To host your repository
4. **Cloudflare Account:** Free account at [dash.cloudflare.com](https://dash.cloudflare.com/)
5. **Discord Account:** To create a webhook for contact form notifications

***

## **🚀 Step 1: Initialize Project Locally**

### 1. Create and Setup Vite Project

```bash
# Create project directory
mkdir portfolio-website
cd portfolio-website

# Initialize Vite with React template
npm create vite@latest . -- --template react

# Install base dependencies
npm install
```

### 2. Install Required Packages

```bash
# Install Tailwind CSS and PostCSS
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p

# Install icon library
npm install lucide-react
```

***

## **🎨 Step 2: Configure Tailwind CSS**

### 1. Update `tailwind.config.js`

Replace the entire file content with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 2. Update `src/index.css`

Replace all content with the Tailwind directives:

```css
@import "tailwindcss";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Note:** Do NOT use `@import "tailwindcss"` - use the three separate directives above for proper Tailwind functionality.

***

## **💻 Step 3: Add Application Code**

### 1. Replace `src/App.jsx`

- Delete default code in `src/App.jsx`
- Paste your complete portfolio React component code

### 2. Add Assets to `public/` Folder

Navigate to the `public/` directory and add:

- **Profile Picture:** `profilepic.jpg` (or match your code's filename)
- **Resume PDF:** `Harshal_Machhi_resume.pdf`
- **Certificates:** All certificate PDFs/images
  - `brightso_certificate.pdf`
  - `Scaler_DevOps_October_2025.pdf`
  - etc.

**Important:** Ensure all filenames match exactly with your code references.

***

## **🔐 Step 4: Setup Cloudflare Turnstile**

### 1. Create Turnstile Widget

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Turnstile**
2. Click **Add Site**
3. Configure widget:
   - **Site Name:** Portfolio Contact Form
   - **Domain:** `localhost` (for development)
   - **Widget Mode:** Managed (recommended)
4. Click **Create**
5. Copy both keys:
   - **Site Key** (public - for frontend)
   - **Secret Key** (private - for backend)

> [!TIP]
> **React Multi-Widget Tip**: If you implement multiple Turnstile instances (e.g. for different views like Input and Results), ensure you use unique `useRef` hooks and unique `key` props on container divs. This prevents widget "ghosting" or duplication during React re-renders.

### 2. Add Domain After Deployment

**Critical:** After deploying, return to Turnstile settings and add your production domain (e.g., `portfolio-website.pages.dev`) to the **Domain Allowlist**.[2]

***

## **🔒 Step 5: Setup Secure Backend (Cloudflare Functions)**

This function securely processes contact form submissions without exposing your Discord webhook URL.[3]

### 1. Create Directory Structure

In your project root (where `package.json` exists):

```bash
mkdir -p functions/api
```

### 2. Create `functions/api/send-message.js`

Paste this code:

```javascript
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;
    const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY;

    // Validate environment variables
    if (!DISCORD_WEBHOOK_URL || !TURNSTILE_SECRET_KEY) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, message, "cf-turnstile-response": token } = body;

    // Validate required fields
    if (!fullName || !email || !message || !token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }), 
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 1. Verify Turnstile Token
    const verifyFormData = new FormData();
    verifyFormData.append('secret', TURNSTILE_SECRET_KEY);
    verifyFormData.append('response', token);
    verifyFormData.append('remoteip', request.headers.get('CF-Connecting-IP') || '');

    const verifyResult = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: verifyFormData,
      }
    );

    const verifyOutcome = await verifyResult.json();
    
    if (!verifyOutcome.success) {
      console.error('Turnstile verification failed:', verifyOutcome['error-codes']);
      return new Response(
        JSON.stringify({ error: "Bot verification failed" }), 
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 2. Send to Discord
    const discordPayload = {
      embeds: [{
        title: "🚀 New Portfolio Contact",
        color: 0x10b981,
        fields: [
          { name: "👤 Full Name", value: fullName, inline: true },
          { name: "📧 Email", value: email, inline: true },
          { name: "📱 Phone", value: phone || "Not Provided", inline: true },
          { name: "📝 Message", value: message.substring(0, 1024) }
        ],
        footer: { text: "Verified via Cloudflare Turnstile ✓" },
        timestamp: new Date().toISOString()
      }]
    };

    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      console.error('Discord webhook failed:', await discordResponse.text());
      return new Response(
        JSON.stringify({ error: "Message delivery failed" }), 
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you! Your message has been sent." 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error('Server error:', err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
```

***

## **☁️ Step 6: Deploy to Cloudflare Pages**

### 1. Push to GitHub

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Portfolio website"
git branch -M main

# Create new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate: **Workers & Pages** → **Create Application** → **Pages**
3. Select **Connect to Git**
4. Choose your GitHub repository (`portfolio-website`)

### 3. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (default) |

### 4. Set Environment Variables

**Critical Step:** Before deploying, add these environment variables:[4][3]

Click **Environment variables (advanced)** and add:

| Variable Name | Value | Type | Notes |
|---------------|-------|------|-------|
| `DISCORD_WEBHOOK_URL` | `...` | Secret | Contact Form Webhook |
| `DISCORD_CHAT_WEBHOOK_URL` | `...` | Secret | **(New)** AI Chat Logger Webhook |
| `DISCORD_RESUME_WEBHOOK_URL` | `...` | Secret | **(New)** Resume Analyzer Logger Webhook |
| `TURNSTILE_SECRET_KEY` | `0x4AAAA...` | Secret | Cloudflare Turnstile Secret Key |
| `VITE_TURNSTILE_SITE_KEY` | `0x4AAAA...` | Plain text | Cloudflare Turnstile Site Key (public) |
| `GEMINI_API_KEY` | `AIzaSyB...` | Secret | Your Google AI Studio API Key |
| `LITELLM_BASE_URL` | `https://...` | Secret | (Optional) Fallback LLM URL |
| `LITELLM_API_KEY` | `sk-...` | Secret | (Optional) Fallback LLM Key |
| `LITELLM_MODEL` | `gemini/gemini-1.5-pro` | Plain Text | (Optional) Override Model Name |

**Environment Scope:** Set these for both **Production** and **Preview** environments in the Cloudflare Pages dashboard.

### 5. Deploy

Click **Save and Deploy**. Wait 2-5 minutes for the build to complete.[5]

***

## **✅ Step 7: Post-Deployment Configuration**

### 1. Update Turnstile Domain Allowlist

1. Copy your deployed URL (e.g., `portfolio-website.pages.dev`)
2. Go to Cloudflare Dashboard → **Turnstile** → Your Widget
3. Click **Settings**
4. Add your domain to **Domain Allowlist**:
   - `portfolio-website.pages.dev`
   - `www.your-custom-domain.com` (if applicable)
5. Save changes

### 2. Create Discord Webhook

1. Open Discord → Select your server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Configure:
   - **Name:** Portfolio Contact
   - **Channel:** Select notification channel
5. Click **Copy Webhook URL**
6. Add this URL to Cloudflare Pages environment variables

### 3. Test Your Site

1. Visit your deployed URL
2. Test the contact form with Turnstile verification
3. Verify form submission appears in Discord
4. Test resume download functionality
5. Check all certificate links

***

## **🛠️ Local Development**

### 1. Setup Local Environment

Create `.env.local` in project root:

```env
VITE_TURNSTILE_SITE_KEY=0x4AAAA...your_site_key
```

**Note:** Do NOT add secret keys to `.env.local` - these are only for Cloudflare Functions.[6][7]

### 2. Add to `.gitignore`

Ensure your `.gitignore` includes:

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Cloudflare
.dev.vars
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to view your site.

**Important:** Turnstile verification will only work locally if you added `localhost` to your Turnstile widget's domain allowlist.[2]

***

## **🐛 Common Issues & Solutions**

### Issue 1: Tailwind Styles Not Working

**Solution:** Ensure `src/index.css` uses the three separate directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Issue 2: Environment Variables Not Loading

**Solution:** 
- For Vite: Use `VITE_` prefix and access via `import.meta.env.VITE_*`[6]
- For Cloudflare Functions: Access via `env.*` parameter (no prefix needed)
- Redeploy after adding new environment variables

### Issue 3: Turnstile Verification Fails

**Solution:**
- Verify domain is in Turnstile allowlist
- Check both Site Key (frontend) and Secret Key (backend) are correct
- Ensure Secret Key is set in Cloudflare Pages, not in frontend code

### Issue 4: Discord Webhook Not Receiving Messages

**Solution:**
- Test webhook URL manually using curl or Postman
- Check Cloudflare Functions logs for errors
- Verify `DISCORD_WEBHOOK_URL` environment variable is set correctly

***

## **📚 Additional Resources**

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)[1]
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)[8]
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)

***

## **🎉 Next Steps**

After successful deployment:

1. **Custom Domain:** Add your custom domain in Cloudflare Pages settings
2. **Analytics:** Enable Cloudflare Web Analytics for visitor tracking
3. **SEO:** Add meta tags, Open Graph images, and sitemap
4. **Performance:** Test with Lighthouse and optimize assets
5. **SSL:** Verify HTTPS is working (automatic with Cloudflare)

***

**Need Help?** Check Cloudflare Pages logs in the dashboard under **Workers & Pages** → Your Project → **Deployments** → **View logs**.

***

## Key Fixes Made:

1. **Tailwind CSS Configuration:** Fixed the `index.css` to use proper directives instead of `@import`[1]
2. **Environment Variables:** Clarified the difference between `VITE_` prefixed variables (frontend) and non-prefixed (backend)[7][6]
3. **Error Handling:** Enhanced the Cloudflare Function with better validation and error messages[2]
4. **Turnstile Setup:** Added clear steps for domain allowlist configuration[2]
5. **Discord Webhook:** Added steps to create and configure Discord webhooks
6. **Local Development:** Clarified `.env.local` usage and security practices[7]
7. **Troubleshooting:** Added common issues section
8. **Structure:** Improved formatting, readability, and logical flow
9. **AI Integration**: Added Gemini API support for Resume Matching and Chat Assistant.
10. **Adaptive Theme**: Implemented comprehensive Dark/Light mode with CSS variable-based theming.
11. **UI Clarity**: Fixed text and element visibility in light mode using robust utility overrides.
12. **Turnstile UX**: Corrected Turnstile widget duplication and positioning in the results view.
13. **Added Lightmode** Added Lightmode
