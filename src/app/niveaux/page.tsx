"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'

interface Niveau {
  id: number
  nom: string
  session: {
    id: number
    nom: string
    etat: 'EN_COURS' | 'TERMINEE' | 'ANNULEE' | 'REPORTER'
  }
}

interface Session {
  id: number
  nom: string
}

export default function NiveauxPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredNiveaux, setFilteredNiveaux] = useState<Niveau[]>([])
  const [newNiveau, setNewNiveau] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [loadingNiveaux, setLoadingNiveaux] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtres et tri
  const [sessionFilter, setSessionFilter] = useState('')
  const [etatFilter, setEtatFilter] = useState('')
  const [sortField, setSortField] = useState<'nom' | 'session' | 'etat'>('nom')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchNiveaux = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/niveaux', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setNiveaux(data.niveaux || [])
          setFilteredNiveaux(data.niveaux || [])
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingNiveaux(false)
      }
    }

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/sessions?etat=EN_COURS', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setSessions(data.sessions || [])
        }
      } catch (err) {
        setError('Erreur réseau')
      }
    }

    if (user?.role === 'ADMIN') {
      fetchNiveaux()
      fetchSessions()
    }
  }, [user, loading, router])

  useEffect(() => {
    let result = niveaux

    if (sessionFilter) {
      result = result.filter(niveau => niveau.session.id.toString() === sessionFilter)
    }

    if (etatFilter) {
      result = result.filter(niveau => niveau.session.etat === etatFilter)
    }

    // Tri
    result = [...result].sort((a, b) => {
      let aValue: string, bValue: string

      switch (sortField) {
        case 'nom':
          aValue = a.nom
          bValue = b.nom
          break
        case 'session':
          aValue = a.session.nom
          bValue = b.session.nom
          break
        case 'etat':
          aValue = a.session.etat
          bValue = b.session.etat
          break
        default:
          aValue = a.nom
          bValue = b.nom
      }

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

    setFilteredNiveaux(result)
  }, [niveaux, sessionFilter, etatFilter, sortField, sortDirection])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNiveau.trim() || !selectedSession) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/niveaux', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: newNiveau,
          sessionId: parseInt(selectedSession),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setNiveaux([...niveaux, data.niveau])
        setNewNiveau('')
        setSelectedSession('')
        setSuccess('Niveau ajouté avec succès !')
        setIsModalOpen(false)
      } else {
        setError(data.error || "Erreur lors de l'ajout")
      }
    } catch (err) {
      setError('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/niveaux/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setNiveaux(niveaux.filter(niveau => niveau.id !== id))
        setSuccess('Niveau supprimé avec succès !')
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur réseau')
    }
  }

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800'
      case 'TERMINEE':
        return 'bg-green-100 text-green-800'
      case 'ANNULEE':
        return 'bg-red-100 text-red-800'
      case 'REPORTER':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSort = (field: 'nom' | 'session' | 'etat') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const resetFilters = () => {
    setSessionFilter('')
    setEtatFilter('')
    setSortField('nom')
    setSortDirection('asc')
  }

  if (loading || loadingNiveaux) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des niveaux</h1>
            <p className="mt-2 text-gray-600">Créez et gérez les niveaux liés aux sessions.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Ajouter un niveau
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg shadow">
            {success}
          </div>
        )}

        {/* Filtres et tri */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par session</label>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Toutes les sessions</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par statut</label>
              <select
                value={etatFilter}
                onChange={(e) => setEtatFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINEE">Terminée</option>
                <option value="ANNULEE">Annulée</option>
                <option value="REPORTER">Reportée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort('nom')}
                  className={`px-3 py-2 rounded-lg border ${
                    sortField === 'nom' ? 'bg-indigo-100 border-indigo-500' : 'border-gray-300'
                  }`}
                >
                  Nom {sortField === 'nom' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('session')}
                  className={`px-3 py-2 rounded-lg border ${
                    sortField === 'session' ? 'bg-indigo-100 border-indigo-500' : 'border-gray-300'
                  }`}
                >
                  Session {sortField === 'session' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('etat')}
                  className={`px-3 py-2 rounded-lg border ${
                    sortField === 'etat' ? 'bg-indigo-100 border-indigo-500' : 'border-gray-300'
                  }`}
                >
                  Statut {sortField === 'etat' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            <div className="self-end">
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des niveaux */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 p-6 pb-4">Liste des niveaux</h2>
          {filteredNiveaux.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun niveau trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du niveau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNiveaux.map((niveau) => (
                    <tr key={niveau.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{niveau.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{niveau.session.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEtatBadge(niveau.session.etat)}`}>
                          {niveau.session.etat}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/niveaux/${niveau.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(niveau.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ajouter un niveau</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="mb-4">
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom du niveau</label>
                  <input
                    type="text"
                    id="nom"
                    value={newNiveau}
                    onChange={(e) => setNewNiveau(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                  <select
                    id="session"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Sélectionner une session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}