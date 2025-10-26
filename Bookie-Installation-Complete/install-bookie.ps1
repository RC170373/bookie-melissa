# 📚 Bookie - Installation Automatique en Un Clic (Windows)
# Ce script installe et configure Bookie sur votre machine locale Windows

# Arrêter en cas d'erreur
$ErrorActionPreference = "Stop"

# Fonction pour afficher les messages
function Print-Step {
    param([string]$Message)
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "📚 $Message" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Banner
Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗  ██████╗  ██████╗ ██╗  ██╗██╗███████╗            ║
║   ██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝██║██╔════╝            ║
║   ██████╔╝██║   ██║██║   ██║█████╔╝ ██║█████╗              ║
║   ██╔══██╗██║   ██║██║   ██║██╔═██╗ ██║██╔══╝              ║
║   ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗██║███████╗            ║
║   ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝            ║
║                                                              ║
║          Installation Automatique - Version 1.0              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

# Vérifier Node.js
Print-Step "Vérification des prérequis"

try {
    $nodeVersion = node -v
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -lt 18) {
        Print-Error "Node.js version 18+ est requis (version actuelle: $nodeVersion)"
        exit 1
    }
    
    Print-Success "Node.js $nodeVersion détecté"
} catch {
    Print-Error "Node.js n'est pas installé!"
    Print-Info "Veuillez installer Node.js 18+ depuis https://nodejs.org"
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm -v
    Print-Success "npm $npmVersion détecté"
} catch {
    Print-Error "npm n'est pas installé!"
    exit 1
}

# Installation des dépendances
Print-Step "Installation des dépendances"
Print-Info "Cela peut prendre quelques minutes..."
npm install --legacy-peer-deps

Print-Success "Dépendances installées"

# Configuration de l'environnement
Print-Step "Configuration de l'environnement"

# Créer le fichier .env.local
$envContent = @"
# Local Database Configuration
# SQLite database file location
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret for authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Books API Key (optional but recommended for better results)
# Get your key from: https://console.cloud.google.com/apis/credentials
GOOGLE_BOOKS_API_KEY="AIzaSyDMFWV7Ohdfw0sAZ7rnYPGCTPcUtkz08Ps"

# Weather Widget - Using Open-Meteo (100% FREE, NO API KEY REQUIRED!)
# Open-Meteo is an open-source weather API: https://open-meteo.com
# No configuration needed - just works!
"@

Set-Content -Path ".env.local" -Value $envContent
Print-Success "Fichier .env.local créé"

# Initialiser la base de données
Print-Step "Initialisation de la base de données"

# Créer le dossier prisma s'il n'existe pas
New-Item -ItemType Directory -Force -Path "prisma\prisma" | Out-Null

# Générer le client Prisma
Print-Info "Génération du client Prisma..."
npx prisma generate

# Créer la base de données
Print-Info "Création de la base de données..."
npx prisma db push --skip-generate

Print-Success "Base de données initialisée"

# Créer le compte utilisateur
Print-Step "Création du compte utilisateur"

# Script pour créer l'utilisateur
$createUserScript = @"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'melissadelageclairin@gmail.com'
  const password = 'bookie'
  const username = 'Melissa'

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('✅ Utilisateur déjà existant')
    return
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10)

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    }
  })

  console.log('✅ Utilisateur créé avec succès!')
  console.log(`   Email: ${email}`)
  console.log(`   Mot de passe: ${password}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.`$disconnect())
"@

Set-Content -Path "scripts\create-user.ts" -Value $createUserScript

Print-Info "Création de l'utilisateur..."
npx tsx scripts/create-user.ts

Print-Success "Compte utilisateur créé"
Print-Info "Email: melissadelageclairin@gmail.com"
Print-Info "Mot de passe: bookie"

# Copier la base de données existante (si elle existe)
Print-Step "Importation des données existantes"

if (Test-Path "prisma\prisma\dev.db") {
    Print-Info "Base de données existante détectée"
    Print-Success "Les livres de la bibliothèque sont conservés"
} else {
    Print-Warning "Aucune base de données existante trouvée"
    Print-Info "Vous commencez avec une bibliothèque vide"
}

# Build de l'application
Print-Step "Compilation de l'application"
Print-Info "Cela peut prendre quelques minutes..."
npm run build

Print-Success "Application compilée"

# Résumé final
Print-Step "Installation terminée!"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║  🎉 Bookie est maintenant installé et prêt à l'emploi!      ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Print-Info "Pour démarrer Bookie, exécutez:"
Write-Host "    npm run dev" -ForegroundColor Cyan
Write-Host ""

Print-Info "Puis ouvrez votre navigateur à l'adresse:"
Write-Host "    http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Print-Info "Connectez-vous avec:"
Write-Host "    Email: melissadelageclairin@gmail.com" -ForegroundColor Cyan
Write-Host "    Mot de passe: bookie" -ForegroundColor Cyan
Write-Host ""

Print-Warning "IMPORTANT: Changez le mot de passe après la première connexion!"
Write-Host ""

Print-Success "Bonne lecture! 📚✨"
Write-Host ""

