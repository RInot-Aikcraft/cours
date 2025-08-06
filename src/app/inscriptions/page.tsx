"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'

interface Inscription {
  id: number
  matricule: string
  etatFrais: 'PAYE' | 'NON_PAYE' | 'PARTIEL'
  dateInscription: string
  groupe: {
    id: number
    nom: string
    niveau: {
      id: number
      nom: string
      session: {
        id: number
        nom: string
      }
    }
  }
  eleve: {
    id: number
    nom: string
    prenom: string
    cin: string
    user: {
      id: number
      mail: string
    }
  }
}

interface Groupe {
  id: number
  nom: string
  niveau: {
    id: number
    nom: string
    session: {
      id: number
      nom: string
    }
  }
}

interface Student {
  id: number
  nom: string
  prenom: string
  cin: string
  user: {
    id: number
    mail: string
  }
}

export default function InscriptionsPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [eleves, setEleves] = useState<Student[]>([])
  const [newInscription, setNewInscription] = useState({
    groupeId: '',
    eleveId: '',
    searchTerm: '',
    etatFrais: 'NON_PAYE' as 'PAYE' | 'NON_PAYE' | 'PARTIEL',
  })
  const [loadingInscriptions, setLoadingInscriptions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtrer les étudiants pour la recherche
  const filteredEleves = eleves.filter(eleve =>
    eleve.nom.toLowerCase().includes((newInscription.searchTerm || '').toLowerCase()) ||
    eleve.prenom.toLowerCase().includes((newInscription.searchTerm || '').toLowerCase()) ||
    eleve.user.mail.toLowerCase().includes((newInscription.searchTerm || '').toLowerCase()) ||
    eleve.cin.toLowerCase().includes((newInscription.searchTerm || '').toLowerCase())
  )

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchInscriptions = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/inscriptions', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setInscriptions(data.inscriptions || [])
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingInscriptions(false)
      }
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
        }
      } catch (err) {
        setError('Erreur réseau')
      }
    }

    const fetchEleves = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          // Correction : l'API retourne directement un tableau
          setEleves(data || [])
        }
      } catch (err) {
        setError('Erreur réseau')
      }
    }

    if (user?.role === 'ADMIN') {
      fetchInscriptions()
      fetchGroupes()
      fetchEleves()
    }
  }, [user, loading, router])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInscription.groupeId || !newInscription.eleveId) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupeId: parseInt(newInscription.groupeId),
          eleveId: parseInt(newInscription.eleveId),
          etatFrais: newInscription.etatFrais,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setInscriptions([...inscriptions, data.inscription])
        setNewInscription({
          groupeId: '',
          eleveId: '',
          searchTerm: '',
          etatFrais: 'NON_PAYE',
        })
        setSuccess('Inscription ajoutée avec succès !')
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/inscriptions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setInscriptions(inscriptions.filter(inscription => inscription.id !== id))
        setSuccess('Inscription supprimée avec succès !')
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur réseau')
    }
  }

  const getEtatFraisBadge = (etat: string) => {
    switch (etat) {
      case 'PAYE':
        return 'bg-green-100 text-green-800'
      case 'NON_PAYE':
        return 'bg-red-100 text-red-800'
      case 'PARTIEL':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || loadingInscriptions) return <div>Chargement...</div>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des inscriptions</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

        {/* Formulaire d'ajout */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-medium mb-4">Ajouter une inscription</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={newInscription.groupeId}
              onChange={(e) => setNewInscription({...newInscription, groupeId: e.target.value})}
              className="px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Sélectionner un groupe</option>
              {groupes.map((groupe) => (
                <option key={groupe.id} value={groupe.id}>
                  {groupe.nom} ({groupe.niveau.nom} - {groupe.niveau.session.nom})
                </option>
              ))}
            </select>
            
            {/* Recherche et sélection d'étudiant */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un étudiant..."
                value={newInscription.searchTerm || ''}
                onChange={(e) => setNewInscription({...newInscription, searchTerm: e.target.value})}
                className="w-full px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {newInscription.searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredEleves.length > 0 ? (
                    filteredEleves.map((eleve) => (
                      <div
                        key={eleve.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setNewInscription({
                            ...newInscription,
                            eleveId: eleve.id.toString(),
                            searchTerm: `${eleve.nom} ${eleve.prenom} (${eleve.user.mail})`
                          })
                        }}
                      >
                        <div className="font-medium">{eleve.nom} {eleve.prenom}</div>
                        <div className="text-sm text-gray-500">{eleve.user.mail}</div>
                        <div className="text-xs text-gray-400">CIN: {eleve.cin}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Aucun étudiant trouvé</div>
                  )}
                </div>
              )}
            </div>
            
            <select
              value={newInscription.etatFrais}
              onChange={(e) => setNewInscription({...newInscription, etatFrais: e.target.value as any})}
              className="px-3 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="PAYE">Payé</option>
              <option value="NON_PAYE">Non payé</option>
              <option value="PARTIEL">Partiel</option>
            </select>
            
            <button
              type="submit"
              disabled={isSubmitting || !newInscription.groupeId || !newInscription.eleveId}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </button>
          </form>
        </div>

        {/* Tableau des inscriptions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <h2 className="text-lg font-medium p-6 pb-4">Liste des inscriptions</h2>
          {inscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune inscription trouvée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État des frais</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inscriptions.map((inscription) => (
                    <tr key={inscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inscription.matricule}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{inscription.eleve.nom} {inscription.eleve.prenom}</div>
                        <div className="text-xs text-gray-500">{inscription.eleve.user.mail}</div>
                        <div className="text-xs text-gray-400">CIN: {inscription.eleve.cin}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscription.groupe.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscription.groupe.niveau.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscription.groupe.niveau.session.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEtatFraisBadge(inscription.etatFrais)}`}>
                          {inscription.etatFrais}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inscription.dateInscription).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(inscription.id)}
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
    </div>
  )
}