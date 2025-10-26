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

// Strategy 1: Google Books API
async function fetchFromGoogleBooks(book: any): Promise<string | null> {
  try {
    // Try ISBN first
    if (book.isbn) {
      const cleanIsbn = book.isbn.replace(/[^\d]/g, '')
      if (cleanIsbn.length >= 10) {
        const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
        const response = await fetch(url)
        const data = await response.json() as any
        
        if (data.items && data.items.length > 0) {
          const imageLinks = data.items[0].volumeInfo?.imageLinks
          if (imageLinks) {
            const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail
            if (cover) return cover.replace('http:', 'https:')
          }
        }
      }
    }
    
    // Try title + author
    const searchQuery = `${book.title} ${book.author}`.substring(0, 100)
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`
    const response = await fetch(url)
    const data = await response.json() as any
    
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const imageLinks = item.volumeInfo?.imageLinks
        if (imageLinks) {
          const cover = imageLinks.large || imageLinks.medium || imageLinks.thumbnail
          if (cover) return cover.replace('http:', 'https:')
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Strategy 2: Open Library API
async function fetchFromOpenLibrary(book: any): Promise<string | null> {
  try {
    // Try ISBN first
    if (book.isbn) {
      const cleanIsbn = book.isbn.replace(/[^\d]/g, '')
      if (cleanIsbn.length >= 10) {
        const url = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok && response.headers.get('content-type')?.includes('image')) {
          return url
        }
      }
    }
    
    // Try search by title
    const searchQuery = encodeURIComponent(book.title)
    const url = `https://openlibrary.org/search.json?title=${searchQuery}&limit=5`
    const response = await fetch(url)
    const data = await response.json() as any
    
    if (data.docs && data.docs.length > 0) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Strategy 3: Generate placeholder cover
function generatePlaceholderCover(book: any): string {
  const title = encodeURIComponent(book.title.substring(0, 50))
  const author = encodeURIComponent((book.author || 'Auteur inconnu').substring(0, 30))
  // Using a placeholder service
  return `https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=${title}+by+${author}`
}

// Fetch cover with multiple strategies
async function fetchCover(book: any): Promise<string> {
  console.log(`   🔍 Recherche pour "${book.title}"...`)
  
  // Strategy 1: Google Books
  let cover = await fetchFromGoogleBooks(book)
  if (cover) {
    console.log(`      ✅ Trouvé sur Google Books`)
    return cover
  }
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Strategy 2: Open Library
  cover = await fetchFromOpenLibrary(book)
  if (cover) {
    console.log(`      ✅ Trouvé sur Open Library`)
    return cover
  }
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Strategy 3: Placeholder
  console.log(`      ⚠️  Aucune couverture trouvée, génération d'un placeholder`)
  return generatePlaceholderCover(book)
}

async function main() {
  console.log('🖼️  Ajout de TOUTES les couvertures manquantes (100%)...\n')
  
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
  
  let googleBooks = 0
  let openLibrary = 0
  let placeholders = 0
  let processed = 0
  
  for (const book of booksWithoutCovers) {
    processed++
    
    if (processed % 10 === 0) {
      console.log(`\n📊 Progression: ${processed}/${booksWithoutCovers.length}`)
      console.log(`   Google Books: ${googleBooks}, Open Library: ${openLibrary}, Placeholders: ${placeholders}\n`)
    }
    
    const coverUrl = await fetchCover(book)
    
    await prisma.book.update({
      where: { id: book.id },
      data: { coverUrl }
    })
    
    // Track source
    if (coverUrl.includes('googleapis') || coverUrl.includes('books.google')) {
      googleBooks++
    } else if (coverUrl.includes('openlibrary')) {
      openLibrary++
    } else {
      placeholders++
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`✅ Google Books: ${googleBooks}`)
  console.log(`✅ Open Library: ${openLibrary}`)
  console.log(`⚠️  Placeholders: ${placeholders}`)
  console.log(`📚 Total: ${processed}`)
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
  console.log(`   Taux de couverture: ${((withCovers / stats._count.id) * 100).toFixed(1)}%`)
  
  await prisma.$disconnect()
}

main().catch(console.error)

