# 🚀 DÉPLOIEMENT BOOKIE EN LIGNE - INSTRUCTIONS COMPLÈTES

**Date:** 2025-10-26  
**Objectif:** Déployer Bookie en ligne pour que Melissa puisse y accéder via un simple lien

---

## 📋 **ÉTAPE 1: Créer un Projet Supabase (5 minutes)**

### **1.1 Créer un compte Supabase**

1. Allez sur: https://supabase.com
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub (ou créez un compte)

### **1.2 Créer un nouveau projet**

1. Cliquez sur **"New Project"**
2. Remplissez:
   - **Name:** `bookie-melissa`
   - **Database Password:** Générez un mot de passe fort (NOTEZ-LE!)
   - **Region:** Choisissez la plus proche (Europe West par exemple)
   - **Pricing Plan:** Free (gratuit)
3. Cliquez sur **"Create new project"**
4. Attendez 2-3 minutes que le projet soit créé

### **1.3 Récupérer l'URL de la base de données**

1. Dans votre projet Supabase, allez dans **Settings** (icône engrenage en bas à gauche)
2. Cliquez sur **Database**
3. Scrollez jusqu'à **Connection string**
4. Sélectionnez **URI** (pas Pooler)
5. Copiez l'URL qui ressemble à:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez créé à l'étape 1.2

**NOTEZ CETTE URL - VOUS EN AUREZ BESOIN!**

---

## 📋 **ÉTAPE 2: Configurer la Base de Données Localement (5 minutes)**

### **2.1 Créer le fichier .env**

Dans le dossier du projet, créez un fichier `.env` avec ce contenu:

```env
# Remplacez cette URL par celle de Supabase (étape 1.3)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_BOOKS_API_KEY="AIzaSyDMFWV7Ohdfw0sAZ7rnYPGCTPcUtkz08Ps"
```

### **2.2 Installer les dépendances**

```bash
npm install --legacy-peer-deps
```

### **2.3 Créer les tables dans Supabase**

```bash
npx prisma db push
```

Cette commande va créer toutes les tables dans votre base de données Supabase.

---

## 📋 **ÉTAPE 3: Importer les Données (5 minutes)**

### **3.1 Exporter les données de SQLite**

Si vous avez déjà des données dans la base SQLite locale, exportez-les:

```bash
# Créer un script d'export
node scripts/export-sqlite-data.js
```

### **3.2 Importer dans PostgreSQL**

```bash
# Importer les données
node scripts/import-to-postgres.js
```

**OU** si vous n'avez pas encore de données, créez juste un compte utilisateur:

```bash
npx tsx scripts/create-user.ts
```

---

## 📋 **ÉTAPE 4: Déployer sur Vercel (5 minutes)**

### **4.1 Créer un compte Vercel**

1. Allez sur: https://vercel.com
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec GitHub

### **4.2 Importer le projet**

1. Cliquez sur **"Add New..."** → **"Project"**
2. Importez votre repository GitHub (ou uploadez le dossier)
3. Configurez le projet:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install --legacy-peer-deps`

### **4.3 Ajouter les variables d'environnement**

Dans la section **Environment Variables**, ajoutez:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` |
| `NEXT_PUBLIC_APP_URL` | `https://votre-projet.vercel.app` (sera généré) |
| `GOOGLE_BOOKS_API_KEY` | `AIzaSyDMFWV7Ohdfw0sAZ7rnYPGCTPcUtkz08Ps` |

### **4.4 Déployer**

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes
3. Votre site sera disponible sur: `https://votre-projet.vercel.app`

---

## 📋 **ÉTAPE 5: Tester et Partager**

### **5.1 Tester le déploiement**

1. Ouvrez l'URL Vercel dans votre navigateur
2. Créez un compte ou connectez-vous
3. Vérifiez que tout fonctionne

### **5.2 Partager avec Melissa**

Envoyez-lui simplement le lien:

```
📚 Bookie est prêt!

Voici ton lien: https://votre-projet.vercel.app

Tu n'as RIEN à installer - ouvre juste le lien dans ton navigateur!

Pour te connecter:
- Clique sur "S'inscrire"
- Crée ton compte avec ton email

Bonne lecture! 📖✨
```

---

## ✅ **RÉSUMÉ RAPIDE:**

```bash
# 1. Créer projet Supabase → Récupérer DATABASE_URL
# 2. Créer fichier .env avec DATABASE_URL
# 3. Installer et créer les tables
npm install --legacy-peer-deps
npx prisma db push

# 4. Déployer sur Vercel
# - Importer le projet
# - Ajouter les variables d'environnement
# - Déployer

# 5. Partager le lien!
```

---

## 🎯 **RÉSULTAT FINAL:**

✅ Bookie accessible en ligne 24/7  
✅ Aucune installation requise  
✅ Accessible depuis n'importe quel appareil  
✅ Base de données sécurisée sur Supabase  
✅ Hébergement gratuit sur Vercel  

**Melissa n'aura qu'à ouvrir le lien - RIEN à installer!** 🎉

