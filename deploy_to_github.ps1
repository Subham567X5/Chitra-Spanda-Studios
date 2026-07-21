# deploy_to_github.ps1
# Script to initialize Git and push the project to GitHub

# 1. Check if git is installed
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
    Write-Host "❌ Error: Git is not installed or not in your system PATH." -ForegroundColor Red
    Write-Host "Please download and install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host "After installing Git, please restart your terminal/IDE and run this script again." -ForegroundColor Yellow
    Exit
}

# 2. Go to the project root
$ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location -Path $ScriptRoot

Write-Host "🚀 Preparing to deploy to GitHub..." -ForegroundColor Cyan

# 3. Initialize Git if not already initialized
if (-not (Test-Path -Path ".git")) {
    Write-Host "📦 Initializing local Git repository..." -ForegroundColor Green
    git init
} else {
    Write-Host "📦 Git repository already initialized." -ForegroundColor Green
}

# 4. Check if remote origin exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host ""
    Write-Host "🔗 Please enter your remote GitHub repository URL" -ForegroundColor Yellow
    Write-Host "Example: https://github.com/your-username/your-repo-name.git" -ForegroundColor Gray
    $repoUrl = Read-Host "GitHub Repository URL"
    if (-not $repoUrl) {
        Write-Host "❌ Error: GitHub repository URL is required." -ForegroundColor Red
        Exit
    }
    git remote add origin $repoUrl
    Write-Host "Added remote origin: $repoUrl" -ForegroundColor Green
} else {
    Write-Host "🔗 Remote origin already configured: $remoteExists" -ForegroundColor Green
}

# 5. Staging files
Write-Host "📂 Staging all project files..." -ForegroundColor Green
git add -A

# 6. Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Green
git commit -m "feat: Add Software Hub and installer vault"

# 7. Rename branch to main
git branch -M main

# 8. Push to GitHub
Write-Host "📤 Pushing codebase to GitHub (this will trigger GitHub Pages deployment)..." -ForegroundColor Green
git push -u origin main

Write-Host "🎉 Push process complete! Check your GitHub Actions tab to monitor the Pages deployment progress." -ForegroundColor Cyan
