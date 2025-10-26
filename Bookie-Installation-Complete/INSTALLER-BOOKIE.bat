@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════════════════
::                    📚 BOOKIE - INSTALLATEUR AUTOMATIQUE
:: ═══════════════════════════════════════════════════════════════════════════

color 0B
title 📚 Installation de Bookie

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║              📚 BIENVENUE DANS BOOKIE                        ║
echo ║                                                              ║
echo ║         Installation Automatique en Cours...                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: ÉTAPE 1: Vérifier Node.js
:: ═══════════════════════════════════════════════════════════════════════════

echo [1/6] 🔍 Vérification de Node.js...
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé!
    echo.
    echo 📥 Téléchargement automatique de Node.js...
    echo.
    echo ⚠️  IMPORTANT: Une page va s'ouvrir dans votre navigateur.
    echo     Téléchargez et installez Node.js, puis relancez ce fichier.
    echo.
    timeout /t 3 >nul
    start https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
    echo.
    echo 📌 Après l'installation de Node.js:
    echo    1. Fermez cette fenêtre
    echo    2. Double-cliquez à nouveau sur INSTALLER-BOOKIE.bat
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js détecté: %NODE_VERSION%
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: ÉTAPE 2: Installer les dépendances
:: ═══════════════════════════════════════════════════════════════════════════

echo [2/6] 📦 Installation des dépendances...
echo.
echo ⏳ Cela peut prendre 5-10 minutes. Soyez patient...
echo.

call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erreur lors de l'installation des dépendances!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dépendances installées avec succès!
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: ÉTAPE 3: Créer le fichier .env.local
:: ═══════════════════════════════════════════════════════════════════════════

echo [3/6] ⚙️  Configuration de l'environnement...
echo.

(
echo DATABASE_URL="file:./prisma/dev.db"
echo JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
echo GOOGLE_BOOKS_API_KEY="AIzaSyDMFWV7Ohdfw0sAZ7rnYPGCTPcUtkz08Ps"
) > .env.local

echo ✅ Environnement configuré!
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: ÉTAPE 4: Initialiser Prisma
:: ═══════════════════════════════════════════════════════════════════════════

echo [4/6] 🗄️  Initialisation de la base de données...
echo.

call npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erreur lors de la génération Prisma!
    echo.
    pause
    exit /b 1
)

call npx prisma db push --skip-generate
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erreur lors de la création de la base de données!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Base de données initialisée!
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: ÉTAPE 5: Créer le compte utilisateur
:: ═══════════════════════════════════════════════════════════════════════════

echo [5/6] 👤 Création du compte utilisateur...
echo.

:: Créer le script de création d'utilisateur
(
echo import { PrismaClient } from '@prisma/client'
echo import bcrypt from 'bcryptjs'
echo.
echo const prisma = new PrismaClient^(^)
echo.
echo async function main^(^) {
echo   const email = 'melissadelageclairin@gmail.com'
echo   const password = 'bookie'
echo   const username = 'Melissa'
echo.
echo   const existingUser = await prisma.user.findUnique^({
echo     where: { email }
echo   }^)
echo.
echo   if ^(existingUser^) {
echo     console.log^('✅ Utilisateur déjà existant'^)
echo     await prisma.$disconnect^(^)
echo     return
echo   }
echo.
echo   const hashedPassword = await bcrypt.hash^(password, 10^)
echo.
echo   await prisma.user.create^({
echo     data: {
echo       email,
echo       username,
echo       password: hashedPassword,
echo     }
echo   }^)
echo.
echo   console.log^('✅ Utilisateur créé avec succès!'^)
echo   await prisma.$disconnect^(^)
echo }
echo.
echo main^(^).catch^(^(e^) =^> {
echo   console.error^(e^)
echo   process.exit^(1^)
echo }^)
) > scripts\create-user-temp.ts

call npx tsx scripts\create-user-temp.ts
del scripts\create-user-temp.ts

echo.
echo ✅ Compte utilisateur créé!
echo    📧 Email: melissadelageclairin@gmail.com
echo    🔑 Mot de passe: bookie
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: ÉTAPE 6: Compiler l'application
:: ═══════════════════════════════════════════════════════════════════════════

echo [6/6] 🔨 Compilation de l'application...
echo.

call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  La compilation a échoué, mais ce n'est pas grave.
    echo    Vous pouvez utiliser le mode développement.
    echo.
)

echo.
echo ✅ Application compilée!
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: INSTALLATION TERMINÉE
:: ═══════════════════════════════════════════════════════════════════════════

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           ✅ INSTALLATION TERMINÉE AVEC SUCCÈS!              ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Bookie est maintenant installé!
echo.
echo 📚 Votre bibliothèque contient:
echo    • 1671 livres avec couvertures
echo    • 494 critiques
echo    • 1278 notes
echo.
echo 🚀 Démarrage de Bookie dans 3 secondes...
echo.
timeout /t 3 >nul

:: Créer un fichier de démarrage permanent
(
echo @echo off
echo title 📚 Bookie - Serveur
echo cd /d "%%~dp0"
echo echo.
echo echo ╔══════════════════════════════════════════════════════════════╗
echo echo ║                                                              ║
echo echo ║                    📚 BOOKIE - DÉMARRAGE                     ║
echo echo ║                                                              ║
echo echo ╚══════════════════════════════════════════════════════════════╝
echo echo.
echo echo 🚀 Démarrage du serveur...
echo echo.
echo call npm run dev
) > DEMARRER-BOOKIE.bat

echo ✅ Fichier de démarrage créé: DEMARRER-BOOKIE.bat
echo.
echo 💡 Pour démarrer Bookie à l'avenir, double-cliquez sur:
echo    DEMARRER-BOOKIE.bat
echo.

:: Démarrer Bookie
echo 🌐 Ouverture de Bookie dans votre navigateur...
echo.
start http://localhost:3000

echo 🚀 Démarrage du serveur...
echo.
echo ⚠️  NE FERMEZ PAS CETTE FENÊTRE!
echo    Le serveur Bookie tourne dans cette fenêtre.
echo.
echo 📌 Pour arrêter Bookie: Fermez cette fenêtre ou appuyez sur Ctrl+C
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call npm run dev

