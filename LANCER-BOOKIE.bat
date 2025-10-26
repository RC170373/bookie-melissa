@echo off
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
