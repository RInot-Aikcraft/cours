"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'
import Link from 'next/link'

interface Session {
  id: number
  nom: string
  dateDebut: string
  dateFin: string
  etat: string
  createdAt: string
}

export default function SessionsPage() {
  const { user, loading } = useUser()
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [etatFilter, setEtatFilter] = useState('')
  const [loadingSessions, setLoadingSessions] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch('/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        if (res.ok) {
          setSessions(data.sessions || [])
        }
      } catch (error) {
        console.error('Erreur réseau', error)
      } finally {
        setLoadingSessions(false)
      }
    }

    if (user?.role === 'ADMIN') fetchSessions()
  }, [user, loading, router])

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setSessions(sessions.filter(session => session.id !== id))
      }
    } catch (error) {
      console.error('Erreur réseau', error)
    }
  }

  const filteredSessions = sessions.filter((session) =>
    (etatFilter ? session.etat === etatFilter : true) &&
    (session.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading || loadingSessions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des sessions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez toutes les sessions de votre établissement.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📅</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total sessions
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {sessions.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">✅</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Terminées
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {sessions.filter(s => s.etat === 'TERMINEE').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🔄</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      En cours
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {sessions.filter(s => s.etat === 'EN_COURS').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">❌</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Annulées
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {sessions.filter(s => s.etat === 'ANNULEE').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et création */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="w-64">
              <input
                type="text"
                placeholder="Rechercher une session..."
                className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <select
                className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={etatFilter}
                onChange={(e) => setEtatFilter(e.target.value)}
              >
                <option value="">Tous les états</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
                <option value="REPORTER">Reportée</option>
              </select>
            </div>
          </div>
          <Link
            href="/sessions/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700"
          >
            Créer une session
          </Link>
        </div>

        {/* Tableau des sessions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(session.dateDebut).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(session.dateFin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      session.etat === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                      session.etat === 'TERMINEE' ? 'bg-green-100 text-green-800' :
                      session.etat === 'ANNULEE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.etat}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/sessions/edit/${session.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Modifier
                    </Link>
                    <button onClick={() => handleDelete(session.id)} className="text-red-600 hover:text-red-900">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}