// Import books from JSON to Supabase PostgreSQL
import { PrismaClient } from '../node_modules/@prisma/client/index.js'
import fs from 'fs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.sssczjmyfdptqqtlghwj:Melissa2025+@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
})

async function importData() {
  console.log('🚀 Importing data to Supabase PostgreSQL...\n')

  try {
    // Read exported data
    const data = JSON.parse(fs.readFileSync('./scripts/sqlite-export.json', 'utf-8'))
    
    console.log(`📚 Found ${data.books.length} books to import`)
    console.log(`👤 Found ${data.users.length} users to import`)
    console.log(`📖 Found ${data.userBooks.length} user books to import\n`)

    // 1. Import Users first
    console.log('👤 Importing users...')
    for (const user of data.users) {
      try {
        const createdAt = user.created_at ? new Date(user.created_at) : new Date()
        const updatedAt = user.updated_at ? new Date(user.updated_at) : new Date()

        await prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            email: user.email,
            username: user.username,
            password: user.password,
            fullName: user.fullName || null,
            avatar: user.avatar || null,
            bio: user.bio || null,
            location: user.location || null,
            website: user.website || null,
            created_at: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            updated_at: isNaN(updatedAt.getTime()) ? new Date() : updatedAt
          }
        })
        console.log(`  ✅ User: ${user.username}`)
      } catch (error: any) {
        console.error(`  ❌ Error importing user ${user.username}:`, error.message)
      }
    }

    // 2. Import Books
    console.log('\n📚 Importing books...')
    let bookCount = 0
    for (const book of data.books) {
      try {
        const createdAt = book.created_at ? new Date(book.created_at) : new Date()
        const updatedAt = book.updated_at ? new Date(book.updated_at) : new Date()

        await prisma.book.upsert({
          where: { id: book.id },
          update: {},
          create: {
            id: book.id,
            title: book.title,
            author: book.author,
            isbn: book.isbn || null,
            publisher: book.publisher || null,
            publication_year: book.publication_year || null,
            pages: book.pages || null,
            language: book.language || 'fr',
            description: book.description || null,
            cover_url: book.cover_url || null,
            genre: book.genre || null,
            created_at: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            updated_at: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
            created_by: book.created_by || null
          }
        })
        bookCount++
        if (bookCount % 100 === 0) {
          console.log(`  Imported ${bookCount}/${data.books.length} books...`)
        }
      } catch (error: any) {
        console.error(`  ❌ Error importing book "${book.title}":`, error.message)
      }
    }
    console.log(`✅ Imported ${bookCount} books`)

    // 3. Import UserBooks
    console.log('\n📖 Importing user books...')
    let userBookCount = 0
    for (const userBook of data.userBooks) {
      try {
        const createdAt = userBook.created_at ? new Date(userBook.created_at) : new Date()
        const updatedAt = userBook.updated_at ? new Date(userBook.updated_at) : new Date()
        const startedAt = userBook.started_at ? new Date(userBook.started_at) : null
        const finishedAt = userBook.finished_at ? new Date(userBook.finished_at) : null

        await prisma.userBook.upsert({
          where: { id: userBook.id },
          update: {},
          create: {
            id: userBook.id,
            user_id: userBook.user_id,
            book_id: userBook.book_id,
            status: userBook.status,
            rating: userBook.rating || null,
            started_at: startedAt && !isNaN(startedAt.getTime()) ? startedAt : null,
            finished_at: finishedAt && !isNaN(finishedAt.getTime()) ? finishedAt : null,
            created_at: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            updated_at: isNaN(updatedAt.getTime()) ? new Date() : updatedAt
          }
        })
        userBookCount++
        if (userBookCount % 100 === 0) {
          console.log(`  Imported ${userBookCount}/${data.userBooks.length} user books...`)
        }
      } catch (error: any) {
        console.error(`  ❌ Error importing user book:`, error.message)
      }
    }
    console.log(`✅ Imported ${userBookCount} user books`)

    console.log('\n🎉 Import completed successfully!')

  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()

