'use client'

import { X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DeskHeader, controlClass } from '@/components/admin/admin-dialog'
import { formatWhen, nextOrderStatus, orderStatusLabel, orderTotal, useAdminState, type AdminOrder, type OrderStatus } from '@/components/admin/store'
import { formatInr } from '@/lib/money'

const pageSize = 4

const filters: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Completed' },
]

const statusClass: Record<OrderStatus, string> = {
  pending: 'status-confirmed',
  preparing: 'status-preparing',
  ready: 'status-ready-for-pickup',
  completed: 'status-completed',
}

export function OrdersDesk({ scope }: { scope: 'all' | 'pending' }) {
  const { state, commit } = useAdminState()
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const orders = useMemo(() => {
    if (!state) return []
    const needle = query.trim().toLowerCase()
    return state.orders.filter((order) => {
      if (scope === 'pending' && order.status === 'completed') return false
      if (scope === 'all' && filter !== 'all' && order.status !== filter) return false
      const text = `${order.number} ${order.customer} ${order.items.map((item) => item.name).join(' ')}`.toLowerCase()
      return !needle || text.includes(needle)
    })
  }, [state, query, filter, scope])
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const pageRows = orders.slice(pageStart, pageStart + pageSize)
  const selected = state?.orders.find((order) => order.id === selectedId) ?? null

  useEffect(() => { setPage(1) }, [query, filter, scope])

  if (!state) return <p className="text-sm text-[#806b60]">Opening orders…</p>

  const advance = (id: string) => {
    commit({
      ...state,
      orders: state.orders.map((order) => {
        const next = nextOrderStatus[order.status]
        return order.id === id && next ? { ...order, status: next } : order
      }),
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <DeskHeader
        eyebrow="Orders"
        title={scope === 'pending' ? 'Pending orders.' : 'All orders.'}
        lede={scope === 'pending' ? 'Tickets that are still pending, in the oven, or waiting for pickup.' : 'Counter tickets and online tickets, including the ones already picked up.'}
        action={<a href="/admin/orders/pos" className="primary-button">New counter order</a>}
      />
      <label className="mt-6 block">
        <span className="sr-only">Search orders</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a name or ticket" className={controlClass} />
      </label>
      {scope === 'all' && (
        <div className="mt-3 flex gap-2 overflow-x-auto py-1" role="group" aria-label="Filter orders">
          {filters.map((item) => (
            <button key={item.id} type="button" className={`category-pill ${filter === item.id ? 'active' : ''}`} onClick={() => setFilter(item.id)}>{item.label}</button>
          ))}
        </div>
      )}
      {orders.length === 0 ? (
        <p className="mt-8 rounded-[20px] border border-[#eadfd5] bg-[#fffaf5] p-6 text-sm leading-6 text-[#806b60]">No tickets here. <a href="/admin/orders/pos" className="font-bold text-[#a95e4c] underline underline-offset-4">Start one at the counter.</a></p>
      ) : scope === 'all' ? (
        <>
          <div className="mt-6 overflow-x-auto rounded-[20px] border border-[#eadfd5] bg-[#fffaf5]">
            <table className="w-full table-fixed border-collapse text-left text-sm sm:table-auto">
              <caption className="sr-only">All orders. Choose a row to open the ticket.</caption>
              <thead className="bg-[#f7f1ea] text-xs font-bold uppercase tracking-[.14em] text-[#927a6d]">
                <tr>
                  <th scope="col" className="w-[30%] px-3 py-3 font-bold sm:w-auto">Ticket</th>
                  <th scope="col" className="px-3 py-3 font-bold">Customer</th>
                  <th scope="col" className="hidden px-3 py-3 font-bold sm:table-cell">When</th>
                  <th scope="col" className="hidden px-3 py-3 font-bold md:table-cell">Channel</th>
                  <th scope="col" className="hidden px-3 py-3 font-bold sm:table-cell">Items</th>
                  <th scope="col" className="px-3 py-3 font-bold">Total</th>
                  <th scope="col" className="px-3 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((order) => (
                  <tr
                    key={order.id}
                    tabIndex={0}
                    aria-label={`Open ${order.number}`}
                    onClick={() => setSelectedId(order.id)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      setSelectedId(order.id)
                    }}
                    className="cursor-pointer border-t border-[#eadfd5] align-middle focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#c87968] hover:bg-[#fbf8f3]"
                  >
                    <td className="whitespace-nowrap px-3 py-3 font-serif text-lg text-[#4b332b]">{order.number}</td>
                    <td className="max-w-[8rem] truncate px-3 py-3 text-[#5a4137] sm:max-w-[12rem]">{order.customer}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-[#806b60] sm:table-cell">{formatWhen(order.createdAt)}</td>
                    <td className="hidden px-3 py-3 text-[#806b60] md:table-cell">{order.channel === 'counter' ? 'Counter' : 'Online'}</td>
                    <td className="hidden px-3 py-3 text-[#5a4137] sm:table-cell">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#b96654]">{formatInr(orderTotal(order))}</td>
                    <td className="px-3 py-3"><span className={`status ${statusClass[order.status]}`}>{orderStatusLabel[order.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="Order pages">
            <p className="text-sm text-[#806b60]">Showing {pageStart + 1}–{pageStart + pageRows.length} of {orders.length}</p>
            <div className="flex items-center gap-2">
              <button type="button" className="secondary-button disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
              <p className="min-w-16 text-center text-sm font-semibold text-[#5a4137]">Page {currentPage} of {pageCount}</p>
              <button type="button" className="secondary-button disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
            </div>
          </nav>
          {selected ? <OrderDetailsModal order={selected} onClose={() => setSelectedId(null)} onAdvance={() => advance(selected.id)} /> : null}
        </>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const next = nextOrderStatus[order.status]
            return (
              <li key={order.id} className="dashboard-card flex min-w-0 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl text-[#4b332b]">{order.number}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#806b60]">{order.customer} · {order.channel === 'counter' ? 'Counter' : 'Online'}</p>
                    <p className="text-sm leading-6 text-[#806b60]">{formatWhen(order.createdAt)}</p>
                  </div>
                  <span className={`status ${statusClass[order.status]}`}>{orderStatusLabel[order.status]}</span>
                </div>
                <ul className="mt-4 flex flex-1 flex-col gap-3">
                  {order.items.map((item) => {
                    const photo = state.products.find((product) => product.name === item.name)?.image
                    return (
                      <li key={`${order.id}-${item.name}-${item.note ?? ''}`} className="flex min-w-0 items-center gap-3">
                        {photo ? <img src={photo} alt="" className="size-14 shrink-0 rounded-xl object-cover" /> : null}
                        <div className="min-w-0">
                          <p className="font-semibold leading-5 text-[#5a4137]">{item.quantity} × {item.name}</p>
                          {item.note ? <p className="mt-0.5 text-sm leading-5 text-[#806b60]">{item.note}</p> : null}
                          <p className="mt-0.5 text-sm text-[#a08476]">{formatInr(item.price * item.quantity)}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eadfd5] pt-4">
                  <p className="font-serif text-2xl text-[#4b332b]">{formatInr(orderTotal(order))}</p>
                  {next ? <button type="button" className="primary-button" onClick={() => advance(order.id)}>Mark {orderStatusLabel[next].toLowerCase()}</button> : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function OrderDetailsModal({ order, onClose, onAdvance }: { order: AdminOrder; onClose: () => void; onAdvance: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const next = nextOrderStatus[order.status]

  useEffect(() => {
    const panel = panelRef.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () => panel ? [...panel.querySelectorAll<HTMLElement>('button, input, select, textarea')].filter((element) => !element.hasAttribute('disabled')) : []
    focusable()[0]?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panel) return
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
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#3f2c25]/45 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Close order details" onClick={onClose} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="order-details-title" className="relative z-10 flex max-h-[min(92dvh,760px)] w-full min-w-0 flex-col overflow-hidden rounded-t-[28px] bg-[#fffaf5] shadow-[0_-12px_40px_#50372d24] sm:max-w-[560px] sm:rounded-[28px]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#eadfd5] px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#ba715f]">{order.channel === 'counter' ? 'Counter' : 'Online'}</p>
            <h2 id="order-details-title" className="mt-1 font-serif text-3xl leading-tight text-[#402b24]">{order.number}</h2>
            <p className="mt-1 text-sm leading-6 text-[#806b60]">{order.customer} · {formatWhen(order.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-button shrink-0" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <span className={`status ${statusClass[order.status]}`}>{orderStatusLabel[order.status]}</span>
          <ul className="mt-4 divide-y divide-[#eadfd5]">
            {order.items.map((item) => (
              <li key={`${item.name}-${item.note ?? ''}`} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg leading-tight text-[#4b332b]">{item.quantity} × {item.name}</p>
                  {item.note ? <p className="mt-1 text-sm leading-5 text-[#806b60]">{item.note}</p> : null}
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#b96654]">{formatInr(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0 border-t border-[#eadfd5] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#806b60]">Pickup total</p>
            <p className="font-serif text-3xl text-[#4b332b]">{formatInr(orderTotal(order))}</p>
          </div>
          {next ? <button type="button" className="primary-button mt-4 w-full justify-center" onClick={onAdvance}>Mark {orderStatusLabel[next].toLowerCase()}</button> : null}
        </div>
      </div>
    </div>
  )
}
