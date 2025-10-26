# 🔧 Scripts de correction Bookie

## ✅ Script en cours d'exécution

### `fix-encoding-and-covers.ts`
**EN COURS** - Corrige automatiquement:
- ✅ Tous les caractères mal encodés (ç → ç, é → é, è → è, etc.)
- ✅ Récupère toutes les couvertures manquantes via Google Books API

**Progression**: Le script traite automatiquement tous les 3102 livres de la base de données.

---

## 📝 Pour ajouter les critiques du CSV

### `fix-all-data.ts`
Corrige TOUT en une seule fois:
- ✅ Caractères mal encodés
- ✅ Couvertures manquantes  
- ✅ **Critiques du CSV Livraddict**

### Utilisation:

```bash
npx tsx scripts/fix-all-data.ts /chemin/vers/votre/fichier-livraddict.csv
```

**Exemple**:
```bash
npx tsx scripts/fix-all-data.ts ~/Downloads/export-livraddict.csv
```

Le script va:
1. Lire le CSV Livraddict
2. Extraire toutes les critiques
3. Les associer aux livres correspondants dans la base de données
4. Corriger tous les encodages
5. Récupérer toutes les couvertures manquantes

---

## 📊 Résultats attendus

Après l'exécution complète:
- ✅ **"Française"** au lieu de "Franeaise"
- ✅ **Tous les ç, é, è, à, ô** correctement affichés
- ✅ **Couvertures** pour la majorité des livres
- ✅ **Critiques** importées du CSV et affichées dans les cartes de livres

---

## ⚠️ Important

- Le script `fix-encoding-and-covers.ts` est **déjà en cours d'exécution**
- Pour ajouter les critiques, vous devez lancer `fix-all-data.ts` avec le chemin du CSV
- Les deux scripts peuvent être exécutés l'un après l'autre sans problème

