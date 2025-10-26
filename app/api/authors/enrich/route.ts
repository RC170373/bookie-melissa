import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Enrich author information using Wikipedia/Wikidata API
 * This endpoint fetches additional information about an author
 */
export async function POST(request: NextRequest) {
  try {
    const { authorName } = await request.json()

    if (!authorName) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      )
    }

    // Check if author already exists in database
    let author = await prisma.author.findUnique({
      where: { name: authorName },
    })

    // If author exists and has complete info, return it
    if (author && author.bio && author.photoUrl && author.nationality) {
      return NextResponse.json({ author }, { status: 200 })
    }

    // Fetch from Wikipedia API
    const wikipediaData = await fetchWikipediaData(authorName)

    if (!wikipediaData) {
      return NextResponse.json(
        { error: 'Author information not found' },
        { status: 404 }
      )
    }

    // Create or update author in database
    if (author) {
      author = await prisma.author.update({
        where: { id: author.id },
        data: {
          bio: wikipediaData.bio || author.bio,
          photoUrl: wikipediaData.photoUrl || author.photoUrl,
          birthDate: wikipediaData.birthDate || author.birthDate,
          nationality: wikipediaData.nationality || author.nationality,
          website: wikipediaData.website || author.website,
        },
      })
    } else {
      author = await prisma.author.create({
        data: {
          name: authorName,
          bio: wikipediaData.bio,
          photoUrl: wikipediaData.photoUrl,
          birthDate: wikipediaData.birthDate,
          nationality: wikipediaData.nationality,
          website: wikipediaData.website,
        },
      })
    }

    return NextResponse.json({ author }, { status: 200 })
  } catch (error) {
    console.error('Error enriching author:', error)
    return NextResponse.json(
      { error: 'Failed to enrich author information' },
      { status: 500 }
    )
  }
}

async function fetchWikipediaData(authorName: string) {
  try {
    // Step 1: Search for the author on Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      authorName
    )}&format=json&origin=*`

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchData.query?.search?.length) {
      return null
    }

    const pageTitle = searchData.query.search[0].title

    // Step 2: Get page content and extract information
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      pageTitle
    )}&prop=extracts|pageimages|info&exintro=true&explaintext=true&piprop=original&inprop=url&format=json&origin=*`

    const pageResponse = await fetch(pageUrl)
    const pageData = await pageResponse.json()

    const pages = pageData.query?.pages
    if (!pages) {
      return null
    }

    const page = Object.values(pages)[0] as any

    // Extract bio (first paragraph)
    let bio = page.extract || null
    if (bio && bio.length > 500) {
      bio = bio.substring(0, 500) + '...'
    }

    // Extract photo
    const photoUrl = page.original?.source || null

    // Step 3: Try to get structured data from Wikidata
    let birthDate = null
    let nationality = null
    let website = null

    try {
      // Get Wikidata ID from Wikipedia page
      const wikidataUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        pageTitle
      )}&prop=pageprops&format=json&origin=*`

      const wikidataResponse = await fetch(wikidataUrl)
      const wikidataData = await wikidataResponse.json()

      const wikidataPages = wikidataData.query?.pages
      if (wikidataPages) {
        const wikidataPage = Object.values(wikidataPages)[0] as any
        const wikidataId = wikidataPage.pageprops?.wikibase_item

        if (wikidataId) {
          // Fetch Wikidata entity
          const entityUrl = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`
          const entityResponse = await fetch(entityUrl)
          const entityData = await entityResponse.json()

          const entity = entityData.entities?.[wikidataId]

          if (entity) {
            // Extract birth date (P569)
            const birthClaim = entity.claims?.P569?.[0]
            if (birthClaim) {
              const birthValue = birthClaim.mainsnak?.datavalue?.value?.time
              if (birthValue) {
                // Convert from Wikidata format (+1947-09-21T00:00:00Z) to ISO
                const dateMatch = birthValue.match(/([+-]\d{4})-(\d{2})-(\d{2})/)
                if (dateMatch) {
                  birthDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`)
                }
              }
            }

            // Extract nationality (P27)
            const nationalityClaim = entity.claims?.P27?.[0]
            if (nationalityClaim) {
              const nationalityId = nationalityClaim.mainsnak?.datavalue?.value?.id
              if (nationalityId) {
                // Fetch country name
                const countryUrl = `https://www.wikidata.org/wiki/Special:EntityData/${nationalityId}.json`
                const countryResponse = await fetch(countryUrl)
                const countryData = await countryResponse.json()
                nationality = countryData.entities?.[nationalityId]?.labels?.en?.value || null
              }
            }

            // Extract official website (P856)
            const websiteClaim = entity.claims?.P856?.[0]
            if (websiteClaim) {
              website = websiteClaim.mainsnak?.datavalue?.value || null
            }
          }
        }
      }
    } catch (wikidataError) {
      console.error('Error fetching Wikidata:', wikidataError)
      // Continue without Wikidata info
    }

    return {
      bio,
      photoUrl,
      birthDate,
      nationality,
      website,
    }
  } catch (error) {
    console.error('Error fetching Wikipedia data:', error)
    return null
  }
}

