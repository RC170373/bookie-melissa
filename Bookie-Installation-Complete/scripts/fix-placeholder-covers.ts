#!/usr/bin/env node
import { PrismaClient } from '../node_modules/@prisma/client/default.js'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../prisma/prisma/dev.db'
    }
  }
})

// Generate a better cover URL using UI Avatars or similar service
function generateBetterCover(book: any): string {
  // Use a color based on the first letter of the title
  const colors = [
    '4F46E5', // Indigo
    '7C3AED', // Violet
    'EC4899', // Pink
    'EF4444', // Red
    'F59E0B', // Amber
    '10B981', // Emerald
    '3B82F6', // Blue
    '8B5CF6', // Purple
  ]
  
  const firstLetter = book.title.charAt(0).toUpperCase()
  const colorIndex = firstLetter.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  
  // Create a simple cover with title
  const title = encodeURIComponent(book.title.substring(0, 30))
  const author = encodeURIComponent((book.author || '').substring(0, 20))
  
  // Use a better placeholder service that actually works
  return `https://placehold.co/400x600/${bgColor}/FFFFFF/png?text=${title}+by+${author}&font=roboto`
}

async function main() {
  console.log('🖼️  Correction des couvertures placeholder...\n')
  
  // Get all books with placeholder covers
  const booksWithPlaceholders = await prisma.book.findMany({
    where: {
      coverUrl: {
        contains: 'placeholder'
      }
    },
    orderBy: {
      title: 'asc'
    }
  })
  
  console.log(`📚 ${booksWithPlaceholders.length} livres avec placeholders\n`)
  
  if (booksWithPlaceholders.length === 0) {
    console.log('✅ Aucun placeholder à corriger!')
    await prisma.$disconnect()
    return
  }
  
  let updated = 0
  
  for (const book of booksWithPlaceholders) {
    const newCoverUrl = generateBetterCover(book)
    
    await prisma.book.update({
      where: { id: book.id },
      data: { coverUrl: newCoverUrl }
    })
    
    updated++
    
    if (updated % 10 === 0) {
      console.log(`   ✅ ${updated}/${booksWithPlaceholders.length} couvertures mises à jour`)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`✅ Couvertures mises à jour: ${updated}`)
  console.log('='.repeat(60))
  
  await prisma.$disconnect()
}

main().catch(console.error)

