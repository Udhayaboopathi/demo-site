'use client'

import { useState } from 'react'
import { AdminDialog, controlClass, DeskHeader, Field } from '@/components/admin/admin-dialog'
import { createId, useAdminState, type Employee } from '@/components/admin/store'
import { formatInr } from '@/lib/money'

const blank = { name: '', role: '', phone: '', pay: '', status: 'active' as Employee['status'], started: '' }

export function EmployeesDesk() {
  const { state, commit } = useAdminState()
  const [editing, setEditing] = useState<Employee | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState(blank)
  const [error, setError] = useState('')
  const [removeId, setRemoveId] = useState<string | null>(null)

  if (!state) return <p className="text-sm text-[#806b60]">Opening the crew…</p>

  const openCreate = () => { setEditing(null); setDraft(blank); setError(''); setCreating(true) }
  const openEdit = (employee: Employee) => {
    setCreating(false)
    setEditing(employee)
    setError('')
    setDraft({ name: employee.name, role: employee.role, phone: employee.phone, pay: String(employee.pay), status: employee.status, started: employee.started })
  }
  const close = () => { setCreating(false); setEditing(null); setError('') }

  const save = () => {
    const name = draft.name.trim()
    const pay = Number(draft.pay)
    if (!name) { setError('Add a name.'); return }
    if (!draft.role.trim()) { setError('Add a role.'); return }
    if (!Number.isFinite(pay) || pay < 0) { setError('Enter a monthly pay of zero or more.'); return }
    const next: Employee = {
      id: editing?.id ?? createId('emp'),
      name,
      role: draft.role.trim(),
      phone: draft.phone.trim(),
      pay,
      status: draft.status,
      started: draft.started || editing?.started || new Date().toISOString().slice(0, 10),
    }
    commit({ ...state, employees: editing ? state.employees.map((employee) => employee.id === editing.id ? next : employee) : [...state.employees, next] })
    close()
  }

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <DeskHeader eyebrow="People" title="Employees." lede="The crew list is sample data stored in this browser, with a role and a monthly pay." action={<button type="button" className="primary-button" onClick={openCreate}>Add someone</button>} />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {state.employees.map((employee) => (
          <li key={employee.id} className="dashboard-card min-w-0">
            <div className="flex items-start gap-3">
              <span className="avatar shrink-0" aria-hidden="true">{employee.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-2xl leading-tight text-[#4b332b]">{employee.name}</h2>
                <p className="mt-1 text-sm text-[#806b60]">{employee.role}</p>
              </div>
              <span className={`status ${employee.status === 'active' ? 'status-ready-for-pickup' : 'status-preparing'}`}>{employee.status === 'active' ? 'Active' : 'On leave'}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#806b60]">{employee.phone || 'No phone'} · since {employee.started}</p>
            <p className="mt-1 text-sm font-semibold text-[#5a4137]">{formatInr(employee.pay)} / month</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="secondary-button" onClick={() => openEdit(employee)}>Edit</button>
              <button type="button" className="secondary-button" onClick={() => setRemoveId(employee.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {(creating || editing) && (
        <AdminDialog title={editing ? 'Edit employee' : 'New employee'} onClose={close}>
          <Field label="Name"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={controlClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role"><input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} className={controlClass} /></Field>
            <Field label="Phone"><input value={draft.phone} inputMode="tel" onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className={controlClass} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monthly pay"><input value={draft.pay} inputMode="decimal" onChange={(event) => setDraft({ ...draft, pay: event.target.value })} className={controlClass} /></Field>
            <Field label="Started"><input type="date" value={draft.started} onChange={(event) => setDraft({ ...draft, started: event.target.value })} className={controlClass} /></Field>
          </div>
          <Field label="Status">
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Employee['status'] })} className={controlClass}>
              <option value="active">Active</option>
              <option value="on-leave">On leave</option>
            </select>
          </Field>
          {error ? <p role="alert" className="text-sm leading-6 text-[#9b4d3c]">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={save}>Save</button>
            <button type="button" className="secondary-button" onClick={close}>Cancel</button>
          </div>
        </AdminDialog>
      )}
      {removeId && (
        <AdminDialog title="Remove this person?" description="Attendance already marked stays in the month. New payslips will skip them." onClose={() => setRemoveId(null)}>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={() => { commit({ ...state, employees: state.employees.filter((employee) => employee.id !== removeId) }); setRemoveId(null) }}>Remove</button>
            <button type="button" className="secondary-button" onClick={() => setRemoveId(null)}>Keep them</button>
          </div>
        </AdminDialog>
      )}
    </div>
  )
}
