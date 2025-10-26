# Bookie - One-Click Setup Script for Windows
# This script will set up the entire Bookie application on your local machine

$ErrorActionPreference = "Stop"

# Banner
Write-Host @"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██████╗  ██████╗  ██████╗ ██╗  ██╗██╗███████╗        ║
║   ██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝██║██╔════╝        ║
║   ██████╔╝██║   ██║██║   ██║█████╔╝ ██║█████╗          ║
║   ██╔══██╗██║   ██║██║   ██║██╔═██╗ ██║██╔══╝          ║
║   ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗██║███████╗        ║
║   ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝        ║
║                                                          ║
║        Your Personal Library Companion                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

Write-Host ""
Write-Host "Starting Bookie setup..." -ForegroundColor Blue
Write-Host ""

# Check if Node.js is installed
Write-Host "=> Checking Node.js installation..." -ForegroundColor Blue
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Recommended version: 18.x or higher" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
Write-Host "=> Checking npm installation..." -ForegroundColor Blue
try {
    $npmVersion = npm -v
    Write-Host "✓ npm $npmVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "=> Installing dependencies..." -ForegroundColor Blue
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Check if .env file exists
Write-Host "=> Checking environment configuration..." -ForegroundColor Blue
if (-not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found, creating..." -ForegroundColor Yellow
    @"
DATABASE_URL="file:./prisma/dev.db"
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Check if .env.local file exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠ .env.local file not found, creating..." -ForegroundColor Yellow
    
    # Generate a random JWT secret
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    @"
JWT_SECRET="$jwtSecret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ .env.local file created with secure JWT secret" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local file exists" -ForegroundColor Green
}

# Run database migrations
Write-Host "=> Setting up database..." -ForegroundColor Blue
try {
    npx prisma migrate deploy 2>$null
} catch {
    npx prisma migrate dev --name init
}
Write-Host "✓ Database setup complete" -ForegroundColor Green

# Generate Prisma Client
Write-Host "=> Generating Prisma Client..." -ForegroundColor Blue
npx prisma generate
Write-Host "✓ Prisma Client generated" -ForegroundColor Green

# Ask about sample data
Write-Host "=> Would you like to add sample data? (y/n)" -ForegroundColor Blue
$addSampleData = Read-Host

if ($addSampleData -eq "y" -or $addSampleData -eq "Y") {
    Write-Host "=> Adding sample data..." -ForegroundColor Blue
    Write-Host "⚠ Sample data feature requires manual setup" -ForegroundColor Yellow
}

# Build the application
Write-Host "=> Building the application..." -ForegroundColor Blue
npm run build
Write-Host "✓ Application built successfully" -ForegroundColor Green

# Success message
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║  ✓ Bookie setup completed successfully!                 ║" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Blue
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Blue
Write-Host "  http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Additional commands:" -ForegroundColor Blue
Write-Host "  npm run build     - Build for production" -ForegroundColor Yellow
Write-Host "  npm start         - Start production server" -ForegroundColor Yellow
Write-Host "  npx prisma studio - Open database viewer" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy reading! 📚" -ForegroundColor Magenta
Write-Host ""

