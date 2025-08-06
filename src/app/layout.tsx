import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Mon App Next.js',
  description: 'Application Next.js avec PostgreSQL et authentification',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  )
}