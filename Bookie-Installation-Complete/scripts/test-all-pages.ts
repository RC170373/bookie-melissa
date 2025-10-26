#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000'

// All pages to test
const PAGES = [
  // Main pages
  '/',
  '/bibliomania',
  '/calendar',
  '/sagas',
  '/authors',
  '/stats',
  '/statistics',
  '/challenges',
  '/achievements',
  '/discover',
  '/import-export',
  '/quick-add',
  '/search',
  '/advanced-search',
  '/reading-journal',
  '/writing',
  '/books',
  '/profile',
  '/book-club',

  // Auth pages
  '/auth/login',
  '/auth/register',

  // Lists pages
  '/lists',

  // API routes (public)
  '/api/books',
  '/api/authors',
  '/api/search?q=test',
  '/api/new-releases',
  '/api/challenges',
  '/api/lists',
]

interface TestResult {
  url: string
  status: number
  ok: boolean
  error?: string
  time: number
}

async function testPage(path: string): Promise<TestResult> {
  const url = `${BASE_URL}${path}`
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PageTester/1.0)',
      },
    })
    
    const time = Date.now() - startTime
    
    return {
      url: path,
      status: response.status,
      ok: response.ok,
      time,
    }
  } catch (error: any) {
    const time = Date.now() - startTime
    return {
      url: path,
      status: 0,
      ok: false,
      error: error.message,
      time,
    }
  }
}

async function main() {
  console.log('🧪 Test de toutes les pages...\n')
  console.log(`📍 Base URL: ${BASE_URL}\n`)
  console.log(`📊 ${PAGES.length} pages à tester\n`)
  console.log('='.repeat(80))
  
  const results: TestResult[] = []
  let passed = 0
  let failed = 0
  
  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i]
    const result = await testPage(page)
    results.push(result)
    
    const statusIcon = result.ok ? '✅' : '❌'
    const statusColor = result.ok ? '\x1b[32m' : '\x1b[31m'
    const resetColor = '\x1b[0m'
    
    console.log(
      `${statusIcon} [${i + 1}/${PAGES.length}] ${statusColor}${result.status}${resetColor} ${result.url} (${result.time}ms)`
    )
    
    if (result.error) {
      console.log(`   ⚠️  Erreur: ${result.error}`)
    }
    
    if (result.ok) {
      passed++
    } else {
      failed++
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n📊 RÉSUMÉ:\n')
  console.log(`✅ Pages OK (200): ${passed}`)
  console.log(`❌ Pages en erreur: ${failed}`)
  console.log(`📈 Taux de réussite: ${((passed / PAGES.length) * 100).toFixed(1)}%`)
  
  // Show failed pages
  if (failed > 0) {
    console.log('\n❌ PAGES EN ERREUR:\n')
    results
      .filter(r => !r.ok)
      .forEach(r => {
        console.log(`   ${r.status} ${r.url}`)
        if (r.error) {
          console.log(`      Erreur: ${r.error}`)
        }
      })
  }
  
  // Show slowest pages
  const slowest = [...results]
    .sort((a, b) => b.time - a.time)
    .slice(0, 5)
  
  console.log('\n⏱️  PAGES LES PLUS LENTES:\n')
  slowest.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.url} - ${r.time}ms`)
  })
  
  // Average response time
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
  console.log(`\n⏱️  Temps de réponse moyen: ${avgTime.toFixed(0)}ms`)
  
  console.log('\n' + '='.repeat(80))
  
  // Exit with error code if any test failed
  if (failed > 0) {
    process.exit(1)
  }
}

main().catch(console.error)

