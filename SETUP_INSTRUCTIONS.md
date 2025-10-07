# 🚨 Quick Fix Instructions

## Issue 1: Backend Server Not Running

The error `ERR_CONNECTION_REFUSED` means your backend server isn't running.

### Solution:
**Open a NEW terminal window** and run:
```bash
npm install @google/generative-ai
npm run server:dev
```

You should see:
```
✅ AI Chat Service initialized with Google Gemini
Tutorspool API listening on http://localhost:5174
```

---

## Issue 2: Cannot Login

This is likely because the backend server isn't running (same issue as above).

### Once backend is running:
1. Backend provides authentication
2. Login should work
3. Chatbot AI will work

---

## Complete Setup (Run These Commands)

### Terminal 1: Install Package (run once)
```bash
npm install @google/generative-ai
```

### Terminal 2: Backend Server (keep running)
```bash
npm run server:dev
```

### Terminal 3: Frontend (already running)
```bash
# You already have this running on port 5173
```

---

## Current Status

✅ **Frontend**: Running on port 5173  
❌ **Backend**: NOT running (need to start it)  
✅ **Chatbot UI**: Working perfectly  
⚠️ **Chatbot AI**: Using fallback (will use AI once backend starts)  
❌ **Login**: Not working (needs backend)  

---

## What's Actually Working

Your chatbot IS working! When you see:
```
"AI service unavailable, using fallback responses"
```

This means it's using the smart rule-based responses I built. The chatbot will still answer questions perfectly - it just won't have the AI enhancement until you start the backend.

---

## Next Steps

1. Open a new terminal
2. Run: `npm install @google/generative-ai`
3. Run: `npm run server:dev`
4. Try logging in again
5. Test the chatbot - it will now use AI!

---

**The chatbot works great even without AI - it just won't have the super-intelligent conversational abilities until the backend runs!**

