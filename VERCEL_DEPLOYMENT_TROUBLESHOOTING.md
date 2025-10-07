# 🔧 Vercel Deployment Troubleshooting Guide

Your deployment failed. Follow these steps to fix it.

---

## 🚨 Most Common Issues & Fixes

### Issue 1: Missing Dependencies (Most Likely)

**Error:** `Cannot find package '@google/generative-ai'` or `Cannot find package 'openai'`

**Fix:**

```bash
# Install missing dependencies
npm install --legacy-peer-deps

# Commit and push
git add package-lock.json
git commit -m "Fix: Install missing dependencies"
git push
```

**Or update `package.json` to remove optional AI dependencies:**

In `server/services/aiChatService.ts`, the imports are commented out, so you can safely remove from package.json if not using AI:

```json
// Remove these lines from dependencies if not using AI:
"@google/generative-ai": "^0.21.0",
"openai": "^4.77.3",  // This is in devDependencies
```

---

### Issue 2: Build Command Issues

**Error:** `Build failed` or `Command "npm run vercel-build" exited with 1`

**Fix 1: Simplify Build Command**

Update `vercel.json`:

```json
{
  "buildCommand": "npm run build"
}
```

Or in Vercel Dashboard:
- Project Settings > Build & Development Settings
- Build Command: `npm run build` (remove `vercel-build`)

**Fix 2: Check TypeScript Errors**

```bash
npm run type-check
```

If errors, fix them or temporarily skip:

Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build",  // Remove tsc from here
    "vercel-build": "vite build --mode production"
  }
}
```

---

### Issue 3: Environment Variables Not Set

**Error:** `JWT_SECRET is not defined` or similar

**Fix:**

1. Go to Vercel Dashboard
2. Your Project > Settings > Environment Variables
3. Add these MINIMUM required variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your_generated_secret_here
   ```

4. Redeploy:
   - Deployments tab > Three dots > Redeploy

---

### Issue 4: Node Version Mismatch

**Error:** `The engine "node" is incompatible`

**Fix:**

Add to `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### Issue 5: Output Directory Not Found

**Error:** `Error: No Output Directory named "dist" found`

**Fix:**

Ensure build creates `dist` folder:

```bash
# Test locally
npm run build
ls dist  # Should show files
```

If empty, check `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    outDir: 'dist',  // Make sure this is set
  }
})
```

---

## 🔍 How to Find the Actual Error

### Step 1: Check Vercel Build Logs

1. Go to Vercel Dashboard
2. Click on the failed deployment
3. Click "View Build Logs"
4. Scroll to the RED error messages
5. Copy the error message

### Step 2: Common Error Patterns

**Pattern 1: Module Not Found**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'XXX'
```
**Fix:** Install the package: `npm install XXX`

**Pattern 2: TypeScript Error**
```
error TS2307: Cannot find module 'XXX'
```
**Fix:** Install types: `npm install -D @types/XXX` or fix import

**Pattern 3: Build Failure**
```
npm ERR! code ELIFECYCLE
```
**Fix:** Run `npm run build` locally to see the actual error

**Pattern 4: Memory Error**
```
JavaScript heap out of memory
```
**Fix:** Increase memory in `vercel.json`:
```json
{
  "functions": {
    "api/index.js": {
      "memory": 3008
    }
  }
}
```

---

## ✅ Quick Fix Checklist

Try these in order:

### 1. Fix Dependencies (Most Likely)

```bash
# Remove the troublesome AI import temporarily
# Edit server/services/aiChatService.ts - the import is already commented out

# Install all deps
npm install --legacy-peer-deps

# Commit and push
git add .
git commit -m "Fix: Resolve dependencies"
git push
```

### 2. Simplify Build Process

Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

```bash
git add package.json
git commit -m "Fix: Simplify build command"
git push
```

### 3. Test Build Locally

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# If it works, commit everything
git add .
git commit -m "Fix: Clean install and successful build"
git push
```

### 4. Set Minimum Environment Variables

In Vercel Dashboard, set:
- `NODE_ENV` = `production`
- `JWT_SECRET` = (generate with: `openssl rand -base64 32`)

---

## 🆘 Nuclear Option: Start Fresh

If nothing works, do a clean setup:

### Step 1: Reset Package Lock

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Step 2: Remove AI Dependencies Temporarily

Edit `package.json` - remove these from dependencies:
```json
// Remove or comment out:
"@google/generative-ai": "^0.21.0",
```

From devDependencies:
```json
// Remove or comment out:
"openai": "^4.77.3",
```

### Step 3: Simplify Build

Update `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

### Step 4: Test Locally

```bash
npm run build
```

### Step 5: Commit and Push

```bash
git add .
git commit -m "Fix: Simplify for Vercel deployment"
git push
```

---

## 📊 Post-Fix: Verify Deployment

After fixing, verify:

1. ✅ Build succeeds in Vercel
2. ✅ Website loads: `https://your-app.vercel.app`
3. ✅ API health check: `https://your-app.vercel.app/api/health`
4. ✅ Can login
5. ✅ Basic features work

---

## 🔄 Add AI Back Later

Once basic deployment works:

1. Install AI package:
   ```bash
   npm install @google/generative-ai --legacy-peer-deps
   ```

2. Uncomment in `server/services/aiChatService.ts`:
   ```typescript
   import { GoogleGenerativeAI } from '@google/generative-ai';
   ```

3. Add env var in Vercel:
   ```
   GOOGLE_AI_API_KEY=your_key_here
   AI_PROVIDER=google
   ```

4. Commit and redeploy:
   ```bash
   git add .
   git commit -m "Add: Google Gemini AI integration"
   git push
   ```

---

## 📞 Still Stuck?

Share the **exact error message** from Vercel build logs, and I can provide specific guidance.

### Where to find build logs:
1. Vercel Dashboard
2. Your project
3. Click the failed deployment
4. "View Build Logs" button
5. Copy the ERROR lines (red text)

---

**Most likely fix:** Run `npm install --legacy-peer-deps` then commit and push!

