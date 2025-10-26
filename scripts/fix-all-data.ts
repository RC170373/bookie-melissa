/**
 * Script de correction complète des données
 * - Corrige tous les caractères mal encodés (ç, é, è, etc.)
 * - Récupère toutes les couvertures manquantes
 * - Extrait et sauvegarde toutes les critiques du CSV
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Fonction pour corriger l'encodage Windows-1252 -> UTF-8
function fixEncoding(text: string): string {
  if (!text) return text
  
  return text
    // Lowercase accented characters
    .replace(/Ã©/g, 'é')   // é (e acute)
    .replace(/Ã¨/g, 'è')   // è (e grave)
    .replace(/Ãª/g, 'ê')   // ê (e circumflex)
    .replace(/Ã«/g, 'ë')   // ë (e diaeresis)
    .replace(/Ã /g, 'à')   // à (a grave)
    .replace(/Ã¢/g, 'â')   // â (a circumflex)
    .replace(/Ã´/g, 'ô')   // ô (o circumflex)
    .replace(/Ã¹/g, 'ù')   // ù (u grave)
    .replace(/Ã»/g, 'û')   // û (u circumflex)
    .replace(/Ã®/g, 'î')   // î (i circumflex)
    .replace(/Ã¯/g, 'ï')   // ï (i diaeresis)
    .replace(/Ã§/g, 'ç')   // ç (c cedilla)
    .replace(/Å\u0093/g, 'œ') // œ (oe ligature)
    // Uppercase accented characters
    .replace(/Ã\u0089/g, 'É')
    .replace(/Ã\u0088/g, 'È')
    .replace(/Ã\u008A/g, 'Ê')
    .replace(/Ã\u0080/g, 'À')
    .replace(/Ã\u0082/g, 'Â')
    .replace(/Ã\u0094/g, 'Ô')
    .replace(/Ã\u0099/g, 'Ù')
    .replace(/Ã\u009B/g, 'Û')
    .replace(/Ã\u008E/g, 'Î')
    .replace(/Ã\u0087/g, 'Ç')
    .replace(/Å\u0092/g, 'Œ')
    // Fallback
    .replace(/�/g, 'e')
}

// Fonction pour parser le CSV Livraddict
function parseCSV(filePath: string): any[] {
  const text = fs.readFileSync(filePath, 'utf-8')
  const fixedText = fixEncoding(text)
  
  const lines = fixedText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const firstLine = lines[0]
  const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ','

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const books: any[] = []

  console.log('📋 Headers trouvés:', headers)

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]

      if (char === '"') {
        if (inQuotes && lines[i][j + 1] === '"') {
          current += '"'
          j++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const book: any = {}
    headers.forEach((header, index) => {
      book[header] = values[index] || ''
    })

    books.push(book)
  }

  return books
}

// Fonction pour récupérer les métadonnées Google Books
async function fetchGoogleBooksMetadata(book: { isbn: string | null; title: string; author: string }) {
  try {
    const strategies = []

    if (book.isbn && book.isbn.length >= 10) {
      strategies.push(`isbn:${book.isbn}`)
    }

    strategies.push(`intitle:"${book.title}"+inauthor:"${book.author}"`)
    strategies.push(`intitle:${book.title}+inauthor:${book.author}`)

    const cleanTitle = book.title.split(',')[0].split(':')[0].trim()
    strategies.push(`intitle:"${cleanTitle}"`)

    for (const searchQuery of strategies) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=3&langRestrict=fr`
        )

        if (!response.ok) continue

        const data = await response.json()
        if (!data.items || data.items.length === 0) continue

        for (const item of data.items) {
          const volumeInfo = item.volumeInfo

          const titleMatch = volumeInfo.title?.toLowerCase().includes(cleanTitle.toLowerCase())
          const authorMatch = volumeInfo.authors?.some((a: string) =>
            a.toLowerCase().includes(book.author.toLowerCase()) ||
            book.author.toLowerCase().includes(a.toLowerCase())
          )

          if (titleMatch || authorMatch || book.isbn) {
            return {
              coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                        volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://') || null,
              description: volumeInfo.description || null,
              pageCount: volumeInfo.pageCount || null,
              publishedDate: volumeInfo.publishedDate || null,
            }
          }
        }
      } catch (err) {
        continue
      }
    }

    return null
  } catch (error) {
    console.error('❌ Erreur Google Books:', error)
    return null
  }
}

async function main() {
  console.log('🚀 Démarrage du script de correction...\n')

  // 1. Demander le chemin du CSV
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('❌ Veuillez fournir le chemin du fichier CSV:')
    console.error('   npm run fix-data /chemin/vers/fichier.csv')
    process.exit(1)
  }

  if (!fs.existsSync(csvPath)) {
    console.error('❌ Fichier CSV introuvable:', csvPath)
    process.exit(1)
  }

  console.log('📂 Lecture du CSV:', csvPath)
  const csvBooks = parseCSV(csvPath)
  console.log(`✅ ${csvBooks.length} livres trouvés dans le CSV\n`)

  // 2. Créer un mapping titre+auteur -> critique
  const reviewMap = new Map<string, string>()
  
  csvBooks.forEach(csvBook => {
    const getField = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        if (csvBook[name] && csvBook[name].trim()) {
          return csvBook[name].trim()
        }
      }
      return null
    }

    const title = getField(['titre vf', 'titre', 'title', 'book title'])
    const author = getField(['auteur(s)', 'auteur', 'author', 'authors'])
    const review = getField(['critique', 'review', 'avis', 'commentaire', 'comment', 'commentaires'])

    if (title && author && review) {
      const key = `${title.toLowerCase()}|||${author.toLowerCase()}`
      reviewMap.set(key, review)
    }
  })

  console.log(`📝 ${reviewMap.size} critiques trouvées dans le CSV\n`)

  // 3. Récupérer tous les livres de la base de données
  const allBooks = await prisma.book.findMany({
    include: {
      userBooks: true
    }
  })

  console.log(`📚 ${allBooks.length} livres dans la base de données\n`)

  let fixedEncoding = 0
  let addedCovers = 0
  let addedReviews = 0
  let errors = 0

  // 4. Corriger chaque livre
  for (const book of allBooks) {
    try {
      const updates: any = {}
      
      // Corriger l'encodage du titre, auteur, éditeur, langue, genres
      if (book.title && (book.title.includes('Ã') || book.title.includes('�'))) {
        updates.title = fixEncoding(book.title)
        fixedEncoding++
      }
      
      if (book.author && (book.author.includes('Ã') || book.author.includes('�'))) {
        updates.author = fixEncoding(book.author)
        fixedEncoding++
      }
      
      if (book.publisher && (book.publisher.includes('Ã') || book.publisher.includes('�'))) {
        updates.publisher = fixEncoding(book.publisher)
        fixedEncoding++
      }
      
      if (book.language && (book.language.includes('Ã') || book.language.includes('�'))) {
        updates.language = fixEncoding(book.language)
        fixedEncoding++
      }
      
      if (book.genres && (book.genres.includes('Ã') || book.genres.includes('�'))) {
        updates.genres = fixEncoding(book.genres)
        fixedEncoding++
      }

      // Récupérer la couverture si manquante
      if (!book.coverUrl) {
        console.log(`🔍 Recherche couverture pour: ${book.title}`)
        const metadata = await fetchGoogleBooksMetadata({
          isbn: book.isbn,
          title: book.title,
          author: book.author
        })

        if (metadata?.coverUrl) {
          updates.coverUrl = metadata.coverUrl
          addedCovers++
          console.log(`✅ Couverture trouvée!`)
        }

        // Pause pour éviter rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Mettre à jour le livre si nécessaire
      if (Object.keys(updates).length > 0) {
        await prisma.book.update({
          where: { id: book.id },
          data: updates
        })
      }

      // Ajouter la critique si manquante
      for (const userBook of book.userBooks) {
        if (!userBook.review) {
          const key = `${book.title.toLowerCase()}|||${book.author.toLowerCase()}`
          const review = reviewMap.get(key)

          if (review) {
            await prisma.userBook.update({
              where: { id: userBook.id },
              data: { review: review }
            })
            addedReviews++
            console.log(`📝 Critique ajoutée pour: ${book.title}`)
          }
        }
      }

    } catch (error) {
      console.error(`❌ Erreur pour ${book.title}:`, error)
      errors++
    }
  }

  console.log('\n✅ CORRECTION TERMINÉE!\n')
  console.log(`📊 Résultats:`)
  console.log(`   - ${fixedEncoding} champs corrigés (encodage)`)
  console.log(`   - ${addedCovers} couvertures ajoutées`)
  console.log(`   - ${addedReviews} critiques ajoutées`)
  console.log(`   - ${errors} erreurs`)

  await prisma.$disconnect()
}

main().catch(console.error)

