#!/usr/bin/env node
import { PrismaClient } from '../node_modules/@prisma/client/default.js'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../prisma/prisma/dev.db'
    }
  }
})

async function main() {
  console.log('🔧 Fusion des UserBooks en double et restauration des données...\n')
  
  // Get the user
  const user = await prisma.user.findFirst()
  if (!user) {
    console.error('❌ Aucun utilisateur trouvé')
    return
  }
  
  console.log(`👤 Utilisateur: ${user.email}\n`)
  
  // Find all books with multiple UserBooks for the same user
  const allUserBooks = await prisma.userBook.findMany({
    where: { userId: user.id },
    include: { book: true },
    orderBy: { createdAt: 'asc' } // Oldest first (original data)
  })
  
  console.log(`📚 Total UserBooks: ${allUserBooks.length}`)
  
  // Group by bookId
  const bookGroups = new Map<string, typeof allUserBooks>()
  for (const ub of allUserBooks) {
    const existing = bookGroups.get(ub.bookId) || []
    existing.push(ub)
    bookGroups.set(ub.bookId, existing)
  }
  
  let merged = 0
  let deleted = 0
  
  for (const [bookId, userBooks] of bookGroups.entries()) {
    if (userBooks.length <= 1) continue
    
    console.log(`\n📖 "${userBooks[0].book.title}" - ${userBooks.length} entrées`)
    
    // The FIRST one (oldest) has the original data (status, rating, dateRead, etc.)
    const original = userBooks[0]
    
    // Find the one(s) with review (newer ones created by import script)
    const withReview = userBooks.filter(ub => ub.review && ub.review.length > 0)
    
    if (withReview.length === 0) {
      // No review, just delete duplicates
      for (let i = 1; i < userBooks.length; i++) {
        await prisma.userBook.delete({ where: { id: userBooks[i].id } })
        deleted++
        console.log(`   ❌ Supprimé doublon sans critique`)
      }
      continue
    }
    
    // Merge: Keep original, add review from newer entry
    const review = withReview[0].review
    
    await prisma.userBook.update({
      where: { id: original.id },
      data: {
        review: review,
        // Keep all original data: status, rating, dateRead, dateAdded, notes, etc.
      }
    })
    
    console.log(`   ✅ Critique fusionnée dans l'entrée originale`)
    console.log(`   📊 Données conservées: status=${original.status}, rating=${original.rating}, dateRead=${original.dateRead ? 'oui' : 'non'}`)
    
    // Delete the duplicate(s)
    for (let i = 1; i < userBooks.length; i++) {
      await prisma.userBook.delete({ where: { id: userBooks[i].id } })
      deleted++
      console.log(`   🗑️  Supprimé doublon`)
    }
    
    merged++
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`✅ Livres fusionnés: ${merged}`)
  console.log(`🗑️  Doublons supprimés: ${deleted}`)
  console.log('='.repeat(60))
  
  // Verify final state
  const finalCount = await prisma.userBook.count({ where: { userId: user.id } })
  const withReviewCount = await prisma.userBook.count({
    where: {
      userId: user.id,
      review: { not: null }
    }
  })
  
  console.log(`\n📚 Total final UserBooks: ${finalCount}`)
  console.log(`📝 UserBooks avec critiques: ${withReviewCount}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)

