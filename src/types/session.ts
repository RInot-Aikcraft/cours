export interface Session {
  id: number
  nom: string
  dateDebut: string
  dateFin: string
  etat: 'EN_COURS' | 'TERMINEE' | 'ANNULEE' | 'REPORTER'
  createdAt: string
  updatedAt: string
}