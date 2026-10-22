'use client'

import { Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminDialog, controlClass, DeskHeader, Field } from '@/components/admin/admin-dialog'
import { createId, useAdminState, type AdminProduct } from '@/components/admin/store'
import type { ProductCustomization } from '@/components/bakery-navigation'
import { formatInr } from '@/lib/money'

const placeholder = 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80'

type ChoiceDraft = { label: string; price: string; color: string }
type GroupDraft = { id: string; label: string; choices: ChoiceDraft[] }
type Draft = {
  name: string
  categoryId: string
  price: string
  tag: string
  description: string
  available: boolean
  optionsOn: boolean
  groups: GroupDraft[]
  messageOn: boolean
  messageLabel: string
  messagePlaceholder: string
  messageLimit: string
}

function blankChoice(): ChoiceDraft {
  return { label: '', price: '0', color: '' }
}

function blankGroup(): GroupDraft {
  return { id: createId('opt'), label: '', choices: [blankChoice()] }
}

const emptyDraft: Draft = {
  name: '',
  categoryId: '',
  price: '',
  tag: '',
  description: '',
  available: true,
  optionsOn: false,
  groups: [],
  messageOn: false,
  messageLabel: 'Inscription',
  messagePlaceholder: 'Happy birthday',
  messageLimit: '40',
}

function draftFromProduct(product: AdminProduct): Draft {
  const options = product.customization
  return {
    name: product.name,
    categoryId: product.categoryId,
    price: String(product.price),
    tag: product.tag,
    description: product.description,
    available: product.available,
    optionsOn: Boolean(options?.groups.length),
    groups: options?.groups.map((group) => ({
      id: group.id,
      label: group.label,
      choices: group.choices.map((choice) => ({ label: choice.label, price: String(choice.price), color: choice.color ?? '' })),
    })) ?? [],
    messageOn: Boolean(options?.message),
    messageLabel: options?.message?.label ?? 'Inscription',
    messagePlaceholder: options?.message?.placeholder ?? 'Happy birthday',
    messageLimit: String(options?.message?.maxLength ?? 40),
  }
}

