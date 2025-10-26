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
  console.log('🔧 Correction des livres avec critiques...\n')

  // Find all UserBooks with reviews but without status "read"
  const userBooksWithReviews = await prisma.userBook.findMany({
    where: {
      review: {
        not: null,
        not: ''
      },
      status: {
        not: 'read'
      }
    },
    include: {
      book: true
    }
  })
  
  console.log(`📚 Trouvé ${userBooksWithReviews.length} livres avec critiques mais sans status "read"\n`)

  if (userBooksWithReviews.length === 0) {
    console.log('✅ Aucune correction nécessaire!')
    await prisma.$disconnect()
    return
  }

  let updated = 0

  for (const userBook of userBooksWithReviews) {
    console.log(`   📖 "${userBook.book.title}" - Status: ${userBook.status || 'NULL'} → read`)

    await prisma.userBook.update({
      where: { id: userBook.id },
      data: {
        status: 'read'
      }
    })

    updated++
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ:')
  console.log('='.repeat(60))
  console.log(`✅ Livres mis à jour: ${updated}`)
  console.log('='.repeat(60))
  
  // Verify final state
  const stats = await prisma.userBook.count({
    where: {
      status: 'read'
    }
  })

  const withReviews = await prisma.userBook.count({
    where: {
      review: { not: null, not: '' }
    }
  })

  console.log(`\n📚 État final:`)
  console.log(`   Total avec status "read" (lu): ${stats}`)
  console.log(`   Total avec critiques: ${withReviews}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)

