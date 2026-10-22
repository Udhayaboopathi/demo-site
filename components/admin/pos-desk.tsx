'use client'

import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createId, nextOrderNumber, useAdminState, type AdminOrderItem, type AdminProduct } from '@/components/admin/store'
import { formatInr } from '@/lib/money'

function lineKey(item: { name: string; note?: string }) {
  return `${item.name}::${item.note ?? ''}`
}

export function PosDesk() {
  const { state, commit } = useAdminState()
  const [items, setItems] = useState<AdminOrderItem[]>([])
  const [customer, setCustomer] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [placed, setPlaced] = useState<{ number: string; total: number } | null>(null)
  const [detailProduct, setDetailProduct] = useState<AdminProduct | null>(null)

  const categories = useMemo(() => state?.categories.filter((category) => category.active) ?? [], [state])
  const grouped = useMemo(() => categories.map((category) => ({
    category,
    items: (state?.products ?? []).filter((product) => product.available && product.categoryId === category.id),
  })), [categories, state])

  useEffect(() => {
    if (!activeCategory && categories[0]) setActiveCategory(categories[0].id)
  }, [activeCategory, categories])

  useEffect(() => {
    const sections = categories.map((category) => document.getElementById(`pos-${category.id}`)).filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target.id) setActiveCategory(visible.target.id.replace(/^pos-/, ''))
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0.15, 0.4] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [categories])

  useEffect(() => {
    document.body.style.overflow = sheetOpen || detailProduct ? 'hidden' : ''
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (detailProduct) setDetailProduct(null)
      else setSheetOpen(false)
    }
    if (sheetOpen || detailProduct) window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen, detailProduct])

  if (!state) return <p className="text-sm text-[#806b60]">Opening the counter…</p>

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const quantityOf = (name: string) => items.filter((item) => item.name === name).reduce((sum, item) => sum + item.quantity, 0)

  const save = (next: AdminOrderItem[]) => {
    setItems(next)
    setPlaced(null)
  }

  const addProduct = (product: AdminProduct, extra?: { note?: string; price: number }) => {
    const nextItem = { name: product.name, price: extra?.price ?? product.price, quantity: 1, ...(extra?.note ? { note: extra.note } : {}) }
    const key = lineKey(nextItem)
    save(items.some((item) => lineKey(item) === key) ? items.map((item) => lineKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item) : [...items, nextItem])
  }

  const updateQuantity = (key: string, delta: number) => save(items.map((item) => lineKey(item) === key ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0))

  const removeOne = (product: AdminProduct) => {
    const target = [...items].reverse().find((item) => item.name === product.name)
    if (target) updateQuantity(lineKey(target), -1)
  }

  const placeOrder = () => {
    if (count === 0) return
    const order = {
      id: createId('ord'),
      number: nextOrderNumber(state),
      createdAt: new Date().toISOString(),
      customer: customer.trim() || 'Walk-in',
      channel: 'counter' as const,
      status: 'pending' as const,
      items,
    }
    commit({ ...state, orders: [order, ...state.orders] })
    setPlaced({ number: order.number, total })
    setItems([])
    setCustomer('')
    setSheetOpen(false)
  }

  const showCategory = (id: string) => {
    setActiveCategory(id)
    document.getElementById(`pos-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-[1440px] gap-6 pb-28 md:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] md:items-start md:pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
      <section>
        <p className="eyebrow">Counter</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-.04em] text-[#402b24] sm:text-5xl">New order</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#806b60] sm:text-base">Same case as the menu. Plus opens options when a product has them, then adds it to the ticket.</p>
        <div className="sticky top-[68px] z-10 -mx-4 mt-5 bg-[#fbf8f3]/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 md:top-0 md:mx-0 md:px-0">
          <nav className="flex gap-2 overflow-x-auto py-1" aria-label="Counter categories">
            {categories.map((category) => (
              <button key={category.id} type="button" aria-current={activeCategory === category.id ? 'true' : undefined} onClick={() => showCategory(category.id)} className={`category-pill min-h-11 ${activeCategory === category.id ? 'active' : ''}`}>{category.name}</button>
            ))}
          </nav>
        </div>
        <div className="mt-2 flex flex-col gap-8 @container">
          {grouped.map((group) => (
            <section key={group.category.id} id={`pos-${group.category.id}`} className="scroll-mt-36">
              <h2 className="font-serif text-3xl text-[#4d332a]">{group.category.name}</h2>
              {group.items.length === 0 ? <p className="mt-3 text-sm text-[#806b60]">Nothing from this category is on the counter.</p> : (
                <ul className="mt-3 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 @min-[680px]:grid-cols-3 @min-[960px]:grid-cols-4">
                  {group.items.map((product) => {
                    const quantity = quantityOf(product.name)
                    return (
                      <li key={product.id} className="min-w-0">
                        <div className={`flex h-full flex-col rounded-[20px] border-2 bg-[#fffaf5] p-2.5 sm:p-3 ${quantity > 0 ? 'border-[#4c3830]' : 'border-[#eadfd5]'}`}>
                          <button type="button" onClick={() => setDetailProduct(product)} className="flex flex-1 flex-col text-left" aria-label={`View ${product.name}, ${formatInr(product.price)}`}>
                            <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-[#f3ebe4]"><img src={product.image} alt="" className="h-full w-full object-cover" /></span>
                            <span className="mt-2 block font-serif text-base leading-tight text-[#4b332b] sm:text-lg">{product.name}</span>
                            <span className="mt-1 block text-xs text-[#a08476]">{product.customization ? `${product.tag} · Options` : product.tag}</span>
                          </button>
                          <span className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                            <span className="text-sm font-semibold text-[#b96654]">{formatInr(product.price)}</span>
                            <span className="ml-auto flex shrink-0 items-center gap-1">
                              {quantity > 0 && <button type="button" onClick={() => removeOne(product)} className="flex size-11 items-center justify-center rounded-full border border-[#4c3830] text-[#4c3830]" aria-label={`Remove one ${product.name}`}><Minus size={18} /></button>}
                              {quantity > 0 && <span className="w-6 text-center text-sm font-semibold">{quantity}</span>}
                              <button type="button" onClick={() => product.customization ? setDetailProduct(product) : addProduct(product)} className="flex size-11 items-center justify-center rounded-full bg-[#c87968] text-[#fffaf5]" aria-label={product.customization ? `Customize ${product.name}` : `Add ${product.name}`}><Plus size={18} /></button>
                            </span>
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </section>
      <Ticket items={items} count={count} total={total} customer={customer} placed={placed} sheetOpen={sheetOpen} onCustomer={setCustomer} onClose={() => setSheetOpen(false)} onUpdate={updateQuantity} onPlace={placeOrder} onNew={() => setPlaced(null)} />
      {!sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eadfd5] bg-[#fffaf5] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <button type="button" onClick={() => setSheetOpen(true)} className="flex min-h-11 w-full items-center justify-between rounded-full bg-[#4c3830] px-5 text-sm font-bold text-[#fff8f1]">
            <span>{count === 0 ? 'View ticket' : `${count} item${count > 1 ? 's' : ''}`}</span>
            <span>{formatInr(total)}</span>
          </button>
        </div>
      )}
      {detailProduct && (
        <ProductDialog product={detailProduct} onClose={() => setDetailProduct(null)} onAdd={(note, price) => { addProduct(detailProduct, note ? { note, price } : undefined); setDetailProduct(null) }} />
      )}
    </div>
  )
}

function Ticket({
  items, count, total, customer, placed, sheetOpen, onCustomer, onClose, onUpdate, onPlace, onNew,
}: {
  items: AdminOrderItem[]
  count: number
  total: number
  customer: string
  placed: { number: string; total: number } | null
  sheetOpen: boolean
  onCustomer: (value: string) => void
  onClose: () => void
  onUpdate: (key: string, delta: number) => void
  onPlace: () => void
  onNew: () => void
}) {
  const body = placed ? (
    <div className="rounded-[24px] border border-[#eadfd5] bg-[#fffaf5] p-6 text-center">
      <ShoppingBag className="mx-auto text-[#c87968]" size={28} />
      <h2 className="mt-4 font-serif text-3xl text-[#4d332a]">Ticket {placed.number}</h2>
      <p className="mt-3 text-sm leading-6 text-[#806b60]">{formatInr(placed.total)} is pending for the kitchen.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onNew} className="primary-button">Start another</button>
        <a href="/admin/orders/pending" className="secondary-button">See pending</a>
      </div>
    </div>
  ) : (
    <div className="flex min-h-0 w-full flex-col gap-4 md:h-full">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#eadfd5] bg-[#fffaf5] p-4 sm:p-5">
        <div className="hidden shrink-0 items-center justify-between md:flex">
          <h2 className="font-serif text-3xl text-[#402b24]">Ticket</h2>
          <span className="text-sm text-[#a08476]">{count === 1 ? '1 item' : `${count} items`}</span>
        </div>
        <label className="mt-3 block text-sm font-semibold text-[#5a4137] md:mt-4">
          Name on the ticket
          <input value={customer} onChange={(event) => onCustomer(event.target.value)} placeholder="Walk-in" className="mt-2 w-full min-h-11 rounded-2xl border border-[#eadfd5] bg-white px-4 text-base text-[#3f2c25] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c87968]" />
        </label>
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="mx-auto text-[#c87968]" size={28} />
            <p className="mt-4 font-serif text-2xl text-[#4d332a]">The ticket is empty.</p>
            <p className="mt-2 text-sm leading-6 text-[#806b60]">Use plus on a product. Options open first when a product has them.</p>
          </div>
        ) : (
          <ul className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 max-md:max-h-[min(36dvh,360px)]">
            {items.map((item) => (
              <li key={lineKey(item)} className="flex items-center gap-2 border-b border-[#eadfd5] py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg leading-tight text-[#4b332b]">{item.name}</p>
                  {item.note && <p className="mt-1 text-sm leading-5 text-[#806b60]">{item.note}</p>}
                  <p className="mt-1 text-sm text-[#a08476]">{formatInr(item.price)} · {formatInr(item.price * item.quantity)}</p>
                </div>
                <button type="button" className="icon-button shrink-0" onClick={() => onUpdate(lineKey(item), -1)} aria-label={`Remove one ${item.name}`}><Minus size={16} /></button>
                <span className="w-6 shrink-0 text-center text-sm font-semibold">{item.quantity}</span>
                <button type="button" className="icon-button shrink-0" onClick={() => onUpdate(lineKey(item), 1)} aria-label={`Add one ${item.name}`}><Plus size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="shrink-0 rounded-[24px] bg-[#4c3830] p-5 text-[#fff8f1]">
        <p className="text-xs uppercase tracking-[.18em] text-[#e9b09f]">Ticket total</p>
        <p className="mt-2 font-serif text-4xl sm:text-5xl">{formatInr(total)}</p>
        <p className="mt-3 text-sm leading-6 text-[#dcc7b9]">Sending it marks the ticket pending for the kitchen.</p>
        <button type="button" onClick={onPlace} disabled={count === 0} className="mt-5 min-h-11 w-full rounded-full bg-[#e8a390] px-5 py-3 text-sm font-bold text-[#4c3830] disabled:cursor-not-allowed disabled:opacity-50">Send to kitchen</button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="sticky top-4 z-20 hidden h-[calc(100dvh-2rem)] min-h-0 flex-col md:flex" aria-label="Point of sale">{body}</aside>
      {sheetOpen && (
        <>
          <button type="button" className="fixed inset-0 z-30 bg-[#3f2c25]/40 md:hidden" aria-label="Close ticket" onClick={onClose} />
          <aside className="fixed inset-x-0 bottom-0 z-40 flex max-h-[min(85dvh,720px)] flex-col overflow-hidden rounded-t-[28px] border border-[#eadfd5] bg-[#fbf8f3] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden" aria-label="Point of sale">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#eadfd5]" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-[#402b24]">Ticket</h2>
              <button type="button" onClick={onClose} className="min-h-11 px-2 text-sm font-bold text-[#a95e4c]">Done</button>
            </div>
            {body}
          </aside>
        </>
      )}
    </>
  )
}

function ProductDialog({ product, onClose, onAdd }: { product: AdminProduct; onClose: () => void; onAdd: (note: string, price: number) => void }) {
  const customization = product.customization
  const [selected, setSelected] = useState<Record<string, string>>(() => Object.fromEntries((customization?.groups ?? []).map((group) => [group.id, group.choices.find((choice) => choice.price === 0)?.label ?? group.choices[0].label])))
  const [message, setMessage] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const price = Math.max(0, product.price + (customization?.groups ?? []).reduce((sum, group) => sum + (group.choices.find((choice) => choice.label === selected[group.id])?.price ?? 0), 0))
  const note = customization ? [...customization.groups.map((group) => selected[group.id]), message.trim() ? `“${message.trim()}”` : ''].filter(Boolean).join(' · ') : ''

  useEffect(() => {
    const dialog = dialogRef.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () => dialog ? [...dialog.querySelectorAll<HTMLElement>('button, input, textarea')].filter((element) => !element.hasAttribute('disabled')) : []
    focusable()[0]?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialog) return
      const controls = focusable()
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#3f2c25]/45 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Close product details" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pos-product-title" className="relative z-10 max-h-[min(92dvh,820px)] w-full overflow-auto rounded-t-[28px] bg-[#fffaf5] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-[520px] sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#ba715f]">{product.tag}</p>
            <h2 id="pos-product-title" className="mt-1 font-serif text-3xl leading-tight text-[#402b24]">{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="icon-button shrink-0" aria-label="Close"><X size={18} /></button>
        </div>
        <img src={product.image} alt="" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" />
        <p className="mt-4 text-sm leading-6 text-[#806b60]">{product.description}</p>
        <p className="mt-2 text-sm font-semibold text-[#b96654]">{formatInr(product.price)}</p>
        {customization && (
          <div className="mt-5 flex flex-col gap-5">
            {customization.groups.map((group) => (
              <fieldset key={group.id}>
                <legend className="text-sm font-bold text-[#5a4137]">{group.label}</legend>
                <div className={group.choices.every((choice) => choice.color) ? 'mt-2 flex flex-wrap gap-3' : 'mt-2 flex flex-wrap gap-2'}>
                  {group.choices.map((choice) => {
                    const active = selected[group.id] === choice.label
                    const adjustment = choice.price === 0 ? '' : choice.price > 0 ? ` +${formatInr(choice.price)}` : ` −${formatInr(Math.abs(choice.price))}`
                    if (choice.color) {
                      return (
                        <label key={choice.label} className="flex min-h-11 min-w-11 cursor-pointer flex-col items-center gap-1 rounded-xl px-1 py-1 text-center">
                          <input type="radio" className="sr-only" name={group.id} value={choice.label} checked={active} onChange={() => setSelected((current) => ({ ...current, [group.id]: choice.label }))} />
                          <span className={`size-11 rounded-full border-2 ${active ? 'border-[#4c3830] outline outline-2 outline-offset-2 outline-[#4c3830]' : 'border-white shadow-[inset_0_0_0_1px_#c8b5a6]'}`} style={{ backgroundColor: choice.color }} />
                          <span className="max-w-16 text-xs font-semibold leading-4">{choice.label}</span>
                        </label>
                      )
                    }
                    return (
                      <label key={choice.label} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold ${active ? 'border-[#c87968] bg-[#c87968] text-white' : 'border-[#e4d7cc] text-[#73594d]'}`}>
                        <input type="radio" className="sr-only" name={group.id} value={choice.label} checked={active} onChange={() => setSelected((current) => ({ ...current, [group.id]: choice.label }))} />
                        {choice.label}{adjustment}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ))}
            {customization.message && (
              <label className="block text-sm font-bold text-[#5a4137]">
                {customization.message.label}
                <input value={message} maxLength={customization.message.maxLength} placeholder={customization.message.placeholder} onChange={(event) => setMessage(event.target.value)} className="mt-2 w-full min-h-11 rounded-2xl border border-[#e4d7cc] bg-white px-4 text-base font-normal text-[#3f2c25]" />
              </label>
            )}
          </div>
        )}
        <button type="button" onClick={() => onAdd(note, price)} className="primary-button mt-6 w-full justify-center">Add to ticket · {formatInr(price)}</button>
      </div>
    </div>
  )
}
