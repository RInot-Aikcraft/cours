// src/app/register/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'

export default function RegisterPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>
  }

  if (!user || user.role !== 'ADMIN') {
    return null // Redirection déjà en cours
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Créer un nouvel utilisateur</h1>
        {/* Formulaire de création d'utilisateur ici */}
      </div>
    </div>
  )
}