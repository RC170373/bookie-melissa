#!/bin/bash

# 📦 Créer un package d'installation complet pour Bookie
# Ce script crée un fichier ZIP prêt à être distribué

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        📦 Création du Package d'Installation Bookie         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Nom du package
PACKAGE_NAME="Bookie-Installation-Complete"
TEMP_DIR="temp_package"

echo -e "${BLUE}🗂️  Préparation du package...${NC}"

# Créer un dossier temporaire
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/$PACKAGE_NAME"

echo -e "${BLUE}📋 Copie des fichiers essentiels...${NC}"

# Copier les fichiers et dossiers nécessaires
cp -r app "$TEMP_DIR/$PACKAGE_NAME/"
cp -r components "$TEMP_DIR/$PACKAGE_NAME/"
cp -r lib "$TEMP_DIR/$PACKAGE_NAME/"
cp -r prisma "$TEMP_DIR/$PACKAGE_NAME/"
cp -r public "$TEMP_DIR/$PACKAGE_NAME/"
cp -r scripts "$TEMP_DIR/$PACKAGE_NAME/"

# Copier les fichiers de configuration
cp package.json "$TEMP_DIR/$PACKAGE_NAME/"
cp package-lock.json "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp tsconfig.json "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp next.config.ts "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp next.config.js "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp next.config.mjs "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp tailwind.config.ts "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp tailwind.config.js "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp postcss.config.mjs "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp postcss.config.js "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp .gitignore "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true

# Copier les scripts d'installation
cp install-bookie.sh "$TEMP_DIR/$PACKAGE_NAME/"
cp install-bookie.ps1 "$TEMP_DIR/$PACKAGE_NAME/"
cp INSTALLER-BOOKIE.bat "$TEMP_DIR/$PACKAGE_NAME/"

# Copier la documentation
cp README.md "$TEMP_DIR/$PACKAGE_NAME/" 2>/dev/null || true
cp INSTALLATION.md "$TEMP_DIR/$PACKAGE_NAME/"
cp DEPLOYMENT_READY.md "$TEMP_DIR/$PACKAGE_NAME/"
cp PAGES_STATUS.md "$TEMP_DIR/$PACKAGE_NAME/"

# Créer un fichier .env.example
cat > "$TEMP_DIR/$PACKAGE_NAME/.env.example" << 'EOF'
# Local Database Configuration
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret for authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Books API Key
GOOGLE_BOOKS_API_KEY="AIzaSyDMFWV7Ohdfw0sAZ7rnYPGCTPcUtkz08Ps"
EOF

# Créer un README d'installation rapide
cat > "$TEMP_DIR/$PACKAGE_NAME/LISEZMOI.txt" << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    📚 BOOKIE - INSTALLATION                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

🎯 INSTALLATION ULTRA-RAPIDE (WINDOWS):

┌──────────────────────────────────────────────────────────────┐
│  ⚡ MÉTHODE 1: INSTALLATION AUTOMATIQUE (RECOMMANDÉ)         │
└──────────────────────────────────────────────────────────────┘

1. Double-cliquez sur: INSTALLER-BOOKIE.bat

2. Suivez les instructions à l'écran

3. C'est tout! Bookie s'ouvrira automatiquement dans votre navigateur

⚠️ Si Node.js n'est pas installé, le script vous guidera pour l'installer.

┌──────────────────────────────────────────────────────────────┐
│  📋 MÉTHODE 2: INSTALLATION MANUELLE (PowerShell)            │
└──────────────────────────────────────────────────────────────┘

1. Assurez-vous que Node.js 18+ est installé
   → Télécharger: https://nodejs.org

2. Ouvrez PowerShell dans ce dossier
   → Clic droit dans le dossier → "Ouvrir dans PowerShell"

3. Exécutez ces 2 commandes:

   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\install-bookie.ps1

4. Attendez la fin de l'installation (5-10 minutes)

5. Démarrez Bookie:

   npm run dev

6. Ouvrez votre navigateur: http://localhost:3000

┌──────────────────────────────────────────────────────────────┐
│  🔑 CONNEXION                                                │
└──────────────────────────────────────────────────────────────┘

Email: melissadelageclairin@gmail.com
Mot de passe: bookie

⚠️ IMPORTANT: Changez le mot de passe après la première connexion!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 CONTENU DU PACKAGE:

✅ 1671 livres avec couvertures (100%)
✅ 1487 livres lus avec notes et critiques
✅ 28 pages fonctionnelles
✅ Statistiques enrichies (9 graphiques)
✅ Recherche avancée
✅ Import/Export CSV
✅ Défis et succès
✅ Book Club
✅ Journal de lecture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 SUPPORT:

Pour plus d'informations, consultez:
- INSTALLATION.md (guide détaillé)
- DEPLOYMENT_READY.md (statut et checklist)
- PAGES_STATUS.md (état des pages)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bonne lecture! 📚✨
EOF

# Créer un fichier START.bat pour Windows
cat > "$TEMP_DIR/$PACKAGE_NAME/START.bat" << 'EOF'
@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                    📚 DEMARRAGE DE BOOKIE                    ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Démarrage du serveur...
echo.
call npm run dev
EOF

echo -e "${BLUE}📊 Calcul de la taille du package...${NC}"

# Calculer la taille
SIZE=$(du -sh "$TEMP_DIR/$PACKAGE_NAME" | cut -f1)
echo -e "${GREEN}✅ Taille du package: $SIZE${NC}"

echo -e "${BLUE}🗜️  Compression du package...${NC}"

# Créer le ZIP
cd "$TEMP_DIR"
zip -r "../${PACKAGE_NAME}.zip" "$PACKAGE_NAME" -q

cd ..

# Nettoyer
rm -rf "$TEMP_DIR"

# Taille finale
FINAL_SIZE=$(du -sh "${PACKAGE_NAME}.zip" | cut -f1)

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              ✅ PACKAGE CRÉÉ AVEC SUCCÈS!                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}📦 Fichier créé: ${PACKAGE_NAME}.zip${NC}"
echo -e "${GREEN}📊 Taille: $FINAL_SIZE${NC}"
echo ""
echo -e "${YELLOW}📤 PROCHAINES ÉTAPES:${NC}"
echo ""
echo -e "${BLUE}1. Uploadez le fichier sur un service cloud:${NC}"
echo "   • Google Drive: https://drive.google.com"
echo "   • Dropbox: https://www.dropbox.com"
echo "   • WeTransfer: https://wetransfer.com"
echo ""
echo -e "${BLUE}2. Obtenez un lien de partage public${NC}"
echo ""
echo -e "${BLUE}3. Envoyez le lien à: melissadelageclairin@gmail.com${NC}"
echo ""
echo -e "${YELLOW}💡 CONSEIL:${NC}"
echo "   Pour Google Drive, utilisez un lien de téléchargement direct:"
echo "   https://drive.google.com/uc?export=download&id=VOTRE_ID_FICHIER"
echo ""
echo -e "${GREEN}✨ Le package contient tout ce qui est nécessaire pour une installation complète!${NC}"
echo ""

