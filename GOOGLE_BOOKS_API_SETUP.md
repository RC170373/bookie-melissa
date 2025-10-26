# 🔑 Configuration de la clé API Google Books

## Pourquoi une clé API ?

L'API Google Books gratuite (sans clé) a des limitations strictes :
- ❌ Maximum 10 résultats par requête
- ❌ Maximum ~40 résultats au total pour une recherche d'auteur
- ❌ Pas d'accès aux fonctionnalités avancées

Avec une clé API (gratuite) :
- ✅ Jusqu'à 40 résultats par requête
- ✅ Jusqu'à 1000 résultats au total
- ✅ Meilleure fiabilité et performance
- ✅ Quota quotidien de 1000 requêtes (largement suffisant)

---

## 📋 Étapes pour obtenir votre clé API

### 1. Créer un projet Google Cloud

1. Allez sur **[Google Cloud Console](https://console.cloud.google.com/)**
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Select a project"** en haut de la page
4. Cliquez sur **"New Project"**
5. Nommez votre projet (ex: `Bookie-App` ou `Livraddict`)
6. Cliquez sur **"Create"**
7. Attendez quelques secondes que le projet soit créé

### 2. Activer l'API Google Books

1. Dans le menu de gauche (☰), allez dans **"APIs & Services"** → **"Library"**
2. Dans la barre de recherche, tapez **"Books API"**
3. Cliquez sur **"Books API"** dans les résultats
4. Cliquez sur le bouton **"Enable"**
5. Attendez que l'API soit activée

### 3. Créer une clé API

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ Create Credentials"** en haut
3. Sélectionnez **"API Key"**
4. Une fenêtre s'ouvre avec votre clé API → **Copiez-la !**
5. (Optionnel mais recommandé) Cliquez sur **"Restrict Key"** pour sécuriser votre clé :
   - Sous "API restrictions", sélectionnez **"Restrict key"**
   - Cochez uniquement **"Books API"**
   - Cliquez sur **"Save"**

### 4. Configurer la clé dans votre application

1. Ouvrez le fichier **`.env.local`** à la racine du projet
2. Trouvez la ligne :
   ```
   GOOGLE_BOOKS_API_KEY=""
   ```
3. Collez votre clé API entre les guillemets :
   ```
   GOOGLE_BOOKS_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```
4. Sauvegardez le fichier

### 5. Redémarrer l'application

1. Dans le terminal où tourne l'application, appuyez sur **Ctrl+C** pour arrêter le serveur
2. Relancez l'application avec :
   ```bash
   npm run dev
   ```
3. L'application utilisera maintenant votre clé API !

---

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Allez sur la page **Auteurs**
2. Recherchez **"Stephen King"**
3. Cliquez sur son nom
4. Vous devriez maintenant voir **beaucoup plus de livres** (potentiellement des centaines)

---

## 🔒 Sécurité

**IMPORTANT** :
- ⚠️ Ne partagez JAMAIS votre clé API publiquement
- ⚠️ Ne commitez JAMAIS le fichier `.env.local` dans Git (il est déjà dans `.gitignore`)
- ✅ La clé est gratuite mais limitée à 1000 requêtes/jour
- ✅ Si vous déployez l'application, ajoutez la clé dans les variables d'environnement de votre hébergeur

---

## 📊 Quotas et limites

Avec une clé API gratuite :
- **1000 requêtes par jour** (se réinitialise à minuit PST)
- **40 résultats maximum par requête**
- **Jusqu'à 1000 résultats au total** pour une recherche

Pour un usage personnel, c'est largement suffisant !

---

## 🆘 Problèmes courants

### La clé ne fonctionne pas
- Vérifiez que l'API Books est bien activée dans votre projet
- Vérifiez que la clé est bien copiée dans `.env.local` (sans espaces)
- Redémarrez l'application après avoir ajouté la clé

### Erreur "API key not valid"
- Vérifiez que vous n'avez pas de restrictions d'IP ou de domaine sur la clé
- Essayez de créer une nouvelle clé sans restrictions

### Toujours limité à 40 livres
- Vérifiez que la clé est bien dans `.env.local`
- Vérifiez que le serveur a bien redémarré
- Regardez les logs du serveur pour voir si la clé est utilisée

---

## 📚 Ressources

- [Documentation Google Books API](https://developers.google.com/books/docs/v1/using)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Quotas et limites](https://developers.google.com/books/docs/v1/using#quota)

---

**Une fois la clé configurée, vous pourrez profiter de bibliographies complètes pour tous vos auteurs préférés !** 📚✨

