// Export books from SQLite to JSON
import Database from 'better-sqlite3'
import fs from 'fs'

const db = new Database('./prisma/prisma/dev.db', { readonly: true })

console.log('📚 Exporting books from SQLite...\n')

// Get count first
const bookCount = db.prepare('SELECT COUNT(*) as count FROM Book').get() as { count: number }
console.log(`Found ${bookCount.count} books`)

const userCount = db.prepare('SELECT COUNT(*) as count FROM User').get() as { count: number }
console.log(`Found ${userCount.count} users`)

// Get all books
const books = db.prepare('SELECT * FROM Book').all()

// Get all users
const users = db.prepare('SELECT * FROM User').all()

// Get all user books (if table exists)
let userBooks: any[] = []
try {
  userBooks = db.prepare('SELECT * FROM UserBook').all()
  console.log(`Found ${userBooks.length} user books`)
} catch (e) {
  console.log('No UserBook table found')
}

// Save to JSON
const data = {
  books,
  users,
  userBooks
}

fs.writeFileSync('./scripts/sqlite-export.json', JSON.stringify(data, null, 2))

console.log('\n✅ Data exported to scripts/sqlite-export.json')

db.close()

