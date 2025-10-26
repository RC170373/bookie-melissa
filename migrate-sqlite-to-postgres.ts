import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'

// Client PostgreSQL (Supabase - utilise DATABASE_URL du .env)
const postgres = new PrismaClient()

// Client SQLite direct
const sqliteDb = new Database('./prisma/prisma/dev.db', { readonly: true })

async function migrate() {
  console.log('🚀 Début de la migration SQLite → PostgreSQL...\n')

  try {
    // 1. Migrer les livres
    console.log('📚 Migration des livres...')
    const booksData = sqliteDb.prepare('SELECT * FROM Book').all()
    console.log(`   Trouvé ${booksData.length} livres`)

    let migratedBooks = 0
    for (const book of booksData) {
      try {
        await postgres.book.create({
          data: {
            id: book.id,
            title: book.title,
            author: book.author,
            authorId: book.authorId,
            isbn: book.isbn,
            publisher: book.publisher,
            publicationYear: book.publicationYear,
            pages: book.pages,
            language: book.language,
            genres: book.genres,
            description: book.description,
            coverUrl: book.coverUrl,
            sagaId: book.sagaId,
            sagaOrder: book.sagaOrder,
            createdAt: new Date(book.createdAt),
            updatedAt: new Date(book.updatedAt)
          }
        })
        migratedBooks++
        if (migratedBooks % 100 === 0) {
          console.log(`   ⏳ ${migratedBooks}/${booksData.length} livres migrés...`)
        }
      } catch (error: any) {
        if (!error.message.includes('Unique constraint')) {
          console.error(`   ⚠️  Erreur pour le livre "${book.title}":`, error.message)
        }
      }
    }
    console.log(`   ✅ ${migratedBooks} livres migrés\n`)

    console.log('✅ Migration terminée avec succès!')
    console.log('\n📊 Résumé:')
    console.log(`   - ${migratedBooks} livres`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    sqliteDb.close()
    await postgres.$disconnect()
  }
}

migrate()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

