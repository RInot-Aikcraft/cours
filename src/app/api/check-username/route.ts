import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username requis' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Ce nom d\'utilisateur est déjà pris' : 'Ce nom d\'utilisateur est disponible'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}