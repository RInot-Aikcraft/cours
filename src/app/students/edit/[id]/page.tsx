"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useUser from '@/hooks/useUser'
import Image from 'next/image'
import Link from 'next/link'

interface Student {
  id: number
  nom: string
  prenom: string
  dateNaissance: string
  adresse: string
  cin: string
  statut: 'ETUDIANT' | 'EMPLOYER'
  photo?: string
  userId: number
  user: {
    username: string
    mail: string
  }
}

export default function EditStudentPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    adresse: '',
    cin: '',
    statut: 'ETUDIANT' as 'ETUDIANT' | 'EMPLOYER',
    username: '',
    mail: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [previewPhoto, setPreviewPhoto] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingStudent, setLoadingStudent] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setFormData({
            nom: data.nom,
            prenom: data.prenom,
            dateNaissance: new Date(data.dateNaissance).toISOString().split('T')[0],
            adresse: data.adresse,
            cin: data.cin,
            statut: data.statut,
            username: data.user.username,
            mail: data.user.mail,
          })
          if (data.photo) {
            setPreviewPhoto(data.photo)
          }
        } else {
          setError('Élève non trouvé')
        }
      } catch (err) {
        setError('Erreur réseau')
      } finally {
        setLoadingStudent(false)
      }
    }

    if (user?.role === 'ADMIN') fetchStudent()
  }, [user, loading, router, studentId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhoto(file)
      setPreviewPhoto(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()
      formDataToSend.append('nom', formData.nom)
      formDataToSend.append('prenom', formData.prenom)
      formDataToSend.append('dateNaissance', formData.dateNaissance)
      formDataToSend.append('adresse', formData.adresse)
      formDataToSend.append('cin', formData.cin)
      formDataToSend.append('statut', formData.statut)
      formDataToSend.append('username', formData.username)
      formDataToSend.append('mail', formData.mail)
      if (photo) {
        formDataToSend.append('photo', photo)
      }

      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Élève modifié avec succès!')
        // Redirection vers la fiche élève après 1.5 secondes
        setTimeout(() => {
          router.push(`/students/${studentId}`)
        }, 1500)
      } else {
        setError(data.error || 'Erreur lors de la modification')
      }
    } catch (err) {
      setError('Erreur réseau ou serveur')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des informations...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modifier l'élève</h1>
              <p className="mt-1 text-sm text-gray-600">
                Mettez à jour les informations de {formData.nom} {formData.prenom}
              </p>
            </div>
            <Link
              href={`/students/${studentId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </Link>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* Messages d'erreur/succès */}
          {error && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="border-b border-green-200 bg-green-50 px-4 py-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                  <p className="text-sm text-green-700">Redirection vers la fiche élève...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Section Photo */}
            <div className="px-6 py-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Photo de profil</h3>
              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0">
                  {previewPhoto ? (
                    <Image
                      src={previewPhoto}
                      alt="Photo de l'élève"
                      width={160}
                      height={160}
                      className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-5xl text-gray-500 font-bold">
                        {formData.nom.charAt(0)}{formData.prenom.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Changer la photo</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG ou GIF. Taille maximale : 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Informations personnelles */}
            <div className="px-6 py-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    id="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    id="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700">
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateNaissance"
                    id="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cin" className="block text-sm font-medium text-gray-700">
                    CIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cin"
                    id="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    id="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section Statut et Compte */}
            <div className="px-6 py-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Statut et Compte</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="statut"
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="ETUDIANT">Étudiant</option>
                    <option value="EMPLOYER">Employé</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="mail" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="mail"
                    id="mail"
                    value={formData.mail}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="px-6 py-6 bg-gray-50">
              <div className="flex justify-end space-x-4">
                <Link
                  href={`/students/${studentId}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}