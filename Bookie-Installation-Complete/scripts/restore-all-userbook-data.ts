#!/usr/bin/env node
import { PrismaClient } from '../node_modules/@prisma/client/default.js'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../prisma/prisma/dev.db'
    }
  }
})

interface CSVBook {
  title: string
  author: string
  rating?: number
  dateRead?: Date
  dateAdded?: Date
  status: string
  format?: string
  language?: string
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

// Parse CSV
function parseCSV(filePath: string): CSVBook[] {
  const content = fs.readFileSync(filePath, 'latin1') // Livraddict uses Windows-1252
  const lines = content.split('\n')
  
  if (lines.length === 0) return []
  
  // Parse header
  const header = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''))
  
  const books: CSVBook[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(';').map(v => v.trim().replace(/^"|"$/g, ''))
    
    const getField = (names: string[]): string => {
      for (const name of names) {
        const idx = header.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))
        if (idx !== -1 && values[idx]) return values[idx]
      }
      return ''
    }
    
    const title = getField(['titre vf', 'titre'])
    const author = getField(['auteur'])
    
    if (!title) continue
    
    // Parse rating (out of 20)
    const ratingStr = getField(['note personnelle', 'note'])
    let rating: number | undefined
    if (ratingStr) {
      const parsed = parseFloat(ratingStr.replace(',', '.'))
      if (!isNaN(parsed)) rating = parsed
    }
    
    // Parse dates (format: DD/MM/YYYY HH:MM)
    const dateReadStr = getField(['date de lecture', 'date lecture'])
    let dateRead: Date | undefined
    if (dateReadStr) {
      const match = dateReadStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/)
      if (match) {
        const [, day, month, year, hour, minute] = match
        dateRead = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
      }
    }

    const dateAddedStr = getField(['date d\'achat', 'date achat'])
    let dateAdded: Date | undefined
    if (dateAddedStr) {
      const match = dateAddedStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/)
      if (match) {
        const [, day, month, year, hour, minute] = match
        dateAdded = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
      }
    }
    
    // Parse format and language
    const format = getField(['type de livre', 'format', 'type'])
    const language = getField(['langue'])
    
    books.push({
      title,
      author,
      rating,
      dateRead,
      dateAdded,
      status: 'read', // All books in Livraddict export are read
      format,
      language
    })
  }
  
  return books
}

// Find book in database
async function findBook(title: string, author: string, allBooks: any[]) {
  const normalizedTitle = normalize(title)
  const normalizedAuthor = normalize(author)
  
  // Try exact match first
  let books = allBooks.filter(book => {
    const bookTitle = normalize(book.title)
    const bookAuthor = normalize(book.author || '')
    return (bookTitle.includes(normalizedTitle) || normalizedTitle.includes(bookTitle)) &&
           (bookAuthor.includes(normalizedAuthor) || normalizedAuthor.includes(bookAuthor))
  })
  
  if (books.length > 0) return books[0]
  
  // Try fuzzy match by title only
  books = allBooks.filter(book => {
    const bookTitle = normalize(book.title)
    return bookTitle.includes(normalizedTitle) || normalizedTitle.includes(bookTitle)
  })
  
  return books.length > 0 ? books[0] : null
}

async function main() {
  console.log('🔧 Restauration de TOUTES les données UserBook depuis le CSV...\n')
  
  const homeDir = process.env.HOME || ''
  const csvPath = path.join(homeDir, 'Downloads', 'export_livraddict_bibliotheque.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Fichier CSV non trouvé: ${csvPath}`)
    return
  }
  
  console.log('📖 Lecture du CSV...')
  const csvBooks = parseCSV(csvPath)
  console.log(`   ${csvBooks.length} livres trouvés dans le CSV\n`)
  
  // Get user
  const user = await prisma.user.findFirst()
  if (!user) {
    console.error('❌ Aucun utilisateur trouvé')
    return
  }
  
  // Get all books with their UserBooks
  console.log('📚 Chargement de la base de données...')
  const allBooks = await prisma.book.findMany({
    include: {
      userBooks: {
        where: { userId: user.id }
      }
    }
  })
  console.log(`   ${allBooks.length} livres dans la base\n`)
  
  let updated = 0
  let notFound = 0
  let noUserBook = 0

  for (const csvBook of csvBooks) {
    const book = await findBook(csvBook.title, csvBook.author, allBooks)

    if (!book) {
      notFound++
      // Don't log every single one to avoid spam
      continue
    }

    const existingUserBook = book.userBooks[0]

    if (!existingUserBook) {
      noUserBook++
      continue
    }

    const data = {
      status: csvBook.status,
      rating: csvBook.rating,
      dateRead: csvBook.dateRead || null,
    }

    // Update existing UserBook
    await prisma.userBook.update({
      where: { id: existingUserBook.id },
      data
    })
    updated++
    if (updated % 100 === 0) {
      console.log(`   ✅ ${updated} livres mis à jour...`)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`✅ UserBooks mis à jour: ${updated}`)
  console.log(`⚠️  Livres sans UserBook: ${noUserBook}`)
  console.log(`❌ Livres non trouvés: ${notFound}`)
  console.log('='.repeat(60))
  
  // Verify final state
  const stats = await prisma.userBook.aggregate({
    where: { userId: user.id },
    _count: {
      id: true
    }
  })
  
  const withStatus = await prisma.userBook.count({
    where: {
      userId: user.id,
      status: 'read'
    }
  })
  
  const withRating = await prisma.userBook.count({
    where: {
      userId: user.id,
      rating: { not: null }
    }
  })
  
  const withDate = await prisma.userBook.count({
    where: {
      userId: user.id,
      dateRead: { not: null }
    }
  })
  
  console.log(`\n📚 État final:`)
  console.log(`   Total UserBooks: ${stats._count.id}`)
  console.log(`   Avec status "read" (lu): ${withStatus}`)
  console.log(`   Avec note: ${withRating}`)
  console.log(`   Avec date de lecture: ${withDate}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)

