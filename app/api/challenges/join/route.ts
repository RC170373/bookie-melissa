import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get('auth-token')
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(tokenCookie.value)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
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
          userId: payload.userId,
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
        userId: payload.userId,
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

