"use client"

import { useState, useCallback } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Session } from '@/types/session'

interface SessionCalendarProps {
  sessions: Session[]
  onSessionClick?: (session: Session) => void
}

export default function SessionCalendar({ sessions, onSessionClick }: SessionCalendarProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null)

  const tileContent = useCallback(({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.dateDebut)
      return sessionDate.toDateString() === date.toDateString()
    })

    if (daySessions.length === 0) return null

    return (
      <div className="relative">
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded cursor-pointer"
          onMouseEnter={(e) => {
            const content = daySessions.map(s => s.nom).join(', ')
            setTooltip({ content, x: e.clientX, y: e.clientY })
          }}
          onMouseLeave={() => setTooltip(null)}
        />
      </div>
    )
  }, [sessions])

  const handleDayClick = useCallback((value: Date) => {
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.dateDebut)
      return sessionDate.toDateString() === value.toDateString()
    })

    if (daySessions.length === 1 && onSessionClick) {
      onSessionClick(daySessions[0])
    }
  }, [sessions, onSessionClick])

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Calendrier des sessions</h3>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        onClickDay={handleDayClick}
        className="border-0 w-full"
        aria-label="Calendrier des sessions"
      />
      {tooltip && (
        <div
          className="fixed bg-gray-800 text-white text-xs rounded px-2 py-1 z-10"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.content}
        </div>
      )}
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