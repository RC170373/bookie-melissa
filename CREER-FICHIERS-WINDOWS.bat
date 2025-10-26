@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║         📝 CRÉATION DES FICHIERS WINDOWS 📝                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Node.js n'est pas installé!
    echo.
    echo 👉 Téléchargez Node.js sur: https://nodejs.org/
    echo    Installez-le, redémarrez votre PC, puis relancez ce fichier.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js détecté!
echo.
echo 📝 Création des fichiers INSTALLER.bat et LANCER-BOOKIE.bat...
echo.

REM Lancer le script Node.js
node create-windows-files.js

if errorlevel 1 (
    echo.
    echo ❌ ERREUR lors de la création des fichiers!
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              ✅ FICHIERS CRÉÉS! ✅                          ║
echo ║                                                            ║
echo ║  Vous pouvez maintenant:                                  ║
echo ║  1. Double-cliquer sur INSTALLER.bat                      ║
echo ║  2. Puis sur LANCER-BOOKIE.bat                            ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause

