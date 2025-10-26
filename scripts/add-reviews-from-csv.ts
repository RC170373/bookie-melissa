/**
 * Script pour ajouter UNIQUEMENT les critiques du CSV
 */

import { PrismaClient } from '../node_modules/@prisma/client/default.js'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Fonction pour corriger l'encodage Windows-1252 -> UTF-8
function fixEncoding(text: string): string {
  if (!text) return text
  
  return text
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã /g, 'à')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã»/g, 'û')
    .replace(/Ã®/g, 'î')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã§/g, 'ç')
    .replace(/Å\u0093/g, 'œ')
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
    .replace(/�/g, 'e')
}

function parseCSV(filePath: string): any[] {
  const text = fs.readFileSync(filePath, 'utf-8')
  const fixedText = fixEncoding(text)
  
  const lines = fixedText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const firstLine = lines[0]
  const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ','

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const books: any[] = []

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

async function main() {
  console.log('🚀 Ajout des critiques du CSV Livraddict...\n')

  const csvPath = process.argv[2] || '~/Downloads/export_livraddict_bibliotheque.csv'
  const expandedPath = csvPath.replace('~', process.env.HOME || '')

  if (!fs.existsSync(expandedPath)) {
    console.error('❌ Fichier CSV introuvable:', expandedPath)
    process.exit(1)
  }

  console.log('📂 Lecture du CSV:', expandedPath)
  const csvBooks = parseCSV(expandedPath)
  console.log(`✅ ${csvBooks.length} livres trouvés dans le CSV\n`)

  // Créer un mapping titre+auteur -> critique
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
      console.log(`📝 Critique trouvée pour: ${title}`)
    }
  })

  console.log(`\n✅ ${reviewMap.size} critiques trouvées dans le CSV\n`)

  // Récupérer tous les UserBooks
  const allUserBooks = await prisma.userBook.findMany({
    include: {
      book: true
    }
  })

  console.log(`📚 ${allUserBooks.length} livres dans votre bibliothèque\n`)

  let addedReviews = 0
  let alreadyHasReview = 0
  let notFound = 0

  for (const userBook of allUserBooks) {
    try {
      // Si le livre a déjà une critique, on ne la remplace pas
      if (userBook.review && userBook.review.trim()) {
        alreadyHasReview++
        continue
      }

      const key = `${userBook.book.title.toLowerCase()}|||${userBook.book.author.toLowerCase()}`
      const review = reviewMap.get(key)

      if (review) {
        await prisma.userBook.update({
          where: { id: userBook.id },
          data: { review: review }
        })
        addedReviews++
        console.log(`✅ Critique ajoutée pour: ${userBook.book.title}`)
      } else {
        notFound++
      }

    } catch (error) {
      console.error(`❌ Erreur pour ${userBook.book.title}:`, error)
    }
  }

  console.log('\n✅ AJOUT DES CRITIQUES TERMINÉ!\n')
  console.log(`📊 Résultats:`)
  console.log(`   - ${addedReviews} critiques ajoutées`)
  console.log(`   - ${alreadyHasReview} livres avaient déjà une critique`)
  console.log(`   - ${notFound} livres sans critique dans le CSV`)

  await prisma.$disconnect()
}

main().catch(console.error)

