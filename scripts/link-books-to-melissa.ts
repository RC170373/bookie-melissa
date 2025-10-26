// Import UserBooks with ALL data (ratings, reviews, dates, notes)
import { PrismaClient } from '../node_modules/@prisma/client/index.js'
import fs from 'fs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.sssczjmyfdptqqtlghwj:Melissa2025+@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
})

async function importUserBooks() {
  console.log('🚀 Importing UserBooks with ALL data...\n')

  try {
    // 1. Find Melissa's user
    const melissa = await prisma.user.findUnique({
      where: { email: 'melissadelageclairin@gmail.com' }
    })

    if (!melissa) {
      console.error('❌ Melissa user not found!')
      return
    }

    console.log(`✅ Found Melissa: ${melissa.username} (${melissa.id})\n`)

    // 2. Delete existing UserBooks for Melissa
    console.log('🗑️  Deleting existing UserBooks...')
    const deleted = await prisma.userBook.deleteMany({
      where: { userId: melissa.id }
    })
    console.log(`✅ Deleted ${deleted.count} existing UserBooks\n`)

    // 3. Read exported data
    const data = JSON.parse(fs.readFileSync('./scripts/sqlite-export.json', 'utf-8'))
    console.log(`📚 Found ${data.userBooks.length} UserBooks to import\n`)

    // 4. Import UserBooks with ALL data
    console.log('📖 Importing UserBooks...')
    let importedCount = 0

    for (const userBook of data.userBooks) {
      try {
        // Convert timestamps to Date objects
        const dateRead = userBook.dateRead ? new Date(userBook.dateRead) : null
        const plannedReadDate = userBook.plannedReadDate ? new Date(userBook.plannedReadDate) : null
        const loanDate = userBook.loanDate ? new Date(userBook.loanDate) : null
        const createdAt = userBook.createdAt ? new Date(userBook.createdAt) : new Date()
        const updatedAt = userBook.updatedAt ? new Date(userBook.updatedAt) : new Date()

        await prisma.userBook.create({
          data: {
            userId: melissa.id,
            bookId: userBook.bookId,
            status: userBook.status || 'read',
            rating: userBook.rating,
            ratingAnswers: userBook.ratingAnswers,
            ratingComments: userBook.ratingComments,
            aiRating: userBook.aiRating,
            manualOverride: userBook.manualOverride === 1,
            notes: userBook.notes,
            review: userBook.review,
            favoriteQuotes: userBook.favoriteQuotes,
            dateRead: dateRead && !isNaN(dateRead.getTime()) ? dateRead : null,
            plannedReadDate: plannedReadDate && !isNaN(plannedReadDate.getTime()) ? plannedReadDate : null,
            currentPage: userBook.currentPage,
            totalReadingTime: userBook.totalReadingTime,
            tags: userBook.tags,
            shelf: userBook.shelf,
            location: userBook.location,
            loanedTo: userBook.loanedTo,
            loanDate: loanDate && !isNaN(loanDate.getTime()) ? loanDate : null,
            isPrivate: userBook.isPrivate === 1,
            createdAt: !isNaN(createdAt.getTime()) ? createdAt : new Date(),
            updatedAt: !isNaN(updatedAt.getTime()) ? updatedAt : new Date()
          }
        })

        importedCount++
        if (importedCount % 100 === 0) {
          console.log(`  Imported ${importedCount}/${data.userBooks.length} UserBooks...`)
        }
      } catch (error: any) {
        console.error(`  ❌ Error importing UserBook for book ${userBook.bookId}:`, error.message)
      }
    }

    console.log(`\n✅ Imported ${importedCount} UserBooks with ALL data!`)
    console.log(`\n🎉 Melissa now has ${importedCount} books with ratings, reviews, dates, and notes!`)

  } catch (error) {
    console.error('❌ Failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importUserBooks()

