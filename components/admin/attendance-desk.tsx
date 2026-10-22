'use client'

import { useState } from 'react'
import { DeskHeader, controlClass } from '@/components/admin/admin-dialog'
import { todayKey, useAdminState, type AttendanceMark } from '@/components/admin/store'

const choices: { id: AttendanceMark; label: string }[] = [
  { id: 'present', label: 'Present' },
  { id: 'late', label: 'Late' },
  { id: 'absent', label: 'Absent' },
  { id: 'leave', label: 'Leave' },
]

export function AttendanceDesk() {
  const { state, commit } = useAdminState()
  const [date, setDate] = useState(todayKey())
  if (!state) return <p className="text-sm text-[#806b60]">Opening attendance…</p>
  const day = state.attendance.find((entry) => entry.date === date)
  const marks = day?.marks ?? {}
  const count = (mark: AttendanceMark) => state.employees.filter((employee) => marks[employee.id] === mark).length

  const setMark = (employeeId: string, mark: AttendanceMark) => {
    const attendance = state.attendance.some((entry) => entry.date === date)
      ? state.attendance.map((entry) => entry.date === date ? { ...entry, marks: { ...entry.marks, [employeeId]: mark } } : entry)
      : [...state.attendance, { date, marks: { [employeeId]: mark } }]
    commit({ ...state, attendance })
  }

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <DeskHeader eyebrow="People" title="Attendance." lede="Tap a mark for the day. Present, late, absent, and leave feed the payslip for that month." action={<label className="text-sm font-semibold text-[#5a4137]">Day<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={controlClass} /></label>} />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="stat-card min-w-0"><p className="stat-label">Present</p><p className="mt-2 font-serif text-3xl">{count('present')}</p></article>
        <article className="stat-card min-w-0"><p className="stat-label">Late</p><p className="mt-2 font-serif text-3xl">{count('late')}</p></article>
        <article className="stat-card min-w-0"><p className="stat-label">Absent</p><p className="mt-2 font-serif text-3xl">{count('absent')}</p></article>
        <article className="stat-card min-w-0"><p className="stat-label">Leave</p><p className="mt-2 font-serif text-3xl">{count('leave')}</p></article>
      </div>
      <ul className="mt-6 flex flex-col">
        {state.employees.map((employee) => (
          <li key={employee.id} className="flex flex-col gap-3 border-b border-[#eadfd5] py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-serif text-xl text-[#4b332b]">{employee.name}</p>
              <p className="text-sm text-[#806b60]">{employee.role}{employee.status === 'on-leave' ? ' · on leave' : ''}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={`Attendance for ${employee.name}`}>
              {choices.map((choice) => {
                const active = marks[employee.id] === choice.id
                return (
                  <button key={choice.id} type="button" aria-pressed={active} onClick={() => setMark(employee.id, choice.id)} className={`min-h-11 rounded-full px-3 text-sm font-semibold ${active ? 'bg-[#c87968] text-[#fffaf5]' : 'border border-[#e4d7cc] text-[#73594d]'}`}>{choice.label}</button>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
