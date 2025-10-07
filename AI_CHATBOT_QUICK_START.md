# 🚀 AI Chatbot - Quick Start Guide

## ✅ What's New?

Your TutorsPool chatbot is now **AI-powered**! It can understand natural conversation and provide intelligent, context-aware responses.

---

## 🎯 Setup in 3 Steps

### Step 1: Install OpenAI Package

```bash
npm install openai
```

### Step 2: Get a Free API Key (Choose ONE)

#### Option A: Google Gemini (FREE - Recommended for Testing)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"  
4. Copy your key

#### Option B: OpenAI (Best Quality - $5 free credit)

1. Go to: https://platform.openai.com/api-keys
2. Sign up/Login
3. Click "Create new secret key"
4. Copy your key (starts with `sk-...`)

### Step 3: Add API Key to Environment

Create a `.env.local` file in the project root:

```env
# For Google Gemini (Free)
AI_PROVIDER=google
GOOGLE_AI_API_KEY=your-google-ai-key-here

# OR for OpenAI (Better quality)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

---

## 🎮 Test It!

1. **Start servers:**
   ```bash
   npm run dev          # Frontend
   npm run server:dev   # Backend (in new terminal)
   ```

2. **Open browser:**
   - Go to `http://localhost:5173`
   - Click the chat button
   - Try asking: "What subjects do you offer?"

3. **You should see intelligent AI responses!**

---

## 💡 How It Works

### With AI (Recommended):
```
User: "I need help with calculus"
AI: "Great! We have excellent calculus tutors available.  
     Our calculus tutoring starts at $25/hour and includes:
     - One-on-one sessions
     - Homework help
     - Exam preparation
     Would you like to browse our calculus tutors?"
```

### Without AI (Fallback):
```
User: "I need help with calculus"
Bot: "We offer tutoring in 50+ subjects including Mathematics..."
```

---

## 🆓 Cost Comparison

| Provider | Free Tier | Best For | Quality |
|----------|-----------|----------|---------|
| **Google Gemini** | ✅ 60 req/min | Testing & Dev | ⭐⭐⭐⭐ |
| **OpenAI GPT-3.5** | $5 credit | Production | ⭐⭐⭐⭐⭐ |
| **Local Fallback** | ✅ Unlimited | No API needed | ⭐⭐⭐ |

---

## 🔧 Troubleshooting

### "OpenAI not initialized" or AI responses not working?

1. **Check if OpenAI package is installed:**
   ```bash
   npm list openai
   ```
   If not found, run: `npm install openai`

2. **Check environment file:**
   - Make sure `.env.local` exists in project root
   - API key is correct (no extra spaces)
   - `AI_PROVIDER` matches your provider

3. **Restart backend server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run server:dev
   ```

4. **Check logs:**
   - Look for: `✅ AI Chat Service initialized with OpenAI`
   - Or: `⚠️ AI Chat Service running in local mode`

### Still not working?

**No problem!** The chatbot will automatically use smart rule-based responses. It still works great without AI.

---

## 📊 What You Get

### ✅ With AI Integration:
- Natural, conversational responses
- Understands context and follow-up questions
- Personalized recommendations
- Smarter quick reply suggestions
- Better user experience

### ✅ Without AI (Fallback):
- Fast, reliable responses
- Covers all common questions
- No API costs
- Still fully functional

---

## 🎨 Features That Work Either Way

- ✅ Beautiful modern UI
- ✅ Quick reply buttons
- ✅ WhatsApp escalation
- ✅ Contact form integration
- ✅ Fast response times
- ✅ Mobile responsive
- ✅ Works on all pages

---

## 📝 Environment File Template

```env
# Copy this to .env.local

# AI Configuration (Choose ONE)

# Option 1: Google Gemini (FREE)
AI_PROVIDER=google
GOOGLE_AI_API_KEY=your-google-key-here

# Option 2: OpenAI (BEST QUALITY)
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-your-key-here
# OPENAI_MODEL=gpt-3.5-turbo

# Option 3: No AI (Fallback)
# AI_PROVIDER=local
```

---

## 🚀 Recommended Setup

### For Development:
```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=your-free-google-key
```
**Why:** Free, fast, good for testing

### For Production:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-3.5-turbo
```
**Why:** Best quality, ~$0.001 per conversation, very affordable

---

## ✨ Next Steps

1. ✅ Install `npm install openai`
2. ✅ Get free API key (Google Gemini recommended)
3. ✅ Create `.env.local` file
4. ✅ Restart servers
5. ✅ Test chatbot
6. 🎉 Enjoy AI-powered conversations!

---

**Need help?** The chatbot works perfectly without AI keys too - it just uses the smart rule-based responses we built!

**Ready for production?** See `AI_CHATBOT_SETUP_GUIDE.md` for detailed configuration options.

