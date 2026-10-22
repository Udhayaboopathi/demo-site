'use client'

import { useState } from 'react'
import { AdminDialog, controlClass, DeskHeader, Field } from '@/components/admin/admin-dialog'
import { createId, slug, useAdminState, type AdminCategory } from '@/components/admin/store'

export function CategoriesDesk() {
  const { state, commit } = useAdminState()
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState('')
  const [removeId, setRemoveId] = useState<string | null>(null)

  if (!state) return <p className="text-sm text-[#806b60]">Opening categories…</p>

  const openCreate = () => { setEditing(null); setName(''); setNote(''); setActive(true); setError(''); setCreating(true) }
  const openEdit = (category: AdminCategory) => { setCreating(false); setEditing(category); setName(category.name); setNote(category.note); setActive(category.active); setError('') }
  const close = () => { setCreating(false); setEditing(null); setError('') }

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('Add a category name.'); return }
    if (editing) {
      commit({ ...state, categories: state.categories.map((category) => category.id === editing.id ? { ...category, name: trimmed, note: note.trim(), active } : category) })
    } else {
      const base = slug(trimmed) || 'category'
      const id = state.categories.some((category) => category.id === base) ? `${base}-${createId('x').slice(-4)}` : base
      commit({ ...state, categories: [...state.categories, { id, name: trimmed, note: note.trim(), active }] })
    }
    close()
  }

  const removeTarget = state.categories.find((category) => category.id === removeId)
  const used = removeTarget ? state.products.filter((product) => product.categoryId === removeTarget.id).length : 0

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <DeskHeader eyebrow="Catalog" title="Categories." lede="A paused category stays on file and leaves the counter until you turn it back on." action={<button type="button" className="primary-button" onClick={openCreate}>Add a category</button>} />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {state.categories.map((category) => {
          const count = state.products.filter((product) => product.categoryId === category.id).length
          return (
            <li key={category.id} className="dashboard-card flex min-w-0 flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-serif text-2xl text-[#4b332b]">{category.name}</h2>
                <span className={`status ${category.active ? 'status-ready-for-pickup' : 'status-completed'}`}>{category.active ? 'On the counter' : 'Paused'}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#806b60]">{category.note || 'No note yet.'}</p>
              <p className="mt-3 text-sm font-semibold text-[#5a4137]">{count === 1 ? '1 product' : `${count} products`}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="secondary-button" onClick={() => openEdit(category)}>Edit</button>
                <button type="button" className="secondary-button" onClick={() => setRemoveId(category.id)}>Remove</button>
              </div>
            </li>
          )
        })}
      </ul>
      {(creating || editing) && (
        <AdminDialog title={editing ? 'Edit category' : 'New category'} onClose={close}>
          <Field label="Name"><input value={name} onChange={(event) => setName(event.target.value)} className={controlClass} /></Field>
          <Field label="Note"><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className={`${controlClass} min-h-24 py-3`} /></Field>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#5a4137]">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-5 accent-[#c87968]" />
            Show on the counter
          </label>
          {error ? <p role="alert" className="text-sm leading-6 text-[#9b4d3c]">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={save}>Save category</button>
            <button type="button" className="secondary-button" onClick={close}>Cancel</button>
          </div>
        </AdminDialog>
      )}
      {removeTarget && (
        <AdminDialog title={`Remove ${removeTarget.name}?`} description={used > 0 ? `${used} product${used === 1 ? '' : 's'} still use this category. Move them before removing it.` : 'This only removes the empty category.'} onClose={() => setRemoveId(null)}>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="primary-button" disabled={used > 0} onClick={() => { commit({ ...state, categories: state.categories.filter((category) => category.id !== removeTarget.id) }); setRemoveId(null) }}>Remove</button>
            <button type="button" className="secondary-button" onClick={() => setRemoveId(null)}>Keep it</button>
          </div>
        </AdminDialog>
      )}
    </div>
  )
}
