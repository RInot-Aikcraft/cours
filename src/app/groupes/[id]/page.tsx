"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useUser from '@/hooks/useUser'

interface Groupe {
  id: number
  nom: string
  effectif: number
  type: 'LOCAL' | 'EN_LIGNE' | 'HYBRIDE'
  niveau: {
    id: number
    nom: string
    session: {
      id: number
      nom: string
    }
  }
}

export default function GroupeDetailPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const groupeId = params.id as string

  const [groupe, setGroupe] = useState<Groupe | null>(null)
  const [loadingGroupe, setLoadingGroupe] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchGroupe = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/groupes/${groupeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setGroupe(data.groupe)
        } else {
          setError('Groupe non trouvé')
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingGroupe(false)
      }
    }

    if (user?.role === 'ADMIN') fetchGroupe()
  }, [user, loading, router, groupeId])

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'LOCAL':
        return 'bg-green-100 text-green-800'
      case 'EN_LIGNE':
        return 'bg-blue-100 text-blue-800'
      case 'HYBRIDE':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || loadingGroupe) return <div>Chargement...</div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Détail du groupe</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Informations complètes sur le groupe.
            </p>
          </div>
          <div className="border-t border-gray-200">
            {error ? (
              <div className="px-4 py-5 sm:p-6 text-center text-red-500">
                {error}
              </div>
            ) : groupe ? (
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{groupe.nom}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Effectif</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{groupe.effectif}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(groupe.type)}`}>
                      {groupe.type}
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Niveau</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{groupe.niveau.nom}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Session</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{groupe.niveau.session.nom}</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <div className="px-4 py-4 bg-gray-50 sm:px-6">
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/groupes/${groupeId}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Modifier
              </button>
              <button
                onClick={() => router.push('/groupes')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}