# ⚡ Quick Commands Reference - TutorsPool

## 🧪 Testing

```powershell
# Run all tests
.\run-tests.ps1 all

# Run specific test suite
.\run-tests.ps1 gen-001    # Loading
.\run-tests.ps1 gen-002    # Navigation
.\run-tests.ps1 gen-003    # Forms
.\run-tests.ps1 gen-004    # Accessibility
.\run-tests.ps1 gen-005    # Network

# Watch mode
.\run-tests.ps1 watch

# Coverage report
.\run-tests.ps1 coverage
```

---

## 🚀 Development

```powershell
# Start frontend (http://localhost:5173)
.\run-dev.ps1 frontend

# Start backend (http://localhost:5174)
.\run-dev.ps1 backend

# Build for production
.\run-dev.ps1 build

# Preview production
.\run-dev.ps1 preview
```

---

## 📦 Git Operations

```powershell
# Quick commit & push
.\run-git.ps1 quick "Your message"

# Individual commands
.\run-git.ps1 status
.\run-git.ps1 add
.\run-git.ps1 commit "Message"
.\run-git.ps1 push
.\run-git.ps1 pull

# View history
.\run-git.ps1 log
.\run-git.ps1 diff
```

---

## 🔥 Most Used Commands

```powershell
# 1. Test everything
.\run-tests.ps1 all

# 2. Start development
.\run-dev.ps1 frontend

# 3. Commit changes
.\run-git.ps1 quick "Update feature"

# 4. Check status
.\run-git.ps1 status
```

---

## 💡 Pro Tips

**Run tests before committing:**
```powershell
.\run-tests.ps1 all
.\run-git.ps1 quick "Tests passing"
```

**Start both servers (2 terminals):**
```powershell
# Terminal 1
.\run-dev.ps1 frontend

# Terminal 2
.\run-dev.ps1 backend
```

**Check changes before pushing:**
```powershell
.\run-git.ps1 status
.\run-git.ps1 diff
.\run-git.ps1 push
```

---

## 📖 Need Help?

```powershell
# Show test options
.\run-tests.ps1

# Show dev options
.\run-dev.ps1

# Show git options
.\run-git.ps1
```

**Full documentation**: See `TERMINAL_FIX_GUIDE.md`
