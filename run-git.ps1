# Git Commands Script for TutorsPool
# This script bypasses PowerShell execution policy issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TutorsPool Git Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parse command line arguments
$gitCommand = $args[0]
$message = $args[1]

switch ($gitCommand) {
    "status" {
        Write-Host "Checking git status..." -ForegroundColor Green
        git status
    }
    "add" {
        Write-Host "Adding all changes..." -ForegroundColor Green
        git add .
        Write-Host "Changes staged successfully!" -ForegroundColor Green
    }
    "commit" {
        if ($message) {
            Write-Host "Committing changes..." -ForegroundColor Green
            git commit -m $message
            Write-Host "Changes committed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Error: Commit message required!" -ForegroundColor Red
            Write-Host "Usage: .\run-git.ps1 commit 'Your commit message'" -ForegroundColor Yellow
        }
    }
    "push" {
        Write-Host "Pushing to remote repository..." -ForegroundColor Green
        git push origin main
        Write-Host "Changes pushed successfully!" -ForegroundColor Green
    }
    "pull" {
        Write-Host "Pulling from remote repository..." -ForegroundColor Green
        git pull origin main
        Write-Host "Changes pulled successfully!" -ForegroundColor Green
    }
    "quick" {
        if ($message) {
            Write-Host "Quick commit and push..." -ForegroundColor Green
            git add .
            git commit -m $message
            git push origin main
            Write-Host "All done!" -ForegroundColor Green
        } else {
            Write-Host "Error: Commit message required!" -ForegroundColor Red
            Write-Host "Usage: .\run-git.ps1 quick 'Your commit message'" -ForegroundColor Yellow
        }
    }
    "log" {
        Write-Host "Showing recent commits..." -ForegroundColor Green
        git log --oneline -10
    }
    "diff" {
        Write-Host "Showing changes..." -ForegroundColor Green
        git diff
    }
    "branch" {
        Write-Host "Showing branches..." -ForegroundColor Green
        git branch -a
    }
    default {
        Write-Host "Usage: .\run-git.ps1 [command] [message]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  status   - Show git status" -ForegroundColor White
        Write-Host "  add      - Stage all changes (git add .)" -ForegroundColor White
        Write-Host "  commit   - Commit changes (requires message)" -ForegroundColor White
        Write-Host "  push     - Push to remote repository" -ForegroundColor White
        Write-Host "  pull     - Pull from remote repository" -ForegroundColor White
        Write-Host "  quick    - Add, commit, and push (requires message)" -ForegroundColor White
        Write-Host "  log      - Show recent commits" -ForegroundColor White
        Write-Host "  diff     - Show changes" -ForegroundColor White
        Write-Host "  branch   - Show branches" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\run-git.ps1 status" -ForegroundColor White
        Write-Host "  .\run-git.ps1 commit 'Fix navigation bug'" -ForegroundColor White
        Write-Host "  .\run-git.ps1 quick 'Update tests'" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
