#!/usr/bin/env node
import { PrismaClient } from '../node_modules/@prisma/client/default.js'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../prisma/prisma/dev.db'
    }
  }
})

// Normalize string for search
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ')
    .trim()
}

// Fetch cover from Google Books API
async function fetchCoverFromGoogleBooks(book: any): Promise<string | null> {
  try {
    // Strategy 1: Search by ISBN
    if (book.isbn) {
      const cleanIsbn = book.isbn.replace(/[^\d]/g, '')
      if (cleanIsbn.length >= 10) {
        const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
        const response = await fetch(url)
        const data = await response.json() as any
        
        if (data.items && data.items.length > 0) {
          const imageLinks = data.items[0].volumeInfo?.imageLinks
          if (imageLinks) {
            return imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null
          }
        }
      }
    }
    
    // Strategy 2: Search by title + author
    const searchQuery = `${book.title} ${book.author}`.substring(0, 100)
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`
    const response = await fetch(url)
    const data = await response.json() as any
    
    if (!data.items || data.items.length === 0) {
      return null
    }
    
    // Normalize book title and author for matching
    const normalizedTitle = normalize(book.title)
    const normalizedAuthor = normalize(book.author || '')
    
    // Find best match
    for (const item of data.items) {
      const volumeInfo = item.volumeInfo
      const itemTitle = normalize(volumeInfo.title || '')
      const itemAuthors = (volumeInfo.authors || []).map((a: string) => normalize(a)).join(' ')
      
      // Check if title matches (at least 50% overlap)
      const titleWords = normalizedTitle.split(' ').filter(w => w.length > 2)
      const itemTitleWords = itemTitle.split(' ').filter(w => w.length > 2)
      const matchingWords = titleWords.filter(w => itemTitleWords.some(iw => iw.includes(w) || w.includes(iw)))
      const titleMatch = matchingWords.length / Math.max(titleWords.length, 1)
      
      // Check if author matches
      const authorMatch = normalizedAuthor && itemAuthors.includes(normalizedAuthor.split(' ')[0])
      
      if (titleMatch > 0.5 || authorMatch) {
        const imageLinks = volumeInfo.imageLinks
        if (imageLinks) {
          return imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null
        }
      }
    }
    
    // If no good match, take first result with cover
    for (const item of data.items) {
      const imageLinks = item.volumeInfo?.imageLinks
      if (imageLinks) {
        return imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null
      }
    }
    
    return null
  } catch (error) {
    console.error(`   ❌ Erreur API: ${error}`)
    return null
  }
}

async function main() {
  console.log('🖼️  Ajout des couvertures manquantes...\n')
  
  // Get all books without covers
  const booksWithoutCovers = await prisma.book.findMany({
    where: {
      OR: [
        { coverUrl: null },
        { coverUrl: '' }
      ]
    },
    orderBy: {
      title: 'asc'
    }
  })
  
  console.log(`📚 ${booksWithoutCovers.length} livres sans couverture\n`)
  
  if (booksWithoutCovers.length === 0) {
    console.log('✅ Tous les livres ont déjà une couverture!')
    await prisma.$disconnect()
    return
  }
  
  let added = 0
  let notFound = 0
  let processed = 0
  
  for (const book of booksWithoutCovers) {
    processed++
    
    if (processed % 10 === 0) {
      console.log(`   📊 Progression: ${processed}/${booksWithoutCovers.length} (${added} ajoutées, ${notFound} non trouvées)`)
    }
    
    const coverUrl = await fetchCoverFromGoogleBooks(book)
    
    if (coverUrl) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverUrl }
      })
      added++
      console.log(`   ✅ "${book.title}" - Couverture ajoutée`)
    } else {
      notFound++
      if (notFound % 50 === 0) {
        console.log(`   ⚠️  "${book.title}" - Couverture non trouvée`)
      }
    }
    
    // Rate limiting: 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`✅ Couvertures ajoutées: ${added}`)
  console.log(`❌ Couvertures non trouvées: ${notFound}`)
  console.log(`📚 Total traité: ${processed}`)
  console.log('='.repeat(60))
  
  // Verify final state
  const stats = await prisma.book.aggregate({
    _count: {
      id: true
    }
  })
  
  const withCovers = await prisma.book.count({
    where: {
      coverUrl: {
        not: null,
        not: ''
      }
    }
  })
  
  console.log(`\n📚 État final:`)
  console.log(`   Total livres: ${stats._count.id}`)
  console.log(`   Avec couverture: ${withCovers}`)
  console.log(`   Sans couverture: ${stats._count.id - withCovers}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)

