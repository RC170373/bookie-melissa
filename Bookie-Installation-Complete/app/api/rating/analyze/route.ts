import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

// Questions pour la notation
export const RATING_QUESTIONS = [
  {
    id: 'plot',
    question: 'Comment avez-vous trouvé l\'intrigue ?',
    weight: 0.25,
    options: [
      { value: 5, label: 'Exceptionnelle' },
      { value: 4, label: 'Très bonne' },
      { value: 3, label: 'Bonne' },
      { value: 2, label: 'Moyenne' },
      { value: 1, label: 'Décevante' },
    ],
  },
  {
    id: 'characters',
    question: 'Que pensez-vous des personnages ?',
    weight: 0.20,
    options: [
      { value: 5, label: 'Mémorables et profonds' },
      { value: 4, label: 'Bien développés' },
      { value: 3, label: 'Corrects' },
      { value: 2, label: 'Peu développés' },
      { value: 1, label: 'Plats' },
    ],
  },
  {
    id: 'writing',
    question: 'Comment évaluez-vous le style d\'écriture ?',
    weight: 0.20,
    options: [
      { value: 5, label: 'Magnifique' },
      { value: 4, label: 'Très bon' },
      { value: 3, label: 'Bon' },
      { value: 2, label: 'Moyen' },
      { value: 1, label: 'Faible' },
    ],
  },
  {
    id: 'pacing',
    question: 'Le rythme du livre était-il adapté ?',
    weight: 0.15,
    options: [
      { value: 5, label: 'Parfait' },
      { value: 4, label: 'Très bon' },
      { value: 3, label: 'Correct' },
      { value: 2, label: 'Trop lent/rapide' },
      { value: 1, label: 'Problématique' },
    ],
  },
  {
    id: 'emotional',
    question: 'Impact émotionnel du livre ?',
    weight: 0.20,
    options: [
      { value: 5, label: 'Très fort' },
      { value: 4, label: 'Fort' },
      { value: 3, label: 'Modéré' },
      { value: 2, label: 'Faible' },
      { value: 1, label: 'Aucun' },
    ],
  },
]

// Analyse de sentiment avec Hugging Face API
async function analyzeSentiment(text: string): Promise<number> {
  try {
    // Si pas de texte, retourner neutre
    if (!text || text.trim().length < 10) {
      return 0.5
    }

    // Utiliser l'API Hugging Face pour l'analyse de sentiment
    const response = await fetch(
      'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`,
        },
        body: JSON.stringify({ inputs: text }),
      }
    )

    if (!response.ok) {
      console.error('Hugging Face API error:', await response.text())
      return 0.5 // Neutre par défaut
    }

    const result = await response.json()

    // Le modèle retourne des scores pour 1-5 étoiles
    // On convertit en score 0-1
    if (Array.isArray(result) && result[0]) {
      const scores = result[0]
      
      // Calculer le score moyen pondéré
      let totalScore = 0
      let totalWeight = 0

      for (const item of scores) {
        const stars = parseInt(item.label.split(' ')[0]) // "1 star" -> 1
        const score = item.score
        totalScore += stars * score
        totalWeight += score
      }

      const averageStars = totalWeight > 0 ? totalScore / totalWeight : 3
      
      // Convertir 1-5 étoiles en 0-1
      return (averageStars - 1) / 4
    }

    return 0.5
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return 0.5 // Neutre par défaut en cas d'erreur
  }
}

// POST - Analyser et générer une note
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { answers, comments } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      )
    }

    // 1. Calculer la note basée sur les réponses aux questions
    let questionScore = 0
    let totalWeight = 0

    for (const question of RATING_QUESTIONS) {
      const answer = answers[question.id]
      if (answer !== undefined && answer !== null) {
        questionScore += answer * question.weight
        totalWeight += question.weight
      }
    }

    // Normaliser sur 20 (les réponses sont sur 5)
    const baseRating = totalWeight > 0 ? (questionScore / totalWeight) * 4 : 10

    // 2. Analyser le sentiment des commentaires
    let sentimentScore = 0.5 // Neutre par défaut
    if (comments && comments.trim().length > 0) {
      sentimentScore = await analyzeSentiment(comments)
    }

    // 3. Combiner les scores
    // 70% basé sur les questions, 30% sur le sentiment
    const combinedScore = baseRating * 0.7 + sentimentScore * 20 * 0.3

    // Arrondir à une décimale
    const finalRating = Math.round(combinedScore * 10) / 10

    // S'assurer que la note est entre 0 et 20
    const clampedRating = Math.max(0, Math.min(20, finalRating))

    return NextResponse.json(
      {
        rating: clampedRating,
        breakdown: {
          questionScore: Math.round(baseRating * 10) / 10,
          sentimentScore: Math.round(sentimentScore * 20 * 10) / 10,
          sentimentRaw: sentimentScore,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error analyzing rating:', error)
    return NextResponse.json(
      { error: 'Failed to analyze rating' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les questions de notation
export async function GET() {
  return NextResponse.json({ questions: RATING_QUESTIONS }, { status: 200 })
}