export function ProductsDesk() {
  const { state, commit } = useAdminState()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [removeId, setRemoveId] = useState<string | null>(null)

  const visible = useMemo(() => {
    if (!state) return []
    const needle = query.trim().toLowerCase()
    return state.products.filter((product) => {
      const categoryOk = categoryId === 'all' || product.categoryId === categoryId
      const text = `${product.name} ${product.tag} ${product.description}`.toLowerCase()
      return categoryOk && (!needle || text.includes(needle))
    })
  }, [state, query, categoryId])

  if (!state) return <p className="text-sm text-[#806b60]">Opening products…</p>

  const categoryName = (id: string) => state.categories.find((category) => category.id === id)?.name ?? 'Unfiled'

  const openCreate = () => {
    setEditing(null)
    setError('')
    setDraft({ ...emptyDraft, categoryId: state.categories[0]?.id ?? '' })
    setCreating(true)
  }

  const openEdit = (product: AdminProduct) => {
    setCreating(false)
    setError('')
    setEditing(product)
    setDraft(draftFromProduct(product))
  }

  const closeForm = () => { setCreating(false); setEditing(null); setError('') }

  const updateGroup = (groupId: string, patch: Partial<GroupDraft>) => {
    setDraft((current) => ({ ...current, groups: current.groups.map((group) => group.id === groupId ? { ...group, ...patch } : group) }))
  }

  const updateChoice = (groupId: string, index: number, patch: Partial<ChoiceDraft>) => {
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group) => group.id === groupId ? { ...group, choices: group.choices.map((choice, choiceIndex) => choiceIndex === index ? { ...choice, ...patch } : choice) } : group),
    }))
  }

  const save = () => {
    const name = draft.name.trim()
    const price = Number(draft.price)
    if (!name) { setError('Add a product name.'); return }
    if (!draft.categoryId) { setError('Choose a category first.'); return }
    if (!Number.isFinite(price) || price < 0) { setError('Enter a price of zero or more.'); return }
    let customization: ProductCustomization | undefined
    if (draft.optionsOn) {
      const groups: ProductCustomization['groups'] = []
      for (const group of draft.groups) {
        const label = group.label.trim()
        if (!label) { setError('Name each option group, or remove the empty one.'); return }
        const choices: ProductCustomization['groups'][number]['choices'] = []
        for (const choice of group.choices) {
          const choiceLabel = choice.label.trim()
          if (!choiceLabel) continue
          const change = choice.price.trim() === '' ? 0 : Number(choice.price)
          if (!Number.isFinite(change)) { setError(`Enter a price change for ${choiceLabel}.`); return }
          const color = choice.color.trim()
          if (color && !/^#[0-9a-f]{6}$/i.test(color)) { setError(`Use a hex color for ${choiceLabel}, like #e8a598.`); return }
          choices.push({ label: choiceLabel, price: change, ...(color ? { color } : {}) })
        }
        if (!choices.length) { setError(`${label} needs at least one choice.`); return }
        groups.push({ id: group.id, label, choices })
      }
      if (!groups.length) { setError('Add an option group, or turn choices off.'); return }
      if (draft.messageOn) {
        const messageLabel = draft.messageLabel.trim()
        const maxLength = Number(draft.messageLimit)
        if (!messageLabel) { setError('Name the message field, or turn it off.'); return }
        if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 80) { setError('Set the message limit between 1 and 80 characters.'); return }
        customization = { groups, message: { label: messageLabel, placeholder: draft.messagePlaceholder.trim() || 'Add a note', maxLength } }
      } else {
        customization = { groups }
      }
    }
    const fields = {
      name,
      categoryId: draft.categoryId,
      price,
      tag: draft.tag.trim() || 'House',
      description: draft.description.trim(),
      available: draft.available,
      ...(customization ? { customization } : {}),
    }
    const next: AdminProduct = editing
      ? { ...editing, ...fields, ...(customization ? {} : { customization: undefined }) }
      : { id: createId('prd'), image: placeholder, images: [placeholder], ...fields }
    commit({ ...state, products: editing ? state.products.map((product) => product.id === editing.id ? next : product) : [...state.products, next] })
    closeForm()
  }

  const formOpen = creating || editing !== null

  return (
    <div className="@container mx-auto w-full max-w-[1280px]">
      <DeskHeader eyebrow="Catalog" title="Products." lede="Prices and names here are what the counter uses for a new order." action={<button type="button" className="primary-button" onClick={openCreate}>Add a product</button>} />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search products</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the case" className={controlClass} />
        </label>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto py-1" role="group" aria-label="Filter by category">
        <button type="button" className={`category-pill ${categoryId === 'all' ? 'active' : ''}`} onClick={() => setCategoryId('all')}>All</button>
        {state.categories.map((category) => (
          <button key={category.id} type="button" className={`category-pill ${categoryId === category.id ? 'active' : ''}`} onClick={() => setCategoryId(category.id)}>{category.name}</button>
        ))}
      </div>
      {visible.length === 0 ? <p className="mt-8 rounded-[20px] border border-[#eadfd5] bg-[#fffaf5] p-6 text-sm leading-6 text-[#806b60]">No products match. Clear the search or add one.</p> : (
        <ul className="mt-6 grid gap-4 @min-[520px]:grid-cols-2 @min-[860px]:grid-cols-3">
          {visible.map((product) => (
            <li key={product.id} className="dashboard-card flex min-w-0 flex-col">
              <div className="flex min-w-0 items-start gap-3">
                <img src={product.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xl leading-tight text-[#4b332b]">{product.name}</p>
                  <p className="mt-1 text-sm leading-5 text-[#806b60]">{categoryName(product.categoryId)} · {product.tag}{product.customization ? ` · ${product.customization.groups.length} ${product.customization.groups.length === 1 ? 'option' : 'options'}` : ''}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#b96654]">{formatInr(product.price)}</p>
                <span className={`status ${product.available ? 'status-ready-for-pickup' : 'status-completed'}`}>{product.available ? 'On the menu' : 'Hidden'}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eadfd5] pt-4">
                <button type="button" className="secondary-button" onClick={() => openEdit(product)}>Edit</button>
                <button type="button" className="secondary-button" onClick={() => setRemoveId(product.id)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {formOpen && (
        <AdminDialog title={editing ? 'Edit product' : 'New product'} description="Hidden products stay in the desk and drop off the counter. Choices here are what the counter offers." wide onClose={closeForm}>
          <Field label="Name"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={controlClass} required /></Field>
          <Field label="Category">
            <select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} className={controlClass}>
              {state.categories.length === 0 ? <option value="">No categories yet</option> : state.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price"><input value={draft.price} inputMode="decimal" onChange={(event) => setDraft({ ...draft, price: event.target.value })} className={controlClass} /></Field>
            <Field label="Tag"><input value={draft.tag} onChange={(event) => setDraft({ ...draft, tag: event.target.value })} className={controlClass} placeholder="Seasonal" /></Field>
          </div>
          <Field label="Description"><textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} className={`${controlClass} min-h-24 py-3`} /></Field>
          <fieldset className="rounded-[20px] border border-[#eadfd5] p-4">
            <legend className="px-1 text-xs font-bold uppercase tracking-[.16em] text-[#ba715f]">Options</legend>
            <label className="mt-2 flex min-h-11 items-center gap-3 text-sm font-semibold text-[#5a4137]">
              <input type="checkbox" checked={draft.optionsOn} onChange={(event) => {
                const optionsOn = event.target.checked
                setDraft((current) => ({ ...current, optionsOn, groups: optionsOn && current.groups.length === 0 ? [blankGroup()] : current.groups }))
              }} className="size-5 accent-[#c87968]" />
              Offer choices at the counter
            </label>
            {draft.optionsOn ? (
              <div className="mt-4 flex flex-col gap-4">
                <p className="text-sm leading-6 text-[#806b60]">Each choice can change the price. Use a minus for a smaller size. A swatch is optional.</p>
                {draft.groups.map((group) => (
                  <div key={group.id} className="rounded-2xl bg-[#f7f1ea] p-3">
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Field label="Option group"><input value={group.label} placeholder="Size" onChange={(event) => updateGroup(group.id, { label: event.target.value })} className={controlClass} /></Field>
                      </div>
                      <button type="button" className="secondary-button" onClick={() => setDraft((current) => ({ ...current, groups: current.groups.filter((item) => item.id !== group.id) }))}>Remove</button>
                    </div>
                    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_5.5rem_2.75rem] gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#a08476]">
                      <span>Choice</span><span>Change</span><span className="sr-only">Remove</span>
                    </div>
                    <div className="mt-2 flex flex-col gap-3">
                      {group.choices.map((choice, index) => (
                        <div key={`${group.id}-${index}`} className="flex flex-col gap-2">
                          <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_2.75rem] items-center gap-2">
                            <input aria-label={`${group.label || 'Option'} choice ${index + 1}`} value={choice.label} placeholder="8 inch" onChange={(event) => updateChoice(group.id, index, { label: event.target.value })} className={controlClass} />
                            <input aria-label={`${choice.label || 'Choice'} price change`} inputMode="decimal" value={choice.price} placeholder="0" onChange={(event) => updateChoice(group.id, index, { price: event.target.value })} className={controlClass} />
                            <button type="button" className="icon-button" aria-label={`Remove ${choice.label || 'choice'}`} disabled={group.choices.length === 1} onClick={() => updateGroup(group.id, { choices: group.choices.filter((_, choiceIndex) => choiceIndex !== index) })}><X size={16} /></button>
                          </div>
                          {choice.color ? (
                            <div className="flex items-center gap-2">
                              <input type="color" aria-label={`${choice.label || 'Choice'} swatch`} value={/^#[0-9a-f]{6}$/i.test(choice.color) ? choice.color : '#f4ead8'} onChange={(event) => updateChoice(group.id, index, { color: event.target.value })} className="size-11 shrink-0 cursor-pointer rounded-xl border border-[#e4d7cc] bg-white p-1" />
                              <input aria-label={`${choice.label || 'Choice'} color`} value={choice.color} onChange={(event) => updateChoice(group.id, index, { color: event.target.value })} className={controlClass} />
                              <button type="button" className="text-link shrink-0 text-sm" onClick={() => updateChoice(group.id, index, { color: '' })}>No swatch</button>
                            </div>
                          ) : (
                            <button type="button" className="text-link self-start text-sm" onClick={() => updateChoice(group.id, index, { color: '#f4ead8' })}>Add a color swatch</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" className="secondary-button mt-3" onClick={() => updateGroup(group.id, { choices: [...group.choices, blankChoice()] })}><Plus size={16} /> Add a choice</button>
                  </div>
                ))}
                <button type="button" className="secondary-button" onClick={() => setDraft((current) => ({ ...current, groups: [...current.groups, blankGroup()] }))}><Plus size={16} /> Add an option group</button>
                <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#5a4137]">
                  <input type="checkbox" checked={draft.messageOn} onChange={(event) => setDraft((current) => ({ ...current, messageOn: event.target.checked }))} className="size-5 accent-[#c87968]" />
                  Ask for a message
                </label>
                {draft.messageOn ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Message label"><input value={draft.messageLabel} onChange={(event) => setDraft((current) => ({ ...current, messageLabel: event.target.value }))} className={controlClass} placeholder="Inscription" /></Field>
                    <Field label="Character limit"><input value={draft.messageLimit} inputMode="numeric" onChange={(event) => setDraft((current) => ({ ...current, messageLimit: event.target.value }))} className={controlClass} /></Field>
                    <div className="sm:col-span-2">
                      <Field label="Example"><input value={draft.messagePlaceholder} onChange={(event) => setDraft((current) => ({ ...current, messagePlaceholder: event.target.value }))} className={controlClass} placeholder="Happy birthday" /></Field>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </fieldset>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#5a4137]">
            <input type="checkbox" checked={draft.available} onChange={(event) => setDraft({ ...draft, available: event.target.checked })} className="size-5 accent-[#c87968]" />
            Show on the counter
          </label>
          {error ? <p role="alert" className="text-sm leading-6 text-[#9b4d3c]">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={save}>Save product</button>
            <button type="button" className="secondary-button" onClick={closeForm}>Cancel</button>
          </div>
        </AdminDialog>
      )}
      {removeId && (
        <AdminDialog title="Remove this product?" description="Past tickets keep the name. The counter will no longer offer it." onClose={() => setRemoveId(null)}>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={() => { commit({ ...state, products: state.products.filter((product) => product.id !== removeId) }); setRemoveId(null) }}>Remove</button>
            <button type="button" className="secondary-button" onClick={() => setRemoveId(null)}>Keep it</button>
          </div>
        </AdminDialog>
      )}
    </div>
  )
}
