# Run Tests Script for TutorsPool
# This script bypasses PowerShell execution policy issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TutorsPool Test Suite Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Parse command line arguments
$testType = $args[0]

switch ($testType) {
    "all" {
        Write-Host "Running all tests..." -ForegroundColor Green
        npm test -- --run
    }
    "watch" {
        Write-Host "Running tests in watch mode..." -ForegroundColor Green
        npm test
    }
    "coverage" {
        Write-Host "Running tests with coverage..." -ForegroundColor Green
        npm run test:coverage
    }
    "gen-001" {
        Write-Host "Running GEN-001: Loading Tests..." -ForegroundColor Green
        npm test -- --run GEN-001-Loading
    }
    "gen-002" {
        Write-Host "Running GEN-002: Navigation Tests..." -ForegroundColor Green
        npm test -- --run GEN-002-Navigation
    }
    "gen-003" {
        Write-Host "Running GEN-003: Form Validation Tests..." -ForegroundColor Green
        npm test -- --run GEN-003-FormValidation
    }
    "gen-004" {
        Write-Host "Running GEN-004: Accessibility Tests..." -ForegroundColor Green
        npm test -- --run GEN-004-Accessibility
    }
    "gen-005" {
        Write-Host "Running GEN-005: Low Bandwidth Tests..." -ForegroundColor Green
        npm test -- --run GEN-005-LowBandwidth
    }
    "verbose" {
        Write-Host "Running all tests with verbose output..." -ForegroundColor Green
        npm test -- --run --reporter=verbose
    }
    default {
        Write-Host "Usage: .\run-tests.ps1 [option]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Options:" -ForegroundColor Cyan
        Write-Host "  all       - Run all tests once" -ForegroundColor White
        Write-Host "  watch     - Run tests in watch mode" -ForegroundColor White
        Write-Host "  coverage  - Run tests with coverage report" -ForegroundColor White
        Write-Host "  verbose   - Run tests with verbose output" -ForegroundColor White
        Write-Host "  gen-001   - Run GEN-001 (Loading) tests only" -ForegroundColor White
        Write-Host "  gen-002   - Run GEN-002 (Navigation) tests only" -ForegroundColor White
        Write-Host "  gen-003   - Run GEN-003 (Form Validation) tests only" -ForegroundColor White
        Write-Host "  gen-004   - Run GEN-004 (Accessibility) tests only" -ForegroundColor White
        Write-Host "  gen-005   - Run GEN-005 (Low Bandwidth) tests only" -ForegroundColor White
        Write-Host ""
        Write-Host "Example: .\run-tests.ps1 all" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
