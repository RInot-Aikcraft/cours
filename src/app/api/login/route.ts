// src/app/api/login/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()  // ← Changé ici

    if (!username || !password) {
      return NextResponse.json({ error: 'Nom d’utilisateur et mot de passe requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username },  // ← Changé ici
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },  // ← Changé ici
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}