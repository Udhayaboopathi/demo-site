'use client'

import { useEffect, useMemo, useState } from 'react'
import { DeskHeader, controlClass } from '@/components/admin/admin-dialog'
import { formatWhen, orderStatusLabel, orderTotal, slug, useAdminState, type AdminOrder, type OrderStatus } from '@/components/admin/store'
import { formatInr } from '@/lib/money'

const pageSize = 4

const statusClass: Record<OrderStatus, string> = {
  pending: 'status-confirmed',
  preparing: 'status-preparing',
  ready: 'status-ready-for-pickup',
  completed: 'status-completed',
}

export type ClientRecord = {
  id: string
  name: string
  orders: AdminOrder[]
  spent: number
  lastAt: string
}

export function clientsFromOrders(orders: AdminOrder[]): ClientRecord[] {
  const grouped = new Map<string, ClientRecord>()
  for (const order of orders) {
    const name = order.customer.trim() || 'Walk-in'
    const id = slug(name) || 'walk-in'
    const current = grouped.get(id)
    if (current) {
      current.orders.push(order)
      current.spent += orderTotal(order)
      if (order.createdAt > current.lastAt) current.lastAt = order.createdAt
    } else {
      grouped.set(id, { id, name, orders: [order], spent: orderTotal(order), lastAt: order.createdAt })
    }
  }
  return [...grouped.values()]
    .map((client) => ({ ...client, orders: [...client.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt) || a.name.localeCompare(b.name))
}

function channelLabel(orders: AdminOrder[]) {
  const channels = new Set(orders.map((order) => order.channel))
  return [...channels].map((channel) => channel === 'counter' ? 'Counter' : 'Online').join(' · ')
}

export function CrmDesk() {
  const { state } = useAdminState()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const clients = useMemo(() => {
    if (!state) return []
    const needle = query.trim().toLowerCase()
    return clientsFromOrders(state.orders).filter((client) => !needle || client.name.toLowerCase().includes(needle))
  }, [state, query])
  const pageCount = Math.max(1, Math.ceil(clients.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const pageRows = clients.slice(pageStart, pageStart + pageSize)

  useEffect(() => { setPage(1) }, [query])

  if (!state) return <p className="text-sm text-[#806b60]">Opening clients…</p>

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <DeskHeader eyebrow="Clients" title="Clients." lede="Each row is a name from a ticket. Open a row to see that client’s orders." />
      <label className="mt-6 block">
        <span className="sr-only">Search clients</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a name" className={controlClass} />
      </label>
      {clients.length === 0 ? (
        <p className="mt-8 rounded-[20px] border border-[#eadfd5] bg-[#fffaf5] p-6 text-sm leading-6 text-[#806b60]">No clients match. Names appear here when a ticket is written at the counter.</p>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#eadfd5] bg-[#fffaf5]">
            <table className="w-full table-fixed border-collapse text-left text-sm sm:table-auto">
              <caption className="sr-only">Clients. Choose a row to open that client.</caption>
              <thead className="bg-[#f7f1ea] text-xs font-bold uppercase tracking-[.14em] text-[#927a6d]">
                <tr>
                  <th scope="col" className="w-[42%] px-3 py-3 font-bold sm:w-auto">Name</th>
                  <th scope="col" className="px-3 py-3 font-bold">Orders</th>
                  <th scope="col" className="hidden px-3 py-3 font-bold sm:table-cell">Last order</th>
                  <th scope="col" className="hidden px-3 py-3 font-bold md:table-cell">Channel</th>
                  <th scope="col" className="px-3 py-3 font-bold">Spent</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((client) => (
                  <tr key={client.id} className="relative border-t border-[#eadfd5] align-middle hover:bg-[#fbf8f3]">
                    <td className="px-3 py-3">
                      <a href={`/admin/crm/${client.id}`} className="inline-flex min-h-11 items-center gap-3 font-serif text-xl text-[#4b332b] after:absolute after:inset-0 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#c87968]">
                        <span className="avatar shrink-0" aria-hidden="true">{clientInitials(client.name)}</span>
                        <span className="min-w-0">{client.name}</span>
                      </a>
                    </td>
                    <td className="px-3 py-3 text-[#5a4137]">{client.orders.length}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-[#806b60] sm:table-cell">{formatWhen(client.lastAt)}</td>
                    <td className="hidden px-3 py-3 text-[#806b60] md:table-cell">{channelLabel(client.orders)}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#b96654]">{formatInr(client.spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="Client pages">
            <p className="text-sm text-[#806b60]">Showing {pageStart + 1}–{pageStart + pageRows.length} of {clients.length}</p>
            <div className="flex items-center gap-2">
              <button type="button" className="secondary-button disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
              <p className="min-w-16 text-center text-sm font-semibold text-[#5a4137]">Page {currentPage} of {pageCount}</p>
              <button type="button" className="secondary-button disabled:cursor-not-allowed disabled:opacity-50" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}

function clientInitials(name: string) {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
  return letters || name.slice(0, 1).toUpperCase()
}

export function ClientPage({ id }: { id: string }) {
  const { state } = useAdminState()
  if (!state) return <p className="text-sm text-[#806b60]">Opening this client…</p>
  const client = clientsFromOrders(state.orders).find((item) => item.id === id)

  if (!client) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <a href="/admin/crm" className="text-link text-sm">Clients</a>
        <h1 className="mt-4 font-serif text-4xl text-[#402b24]">No client here.</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[#806b60]">That name is not on a ticket in this browser.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <a href="/admin/crm" className="text-link text-sm">Clients</a>
      <div className="mt-4 flex min-w-0 items-center gap-4">
        <span className="avatar shrink-0" aria-hidden="true">{clientInitials(client.name)}</span>
        <div className="min-w-0">
          <p className="eyebrow">Name</p>
          <h1 className="mt-1 break-words font-serif text-4xl tracking-[-.04em] text-[#402b24] sm:text-5xl">{client.name}</h1>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#806b60] sm:text-base">Orders written under this name, from the counter and from online tickets.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <article className="stat-card min-w-0"><p className="stat-label">Orders</p><p className="mt-3 font-serif text-4xl text-[#4b332b]">{client.orders.length}</p></article>
        <article className="stat-card min-w-0"><p className="stat-label">Spent</p><p className="mt-3 font-serif text-4xl text-[#4b332b]">{formatInr(client.spent)}</p></article>
        <article className="stat-card col-span-2 min-w-0 sm:col-span-1"><p className="stat-label">Last order</p><p className="mt-3 font-serif text-2xl text-[#4b332b] sm:text-3xl">{formatWhen(client.lastAt)}</p></article>
      </div>
      <div className="mt-6 overflow-hidden rounded-[20px] border border-[#eadfd5] bg-[#fffaf5]">
        <table className="w-full table-fixed border-collapse text-left text-sm sm:table-auto">
          <caption className="sr-only">Orders for {client.name}</caption>
          <thead className="bg-[#f7f1ea] text-xs font-bold uppercase tracking-[.14em] text-[#927a6d]">
            <tr>
              <th scope="col" className="w-[34%] px-3 py-3 font-bold sm:w-auto">Ticket</th>
              <th scope="col" className="hidden px-3 py-3 font-bold sm:table-cell">When</th>
              <th scope="col" className="hidden px-3 py-3 font-bold md:table-cell">Channel</th>
              <th scope="col" className="hidden px-3 py-3 font-bold sm:table-cell">Items</th>
              <th scope="col" className="px-3 py-3 font-bold">Total</th>
              <th scope="col" className="px-3 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {client.orders.map((order) => (
              <tr key={order.id} className="border-t border-[#eadfd5] align-middle">
                <td className="whitespace-nowrap px-3 py-3 font-serif text-lg text-[#4b332b]">{order.number}</td>
                <td className="hidden whitespace-nowrap px-3 py-3 text-[#806b60] sm:table-cell">{formatWhen(order.createdAt)}</td>
                <td className="hidden px-3 py-3 text-[#806b60] md:table-cell">{order.channel === 'counter' ? 'Counter' : 'Online'}</td>
                <td className="hidden max-w-[18rem] truncate px-3 py-3 text-[#5a4137] sm:table-cell">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')}</td>
                <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#b96654]">{formatInr(orderTotal(order))}</td>
                <td className="px-3 py-3"><span className={`status ${statusClass[order.status]}`}>{orderStatusLabel[order.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
