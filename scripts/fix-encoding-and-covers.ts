/**
 * Script de correction rapide sans CSV
 * - Corrige tous les caractères mal encodés (ç, é, è, etc.)
 * - Récupère toutes les couvertures manquantes
 */

import { PrismaClient } from '../node_modules/@prisma/client/default.js'

const prisma = new PrismaClient()

// Fonction pour corriger l'encodage Windows-1252 -> UTF-8
function fixEncoding(text: string): string {
  if (!text) return text
  
  return text
    // Lowercase accented characters
    .replace(/Ã©/g, 'é')   // é (e acute)
    .replace(/Ã¨/g, 'è')   // è (e grave)
    .replace(/Ãª/g, 'ê')   // ê (e circumflex)
    .replace(/Ã«/g, 'ë')   // ë (e diaeresis)
    .replace(/Ã /g, 'à')   // à (a grave)
    .replace(/Ã¢/g, 'â')   // â (a circumflex)
    .replace(/Ã´/g, 'ô')   // ô (o circumflex)
    .replace(/Ã¹/g, 'ù')   // ù (u grave)
    .replace(/Ã»/g, 'û')   // û (u circumflex)
    .replace(/Ã®/g, 'î')   // î (i circumflex)
    .replace(/Ã¯/g, 'ï')   // ï (i diaeresis)
    .replace(/Ã§/g, 'ç')   // ç (c cedilla) - LE PLUS IMPORTANT!
    .replace(/Å\u0093/g, 'œ') // œ (oe ligature)
    // Uppercase accented characters
    .replace(/Ã\u0089/g, 'É')
    .replace(/Ã\u0088/g, 'È')
    .replace(/Ã\u008A/g, 'Ê')
    .replace(/Ã\u0080/g, 'À')
    .replace(/Ã\u0082/g, 'Â')
    .replace(/Ã\u0094/g, 'Ô')
    .replace(/Ã\u0099/g, 'Ù')
    .replace(/Ã\u009B/g, 'Û')
    .replace(/Ã\u008E/g, 'Î')
    .replace(/Ã\u0087/g, 'Ç')
    .replace(/Å\u0092/g, 'Œ')
    // Patterns spécifiques observés
    .replace(/Fran[eé]aise/g, 'Française')  // Fix "Franeaise" -> "Française"
    .replace(/fran[eé]ais/g, 'français')
    // Fallback
    .replace(/�/g, 'e')
}

