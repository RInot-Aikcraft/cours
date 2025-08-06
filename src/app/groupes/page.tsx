"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface Niveau {
  id: number
  nom: string
  session: {
    id: number
    nom: string
  }
}

export default function GroupesPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [filteredGroupes, setFilteredGroupes] = useState<Groupe[]>([])
  const [loadingGroupes, setLoadingGroupes] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtres et tri
  const [searchTerm, setSearchTerm] = useState('')
  const [niveauFilter, setNiveauFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortField, setSortField] = useState<'nom' | 'effectif' | 'type' | 'niveau'>('nom')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGroupe, setNewGroupe] = useState({
    nom: '',
    effectif: '',
    type: 'LOCAL' as 'LOCAL' | 'EN_LIGNE' | 'HYBRIDE',
    niveauId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchGroupes = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/groupes', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setGroupes(data.groupes || [])
          setFilteredGroupes(data.groupes || [])
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingGroupes(false)
      }
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
        }
      } catch (err) {
        setError('Erreur réseau')
      }
    }

    if (user?.role === 'ADMIN') {
      fetchGroupes()
      fetchNiveaux()
    }
  }, [user, loading, router])

  useEffect(() => {
    let result = groupes

    if (searchTerm) {
      result = result.filter(groupe => 
        groupe.nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (niveauFilter) {
      result = result.filter(groupe => groupe.niveau.id.toString() === niveauFilter)
    }

    if (typeFilter) {
      result = result.filter(groupe => groupe.type === typeFilter)
    }

    // Tri
    result = [...result].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'nom':
          aValue = a.nom
          bValue = b.nom
          break
        case 'effectif':
          aValue = a.effectif
          bValue = b.effectif
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'niveau':
          aValue = a.niveau.nom
          bValue = b.niveau.nom
          break
        default:
          aValue = a.nom
          bValue = b.nom
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredGroupes(result)
  }, [groupes, searchTerm, niveauFilter, typeFilter, sortField, sortDirection])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupe.nom.trim() || !newGroupe.effectif || !newGroupe.niveauId) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/groupes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: newGroupe.nom,
          effectif: parseInt(newGroupe.effectif),
          type: newGroupe.type,
          niveauId: parseInt(newGroupe.niveauId),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setGroupes([...groupes, data.groupe])
        setNewGroupe({
          nom: '',
          effectif: '',
          type: 'LOCAL',
          niveauId: '',
        })
        setSuccess('Groupe ajouté avec succès !')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/groupes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setGroupes(groupes.filter(groupe => groupe.id !== id))
        setSuccess('Groupe supprimé avec succès !')
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur réseau')
    }
  }

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

  const handleSort = (field: 'nom' | 'effectif' | 'type' | 'niveau') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setNiveauFilter('')
    setTypeFilter('')
    setSortField('nom')
    setSortDirection('asc')
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredGroupes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredGroupes.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading || loadingGroupes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des groupes</h1>
            <p className="mt-2 text-gray-600">Créez et gérez les groupes de votre établissement.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Ajouter un groupe
          </button>
        </header>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        {/* Filtres et tri */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
              <input
                type="text"
                placeholder="Nom du groupe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par niveau</label>
              <select
                value={niveauFilter}
                onChange={(e) => setNiveauFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tous les niveaux</option>
                {niveaux.map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tous les types</option>
                <option value="LOCAL">Local</option>
                <option value="EN_LIGNE">En ligne</option>
                <option value="HYBRIDE">Hybride</option>
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 underline"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleSort('nom')}
              className={`px-3 py-1 text-sm rounded ${
                sortField === 'nom' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Nom {sortField === 'nom' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('effectif')}
              className={`px-3 py-1 text-sm rounded ${
                sortField === 'effectif' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Effectif {sortField === 'effectif' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('type')}
              className={`px-3 py-1 text-sm rounded ${
                sortField === 'type' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('niveau')}
              className={`px-3 py-1 text-sm rounded ${
                sortField === 'niveau' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Niveau {sortField === 'niveau' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Tableau des groupes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((groupe) => (
                    <tr key={groupe.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{groupe.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{groupe.effectif}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(groupe.type)}`}>
                          {groupe.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{groupe.niveau.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{groupe.niveau.session.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/groupes/${groupe.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => router.push(`/groupes/${groupe.id}/edit`)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(groupe.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      Aucun groupe trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredGroupes.length)}
                    </span>{' '}
                    sur <span className="font-medium">{filteredGroupes.length}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      &larr;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ajouter un groupe</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={newGroupe.nom}
                    onChange={(e) => setNewGroupe({...newGroupe, nom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effectif</label>
                  <input
                    type="number"
                    value={newGroupe.effectif}
                    onChange={(e) => setNewGroupe({...newGroupe, effectif: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newGroupe.type}
                    onChange={(e) => setNewGroupe({...newGroupe, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="LOCAL">Local</option>
                    <option value="EN_LIGNE">En ligne</option>
                    <option value="HYBRIDE">Hybride</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <select
                    value={newGroupe.niveauId}
                    onChange={(e) => setNewGroupe({...newGroupe, niveauId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {niveaux.map((niveau) => (
                      <option key={niveau.id} value={niveau.id}>
                        {niveau.nom} ({niveau.session.nom})
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