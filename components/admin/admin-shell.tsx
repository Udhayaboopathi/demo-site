'use client'

import { Cake, CalendarCheck, ClipboardList, Clock, Contact, LayoutDashboard, Menu, ShoppingBag, Tags, Users, Wallet, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type ComponentType } from 'react'

const groups: { label: string; links: { href: string; label: string; icon: ComponentType<{ size?: number }> }[] }[] = [
  { label: 'Desk', links: [{ href: '/admin', label: 'Overview', icon: LayoutDashboard }] },
  {
    label: 'Orders',
    links: [
      { href: '/admin/orders/pos', label: 'New order', icon: ShoppingBag },
      { href: '/admin/orders/pending', label: 'Pending', icon: Clock },
      { href: '/admin/orders/all', label: 'All orders', icon: ClipboardList },
    ],
  },
  {
    label: 'Clients',
    links: [{ href: '/admin/crm', label: 'Clients', icon: Contact }],
  },
  {
    label: 'Catalog',
    links: [
      { href: '/admin/products', label: 'Products', icon: Cake },
      { href: '/admin/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    label: 'People',
    links: [
      { href: '/admin/employees', label: 'Employees', icon: Users },
      { href: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/admin/payslips', label: 'Payslips', icon: Wallet },
    ],
  },
]

function isCurrent(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`)
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-[.16em] text-[#ba715f]">{group.label}</p>
          <div className="mt-1 flex flex-col">
            {group.links.map((link) => {
              const Icon = link.icon
              const current = isCurrent(pathname, link.href)
              return (
                <a key={link.href} href={link.href} aria-current={current ? 'page' : undefined} onClick={onNavigate} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c87968] ${current ? 'bg-[#f6e9de] font-bold text-[#b36b58]' : 'text-[#8b7266]'}`}>
                  <Icon size={16} />
                  {link.label}
                </a>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    panel?.querySelector<HTMLElement>('a, button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-dvh bg-[#fbf8f3] text-[#3f2c25]">
      <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-3 border-b border-[#eadfd5] bg-[#fbf8f3] px-4 md:hidden">
        <a href="/admin" className="min-w-0 font-serif text-lg leading-tight text-[#402b24]">Kitchen desk</a>
        <div className="flex items-center gap-2">
          <a href="/" className="secondary-button">Shop</a>
          <button type="button" className="icon-button" aria-label={open ? 'Close desk menu' : 'Open desk menu'} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((current) => !current)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>
      <div className="mobile-drawer md:hidden" data-open={open} inert={!open ? true : undefined}>
        <button type="button" className="mobile-drawer-backdrop" aria-label="Close desk menu" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
        <nav ref={panelRef} id={panelId} className="mobile-drawer-panel overflow-y-auto px-3" aria-label="Kitchen desk" aria-hidden={!open}>
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="font-serif text-2xl text-[#402b24]">Kitchen desk</p>
            <button type="button" className="icon-button" aria-label="Close desk menu" onClick={() => setOpen(false)}><X size={20} /></button>
          </div>
          <div className="mt-4"><NavLinks pathname={pathname} onNavigate={() => setOpen(false)} /></div>
          <a href="/" className="mx-3 mt-6 inline-flex min-h-11 items-center text-sm font-bold text-[#a95e4c]">Back to the shop</a>
        </nav>
      </div>
      <div className="md:grid md:grid-cols-[245px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-[#eadfd5] bg-[#fffaf5] px-4 py-6 md:flex">
          <a href="/admin" className="px-3 font-serif text-2xl text-[#402b24]">Kitchen desk</a>
          <p className="mt-1 px-3 text-xs leading-5 text-[#927a6d]">Crumb & Bloom counter</p>
          <nav aria-label="Kitchen desk" className="mt-6"><NavLinks pathname={pathname} /></nav>
          <a href="/" className="mt-auto inline-flex min-h-11 items-center px-3 text-sm font-bold text-[#a95e4c]">Back to the shop</a>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-5 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
