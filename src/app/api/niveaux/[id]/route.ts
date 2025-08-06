import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET : Récupérer un niveau par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const niveau = await prisma.niveau.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        session: true,
      },
    })

    if (!niveau) {
      return NextResponse.json(
        { error: 'Niveau non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ niveau })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du niveau' },
      { status: 500 }
    )
  }
}

// PUT : Modifier un niveau
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nom, sessionId } = body

    if (!nom || !sessionId) {
      return NextResponse.json(
        { error: 'Le nom et la session sont requis' },
        { status: 400 }
      )
    }

    const niveau = await prisma.niveau.update({
      where: { id: parseInt(params.id) },
      data: {
        nom,
        sessionId: parseInt(sessionId),
      },
      include: {
        session: true,
      },
    })

    return NextResponse.json({ niveau })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du niveau' },
      { status: 500 }
    )
  }
}

// DELETE : Supprimer un niveau
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.niveau.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du niveau' },
      { status: 500 }
    )
  }
}