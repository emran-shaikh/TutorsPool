# 🔐 TutorsPool Environment Variables Guide

Complete reference for all environment variables used in TutorsPool.

---

## 📋 Table of Contents

1. [Quick Setup](#quick-setup)
2. [Required Variables](#required-variables)
3. [Optional Variables](#optional-variables)
4. [Environment-Specific Variables](#environment-specific-variables)
5. [Security Best Practices](#security-best-practices)

---

## 🚀 Quick Setup

### Development
```bash
cp env.example .env.local
# Edit .env.local with your development values
```

### Production
```bash
cp env.production.example .env.production.local
# Edit .env.production.local with your production values
# Then set these in Vercel Dashboard > Environment Variables
```

---

## ✅ Required Variables

These variables MUST be set for the application to work:

### Security

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `JWT_SECRET` | Secret key for JWT token generation | `your_super_secret_key_32_chars` | Generate: `openssl rand -base64 32` |
| `NODE_ENV` | Application environment | `production` | Set automatically by Vercel |

### URLs

| Variable | Description | Example | Environment |
|----------|-------------|---------|-------------|
| `VITE_FRONTEND_URL` | Frontend application URL | `https://tutorspool.vercel.app` | Client-side |
| `FRONTEND_URL` | Frontend URL for server | `https://tutorspool.vercel.app` | Server-side |
| `VITE_API_URL` | Backend API URL | `https://tutorspool.vercel.app/api` | Client-side |
| `BACKEND_URL` | Backend URL for server | `https://tutorspool.vercel.app/api` | Server-side |

### Firebase (Client-side - Safe to Expose)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyAbc123...` | Firebase Console > Project Settings > General |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `myapp.firebaseapp.com` | Firebase Console > Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `my-project-id` | Firebase Console > Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `myapp.firebasestorage.app` | Firebase Console > Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` | Firebase Console > Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc` | Firebase Console > Project Settings |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID | `G-ABC123` | Firebase Console > Project Settings (Analytics) |

### Firebase Admin (Server-side - KEEP SECRET!)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `my-project-id` | Service Account JSON |
| `FIREBASE_PRIVATE_KEY_ID` | Private Key ID | `abc123...` | Service Account JSON |
| `FIREBASE_PRIVATE_KEY` | Private Key | `"-----BEGIN...-----\n"` | Service Account JSON (escape newlines) |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | `firebase-adminsdk@...` | Service Account JSON |
| `FIREBASE_CLIENT_ID` | Client ID | `123456789` | Service Account JSON |
| `FIREBASE_AUTH_URI` | Auth URI | `https://accounts.google.com/o/oauth2/auth` | Service Account JSON |
| `FIREBASE_TOKEN_URI` | Token URI | `https://oauth2.googleapis.com/token` | Service Account JSON |

> **How to get Firebase Admin credentials:**
> 1. Go to Firebase Console > Project Settings > Service Accounts
> 2. Click "Generate New Private Key"
> 3. Download the JSON file
> 4. Extract values and format properly (escape `\n` in private key)

### Stripe Payment

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key | `pk_live_...` or `pk_test_...` | Stripe Dashboard > Developers > API keys |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_live_...` or `sk_test_...` | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_...` | Stripe Dashboard > Developers > Webhooks |

> ⚠️ **Production:** Use `pk_live_` and `sk_live_` keys  
> 🧪 **Development:** Use `pk_test_` and `sk_test_` keys

---

## 🔧 Optional Variables

These enhance functionality but aren't required:

### AI Chatbot

#### Option 1: Google Gemini (Recommended - Free Tier Available)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `AI_PROVIDER` | AI provider selection | `google` | Set to `google` |
| `GOOGLE_AI_API_KEY` | Google AI API Key | `AIzaSy...` | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `GOOGLE_AI_MODEL` | Model to use | `gemini-pro` | `gemini-pro` or `gemini-2.0-flash` |

#### Option 2: OpenAI

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `AI_PROVIDER` | AI provider selection | `openai` | Set to `openai` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-...` | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| `OPENAI_MODEL` | Model to use | `gpt-3.5-turbo` | `gpt-3.5-turbo` or `gpt-4` |

#### Option 3: Anthropic Claude

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `AI_PROVIDER` | AI provider selection | `anthropic` | Set to `anthropic` |
| `ANTHROPIC_API_KEY` | Anthropic API Key | `sk-ant-...` | [Anthropic Console](https://console.anthropic.com/) |
| `ANTHROPIC_MODEL` | Model to use | `claude-3-sonnet-20240229` | Model name |

#### Option 4: Local/Rule-based (No API Key)

| Variable | Description | Example |
|----------|-------------|---------|
| `AI_PROVIDER` | AI provider selection | `local` |

### WhatsApp Business API

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `VITE_WHATSAPP_ACCESS_TOKEN` | WhatsApp Access Token | `EAAXUlG3a7Gc...` | [Meta for Developers](https://developers.facebook.com/) |
| `VITE_WHATSAPP_PHONE_NUMBER_ID` | Phone Number ID | `841145552417635` | Meta Business Suite > WhatsApp |
| `VITE_WHATSAPP_BUSINESS_ACCOUNT_ID` | Business Account ID | `792592937027748` | Meta Business Suite > WhatsApp |
| `VITE_ADMIN_WHATSAPP_NUMBER` | Admin WhatsApp Number | `+1234567890` | Your WhatsApp number |
| `WHATSAPP_WEBHOOK_SECRET` | Webhook Secret | `your_secret` | Create your own |
| `WHATSAPP_VERIFY_TOKEN` | Webhook Verify Token | `your_token` | Create your own |

### Email Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP Server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP Port | `587` |
| `SMTP_USER` | Email Address | `noreply@yourdomain.com` |
| `SMTP_PASS` | Email Password/App Password | `your_app_password` |

### Google Services

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `GOOGLE_MAPS_API_KEY` | Google Maps API Key | `AIzaSy...` | [Google Cloud Console](https://console.cloud.google.com/) |

### Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `USE_FIREBASE` | Use Firebase | `true` |
| `USE_SUPABASE` | Use Supabase | `false` |

### Application Settings

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_NAME` | Application Name | `TutorsPool` |
| `APP_VERSION` | Application Version | `1.0.0` |
| `APP_DOMAIN` | Application Domain | `tutorspool.vercel.app` |
| `PORT` | Server Port (local dev) | `5174` |

### File Upload

| Variable | Description | Example |
|----------|-------------|---------|
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `pdf,doc,docx,jpg,png` |

---

## 🌍 Environment-Specific Variables

### Development (.env.local)

```env
NODE_ENV=development
VITE_FRONTEND_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5174/api
BACKEND_URL=http://localhost:5174
PORT=5174

# Use test/sandbox keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Production (.env.production.local + Vercel)

```env
NODE_ENV=production
VITE_FRONTEND_URL=https://tutorspool.vercel.app
FRONTEND_URL=https://tutorspool.vercel.app
VITE_API_URL=https://tutorspool.vercel.app/api
BACKEND_URL=https://tutorspool.vercel.app/api

# Use live keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 🔒 Security Best Practices

### 1. Variable Naming Convention

- **`VITE_*`** = Client-side (exposed in browser, safe for public)
- **No prefix** = Server-side only (never exposed to browser)

### 2. Secret Management

✅ **DO:**
- Store secrets in environment variables
- Use different keys for dev/staging/production
- Rotate secrets regularly
- Use strong, random values for JWT_SECRET
- Keep Firebase Admin credentials secure

❌ **DON'T:**
- Hardcode secrets in source code
- Commit `.env.local` or `.env.production.local` to Git
- Share secrets via insecure channels
- Use the same secrets across environments

### 3. Firebase Private Key Formatting

The `FIREBASE_PRIVATE_KEY` must be properly formatted:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w...\n-----END PRIVATE KEY-----\n"
```

- Must be wrapped in quotes
- Use `\n` for newlines (not actual line breaks)
- Include BEGIN and END markers

### 4. Vercel Environment Variables

When setting in Vercel Dashboard:

1. Go to Project Settings > Environment Variables
2. Add each variable
3. Select correct environment:
   - **Production** = production deployments
   - **Preview** = PR previews
   - **Development** = local development
4. Mark sensitive variables as "Sensitive" (they'll be hidden)

### 5. Generate Secure Secrets

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Webhook Secret
openssl rand -hex 32

# Random token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Testing Environment Variables

### Verify Client-side Variables (Browser Console)

```javascript
console.log(import.meta.env.VITE_FIREBASE_API_KEY);
console.log(import.meta.env.VITE_API_URL);
```

### Verify Server-side Variables (API)

```bash
curl https://your-app.vercel.app/api/health
```

---

## 🔍 Troubleshooting

### Issue: Variables Not Working

1. **Check naming:**
   - Client-side MUST start with `VITE_`
   - Server-side should NOT have `VITE_` prefix

2. **Rebuild after changes:**
   ```bash
   # Development
   npm run dev
   
   # Production (Vercel)
   Trigger redeploy in Vercel Dashboard
   ```

3. **Verify in Vercel:**
   - Go to Project Settings > Environment Variables
   - Check variable is set for correct environment
   - Check for typos

### Issue: Firebase Private Key Error

Format correctly:
```bash
# Extract from service account JSON and format
cat firebase-service-account.json | jq -r '.private_key' | sed ':a;N;$!ba;s/\n/\\n/g'
```

---

## 📝 Environment Variables Checklist

### Minimum for Development
- [ ] `JWT_SECRET`
- [ ] `VITE_FRONTEND_URL`
- [ ] `VITE_API_URL`
- [ ] Firebase client variables (7 vars)
- [ ] Firebase admin variables (7 vars)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (test)
- [ ] `STRIPE_SECRET_KEY` (test)

### Minimum for Production
- [ ] All development variables
- [ ] Update URLs to production domain
- [ ] Update Stripe to live keys
- [ ] `GOOGLE_AI_API_KEY` (if using AI)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] WhatsApp variables (if using)

---

## 📞 Support

For help with environment variables:
1. Check this guide
2. Review `env.example` and `env.production.example`
3. Check Vercel documentation
4. Verify provider documentation (Firebase, Stripe, etc.)

---

*Last Updated: October 7, 2025*

