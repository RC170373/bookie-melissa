# 📚 Bookie - Votre Bibliothèque Personnelle

Application de gestion de bibliothèque personnelle avec 1671 livres pré-chargés.

## 🚀 Déploiement sur Vercel

### Variables d'environnement requises:

```env
DATABASE_URL="postgresql://postgres.sssczjmyfdptqqtlghwj:Melissa2025+@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.sssczjmyfdptqqtlghwj:Melissa2025+@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="https://votre-projet.vercel.app"
GOOGLE_BOOKS_API_KEY="AIzaSyDMFWV7Ohdfw0sAZ7rnYPGCTPcUtkz08Ps"
```

## 📦 Installation locale

```bash
npm install --legacy-peer-deps
npx prisma generate
npm run dev
```

## ✨ Fonctionnalités

- 📚 Bibliomania (bibliothèque virtuelle)
- 🔍 Recherche avancée
- 📊 Statistiques de lecture
- 📝 Critiques et notes
- 📖 Club de lecture
- 🎯 Défis de lecture
- Et bien plus!

