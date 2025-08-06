import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET : Récupérer un groupe par son ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupe = await prisma.groupe.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        niveau: {
          include: {
            session: true,
          },
        },
      },
    })

    if (!groupe) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ groupe })
  } catch (error) {
    console.error('Erreur lors de la récupération du groupe :', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du groupe' },
      { status: 500 }
    )
  }
}

// PUT : Modifier un groupe
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nom, effectif, type, niveauId } = body

    if (!nom || !effectif || !niveauId) {
      return NextResponse.json(
        { error: 'Le nom, l\'effectif et le niveau sont requis' },
        { status: 400 }
      )
    }

    const groupe = await prisma.groupe.update({
      where: { id: parseInt(params.id) },
      data: {
        nom,
        effectif: parseInt(effectif),
        type,
        niveauId: parseInt(niveauId),
      },
      include: {
        niveau: {
          include: {
            session: true,
          },
        },
      },
    })

    return NextResponse.json({ groupe })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du groupe :', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du groupe' },
      { status: 500 }
    )
  }
}

// DELETE : Supprimer un groupe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.groupe.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe :', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du groupe' },
      { status: 500 }
    )
  }
}