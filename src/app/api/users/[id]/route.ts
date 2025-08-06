import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        nom: true,
        username: true,
        mail: true,
        contact: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l’utilisateur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { nom, username, mail, contact, role } = await request.json()

    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: {
        nom,
        username,
        mail,
        contact,
        role,
      },
    })

    return NextResponse.json(
      { message: 'Utilisateur modifié avec succès', user },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l’utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l’utilisateur' },
      { status: 500 }
    )
  }
}