'use client'

import { useState } from 'react'
import { DeskHeader, controlClass } from '@/components/admin/admin-dialog'
import { monthKey, rebuildPayslips, useAdminState } from '@/components/admin/store'
import { formatInr } from '@/lib/money'

export function PayslipsDesk() {
  const { state, commit } = useAdminState()
  const [month, setMonth] = useState(monthKey())
  const [notice, setNotice] = useState('')
  if (!state) return <p className="text-sm text-[#806b60]">Opening payslips…</p>
  const slips = state.payslips.filter((slip) => slip.month === month)

  const rebuild = () => {
    commit(rebuildPayslips(state, month))
    setNotice(`Payslips for ${month} now follow the attendance marks. Paid slips were left as they were.`)
  }

  const markPaid = (id: string) => {
    commit({ ...state, payslips: state.payslips.map((slip) => slip.id === id ? { ...slip, status: 'paid' } : slip) })
    setNotice('')
  }

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <DeskHeader
        eyebrow="People"
        title="Payslips."
        lede="A full day is paid. A late day deducts half a day, and an absent day deducts one day from a 26-day month. Leave is not deducted."
        action={<button type="button" className="primary-button" onClick={rebuild}>Build from attendance</button>}
      />
      <label className="mt-6 block max-w-xs text-sm font-semibold text-[#5a4137]">
        Month
        <input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setNotice('') }} className={controlClass} />
      </label>
      {notice ? <p role="status" className="mt-4 max-w-2xl text-sm leading-6 text-[#806b60]">{notice}</p> : null}
      {slips.length === 0 ? <p className="mt-8 rounded-[20px] border border-[#eadfd5] bg-[#fffaf5] p-6 text-sm leading-6 text-[#806b60]">No payslips for this month yet. Build them from attendance.</p> : (
        <ul className="mt-6 flex flex-col gap-4">
          {slips.map((slip) => {
            const employee = state.employees.find((person) => person.id === slip.employeeId)
            return (
              <li key={slip.id} className="dashboard-card min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl text-[#4b332b]">{employee?.name ?? 'Former staff'}</h2>
                    <p className="mt-1 text-sm text-[#806b60]">{employee?.role ?? 'No longer on the crew'} · {slip.month}</p>
                  </div>
                  <span className={`status ${slip.status === 'paid' ? 'status-ready-for-pickup' : 'status-preparing'}`}>{slip.status === 'paid' ? 'Paid' : 'Draft'}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><dt className="stat-label">Base</dt><dd className="mt-1 font-semibold">{formatInr(slip.base)}</dd></div>
                  <div><dt className="stat-label">Present / late</dt><dd className="mt-1 font-semibold">{slip.daysPresent} / {slip.daysLate}</dd></div>
                  <div><dt className="stat-label">Absent</dt><dd className="mt-1 font-semibold">{slip.daysAbsent}</dd></div>
                  <div><dt className="stat-label">Net</dt><dd className="mt-1 font-semibold text-[#b96654]">{formatInr(slip.net)}</dd></div>
                </dl>
                {slip.deduction > 0 ? <p className="mt-3 text-sm text-[#806b60]">Deduction {formatInr(slip.deduction)}</p> : null}
                {slip.status === 'draft' ? <button type="button" className="primary-button mt-4" onClick={() => markPaid(slip.id)}>Mark paid</button> : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
