import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { mail: email },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Cet email est déjà utilisé' : 'Cet email est disponible'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}