@echo off
cls

:MENU
cls
echo.
echo ================================================================
echo.
echo                        BOOKIE
echo.
echo ================================================================
echo.
echo.
echo  Que voulez-vous faire?
echo.
echo  [1] Installer Bookie (premiere fois seulement)
echo  [2] Lancer Bookie
echo  [3] Quitter
echo.
echo.
set /p choice=Votre choix (1, 2 ou 3):

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto LAUNCH
if "%choice%"=="3" goto END
echo.
echo Choix invalide! Tapez 1, 2 ou 3.
pause
goto MENU

:INSTALL
cls
echo.
echo ================================================================
echo.
echo              INSTALLATION DE BOOKIE
echo.
echo ================================================================
echo.
echo.
echo Installation en cours...
echo.
echo ATTENTION: Cela peut prendre 2-3 minutes!
echo Ne fermez pas cette fenetre!
echo.
echo.

REM Verifier si Node.js est installe
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe!
    echo.
    echo Telechargez Node.js sur: https://nodejs.org/
    echo Installez-le, redemarrez votre PC, puis relancez ce fichier.
    echo.
    pause
    goto MENU
)

echo Node.js detecte!
echo.

REM Installer les dependances
echo Installation des dependances...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ERREUR lors de l'installation!
    echo.
    pause
    goto MENU
)

echo.
echo.
echo ================================================================
echo.
echo              INSTALLATION TERMINEE!
echo.
echo ================================================================
echo.
echo.
pause
goto MENU

:LAUNCH
cls
echo.
echo ================================================================
echo.
echo                  LANCEMENT DE BOOKIE
echo.
echo ================================================================
echo.
echo.
echo Demarrage du serveur...
echo.
echo NE FERMEZ PAS CETTE FENETRE!
echo Bookie s'ouvrira automatiquement dans votre navigateur.
echo.
echo Identifiants:
echo Email: melissadelageclairin@gmail.com
echo Mot de passe: bookie
echo.
echo.

REM Verifier si Node.js est installe
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe!
    echo.
    echo Telechargez Node.js sur: https://nodejs.org/
    echo Installez-le, redemarrez votre PC, puis relancez ce fichier.
    echo.
    pause
    goto MENU
)

REM Verifier si node_modules existe
if not exist "node_modules" (
    echo ERREUR: Les dependances ne sont pas installees!
    echo.
    echo Choisissez l'option [1] pour installer d'abord.
    echo.
    pause
    goto MENU
)

echo Demarrage du serveur...
echo.

REM Attendre 5 secondes puis ouvrir le navigateur
start /B cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Lancer le serveur
call npm run dev

REM Si le serveur s'arrete
echo.
echo.
echo ================================================================
echo.
echo                  BOOKIE ARRETE
echo.
echo ================================================================
echo.
pause
goto MENU

:END
cls
echo.
echo Au revoir!
echo.
pause
exit /b 0

