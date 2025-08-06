"use client"

import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Session } from '@/types/session'

interface SessionCalendarProps {
  sessions: Session[]
  onSessionClick?: (session: Session) => void
}

export default function SessionCalendar({ sessions, onSessionClick }: SessionCalendarProps) {
  const [date, setDate] = useState(new Date())

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null
    
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.dateDebut)
      return sessionDate.toDateString() === date.toDateString()
    })

    return (
      <div className="relative">
        {daySessions.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded"></div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Calendrier des sessions</h3>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        className="border-0"
      />
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Légende</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-1 bg-indigo-600 rounded"></div>
            <span className="ml-2">Session prévue</span>
          </div>
        </div>
      </div>
    </div>
  )
}