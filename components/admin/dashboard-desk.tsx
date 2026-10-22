'use client'

import { Cake, CalendarCheck, ClipboardList, Clock, Contact, ShoppingBag, Tags, Users, Wallet } from 'lucide-react'
import { DeskHeader } from '@/components/admin/admin-dialog'
import { formatWhen, monthKey, orderStatusLabel, orderTotal, todayKey, useAdminState, type OrderStatus } from '@/components/admin/store'
import { formatInr } from '@/lib/money'

const modules = [
  { href: '/admin/products', title: 'Products', description: 'Add a bake, change a price, or hide something that sold out.', icon: Cake },
  { href: '/admin/categories', title: 'Categories', description: 'Cakes, bread, pastries, and whatever the case needs next.', icon: Tags },
  { href: '/admin/employees', title: 'Employees', description: 'Roles, phone numbers, and monthly pay for the crew.', icon: Users },
  { href: '/admin/attendance', title: 'Attendance', description: 'Mark who is on the floor, late, away, or on leave.', icon: CalendarCheck },
  { href: '/admin/payslips', title: 'Payslips', description: 'Build a month from attendance and mark it paid.', icon: Wallet },
  { href: '/admin/crm', title: 'Clients', description: 'Names from tickets, and the orders under each one.', icon: Contact },
  { href: '/admin/orders/all', title: 'All orders', description: 'Every counter and online ticket, from pending to picked up.', icon: ClipboardList },
  { href: '/admin/orders/pending', title: 'Pending orders', description: 'Tickets that still need the oven or the counter.', icon: Clock },
  { href: '/admin/orders/pos', title: 'New order', description: 'The same counter as the menu, for a walk-in ticket.', icon: ShoppingBag },
]

const statusClass: Record<OrderStatus, string> = {
  pending: 'status-confirmed',
  preparing: 'status-preparing',
  ready: 'status-ready-for-pickup',
  completed: 'status-completed',
}

export function DashboardDesk() {
  const { state } = useAdminState()
  if (!state) return <p className="text-sm text-[#806b60]">Opening the desk…</p>
  const today = todayKey()
  const marks = state.attendance.find((day) => day.date === today)?.marks ?? {}
  const onShift = state.employees.filter((employee) => marks[employee.id] === 'present' || marks[employee.id] === 'late').length
  const openOrders = state.orders.filter((order) => order.status !== 'completed')
  const drafts = state.payslips.filter((slip) => slip.month === monthKey() && slip.status === 'draft').length
  const recent = openOrders.slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <DeskHeader eyebrow="Kitchen desk" title="Today in the bakery." lede="Products, categories, the crew, and counter orders stay in this browser. Nothing on this desk is uploaded." action={<a href="/admin/orders/pos" className="primary-button">New counter order</a>} />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="stat-card min-w-0"><p className="stat-label">Open orders</p><p className="mt-3 font-serif text-4xl text-[#4b332b]">{openOrders.length}</p></article>
        <article className="stat-card min-w-0"><p className="stat-label">On the menu</p><p className="mt-3 font-serif text-4xl text-[#4b332b]">{state.products.filter((product) => product.available).length}</p></article>
        <article className="stat-card min-w-0"><p className="stat-label">On shift</p><p className="mt-3 font-serif text-4xl text-[#4b332b]">{onShift}</p></article>
        <article className="stat-card min-w-0"><p className="stat-label">Payslips to pay</p><p className="mt-3 font-serif text-4xl text-[#4b332b]">{drafts}</p></article>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <li key={module.href} className="min-w-0">
              <a href={module.href} className="flex h-full min-h-11 flex-col rounded-[20px] border border-[#eadfd5] bg-[#fffaf5] p-5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c87968]">
                <Icon className="text-[#c87968]" size={22} />
                <h2 className="mt-4 font-serif text-2xl text-[#4b332b]">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#806b60]">{module.description}</p>
              </a>
            </li>
          )
        })}
      </ul>
      <section className="dashboard-card mt-8 min-w-0" aria-labelledby="open-tickets">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="open-tickets" className="card-title">Open tickets</h2>
          <a href="/admin/orders/pending" className="text-link text-sm">See pending</a>
        </div>
        {recent.length === 0 ? <p className="mt-4 text-sm leading-6 text-[#806b60]">Nothing is waiting. Start a ticket at the counter.</p> : (
          <ul className="mt-3 flex flex-col">
            {recent.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfd5] py-4 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-serif text-xl text-[#4b332b]">{order.number} · {order.customer}</p>
                  <p className="mt-1 text-sm text-[#806b60]">{formatWhen(order.createdAt)} · {order.items.length === 1 ? '1 line' : `${order.items.length} lines`}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`status ${statusClass[order.status]}`}>{orderStatusLabel[order.status]}</span>
                  <span className="text-sm font-semibold">{formatInr(orderTotal(order))}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
