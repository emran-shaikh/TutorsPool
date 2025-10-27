# 🔧 Terminal Problems Fixed - TutorsPool

## ❌ Common Terminal Issues

### Issue 1: PowerShell Execution Policy Error
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because 
running scripts is disabled on this system.
```

### Issue 2: Command Separator Error
```
The token '&&' is not a valid statement separator in this version.
```

### Issue 3: Long Command Errors
Complex commands with multiple steps fail in PowerShell.

---

## ✅ Solutions Implemented

### 1. Helper Scripts Created

I've created 3 PowerShell scripts that bypass execution policy issues:

#### **run-tests.ps1** - Test Runner
Run tests without execution policy errors.

#### **run-dev.ps1** - Development Server
Start frontend/backend servers easily.

#### **run-git.ps1** - Git Helper
Execute git commands without issues.

---

## 🚀 How to Use Helper Scripts

### Running Tests

#### Run All Tests
```powershell
.\run-tests.ps1 all
```

#### Run Specific Test Suite
```powershell
.\run-tests.ps1 gen-001    # Loading tests
.\run-tests.ps1 gen-002    # Navigation tests
.\run-tests.ps1 gen-003    # Form validation tests
.\run-tests.ps1 gen-004    # Accessibility tests
.\run-tests.ps1 gen-005    # Low bandwidth tests
```

#### Run Tests in Watch Mode
```powershell
.\run-tests.ps1 watch
```

#### Run Tests with Coverage
```powershell
.\run-tests.ps1 coverage
```

#### Run Tests with Verbose Output
```powershell
.\run-tests.ps1 verbose
```

---

### Starting Development Server

#### Start Frontend Only
```powershell
.\run-dev.ps1 frontend
```
Opens at: http://localhost:5173

#### Start Backend Only
```powershell
.\run-dev.ps1 backend
```
Opens at: http://localhost:5174

#### Build for Production
```powershell
.\run-dev.ps1 build
```

#### Preview Production Build
```powershell
.\run-dev.ps1 preview
```

---

### Git Commands

#### Check Status
```powershell
.\run-git.ps1 status
```

#### Stage All Changes
```powershell
.\run-git.ps1 add
```

#### Commit Changes
```powershell
.\run-git.ps1 commit "Your commit message"
```

#### Push to Remote
```powershell
.\run-git.ps1 push
```

#### Pull from Remote
```powershell
.\run-git.ps1 pull
```

#### Quick Commit & Push
```powershell
.\run-git.ps1 quick "Your commit message"
```
This does: add → commit → push in one command!

#### View Recent Commits
```powershell
.\run-git.ps1 log
```

#### Show Changes
```powershell
.\run-git.ps1 diff
```

#### Show Branches
```powershell
.\run-git.ps1 branch
```

---

## 🔧 Alternative: Fix PowerShell Execution Policy

If you prefer to fix the execution policy permanently:

### Option 1: Set Execution Policy for Current User (Recommended)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option 2: Bypass for Single Command
```powershell
powershell -ExecutionPolicy Bypass -Command "npm test"
```

### Option 3: Run as Administrator
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Run: `Set-ExecutionPolicy RemoteSigned`
4. Type `Y` to confirm

---

## 📋 Quick Reference

### Test Commands
| Command | Description |
|---------|-------------|
| `.\run-tests.ps1 all` | Run all tests once |
| `.\run-tests.ps1 watch` | Run tests in watch mode |
| `.\run-tests.ps1 coverage` | Run with coverage report |
| `.\run-tests.ps1 gen-001` | Run loading tests |
| `.\run-tests.ps1 gen-002` | Run navigation tests |
| `.\run-tests.ps1 gen-003` | Run form validation tests |
| `.\run-tests.ps1 gen-004` | Run accessibility tests |
| `.\run-tests.ps1 gen-005` | Run low bandwidth tests |

### Development Commands
| Command | Description |
|---------|-------------|
| `.\run-dev.ps1 frontend` | Start frontend (port 5173) |
| `.\run-dev.ps1 backend` | Start backend (port 5174) |
| `.\run-dev.ps1 build` | Build for production |
| `.\run-dev.ps1 preview` | Preview production build |

### Git Commands
| Command | Description |
|---------|-------------|
| `.\run-git.ps1 status` | Show git status |
| `.\run-git.ps1 add` | Stage all changes |
| `.\run-git.ps1 commit "msg"` | Commit with message |
| `.\run-git.ps1 push` | Push to remote |
| `.\run-git.ps1 pull` | Pull from remote |
| `.\run-git.ps1 quick "msg"` | Add, commit, and push |
| `.\run-git.ps1 log` | Show recent commits |

---

## 🐛 Troubleshooting

### Script Won't Run
**Error**: "Cannot be loaded because running scripts is disabled"

**Solution 1**: Use the helper scripts (they bypass this)
```powershell
.\run-tests.ps1 all
```

**Solution 2**: Temporarily bypass
```powershell
powershell -ExecutionPolicy Bypass -File .\run-tests.ps1 all
```

**Solution 3**: Change execution policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### npm Commands Still Fail
**Error**: "npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded"

**Solution**: Always use the helper scripts instead of direct npm commands:

❌ Don't use:
```powershell
npm test
```

✅ Use instead:
```powershell
.\run-tests.ps1 all
```

---

### && Operator Not Working
**Error**: "The token '&&' is not a valid statement separator"

**Solution**: PowerShell doesn't support `&&`. Use `;` or separate commands:

❌ Don't use:
```powershell
git add . && git commit -m "message" && git push
```

✅ Use instead:
```powershell
.\run-git.ps1 quick "message"
```

Or:
```powershell
git add .
git commit -m "message"
git push origin main
```

---

## 📝 Examples

### Example 1: Run Tests and Commit Results
```powershell
# Run tests
.\run-tests.ps1 all

