import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            username: true,
            mail: true,
            role: true,
          },
        },
      },
    })
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des élèves' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nom, prenom, dateNaissance, adresse, cin, statut, username, mail, password } = await request.json()

    // Vérifier si l'username ou l'email existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { mail },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Nom d’utilisateur ou email déjà utilisé' },
        { status: 400 }
      )
    }

    // Vérifier si le CIN existe déjà
    const existingStudent = await prisma.student.findUnique({
      where: { cin },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'CIN déjà utilisé' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        nom,  // ← Ajout du champ nom
        username,
        mail,
        password: hashedPassword,
        role: 'ELEVE',
      },
    })

    const student = await prisma.student.create({
      data: {
        nom,
        prenom,
        dateNaissance: new Date(dateNaissance),
        adresse,
        cin,
        statut,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            username: true,
            mail: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Erreur détaillée lors de la création de l’élève :', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l’élève', details: error.message },
      { status: 500 }
    )
  }
}