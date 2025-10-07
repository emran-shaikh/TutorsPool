# 🔄 Complete Restart Guide for TutorsPool

## Step 1: Stop All Running Services

### Stop Frontend (Port 5173)
In the PowerShell terminal running Vite:
- Press `Ctrl + C` to stop the frontend server

### Stop Backend (Port 5174) - if running
In any terminal running the backend:
- Press `Ctrl + C` to stop the backend server

---

## Step 2: Install Missing Dependencies

Open **Git Bash** (or PowerShell) and run:

```bash
npm install
```

This will install all packages including `@google/generative-ai` with the fixed `sonner` version.

---

## Step 3: Start Backend Server

In **Git Bash** or **PowerShell Terminal 1**, run:

```bash
npm run server:dev
```

✅ **Expected Output:**
```
✅ AI Chat Service initialized with Google Gemini
Tutorspool API listening on http://localhost:5174
```

---

## Step 4: Start Frontend

In **PowerShell Terminal 2** (or a new terminal), run:

```bash
npm run dev
```

✅ **Expected Output:**
```
VITE v5.4.19 ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.100.24:5173/
```

---

## Step 5: Verify Everything Works

1. **Open Browser**: http://localhost:5173
2. **Test Login**: Try logging in with any account
3. **Test Chatbot**: Click the chat button and send a message
4. **Check AI**: Chatbot should use Google Gemini (not fallback)

---

## 📊 Final Status Check

After restart, you should have:

✅ Frontend running on port 5173  
✅ Backend running on port 5174  
✅ AI Chatbot with Google Gemini active  
✅ Login working  
✅ All features operational  

---

## 🚨 If You Get Errors

**Error: Port already in use**
- Kill the process using that port
- Or use `npm run dev` (it will find next available port)

**Error: Cannot find module '@google/generative-ai'**
- Make sure you ran `npm install` in Step 2
- Check that `package.json` shows `"@google/generative-ai": "^0.21.0"`

**Error: Backend won't start**
- Make sure `.env.local` file exists
- Contains: `GOOGLE_AI_API_KEY=AIzaSyAkeA7LykGr9ckcT50JH7Ie2kUUU5s7T4M`
- Contains: `AI_PROVIDER=google`

---

## 📝 Quick Commands Summary

```bash
# Stop all services (Ctrl+C in each terminal)

# Install dependencies
npm install

# Start backend (Terminal 1)
npm run server:dev

# Start frontend (Terminal 2)
npm run dev
```

---

**That's it!** Your TutorsPool app should now be fully functional with AI chatbot! 🎉

