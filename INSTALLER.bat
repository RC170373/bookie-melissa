@echo off
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

