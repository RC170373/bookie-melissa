#!/usr/bin/env node
import { PrismaClient } from '../node_modules/@prisma/client/default.js'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../prisma/prisma/dev.db'
    }
  }
})

interface BookReview {
  title: string
  author?: string
  review: string
}

// Function to extract text from DOCX files using textutil (macOS)
function extractTextFromDocx(filePath: string): string {
  try {
    // Use textutil to convert DOCX to plain text
    const txtPath = filePath.replace('.docx', '.txt')
    execSync(`textutil -convert txt -output "${txtPath}" "${filePath}"`, { encoding: 'utf-8' })
    const text = fs.readFileSync(txtPath, 'utf-8')
    fs.unlinkSync(txtPath) // Clean up temp file
    return text
  } catch (error) {
    console.error(`❌ Erreur lors de l'extraction de ${filePath}:`, error)
    return ''
  }
}

// Function to parse reviews from text
function parseReviews(text: string, year: string): BookReview[] {
  const reviews: BookReview[] = []

  // Split text into lines
  const lines = text.split('\n')

  let currentTitle = ''
  let currentAuthor = ''
  let currentReview = ''
  let inReview = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and table headers
    if (!line || line.match(/^(Jan|Fev|Mar|Avr|Mai|Jui|Aou|Sep|Oct|Nov|Dec|Total|TARGET|Livres|BDs)/i)) {
      continue
    }

    // Skip numbers and dates
    if (line.match(/^\d+$/) || line.match(/^\d{4}$/)) {
      continue
    }

    // Detect title line: "Titre, Auteur" or "Titre, #X, Série, Auteur"
    // Examples:
    // - "Les enfants de Peakwood, Rod Marty"
    // - "La nef du crépuscule, #3, L'assassin royal, Robin Hobb"
    // - "Alice et l'épouvanteur, #12, Joseph Delaney"
    const titleMatch = line.match(/^([^,]+?)(?:,\s*#\d+)?(?:,\s*([^,]+?))?(?:,\s*)?([A-Z][a-zéèêëàâäôöûüïîç]+(?:\s+[A-Z][a-zéèêëàâäôöûüïîç]+)+)\s*$/i)

    if (titleMatch && line.length < 150) {
      // Save previous review if exists
      if (currentTitle && currentReview.length > 100) {
        reviews.push({
          title: currentTitle.trim(),
          author: currentAuthor.trim() || undefined,
          review: currentReview.trim()
        })
      }

      // Extract title and author
      currentTitle = titleMatch[1].trim()
      currentAuthor = titleMatch[3]?.trim() || titleMatch[2]?.trim() || ''
      currentReview = ''
      inReview = true
    } else if (inReview && line.length > 20) {
      // This is part of the review
      currentReview += (currentReview ? '\n' : '') + line
    } else if (line.length < 20 && currentReview.length > 0) {
      // Might be end of review (short line after review text)
      inReview = false
    }
  }

  // Save last review
  if (currentTitle && currentReview.length > 100) {
    reviews.push({
      title: currentTitle.trim(),
      author: currentAuthor.trim() || undefined,
      review: currentReview.trim()
    })
  }

  console.log(`📖 ${year}: ${reviews.length} critiques trouvées`)
  return reviews
}

// Normalize string for matching
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

// Find book in database
async function findBook(title: string, author?: string) {
  const normalizedTitle = normalize(title)

  // Get all books and filter in memory (SQLite doesn't support case-insensitive contains)
  const allBooks = await prisma.book.findMany({
    include: {
      userBooks: true
    }
  })

  // Try exact match first
  let books = allBooks.filter(book => {
    const bookTitle = normalize(book.title)
    return bookTitle.includes(normalizedTitle) || normalizedTitle.includes(bookTitle)
  })

  // If author provided, filter by author
  if (author && books.length > 1) {
    const normalizedAuthor = normalize(author)
    books = books.filter(book => {
      const bookAuthor = normalize(book.author || '')
      return bookAuthor.includes(normalizedAuthor) || normalizedAuthor.includes(bookAuthor)
    })
  }

  // Try fuzzy match if no exact match (match by words)
  if (books.length === 0) {
    const titleWords = normalizedTitle.split(' ').filter(w => w.length > 3)
    if (titleWords.length > 0) {
      books = allBooks.filter(book => {
        const bookTitle = normalize(book.title)
        return titleWords.every(word => bookTitle.includes(word))
      })
    }
  }

  return books.length > 0 ? books[0] : null
}

async function main() {
  console.log('🚀 Importation des critiques depuis les fichiers DOCX...\n')
  
  const homeDir = process.env.HOME || ''
  const downloadsDir = path.join(homeDir, 'Downloads')
  
  const files = [
    'Livres lus en 2019.docx',
    'Livres lus en 2020.docx',
    'Livres lus en 2021.docx',
    'Livres lus en 2022.docx',
    'Livres lus en 2023.docx',
    'Livres lus en 2024.docx',
    'Livres lus en 2025.docx'
  ]
  
  let totalReviews = 0
  let importedReviews = 0
  let notFoundBooks = 0
  
  for (const file of files) {
    const filePath = path.join(downloadsDir, file)
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${file}`)
      continue
    }
    
    const year = file.match(/\d{4}/)?.[0] || 'unknown'
    console.log(`\n📚 Traitement de: ${file}`)
    
    // Extract text from DOCX
    const text = extractTextFromDocx(filePath)
    if (!text) continue
    
    // Parse reviews
    const reviews = parseReviews(text, year)
    totalReviews += reviews.length
    
    // Import reviews
    for (const review of reviews) {
      const book = await findBook(review.title, review.author)
      
      if (book) {
        // Get user ID (assuming first user)
        const user = await prisma.user.findFirst()
        if (!user) {
          console.error('❌ Aucun utilisateur trouvé dans la base de données')
          continue
        }
        
        // Find or create UserBook
        let userBook = book.userBooks.find(ub => ub.userId === user.id)
        
        if (!userBook) {
          userBook = await prisma.userBook.create({
            data: {
              userId: user.id,
              bookId: book.id,
              status: 'READ',
              review: review.review
            }
          })
        } else {
          // Update existing UserBook with review
          await prisma.userBook.update({
            where: { id: userBook.id },
            data: { review: review.review }
          })
        }
        
        importedReviews++
        console.log(`   ✅ "${book.title}" - Critique importée`)
      } else {
        notFoundBooks++
        console.log(`   ❌ Livre non trouvé: "${review.title}"${review.author ? ` par ${review.author}` : ''}`)
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`📖 Total de critiques trouvées: ${totalReviews}`)
  console.log(`✅ Critiques importées: ${importedReviews}`)
  console.log(`❌ Livres non trouvés: ${notFoundBooks}`)
  console.log('='.repeat(60))
  
  await prisma.$disconnect()
}

main().catch(console.error)

