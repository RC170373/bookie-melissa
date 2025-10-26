import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get('auth-token')
    const payload = tokenCookie ? verifyToken(tokenCookie.value) : null

    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
      },
      include: payload ? {
        userChallenges: {
          where: {
            userId: payload.userId,
          },
          select: {
            progress: true,
            completed: true,
          },
        },
      } : undefined,
      orderBy: {
        endDate: 'desc',
      },
    })

    // Transform to include userChallenge as a single object
    const transformedChallenges = challenges.map((challenge: any) => ({
      ...challenge,
      userChallenge: challenge.userChallenges?.[0] || null,
      userChallenges: undefined,
    }))

    return NextResponse.json({ challenges: transformedChallenges })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}

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

    const { name, description, type, target, startDate, endDate } = await request.json()

    if (!name || !type || !target || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const challenge = await prisma.challenge.create({
      data: {
        name,
        description,
        type,
        target: parseInt(target),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
    })

    return NextResponse.json({ challenge }, { status: 201 })
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
}

