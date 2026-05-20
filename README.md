# 🚀 Loomix AI — Deployment Guide

Complete setup: **GitHub + Netlify + Gemini API = 100% Free Forever**

---

## 📁 Project Structure

```
loomix-ai/
├── public/
│   ├── index.html          ← Main app (frontend)
│   ├── manifest.json       ← PWA manifest
│   └── sw.js               ← Service worker (offline support)
├── netlify/
│   └── functions/
│       └── chat.js         ← Secure AI backend (serverless)
├── .env.example            ← Environment variable template
├── .gitignore
├── netlify.toml            ← Netlify configuration
├── package.json
└── README.md
```

---

## ✅ Step 1 — Get Your FREE Gemini API Key

1. Go to **https://aistudio.google.com**
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Click **"Create API key"**
5. Copy the key (starts with `AIza...`)
6. **Keep it secret — never share it publicly**

**Free limits:** 1,500 requests/day, 15 requests/minute — perfect for 200 msgs/day ✅

---

## ✅ Step 2 — Upload to GitHub

### Option A: GitHub Website (No coding needed)

1. Go to **https://github.com** → Sign up / Log in
2. Click **"New repository"** (green button)
3. Name it: `loomix-ai`
4. Set to **Public**
5. Click **"Create repository"**
6. Click **"uploading an existing file"**
7. Upload ALL the project files maintaining the folder structure:
   - Drag the entire `loomix-ai` folder contents
8. Click **"Commit changes"**

### Option B: Git Command Line

```bash
cd loomix-ai
git init
git add .
git commit -m "🚀 Initial Loomix AI deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/loomix-ai.git
git push -u origin main
```

---

## ✅ Step 3 — Deploy on Netlify (Free)

1. Go to **https://netlify.com** → Sign up with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"** → Select your `loomix-ai` repository
4. Build settings (auto-detected from netlify.toml):
   - **Build command:** *(leave empty)*
   - **Publish directory:** `public`
5. Click **"Deploy site"**

### ⚠️ IMPORTANT — Add Your API Key

After deploying:
1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Key: `GEMINI_API_KEY`
4. Value: Paste your Gemini API key here
5. Click **"Save"**
6. Go to **Deploys** → Click **"Trigger deploy"** → **"Deploy site"**

Your site is now live at: `https://your-site-name.netlify.app` 🎉

---

## ✅ Step 4 — Custom Domain (Optional, Free)

1. In Netlify → **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS instructions from your domain provider

---

## 🔧 Local Development (Optional)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create your local env file
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run locally
netlify dev
# Opens at http://localhost:8888
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Gemini API | 1,500 req/day | 200 msgs/day | **₹0** |
| Netlify Hosting | 100GB bandwidth/month | ~1GB | **₹0** |
| Netlify Functions | 125,000 calls/month | ~6,000/month | **₹0** |
| GitHub | Unlimited public repos | 1 repo | **₹0** |
| **TOTAL** | | | **₹0/month** |

---

## 🛡️ Security Features

- ✅ API key **never exposed** to users (server-side only)
- ✅ All AI requests go through Netlify Functions (backend)
- ✅ No database needed — uses browser localStorage
- ✅ No user accounts needed
- ✅ HTTPS by default on Netlify
- ✅ Zero data collection

---

## 📱 PWA Install

Users can install Loomix AI as a native app:
- **Mobile:** Tap browser menu → "Add to Home Screen"
- **Desktop Chrome:** Click install icon in address bar

---

## 🔄 Updating Your Site

1. Edit files locally
2. Push to GitHub: `git push`
3. Netlify auto-deploys in ~30 seconds

---

## ❓ Troubleshooting

**"Service configuration error"**
→ Your GEMINI_API_KEY is not set in Netlify environment variables

**"Unable to connect"**
→ Check your internet connection

**Functions not working locally**
→ Make sure `.env.local` has your API key and you're using `netlify dev`

**Rate limit errors**
→ You've exceeded 15 requests/minute. The free tier resets every minute.

---

## 🎨 Customization

Edit `public/index.html` to customize:
- Bot name (search for "Loomix AI")
- Colors (edit CSS variables at top of `<style>`)
- Quick prompt cards
- Greeting messages

Edit `netlify/functions/chat.js` to customize:
- AI personality/system prompt
- Safety settings
- Response length

---

Built with ❤️ — Powered by Loomix AI Engine
