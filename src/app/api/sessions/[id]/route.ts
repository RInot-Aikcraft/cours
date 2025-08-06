import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant ou invalide' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET)

    const session = await prisma.session.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Erreur détaillée:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant ou invalide' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET)

    const { nom, dateDebut, dateFin, etat } = await request.json()

    const session = await prisma.session.update({
      where: { id: parseInt(params.id) },
      data: {
        nom,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        etat,
      },
    })

    return NextResponse.json(
      { message: 'Session modifiée avec succès', session },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur détaillée:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant ou invalide' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, JWT_SECRET)

    await prisma.session.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ message: 'Session supprimée avec succès' })
  } catch (error) {
    console.error('Erreur détaillée:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' },
      { status: 500 }
    )
  }
}