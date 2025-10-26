#!/usr/bin/env node
import { PrismaClient } from '../node_modules/@prisma/client/default.js'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../prisma/prisma/dev.db'
    }
  }
})

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

async function main() {
  console.log('🔧 Fusion des livres en double...\n')
  
  // Get all books
  const allBooks = await prisma.book.findMany({
    include: {
      userBooks: true
    }
  })
  
  console.log(`📚 ${allBooks.length} livres dans la base\n`)
  
  // Group books by normalized title + author
  const bookGroups = new Map<string, typeof allBooks>()
  
  for (const book of allBooks) {
    const key = normalize(book.title) + '|||' + normalize(book.author || '')
    const existing = bookGroups.get(key) || []
    existing.push(book)
    bookGroups.set(key, existing)
  }
  
  // Find duplicates
  const duplicates = Array.from(bookGroups.values()).filter(group => group.length > 1)
  
  console.log(`🔍 Trouvé ${duplicates.length} groupes de livres en double\n`)
  
  if (duplicates.length === 0) {
    console.log('✅ Aucun doublon trouvé!')
    await prisma.$disconnect()
    return
  }
  
  let merged = 0
  let userBooksMerged = 0
  
  for (const group of duplicates) {
    // Sort by: 1) has cover, 2) has description, 3) oldest
    group.sort((a, b) => {
      if (a.coverUrl && !b.coverUrl) return -1
      if (!a.coverUrl && b.coverUrl) return 1
      if (a.description && !b.description) return -1
      if (!a.description && b.description) return 1
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    
    const keeper = group[0]
    const toDelete = group.slice(1)
    
    console.log(`\n📖 "${keeper.title}" par ${keeper.author}`)
    console.log(`   Garder: ${keeper.id} (${keeper.userBooks.length} UserBooks)`)
    
    for (const duplicate of toDelete) {
      console.log(`   Supprimer: ${duplicate.id} (${duplicate.userBooks.length} UserBooks)`)
      
      // Reload keeper's UserBooks to get latest state
      const keeperWithUserBooks = await prisma.book.findUnique({
        where: { id: keeper.id },
        include: { userBooks: true }
      })

      if (!keeperWithUserBooks) continue

      // Merge UserBooks
      for (const userBook of duplicate.userBooks) {
        // Check if keeper already has a UserBook for this user
        const existingUserBook = keeperWithUserBooks.userBooks.find(ub => ub.userId === userBook.userId)

        if (existingUserBook) {
          // Merge data: keep best of both
          const mergedData = {
            status: existingUserBook.status === 'read' ? 'read' : userBook.status,
            rating: existingUserBook.rating || userBook.rating,
            dateRead: existingUserBook.dateRead || userBook.dateRead,
            review: existingUserBook.review || userBook.review,
            notes: existingUserBook.notes || userBook.notes,
            favoriteQuotes: existingUserBook.favoriteQuotes || userBook.favoriteQuotes,
          }

          await prisma.userBook.update({
            where: { id: existingUserBook.id },
            data: mergedData
          })

          // Delete duplicate UserBook
          await prisma.userBook.delete({
            where: { id: userBook.id }
          })

          userBooksMerged++
          console.log(`      ✅ UserBook fusionné et doublon supprimé`)
        } else {
          // Move UserBook to keeper
          await prisma.userBook.update({
            where: { id: userBook.id },
            data: { bookId: keeper.id }
          })

          userBooksMerged++
          console.log(`      ✅ UserBook déplacé vers le livre principal`)
        }
      }
      
      // Delete duplicate book
      await prisma.book.delete({
        where: { id: duplicate.id }
      })
      
      merged++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`✅ Livres fusionnés/supprimés: ${merged}`)
  console.log(`✅ UserBooks fusionnés/déplacés: ${userBooksMerged}`)
  console.log('='.repeat(60))
  
  // Verify final state
  const finalBooks = await prisma.book.count()
  const finalUserBooks = await prisma.userBook.count()
  
  console.log(`\n📚 État final:`)
  console.log(`   Total livres: ${finalBooks}`)
  console.log(`   Total UserBooks: ${finalUserBooks}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)

