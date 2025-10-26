# 📚 Bookie - Guide d'Installation

Installation automatique en un clic pour déployer Bookie sur votre machine locale.

---

## 🚀 Installation Rapide (Un Clic)

### Sur macOS / Linux

1. **Téléchargez le projet** ou clonez-le
2. **Ouvrez un terminal** dans le dossier du projet
3. **Exécutez la commande suivante:**

```bash
chmod +x install-bookie.sh && ./install-bookie.sh
```

### Sur Windows

1. **Téléchargez le projet** ou clonez-le
2. **Ouvrez PowerShell** dans le dossier du projet (clic droit → "Ouvrir dans PowerShell")
3. **Exécutez la commande suivante:**

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install-bookie.ps1
```

---

## ✅ Ce que fait le script d'installation

Le script automatique effectue les étapes suivantes:

1. ✅ **Vérifie les prérequis** (Node.js 18+, npm)
2. ✅ **Installe toutes les dépendances** npm
3. ✅ **Configure l'environnement** (.env.local avec les clés API)
4. ✅ **Initialise la base de données** SQLite
5. ✅ **Crée le compte utilisateur** avec vos identifiants
6. ✅ **Conserve tous les livres** de la bibliothèque existante
7. ✅ **Compile l'application** Next.js
8. ✅ **Prêt à démarrer!**

---

## 🔑 Identifiants de Connexion

Après l'installation, connectez-vous avec:

- **Email:** `melissadelageclairin@gmail.com`
- **Mot de passe:** `bookie`

⚠️ **IMPORTANT:** Changez le mot de passe après la première connexion dans les paramètres du profil!

---

## 🎯 Démarrer Bookie

Une fois l'installation terminée:

```bash
npm run dev
```

Puis ouvrez votre navigateur à l'adresse:

```
http://localhost:3000
```

---

## 📊 Fonctionnalités Incluses

### ✅ Bibliothèque Complète
- **1671 livres** avec couvertures (100%)
- **1487 livres lus** avec notes et critiques
- **Aucun doublon**
- **Données complètes** (status, notes, dates, critiques)

### ✅ Statistiques Enrichies
- 📊 **Pages lues par jour** (30 derniers jours)
- 👥 **Top 10 auteurs** les plus lus
- ⭐ **Distribution des notes** avec meilleurs livres
- 🎯 **Objectifs de lecture** annuels et mensuels
- 📈 **Graphiques de tendances** et comparaisons
- 🔥 **Carte thermique** de lecture
- ⚡ **Vitesse de lecture** moyenne

### ✅ Pages Fonctionnelles (28/28)
- 🏠 **Accueil** - Tableau de bord personnalisé
- 📚 **Bibliomania** - Votre bibliothèque virtuelle
- 📅 **Calendrier** - Planning de lecture
- 📖 **Sagas** - Gestion des séries
- ✍️ **Auteurs** - Catalogue d'auteurs
- 📊 **Statistiques** - Analyses détaillées
- 🎯 **Défis** - Challenges de lecture
- 🏆 **Achievements** - Succès débloqués
- 🔍 **Découverte** - Recommandations
- 📥 **Import/Export** - Gestion des données
- ➕ **Ajout Rapide** - Ajouter des livres
- 🔎 **Recherche** - Recherche avancée
- 📝 **Journal** - Journal de lecture
- ✏️ **Écriture** - Projets d'écriture
- 👤 **Profil** - Paramètres utilisateur
- 📚 **Book Club** - Club de lecture
- 📋 **Listes** - Listes personnalisées

---

## 🔧 Configuration

### Clés API Incluses

Le script configure automatiquement:

- ✅ **Google Books API** - Pour les métadonnées et couvertures
- ✅ **Open-Meteo** - Widget météo (gratuit, sans clé)
- ✅ **JWT Secret** - Authentification sécurisée

### Base de Données

- **Type:** SQLite (fichier local)
- **Emplacement:** `prisma/prisma/dev.db`
- **Avantages:**
  - ✅ Aucune configuration serveur
  - ✅ Portable (un seul fichier)
  - ✅ Rapide et léger
  - ✅ Parfait pour usage local

---

## 📦 Prérequis

Avant d'exécuter le script d'installation:

- **Node.js 18+** - [Télécharger](https://nodejs.org)
- **npm** (inclus avec Node.js)
- **10 Go d'espace disque** (pour node_modules et build)

---

## 🛠️ Installation Manuelle (Optionnel)

Si vous préférez installer manuellement:

```bash
# 1. Installer les dépendances
npm install --legacy-peer-deps

# 2. Créer le fichier .env.local
cp .env.example .env.local

# 3. Initialiser la base de données
npx prisma generate
npx prisma db push

# 4. Créer l'utilisateur
npx tsx scripts/create-user.ts

# 5. Compiler l'application
npm run build

# 6. Démarrer
npm run dev
```

---

## 🔄 Mise à Jour du Compte

Pour changer l'email ou le mot de passe après l'installation:

1. **Connectez-vous** avec les identifiants par défaut
2. **Allez dans Profil** (icône utilisateur en haut à droite)
3. **Modifiez vos informations**
4. **Sauvegardez**

Les livres de la bibliothèque restent intacts!

---

## 📚 Données Conservées

Le script d'installation **conserve automatiquement**:

- ✅ **Tous les livres** (1671 livres)
- ✅ **Toutes les couvertures** (100%)
- ✅ **Toutes les notes** (1278 livres notés)
- ✅ **Toutes les critiques** (494 critiques)
- ✅ **Toutes les dates de lecture** (1310 dates)
- ✅ **Tous les statuts** (Lu, En cours, À lire, etc.)

Seul le compte utilisateur est modifié!

---

## 🐛 Dépannage

### Erreur: "Node.js n'est pas installé"
- Installez Node.js 18+ depuis [nodejs.org](https://nodejs.org)

### Erreur: "Permission denied" (macOS/Linux)
```bash
chmod +x install-bookie.sh
```

### Erreur: "Execution Policy" (Windows)
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Port 3000 déjà utilisé
```bash
# Modifier le port dans package.json
"dev": "next dev -p 3001"
```

### Base de données corrompue
```bash
# Supprimer et recréer
rm prisma/prisma/dev.db
npx prisma db push
```

---

## 📞 Support

Pour toute question ou problème:

1. Vérifiez les logs dans le terminal
2. Consultez la documentation dans `/docs`
3. Vérifiez que Node.js 18+ est installé
4. Assurez-vous que le port 3000 est libre

---

## 🎉 Après l'Installation

Une fois Bookie installé et démarré:

1. ✅ **Connectez-vous** avec vos identifiants
2. ✅ **Explorez votre bibliothèque** (1671 livres!)
3. ✅ **Consultez vos statistiques** (graphiques enrichis)
4. ✅ **Changez votre mot de passe** (sécurité)
5. ✅ **Ajoutez de nouveaux livres** (recherche Google Books)
6. ✅ **Créez des listes** personnalisées
7. ✅ **Suivez vos objectifs** de lecture

---

## 🚀 Commandes Utiles

```bash
# Démarrer en mode développement
npm run dev

# Compiler pour production
npm run build

# Démarrer en production
npm start

# Tester toutes les pages
npx tsx scripts/test-all-pages.ts

# Exporter la bibliothèque
# Aller sur http://localhost:3000/import-export

# Sauvegarder la base de données
cp prisma/prisma/dev.db prisma/prisma/dev.db.backup
```

---

**Bonne lecture! 📚✨**

