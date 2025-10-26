import { PrismaClient } from '../node_modules/@prisma/client/index.js'

// SQLite Prisma Client
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

// PostgreSQL Prisma Client (Supabase)
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.sssczjmyfdptqqtlghwj:Melissa2025+@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
})

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to Supabase...\n')

  try {
    // 1. Migrate Books
    console.log('📚 Migrating books...')
    const books = await sqlitePrisma.book.findMany()
    console.log(`Found ${books.length} books in SQLite`)

    let bookCount = 0
    for (const book of books) {
      try {
        await postgresPrisma.book.upsert({
          where: { id: book.id },
          update: {
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            publisher: book.publisher,
            publication_year: book.publication_year,
            pages: book.pages,
            language: book.language,
            description: book.description,
            cover_url: book.cover_url,
            genre: book.genre,
            updated_at: book.updated_at,
            created_by: book.created_by
          },
          create: {
            id: book.id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            publisher: book.publisher,
            publication_year: book.publication_year,
            pages: book.pages,
            language: book.language,
            description: book.description,
            cover_url: book.cover_url,
            genre: book.genre,
            created_at: book.created_at,
            updated_at: book.updated_at,
            created_by: book.created_by
          }
        })
        bookCount++
        if (bookCount % 100 === 0) {
          console.log(`  Migrated ${bookCount}/${books.length} books...`)
        }
      } catch (error) {
        console.error(`Error migrating book ${book.title}:`, error)
      }
    }
    console.log(`✅ Migrated ${bookCount} books\n`)

    // 2. Migrate Users
    console.log('👤 Migrating users...')
    const users = await sqlitePrisma.user.findMany()
    console.log(`Found ${users.length} users in SQLite`)

    let userCount = 0
    for (const user of users) {
      try {
        await postgresPrisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            username: user.username,
            password: user.password,
            fullName: user.fullName,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
            website: user.website,
            updated_at: user.updated_at
          },
          create: {
            id: user.id,
            email: user.email,
            username: user.username,
            password: user.password,
            fullName: user.fullName,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
            website: user.website,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        })
        userCount++
      } catch (error) {
        console.error(`Error migrating user ${user.username}:`, error)
      }
    }
    console.log(`✅ Migrated ${userCount} users\n`)

    // 3. Migrate UserBooks
    console.log('📖 Migrating user books...')
    const userBooks = await sqlitePrisma.userBook.findMany()
    console.log(`Found ${userBooks.length} user books in SQLite`)

    let userBookCount = 0
    for (const userBook of userBooks) {
      try {
        await postgresPrisma.userBook.upsert({
          where: { id: userBook.id },
          update: {
            user_id: userBook.user_id,
            book_id: userBook.book_id,
            status: userBook.status,
            rating: userBook.rating,
            started_at: userBook.started_at,
            finished_at: userBook.finished_at,
            updated_at: userBook.updated_at
          },
          create: {
            id: userBook.id,
            user_id: userBook.user_id,
            book_id: userBook.book_id,
            status: userBook.status,
            rating: userBook.rating,
            started_at: userBook.started_at,
            finished_at: userBook.finished_at,
            created_at: userBook.created_at,
            updated_at: userBook.updated_at
          }
        })
        userBookCount++
      } catch (error) {
        console.error(`Error migrating user book:`, error)
      }
    }
    console.log(`✅ Migrated ${userBookCount} user books\n`)

    console.log('🎉 Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await sqlitePrisma.$disconnect()
    await postgresPrisma.$disconnect()
  }
}

migrateData()

