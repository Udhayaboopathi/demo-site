'use client'

import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BakeryFooter, BakeryNavigation, products } from '@/components/bakery-navigation'
import { formatInr } from '@/lib/money'

const ORDER_KEY = 'crumb-bloom-order'
const categories = ['Cakes', 'Pastries', 'Bread', 'Cookies']

type OrderItem = { name: string; price: number; quantity: number; note?: string }
type Product = (typeof products)[number]

function lineKey(item: { name: string; note?: string }) {
  return `${item.name}::${item.note ?? ''}`
}

function readOrder(): OrderItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const record = item as Partial<OrderItem>
      if (typeof record.name !== 'string' || typeof record.price !== 'number' || typeof record.quantity !== 'number' || record.quantity <= 0) return []
      const note = typeof record.note === 'string' && record.note.trim() ? record.note.trim() : undefined
      return [{ name: record.name, price: record.price, quantity: record.quantity, ...(note ? { note } : {}) }]
    })
  } catch {
    return []
  }
}

function categoryId(category: string) {
  return category.toLowerCase().replace(/\s+/g, '-')
}

export default function MenuPage() {
  const [items, setItems] = useState<OrderItem[]>([])
  const [activeCategory, setActiveCategory] = useState(categoryId(categories[0]))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [placedTotal, setPlacedTotal] = useState<number | null>(null)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const grouped = useMemo(() => categories.map((category) => ({ category, items: products.filter((product) => product.category === category) })), [])
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  useEffect(() => { setItems(readOrder()) }, [])

  useEffect(() => {
    const sections = categories.map((category) => document.getElementById(categoryId(category))).filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target.id) setActiveCategory(visible.target.id)
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0.15, 0.4] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

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

  const save = (next: OrderItem[]) => {
    setItems(next)
    localStorage.setItem(ORDER_KEY, JSON.stringify(next))
    setPlacedTotal(null)
  }

  const addProduct = (product: Product, extra?: { note?: string; price: number }) => {
    const nextItem = { name: product.name, price: extra?.price ?? product.price, quantity: 1, ...(extra?.note ? { note: extra.note } : {}) }
    const key = lineKey(nextItem)
    save(items.some((item) => lineKey(item) === key) ? items.map((item) => lineKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item) : [...items, nextItem])
  }

  const updateQuantity = (key: string, delta: number) => save(items.map((item) => lineKey(item) === key ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0))

  const removeOne = (product: Product) => {
    const target = [...items].reverse().find((item) => item.name === product.name)
    if (target) updateQuantity(lineKey(target), -1)
  }

  const quantityOf = (name: string) => items.filter((item) => item.name === name).reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = () => {
    if (count === 0) return
    setPlacedTotal(total)
    setItems([])
    localStorage.setItem(ORDER_KEY, '[]')
  }

  const showCategory = (category: string) => {
    setActiveCategory(categoryId(category))
    document.getElementById(categoryId(category))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#3f2c25]">
      <BakeryNavigation />
      <div className="mx-auto grid w-full min-w-0 max-w-[1240px] gap-6 px-4 pb-28 pt-6 sm:px-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] md:items-start md:px-6 md:pb-16 md:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:px-8 xl:max-w-[1440px]">
        <section>
          <div className="eyebrow">Counter</div>
          <h1 className="mt-2 font-serif text-4xl tracking-[-.04em] text-[#402b24] sm:text-5xl">Today&apos;s menu</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#806b60] sm:text-base">Tap a product for details. Plus opens options when a product has them, then adds it to the order.</p>
          <div className="sticky top-[68px] z-10 -mx-4 mt-5 bg-[#fbf8f3]/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5 md:-ml-6 md:mr-0 md:pl-6 md:pr-0 lg:-ml-8 lg:pl-8">
            <nav className="flex gap-2 overflow-x-auto py-1" aria-label="Menu categories">
              {categories.map((category) => (
                <button key={category} type="button" aria-current={activeCategory === categoryId(category) ? 'true' : undefined} onClick={() => showCategory(category)} className={`category-pill min-h-11 ${activeCategory === categoryId(category) ? 'active' : ''}`}>{category}</button>
              ))}
            </nav>
          </div>
          <div className="mt-2 flex flex-col gap-8 @container">
            {grouped.map((group) => (
              <section key={group.category} id={categoryId(group.category)} className="scroll-mt-36">
                <h2 className="font-serif text-3xl text-[#4d332a]">{group.category}</h2>
                <ul className="mt-3 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 @min-[680px]:grid-cols-3 @min-[960px]:grid-cols-4">
                  {group.items.map((product) => {
                    const quantity = quantityOf(product.name)
                    return (
                      <li key={product.name} className="min-w-0">
                        <div className={`flex h-full flex-col rounded-[20px] border-2 bg-[#fffaf5] p-2.5 sm:p-3 ${quantity > 0 ? 'border-[#4c3830]' : 'border-[#eadfd5]'}`}>
                          <button type="button" onClick={() => setDetailProduct(product)} className="flex flex-1 flex-col text-left" aria-label={`View ${product.name}, ${formatInr(product.price)}`}>
                            <PhotoSlider images={product.images} label={product.name} />
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
              </section>
            ))}
          </div>
        </section>

        <OrderTicket
          items={items}
          count={count}
          total={total}
          placedTotal={placedTotal}
          sheetOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onUpdate={updateQuantity}
          onPlace={placeOrder}
          onNewOrder={() => setPlacedTotal(null)}
        />
      </div>

      {!sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#eadfd5] bg-[#fffaf5] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <button type="button" onClick={() => setSheetOpen(true)} className="flex min-h-11 w-full items-center justify-between rounded-full bg-[#4c3830] px-5 text-sm font-bold text-[#fff8f1]">
            <span>{count === 0 ? 'View order' : `${count} item${count > 1 ? 's' : ''}`}</span>
            <span>{formatInr(total)}</span>
          </button>
        </div>
      )}
      {detailProduct && (
        <ProductDetailsModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAdd={(note, price) => {
            addProduct(detailProduct, note ? { note, price } : undefined)
            setDetailProduct(null)
          }}
        />
      )}
      <BakeryFooter className="pb-28 md:pb-8" />
    </main>
  )
}

function OrderTicket({
  items,
  count,
  total,
  placedTotal,
  sheetOpen,
  onClose,
  onUpdate,
  onPlace,
  onNewOrder,
}: {
  items: OrderItem[]
  count: number
  total: number
  placedTotal: number | null
  sheetOpen: boolean
  onClose: () => void
  onUpdate: (key: string, delta: number) => void
  onPlace: () => void
  onNewOrder: () => void
}) {
  const mobileHeader = (
    <div className="mb-3 flex items-center justify-between md:hidden">
      <h2 className="font-serif text-2xl text-[#402b24]">Your order</h2>
      <button type="button" onClick={onClose} className="min-h-11 px-2 text-sm font-bold text-[#a95e4c]">Done</button>
    </div>
  )
  const renderBody = () => placedTotal !== null ? (
    <div className="rounded-[24px] border border-[#eadfd5] bg-[#fffaf5] p-6 text-center">
      <ShoppingBag className="mx-auto text-[#c87968]" size={28} />
      <h2 className="mt-4 font-serif text-3xl text-[#4d332a]">Order placed.</h2>
      <p className="mt-3 text-sm leading-6 text-[#806b60]">We&apos;ll have {formatInr(placedTotal)} ready at the Willow Street counter.</p>
      <button type="button" onClick={onNewOrder} className="primary-button mt-6">Start a new order</button>
    </div>
  ) : (
    <div className="flex min-h-0 w-full flex-col gap-4 md:h-full">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#eadfd5] bg-[#fffaf5] p-4 sm:p-5">
        <div className="hidden shrink-0 items-center justify-between md:flex">
          <h2 className="font-serif text-3xl text-[#402b24]">Your order</h2>
          <span className="text-sm text-[#a08476]">{count} item{count === 1 ? '' : 's'}</span>
        </div>
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="mx-auto text-[#c87968]" size={28} />
            <p className="mt-4 font-serif text-2xl text-[#4d332a]">The ticket is empty.</p>
            <p className="mt-2 text-sm leading-6 text-[#806b60]">Use plus on a product. Options open first when a product has them.</p>
          </div>
        ) : (
          <ul className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 max-md:max-h-[min(36dvh,360px)] md:mt-2">
            {items.map((item) => {
              const photo = products.find((product) => product.name === item.name)?.image
              return (
              <li key={lineKey(item)} className="flex items-center gap-2 border-b border-[#eadfd5] py-3 last:border-0 sm:gap-3">
                {photo ? <img src={photo} alt="" className="size-14 shrink-0 rounded-xl object-cover" /> : null}
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg leading-tight text-[#4b332b]">{item.name}</p>
                  {item.note && <p className="mt-1 text-sm leading-5 text-[#806b60]">{item.note}</p>}
                  <p className="mt-1 text-sm text-[#a08476]">{formatInr(item.price)} · {formatInr(item.price * item.quantity)}</p>
                </div>
                <button type="button" className="icon-button shrink-0" onClick={() => onUpdate(lineKey(item), -1)} aria-label={`Remove one ${item.name}`}><Minus size={16} /></button>
                <span className="w-6 shrink-0 text-center text-sm font-semibold">{item.quantity}</span>
                <button type="button" className="icon-button shrink-0" onClick={() => onUpdate(lineKey(item), 1)} aria-label={`Add one ${item.name}`}><Plus size={16} /></button>
              </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="shrink-0 rounded-[24px] bg-[#4c3830] p-5 text-[#fff8f1]">
        <p className="text-xs uppercase tracking-[.18em] text-[#e9b09f]">Pickup total</p>
        <p className="mt-2 font-serif text-4xl sm:text-5xl">{formatInr(total)}</p>
        <p className="mt-3 text-sm leading-6 text-[#dcc7b9]">We&apos;ll have your order ready at our Willow Street counter.</p>
        <button type="button" onClick={onPlace} disabled={count === 0} className="mt-5 min-h-11 w-full rounded-full bg-[#e8a390] px-5 py-3 text-sm font-bold text-[#4c3830] disabled:cursor-not-allowed disabled:opacity-50">Continue to pickup</button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="sticky top-24 z-20 hidden h-[calc(100dvh-7rem)] min-h-0 flex-col md:flex" aria-label="Point of sale">
        {renderBody()}
      </aside>
      {sheetOpen && (
        <>
          <button type="button" className="fixed inset-0 z-30 bg-[#3f2c25]/40 md:hidden" aria-label="Close order" onClick={onClose} />
          <aside className="fixed inset-x-0 bottom-0 z-40 flex max-h-[min(85dvh,720px)] flex-col overflow-hidden rounded-t-[28px] border border-[#eadfd5] bg-[#fbf8f3] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_#50372d24] md:hidden" aria-label="Point of sale">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#eadfd5]" />
            {mobileHeader}
            {renderBody()}
          </aside>
        </>
      )}
    </>
  )
}

function PhotoSlider({ images = [], label }: { images?: string[]; label: string }) {
  const [index, setIndex] = useState(0)
  const paused = useRef(false)
  const count = images.length

  useEffect(() => {
    if (count < 2) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return
    const delay = [...label].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2400
    const advance = () => setIndex((current) => (current + 1) % count)
    const start = window.setTimeout(() => {
      if (!paused.current && !document.hidden) advance()
    }, delay)
    const timer = window.setInterval(() => {
      if (paused.current || document.hidden) return
      advance()
    }, 3200)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(timer)
    }
  }, [count, label])

  return (
    <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-[#f3ebe4]" onMouseEnter={() => { paused.current = true }} onMouseLeave={() => { paused.current = false }}>
      {images.map((src, slide) => (
        <img key={`${label}-${slide}`} src={src} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${slide === index ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      {images.length > 1 && (
        <span className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5" aria-hidden="true">
          {images.map((_, slide) => <span key={slide} className={`h-1.5 rounded-full shadow-sm ${slide === index ? 'w-4 bg-white' : 'w-1.5 bg-white/75'}`} />)}
        </span>
      )}
    </span>
  )
}

function ProductDetailsModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (note: string, price: number) => void }) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#3f2c25]/45 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Close product details" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="product-details-title" className="relative z-10 max-h-[min(92dvh,820px)] w-full overflow-auto rounded-t-[28px] bg-[#fffaf5] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_#50372d24] sm:max-w-[520px] sm:rounded-[28px] sm:pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#ba715f]">{product.category}</p>
            <h2 id="product-details-title" className="mt-1 font-serif text-3xl leading-tight text-[#402b24]">{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="icon-button shrink-0" aria-label="Close"><X size={18} /></button>
        </div>
        <PhotoSlider images={product.images} label={product.name} />
        <p className="mt-4 text-sm leading-6 text-[#806b60]">{product.description}</p>
        <p className="mt-2 text-sm font-semibold text-[#b96654]">{formatInr(product.price)} · {product.tag}</p>
        {customization && <div className="mt-5 flex flex-col gap-5">
          {customization.groups.map((group) => (
            <fieldset key={group.id}>
              <legend className="text-sm font-bold text-[#5a4137]">{group.label}</legend>
              <div className={group.choices.every((choice) => choice.color) ? 'mt-2 flex flex-wrap gap-x-3 gap-y-3' : 'mt-2 flex flex-wrap gap-2'}>
                {group.choices.map((choice) => {
                  const active = selected[group.id] === choice.label
                  const adjustment = choice.price === 0 ? '' : choice.price > 0 ? ` +${formatInr(choice.price)}` : ` −${formatInr(Math.abs(choice.price))}`
                  if (choice.color) {
                    return (
                      <label key={choice.label} className="flex min-h-11 min-w-11 cursor-pointer flex-col items-center gap-1 rounded-xl px-1 py-1 text-center focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#c87968]">
                        <input type="radio" className="sr-only" name={group.id} value={choice.label} checked={active} onChange={() => setSelected((current) => ({ ...current, [group.id]: choice.label }))} />
                        <span className={`flex size-11 items-center justify-center rounded-full border-2 ${active ? 'border-[#4c3830] outline outline-2 outline-offset-2 outline-[#4c3830]' : 'border-white shadow-[inset_0_0_0_1px_#c8b5a6]'}`} style={{ backgroundColor: choice.color }} aria-hidden="true">
                          {active && <span className="size-2.5 rounded-full bg-white shadow-[0_0_0_1px_#4c3830]" />}
                        </span>
                        <span className={`max-w-16 text-xs font-semibold leading-4 ${active ? 'text-[#4c3830]' : 'text-[#73594d]'}`}>{choice.label}</span>
                      </label>
                    )
                  }
                  return (
                    <label key={choice.label} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#c87968] ${active ? 'border-[#c87968] bg-[#c87968] text-white' : 'border-[#e4d7cc] bg-transparent text-[#73594d]'}`}>
                      <input type="radio" className="sr-only" name={group.id} value={choice.label} checked={active} onChange={() => setSelected((current) => ({ ...current, [group.id]: choice.label }))} />
                      {choice.label}{adjustment}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}
          {customization.message && (
            <label className="block">
              <span className="text-sm font-bold text-[#5a4137]">{customization.message.label}</span>
              <input value={message} maxLength={customization.message.maxLength} placeholder={customization.message.placeholder} onChange={(event) => setMessage(event.target.value)} className="mt-2 w-full min-h-11 rounded-2xl border border-[#e4d7cc] bg-white px-4 text-base text-[#3f2c25] outline-none focus-visible:border-[#c87968]" />
            </label>
          )}
        </div>}
        <button type="button" onClick={() => onAdd(note, price)} className="primary-button mt-6 w-full justify-center">Add to order · {formatInr(price)}</button>
      </div>
    </div>
  )
}
