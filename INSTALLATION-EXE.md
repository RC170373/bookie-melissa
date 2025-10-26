# 📦 INSTALLATION BOOKIE - FICHIER .EXE

## 🎯 COMMENT OBTENIR LE FICHIER .EXE

GitHub Actions va compiler automatiquement le fichier `.exe` pour Windows.

---

## ✅ ÉTAPE 1: ACTIVER GITHUB ACTIONS

1. **Allez sur:** https://github.com/RC170373/bookie-melissa

2. **Cliquez sur l'onglet "Actions"** (en haut)

3. **Si demandé, cliquez sur "I understand my workflows, go ahead and enable them"**

---

## ✅ ÉTAPE 2: LANCER LA COMPILATION

GitHub Actions va détecter le nouveau code et lancer automatiquement la compilation.

**OU** vous pouvez forcer la compilation:

1. Dans l'onglet **"Actions"**
2. Cliquez sur **"Build Windows EXE"** dans la liste de gauche
3. Cliquez sur **"Run workflow"** (bouton à droite)
4. Cliquez sur **"Run workflow"** (bouton vert)

---

## ✅ ÉTAPE 3: ATTENDRE LA COMPILATION (10-15 MINUTES)

GitHub va:
1. ✅ Installer Node.js
2. ✅ Installer toutes les dépendances
3. ✅ Compiler Next.js
4. ✅ Créer le fichier .exe avec Electron
5. ✅ Créer une Release avec le fichier .exe

Vous verrez une animation de chargement pendant la compilation.

---

## ✅ ÉTAPE 4: TÉLÉCHARGER LE .EXE

### **OPTION A: Depuis les Releases**

1. Allez sur: https://github.com/RC170373/bookie-melissa/releases
2. Cliquez sur la dernière release (ex: `v1.0.1`)
3. Téléchargez le fichier `Bookie-Setup-1.0.0.exe`

### **OPTION B: Depuis les Artifacts**

1. Dans l'onglet **"Actions"**
2. Cliquez sur le workflow **"Build Windows EXE"** qui vient de se terminer (✅ vert)
3. Scrollez jusqu'à **"Artifacts"**
4. Téléchargez **"Bookie-Windows-Installer"**
5. Décompressez le fichier ZIP
6. Vous avez le fichier `Bookie-Setup-1.0.0.exe`

---

## ✅ ÉTAPE 5: ENVOYER LE .EXE À MELISSA

1. **Téléchargez le fichier .exe** depuis GitHub
2. **Envoyez-le à Melissa** par email ou Google Drive
3. **Melissa double-clique sur le .exe**
4. **L'installation se fait automatiquement**
5. **Bookie s'ouvre automatiquement après l'installation**

---

## 📧 EMAIL À ENVOYER À MELISSA

```
Bonjour Melissa,

Voici l'application Bookie avec tes 1671 livres pré-chargés!

INSTALLATION:
1. Télécharge le fichier "Bookie-Setup-1.0.0.exe" ci-joint
2. Double-clique dessus
3. L'installation se fait automatiquement
4. Bookie s'ouvre tout seul après l'installation

UTILISATION:
1. Crée ton compte (email + mot de passe)
2. Tous les 1671 livres sont déjà là!
3. Explore ta bibliothèque

RACCOURCI:
Un raccourci "Bookie" sera créé sur ton bureau.

Bon courage!
```

---

## 🎉 RÉSULTAT FINAL

Melissa aura:
- ✅ Un fichier .exe à double-cliquer
- ✅ Installation automatique en 1 clic
- ✅ Raccourci sur le bureau
- ✅ Application qui s'ouvre automatiquement
- ✅ 1671 livres pré-chargés
- ✅ Base de données SQLite locale (pas besoin d'internet)

---

## ⚠️ IMPORTANT

Le fichier .exe fait environ **150-200 MB** car il contient:
- Node.js
- Next.js
- Electron
- Toutes les dépendances
- La base de données avec 1671 livres

C'est normal!

---

## 🆘 EN CAS DE PROBLÈME

Si GitHub Actions échoue, vérifiez:
1. Que vous avez bien activé GitHub Actions
2. Que le workflow s'est bien lancé
3. Les logs d'erreur dans l'onglet Actions

---

**TEMPS TOTAL: 15 MINUTES DE COMPILATION SUR GITHUB**

Après ça, vous avez le .exe prêt à envoyer à Melissa!

