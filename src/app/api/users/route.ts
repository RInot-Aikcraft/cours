import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nom: true,
      username: true,
      mail: true,
      contact: true,
      role: true,
      createdAt: true,
    },
  })
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  try {
    const { nom, username, mail, contact, password, role } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        nom,
        username,
        mail,
        contact,
        password: hashedPassword,
        role,
      },
    })

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', user },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création de l’utilisateur' },
      { status: 500 }
    )
  }
}