// Fonction pour récupérer les métadonnées Google Books
async function fetchGoogleBooksMetadata(book: { isbn: string | null; title: string; author: string }) {
  try {
    const strategies = []

    if (book.isbn && book.isbn.length >= 10) {
      strategies.push(`isbn:${book.isbn}`)
    }

    strategies.push(`intitle:"${book.title}"+inauthor:"${book.author}"`)
    strategies.push(`intitle:${book.title}+inauthor:${book.author}`)

    const cleanTitle = book.title.split(',')[0].split(':')[0].trim()
    strategies.push(`intitle:"${cleanTitle}"`)

    for (const searchQuery of strategies) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5&langRestrict=fr`
        )

        if (!response.ok) continue

        const data = await response.json()
        if (!data.items || data.items.length === 0) continue

        for (const item of data.items) {
          const volumeInfo = item.volumeInfo

          const titleMatch = volumeInfo.title?.toLowerCase().includes(cleanTitle.toLowerCase())
          const authorMatch = volumeInfo.authors?.some((a: string) =>
            a.toLowerCase().includes(book.author.toLowerCase()) ||
            book.author.toLowerCase().includes(a.toLowerCase())
          )

          if (titleMatch || authorMatch || book.isbn) {
            return {
              coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                        volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://') || null,
              description: volumeInfo.description || null,
              pageCount: volumeInfo.pageCount || null,
              publishedDate: volumeInfo.publishedDate || null,
            }
          }
        }
      } catch (err) {
        continue
      }
    }

    return null
  } catch (error) {
    return null
  }
}

async function main() {
  console.log('🚀 Démarrage de la correction automatique...\n')

  // Récupérer tous les livres
  const allBooks = await prisma.book.findMany()
  console.log(`📚 ${allBooks.length} livres trouvés\n`)

  let fixedEncoding = 0
  let addedCovers = 0
  let errors = 0
  let processed = 0

  for (const book of allBooks) {
    try {
      processed++
      const updates: any = {}
      let hasChanges = false
      
      // Corriger l'encodage
      if (book.title && (book.title.includes('Ã') || book.title.includes('�') || book.title.includes('Fran'))) {
        const fixed = fixEncoding(book.title)
        if (fixed !== book.title) {
          updates.title = fixed
          hasChanges = true
          console.log(`✏️  Titre: "${book.title}" -> "${fixed}"`)
        }
      }
      
      if (book.author && (book.author.includes('Ã') || book.author.includes('�'))) {
        const fixed = fixEncoding(book.author)
        if (fixed !== book.author) {
          updates.author = fixed
          hasChanges = true
          console.log(`✏️  Auteur: "${book.author}" -> "${fixed}"`)
        }
      }
      
      if (book.publisher && (book.publisher.includes('Ã') || book.publisher.includes('�'))) {
        const fixed = fixEncoding(book.publisher)
        if (fixed !== book.publisher) {
          updates.publisher = fixed
          hasChanges = true
        }
      }
      
      if (book.language && (book.language.includes('Ã') || book.language.includes('�') || book.language.includes('Fran'))) {
        const fixed = fixEncoding(book.language)
        if (fixed !== book.language) {
          updates.language = fixed
          hasChanges = true
          console.log(`✏️  Langue: "${book.language}" -> "${fixed}"`)
        }
      }
      
      if (book.genres && (book.genres.includes('Ã') || book.genres.includes('�'))) {
        const fixed = fixEncoding(book.genres)
        if (fixed !== book.genres) {
          updates.genres = fixed
          hasChanges = true
        }
      }

      if (book.description && (book.description.includes('Ã') || book.description.includes('�'))) {
        const fixed = fixEncoding(book.description)
        if (fixed !== book.description) {
          updates.description = fixed
          hasChanges = true
        }
      }

      if (hasChanges) {
        fixedEncoding++
      }

      // Récupérer la couverture si manquante
      if (!book.coverUrl) {
        console.log(`🔍 [${processed}/${allBooks.length}] Recherche couverture: ${updates.title || book.title}`)
        const metadata = await fetchGoogleBooksMetadata({
          isbn: book.isbn,
          title: updates.title || book.title,
          author: updates.author || book.author
        })

        if (metadata?.coverUrl) {
          updates.coverUrl = metadata.coverUrl
          addedCovers++
          console.log(`   ✅ Couverture trouvée!`)
        } else {
          console.log(`   ❌ Couverture non trouvée`)
        }

        // Pause pour éviter rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Mettre à jour le livre si nécessaire
      if (Object.keys(updates).length > 0) {
        await prisma.book.update({
          where: { id: book.id },
          data: updates
        })
      }

    } catch (error) {
      console.error(`❌ Erreur pour ${book.title}:`, error)
      errors++
    }

    // Afficher la progression tous les 50 livres
    if (processed % 50 === 0) {
      console.log(`\n📊 Progression: ${processed}/${allBooks.length} livres traités`)
      console.log(`   - ${fixedEncoding} livres corrigés (encodage)`)
      console.log(`   - ${addedCovers} couvertures ajoutées\n`)
    }
  }

  console.log('\n✅ CORRECTION TERMINÉE!\n')
  console.log(`📊 Résultats finaux:`)
  console.log(`   - ${allBooks.length} livres traités`)
  console.log(`   - ${fixedEncoding} livres corrigés (encodage)`)
  console.log(`   - ${addedCovers} couvertures ajoutées`)
  console.log(`   - ${errors} erreurs`)

  await prisma.$disconnect()
}

main().catch(console.error)