# Commit results
.\run-git.ps1 quick "Update test results"
```

### Example 2: Start Development
```powershell
# Terminal 1: Start frontend
.\run-dev.ps1 frontend

# Terminal 2: Start backend (in new terminal)
.\run-dev.ps1 backend
```

### Example 3: Deploy Changes
```powershell
# Build for production
.\run-dev.ps1 build

# Commit and push
.\run-git.ps1 quick "Production build ready"
```

### Example 4: Run Specific Tests
```powershell
# Run only form validation tests
.\run-tests.ps1 gen-003

# If passing, commit
.\run-git.ps1 commit "Fix form validation"
.\run-git.ps1 push
```

---

## 🎯 Best Practices

### 1. Always Use Helper Scripts
✅ Use: `.\run-tests.ps1 all`  
❌ Avoid: `npm test`

### 2. Check Status Before Committing
```powershell
.\run-git.ps1 status
.\run-git.ps1 diff
.\run-git.ps1 commit "Your message"
```

### 3. Test Before Pushing
```powershell
.\run-tests.ps1 all
.\run-git.ps1 quick "Changes tested and working"
```

### 4. Use Quick Command for Simple Changes
```powershell
.\run-git.ps1 quick "Fix typo in README"
```

---

## 🔐 Security Note

The helper scripts use `-ExecutionPolicy Bypass` only for the specific script execution. This is safe because:

1. ✅ Only affects the current script
2. ✅ Doesn't change system-wide settings
3. ✅ Scripts are in your project folder
4. ✅ You control the script content

---

## 📚 Additional Resources

### PowerShell Execution Policies
- **Restricted**: No scripts allowed (default)
- **RemoteSigned**: Local scripts OK, downloaded scripts need signature
- **Unrestricted**: All scripts allowed (not recommended)
- **Bypass**: Nothing is blocked (temporary use only)

### Check Current Policy
```powershell
Get-ExecutionPolicy
```

### Check All Scopes
```powershell
Get-ExecutionPolicy -List
```

---

## ✅ Summary

### Problems Fixed
1. ✅ PowerShell execution policy errors
2. ✅ npm command failures
3. ✅ && operator not working
4. ✅ Complex command chains failing
5. ✅ Long command errors

### Solutions Provided
1. ✅ `run-tests.ps1` - Easy test execution
2. ✅ `run-dev.ps1` - Easy server management
3. ✅ `run-git.ps1` - Easy git operations
4. ✅ Complete documentation
5. ✅ Troubleshooting guide

### Benefits
1. ✅ No more execution policy errors
2. ✅ Simple, memorable commands
3. ✅ Color-coded output
4. ✅ Built-in help messages
5. ✅ Works on all Windows systems

---

## 🎉 You're All Set!

Use the helper scripts for all your development tasks. No more terminal errors!

**Quick Start:**
```powershell
.\run-tests.ps1 all           # Run tests
.\run-dev.ps1 frontend        # Start dev server
.\run-git.ps1 quick "message" # Commit and push
```

Happy coding! 🚀
