import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { challengeId } = await request.json()

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      )
    }

    // Check if already joined
    const existing = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId: token.userId,
          challengeId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already joined this challenge' },
        { status: 400 }
      )
    }

    const userChallenge = await prisma.userChallenge.create({
      data: {
        userId: token.userId,
        challengeId,
        progress: 0,
        completed: false,
      },
    })

    return NextResponse.json({ userChallenge }, { status: 201 })
  } catch (error) {
    console.error('Error joining challenge:', error)
    return NextResponse.json(
      { error: 'Failed to join challenge' },
      { status: 500 }
    )
  }
}

