// Script to create Windows .bat files after download
const fs = require('fs');
const path = require('path');

console.log('🚀 Création des fichiers Windows...\n');

// INSTALLER.bat content
const installerContent = `@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              📦 INSTALLATION DE BOOKIE 📦                  ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo ⏳ Installation en cours...
echo.
echo ⚠️  ATTENTION: Cela peut prendre 2-3 minutes!
echo    Ne fermez pas cette fenêtre!
echo.
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Node.js n'est pas installé!
    echo.
    echo 👉 Téléchargez Node.js sur: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js détecté!
echo.

REM Installer les dépendances
echo 📦 Installation des dépendances...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ❌ ERREUR lors de l'installation!
    echo.
    pause
    exit /b 1
)

echo.
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              ✅ INSTALLATION TERMINÉE! ✅                   ║
echo ║                                                            ║
echo ║  Vous pouvez maintenant lancer Bookie en double-cliquant  ║
echo ║  sur le fichier: LANCER-BOOKIE.bat                        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
pause
`;

// LANCER-BOOKIE.bat content
const lancerContent = `@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║                  🚀 LANCEMENT DE BOOKIE 🚀                 ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo ⏳ Démarrage du serveur...
echo.
echo ⚠️  NE FERMEZ PAS CETTE FENÊTRE!
echo    Bookie s'ouvrira automatiquement dans votre navigateur.
echo.
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Node.js n'est pas installé!
    echo.
    echo 👉 Téléchargez Node.js sur: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Vérifier si node_modules existe
if not exist "node_modules" (
    echo ❌ ERREUR: Les dépendances ne sont pas installées!
    echo.
    echo 👉 Lancez d'abord INSTALLER.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Démarrage du serveur...
echo.

REM Attendre 5 secondes puis ouvrir le navigateur
start /B cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Lancer le serveur
call npm run dev

REM Si le serveur s'arrête
echo.
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║                  ⚠️  BOOKIE ARRÊTÉ ⚠️                      ║
echo ║                                                            ║
echo ║  Pour relancer Bookie, double-cliquez à nouveau sur       ║
echo ║  LANCER-BOOKIE.bat                                        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
`;

// Write files
try {
  fs.writeFileSync('INSTALLER.bat', installerContent, 'utf8');
  console.log('✅ INSTALLER.bat créé!');
  
  fs.writeFileSync('LANCER-BOOKIE.bat', lancerContent, 'utf8');
  console.log('✅ LANCER-BOOKIE.bat créé!');
  
  console.log('\n🎉 Fichiers Windows créés avec succès!\n');
  console.log('Vous pouvez maintenant:');
  console.log('1. Double-cliquer sur INSTALLER.bat pour installer');
  console.log('2. Double-cliquer sur LANCER-BOOKIE.bat pour lancer Bookie\n');
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

