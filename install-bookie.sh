#!/bin/bash

# 📚 Bookie - Installation Automatique en Un Clic
# Ce script installe et configure Bookie sur votre machine locale

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_step() {
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📚 $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Banner
echo -e "${PURPLE}"
cat << "EOF"
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
EOF
echo -e "${NC}"

# Vérifier Node.js
print_step "Vérification des prérequis"
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé!"
    print_info "Veuillez installer Node.js 18+ depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ est requis (version actuelle: $(node -v))"
    exit 1
fi

print_success "Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé!"
    exit 1
fi

print_success "npm $(npm -v) détecté"

# Installation des dépendances
print_step "Installation des dépendances"
print_info "Cela peut prendre quelques minutes..."
npm install --legacy-peer-deps

print_success "Dépendances installées"

# Configuration de l'environnement
print_step "Configuration de l'environnement"

# Créer le fichier .env.local
cat > .env.local << 'EOF'
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
EOF

print_success "Fichier .env.local créé"

# Initialiser la base de données
print_step "Initialisation de la base de données"

# Créer le dossier prisma s'il n'existe pas
mkdir -p prisma/prisma

# Générer le client Prisma
print_info "Génération du client Prisma..."
npx prisma generate

# Créer la base de données
print_info "Création de la base de données..."
npx prisma db push --skip-generate

print_success "Base de données initialisée"

# Créer le compte utilisateur
print_step "Création du compte utilisateur"

# Script pour créer l'utilisateur
cat > scripts/create-user.ts << 'EOF'
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
  .finally(() => prisma.$disconnect())
EOF

print_info "Création de l'utilisateur..."
npx tsx scripts/create-user.ts

print_success "Compte utilisateur créé"
print_info "Email: melissadelageclairin@gmail.com"
print_info "Mot de passe: bookie"

# Copier la base de données existante (si elle existe)
print_step "Importation des données existantes"

if [ -f "prisma/prisma/dev.db" ]; then
    print_info "Base de données existante détectée"
    print_success "Les livres de la bibliothèque sont conservés"
else
    print_warning "Aucune base de données existante trouvée"
    print_info "Vous commencez avec une bibliothèque vide"
fi

# Build de l'application
print_step "Compilation de l'application"
print_info "Cela peut prendre quelques minutes..."
npm run build

print_success "Application compilée"

# Résumé final
print_step "Installation terminée!"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  🎉 Bookie est maintenant installé et prêt à l'emploi!      ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

print_info "Pour démarrer Bookie, exécutez:"
echo -e "${CYAN}    npm run dev${NC}"
echo ""

print_info "Puis ouvrez votre navigateur à l'adresse:"
echo -e "${CYAN}    http://localhost:3000${NC}"
echo ""

print_info "Connectez-vous avec:"
echo -e "${CYAN}    Email: melissadelageclairin@gmail.com${NC}"
echo -e "${CYAN}    Mot de passe: bookie${NC}"
echo ""

print_warning "IMPORTANT: Changez le mot de passe après la première connexion!"
echo ""

print_success "Bonne lecture! 📚✨"
echo ""

