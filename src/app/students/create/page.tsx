"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useUser from '@/hooks/useUser'
import Link from 'next/link'
import { debounce } from 'lodash'

interface StudentFormData {
  nom: string
  prenom: string
  dateNaissance: string
  adresse: string
  cin: string
  statut: 'ETUDIANT' | 'EMPLOYER'
  username: string
  mail: string
  password: string
  confirmPassword: string
}

interface FieldCheck {
  available: boolean | null
  checking: boolean
  message: string
}

interface PasswordStrength {
  score: number
  message: string
  color: string
}

export default function CreateStudentPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  
  const [formData, setFormData] = useState<StudentFormData>({
    nom: '',
    prenom: '',
    dateNaissance: '',
    adresse: '',
    cin: '',
    statut: 'ETUDIANT',
    username: '',
    mail: '',
    password: '',
    confirmPassword: ''
  })
  
  const [usernameCheck, setUsernameCheck] = useState<FieldCheck>({
    available: null,
    checking: false,
    message: ''
  })
  
  const [emailCheck, setEmailCheck] = useState<FieldCheck>({
    available: null,
    checking: false,
    message: ''
  })

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    message: '',
    color: 'text-gray-500'
  })

  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fonction pour vérifier la force du mot de passe
  const checkPasswordStrength = useCallback((password: string) => {
    let score = 0
    let message = ''
    let color = 'text-red-500'

    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    switch (score) {
      case 0:
      case 1:
        message = 'Très faible'
        color = 'text-red-500'
        break
      case 2:
        message = 'Faible'
        color = 'text-orange-500'
        break
      case 3:
        message = 'Moyen'
        color = 'text-yellow-500'
        break
      case 4:
        message = 'Fort'
        color = 'text-green-500'
        break
      case 5:
        message = 'Très fort'
        color = 'text-green-600'
        break
    }

    setPasswordStrength({ score, message, color })
  }, [])

  // Fonction pour vérifier le username avec debounce
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (!username) {
        setUsernameCheck({
          available: null,
          checking: false,
          message: ''
        })
        return
      }

      setUsernameCheck(prev => ({
        ...prev,
        checking: true,
        message: 'Vérification...'
      }))

      try {
        const res = await fetch('/api/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        })

        const data = await res.json()
        setUsernameCheck({
          available: data.available,
          checking: false,
          message: data.message
        })

        // Générer des suggestions si le username n'est pas disponible
        if (!data.available && username.length > 2) {
          const suggestRes = await fetch('/api/suggest-usernames', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ baseUsername: username })
          })
          const suggestData = await suggestRes.json()
          setUsernameSuggestions(suggestData.suggestions)
          setShowSuggestions(true)
        } else {
          setShowSuggestions(false)
        }
      } catch (error) {
        setUsernameCheck({
          available: false,
          checking: false,
          message: 'Erreur lors de la vérification'
        })
      }
    }, 500),
    []
  )

  // Fonction pour vérifier l'email avec debounce
  const checkEmail = useCallback(
    debounce(async (email: string) => {
      if (!email) {
        setEmailCheck({
          available: null,
          checking: false,
          message: ''
        })
        return
      }

      setEmailCheck(prev => ({
        ...prev,
        checking: true,
        message: 'Vérification...'
      }))

      try {
        const res = await fetch('/api/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        const data = await res.json()
        setEmailCheck({
          available: data.available,
          checking: false,
          message: data.message
        })
      } catch (error) {
        setEmailCheck({
          available: false,
          checking: false,
          message: 'Erreur lors de la vérification'
        })
      }
    }, 500),
    []
  )

  // Effets pour vérifier les champs quand ils changent
  useEffect(() => {
    if (formData.username) {
      checkUsername(formData.username)
    } else {
      setUsernameCheck({
        available: null,
        checking: false,
        message: ''
      })
      setShowSuggestions(false)
    }
  }, [formData.username, checkUsername])

  useEffect(() => {
    if (formData.mail) {
      checkEmail(formData.mail)
    } else {
      setEmailCheck({
        available: null,
        checking: false,
        message: ''
      })
    }
  }, [formData.mail, checkEmail])

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password)
    } else {
      setPasswordStrength({
        score: 0,
        message: '',
        color: 'text-gray-500'
      })
    }
  }, [formData.password, checkPasswordStrength])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setFormData({ ...formData, username: suggestion })
    setShowSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Valider que le username et l'email sont disponibles
    if (usernameCheck.available === false) {
      setError('Veuillez choisir un nom d\'utilisateur disponible')
      return
    }
    
    if (emailCheck.available === false) {
      setError('Veuillez choisir un email disponible')
      return
    }

    // Valider que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    // Valider la force du mot de passe
    if (passwordStrength.score < 3) {
      setError('Veuillez choisir un mot de passe plus fort')
      return
    }
    
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          dateNaissance: formData.dateNaissance,
          adresse: formData.adresse,
          cin: formData.cin,
          statut: formData.statut,
          username: formData.username,
          mail: formData.mail,
          password: formData.password
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSuccess('Élève créé avec succès!')
        setTimeout(() => {
          router.push('/students')
        }, 1500)
      } else {
        setError(data.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur réseau ou serveur')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Créer un nouvel élève</h1>
              <p className="mt-1 text-sm text-gray-600">
                Ajoutez un nouvel élève à l'établissement
              </p>
            </div>
            <Link
              href="/students"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retour à la liste
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
                  <p className="text-sm text-green-700">Redirection vers la liste des élèves...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
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
                    id="nom"
                    name="nom"
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
                    id="prenom"
                    name="prenom"
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
                    id="dateNaissance"
                    name="dateNaissance"
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
                    id="cin"
                    name="cin"
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
                    id="adresse"
                    name="adresse"
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

                {/* Champ username avec vérification en temps réel et suggestions */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setShowSuggestions(true)}
                      className={`block w-full pr-10 border ${
                        usernameCheck.available === true ? 'border-green-300' :
                        usernameCheck.available === false ? 'border-red-300' :
                        'border-gray-300'
                      } rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {usernameCheck.checking && (
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {usernameCheck.available === true && (
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {usernameCheck.available === false && (
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {usernameCheck.message && (
                    <p className={`mt-1 text-sm ${
                      usernameCheck.available === true ? 'text-green-600' :
                      usernameCheck.available === false ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {usernameCheck.message}
                    </p>
                  )}
                  
                  {/* Suggestions de username */}
                  {showSuggestions && usernameSuggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Suggestions disponibles :</p>
                      <div className="flex flex-wrap gap-2">
                        {usernameSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Champ email avec vérification en temps réel */}
                <div>
                  <label htmlFor="mail" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="email"
                      id="mail"
                      name="mail"
                      value={formData.mail}
                      onChange={handleChange}
                      className={`block w-full pr-10 border ${
                        emailCheck.available === true ? 'border-green-300' :
                        emailCheck.available === false ? 'border-red-300' :
                        'border-gray-300'
                      } rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailCheck.checking && (
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {emailCheck.available === true && (
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {emailCheck.available === false && (
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {emailCheck.message && (
                    <p className={`mt-1 text-sm ${
                      emailCheck.available === true ? 'text-green-600' :
                      emailCheck.available === false ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {emailCheck.message}
                    </p>
                  )}
                </div>

                {/* Champ mot de passe avec indicateur de force */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Force du mot de passe :</span>
                        <span className={`text-sm font-medium ${passwordStrength.color}`}>
                          {passwordStrength.message}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            passwordStrength.score <= 1 ? 'bg-red-500 w-1/5' :
                            passwordStrength.score === 2 ? 'bg-orange-500 w-2/5' :
                            passwordStrength.score === 3 ? 'bg-yellow-500 w-3/5' :
                            passwordStrength.score === 4 ? 'bg-green-500 w-4/5' :
                            'bg-green-600 w-full'
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Champ confirmation mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="px-6 py-6 bg-gray-50">
              <div className="flex justify-end space-x-4">
                <Link
                  href="/students"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || usernameCheck.available === false || emailCheck.available === false}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </>
                  ) : (
                    'Créer l\'élève'
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