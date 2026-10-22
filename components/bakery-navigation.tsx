'use client'

import { Menu as MenuIcon, ShoppingBag, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { shop } from '@/lib/shop'

const links = [
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'Our story' },
  { href: '/visit-us', label: 'Visit us' },
  { href: '/accounts', label: 'Account' },
]

export function BakeryNavigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const isActive = (href: string) => pathname === href
  const linkClass = (href: string) => isActive(href) ? 'bg-[#f3e6dc] text-[#3f2c25]' : 'text-[#7d675b]'

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const closeOnDesktop = () => { if (media.matches) setOpen(false) }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () => panel ? [...panel.querySelectorAll<HTMLElement>('a, button')].filter((element) => !element.hasAttribute('disabled')) : []
    focusable()[0]?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
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
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey, true)
      menuButtonRef.current?.focus()
    }
  }, [open])

  return (
    <header className={`site-header${open ? ' menu-open' : ''}`}>
      <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-3 px-4 py-2 sm:px-5 lg:px-8">
        <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="" width={40} height={40} className="brand-mark" />
          <span className="min-w-0"><strong className="block font-serif text-base leading-tight tracking-tight sm:text-xl sm:leading-none">Crumb & Bloom</strong><small className="mt-1 hidden text-[10px] uppercase tracking-[.22em] text-[#987d6d] min-[400px]:block">Artisan bakery</small></span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#7d675b] lg:gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={`inline-flex min-h-11 items-center ${isActive(link.href) ? 'text-[#3f2c25]' : ''}`} aria-current={isActive(link.href) ? 'page' : undefined}>{link.label}</a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3"><a href="/admin" className="secondary-button hidden sm:inline-flex">Admin</a><a href="/checkout" className="icon-button" aria-label="Shopping bag"><ShoppingBag size={18} /></a><button ref={menuButtonRef} type="button" className="icon-button md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((current) => !current)}>{open ? <X size={20} /> : <MenuIcon size={20} />}</button></div>
      </div>
      <div className="mobile-drawer" data-open={open} inert={!open ? true : undefined}>
        <button type="button" className="mobile-drawer-backdrop" aria-label="Close menu" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
        <nav ref={panelRef} id={panelId} className="mobile-drawer-panel" aria-label="Mobile navigation" aria-hidden={!open}>
          <div className="flex items-center justify-between gap-3 px-4">
            <p className="font-serif text-2xl text-[#402b24]">Menu</p>
            <button type="button" className="icon-button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={20} /></button>
          </div>
          <div className="mt-4 flex flex-col gap-1 px-3 text-base">
            {links.map((link) => (
              <a key={link.href} href={link.href} className={`flex min-h-11 items-center rounded-2xl px-4 font-medium ${linkClass(link.href)}`} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? 'page' : undefined}>{link.label}</a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

export function BakeryFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`border-t border-[#eadfd5] bg-[#f7f1ea] px-4 py-10 sm:px-5 lg:px-8 ${className}`}>
      <div className="mx-auto grid max-w-[1440px] gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <a href="/" className="inline-flex min-h-11 items-center gap-2 font-serif text-xl text-[#4b332b]">
            <img src="/logo.png" alt="" width={40} height={40} className="brand-mark" />
            Crumb & Bloom
          </a>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#806b60]">Handcrafted pastries, celebration cakes, and slow-fermented bread, ready for pickup on Willow Street.</p>
          <address className="mt-4 text-sm not-italic leading-6 text-[#806b60]">
            {shop.streetAddress}<br />
            {shop.addressLocality}, {shop.addressRegion} {shop.postalCode}
          </address>
          <a href={shop.phoneHref} className="text-link text-sm">{shop.phoneDisplay}</a>
          <p className="text-sm leading-6 text-[#806b60]">Mon–Fri 7am–4pm<br />Sat–Sun 8am–3pm</p>
        </div>
        <nav aria-label="Footer" className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#ba715f]">Visit</p>
          <ul className="mt-1">
            {links.map((link) => (
              <li key={link.href}><a href={link.href} className="text-link text-sm">{link.label}</a></li>
            ))}
            <li><a href="/checkout" className="text-link text-sm">Order online</a></li>
          </ul>
        </nav>
        <nav aria-label="Legal" className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#ba715f]">House rules</p>
          <ul className="mt-1">
            <li><a href="/terms" className="text-link text-sm">Terms</a></li>
            <li><a href="/privacy" className="text-link text-sm">Privacy</a></li>
            <li><a href="/admin" className="text-link text-sm">Kitchen desk</a></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1440px] flex-col gap-2 border-t border-[#eadfd5] pt-6 text-sm leading-6 text-[#927a6d] sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Crumb & Bloom. Baked with care.</p>
        <p>
          Developed and maintained by{' '}
          <a href="https://www.krwebsolution.com/" className="text-link text-sm" target="_blank" rel="noopener noreferrer">KR Solutions</a>
        </p>
      </div>
    </footer>
  )
}

export type ProductChoice = { label: string; price: number; color?: string }
export type ProductCustomization = {
  groups: { id: string; label: string; choices: ProductChoice[] }[]
  message?: { label: string; placeholder: string; maxLength: number }
}

const icingColors: ProductChoice[] = [
  { label: 'Ivory', price: 0, color: '#f4ead8' },
  { label: 'Blush', price: 0, color: '#e8a598' },
  { label: 'Rose', price: 0, color: '#c4536a' },
  { label: 'Chocolate', price: 0, color: '#5c3317' },
  { label: 'Lemon', price: 0, color: '#e6c34a' },
  { label: 'Pistachio', price: 0, color: '#7d9a62' },
]

const cakeCustomization: ProductCustomization = {
  groups: [
    { id: 'size', label: 'Size', choices: [{ label: '6 inch', price: -6 }, { label: '8 inch', price: 0 }, { label: '10 inch', price: 12 }] },
    { id: 'frosting', label: 'Frosting', choices: [{ label: 'House frosting', price: 0 }, { label: 'Chocolate', price: 0 }, { label: 'Berry', price: 2 }] },
    { id: 'color', label: 'Color', choices: [...icingColors, { label: 'Sky', price: 0, color: '#7aa0c4' }, { label: 'Lavender', price: 0, color: '#b09bc8' }] },
  ],
  message: { label: 'Inscription', placeholder: 'Happy birthday', maxLength: 40 },
}

const croissantCustomization: ProductCustomization = {
  groups: [
    { id: 'size', label: 'Size', choices: [{ label: 'Regular', price: 0 }, { label: 'Large', price: 2 }] },
    { id: 'filling', label: 'Filling', choices: [{ label: 'Almond cream', price: 0 }, { label: 'Extra almond', price: 1 }, { label: 'Chocolate', price: 1 }] },
  ],
}

const bunCustomization: ProductCustomization = {
  groups: [
    { id: 'size', label: 'Size', choices: [{ label: 'Regular', price: 0 }, { label: 'Large', price: 2 }] },
    { id: 'color', label: 'Glaze', choices: icingColors },
  ],
}

const loafCustomization: ProductCustomization = {
  groups: [
    { id: 'size', label: 'Size', choices: [{ label: 'Half loaf', price: -3 }, { label: 'Whole loaf', price: 0 }] },
    { id: 'cut', label: 'Cut', choices: [{ label: 'Unsliced', price: 0 }, { label: 'Sliced', price: 0 }] },
  ],
}

const focacciaCustomization: ProductCustomization = {
  groups: [
    { id: 'size', label: 'Size', choices: [{ label: 'Quarter', price: -4 }, { label: 'Half', price: 0 }, { label: 'Whole', price: 6 }] },
    { id: 'topping', label: 'Topping', choices: [{ label: 'Rosemary', price: 0 }, { label: 'Olive', price: 1 }, { label: 'Chili', price: 1 }] },
  ],
}

const cookieCustomization: ProductCustomization = {
  groups: [
    { id: 'size', label: 'Size', choices: [{ label: 'Single', price: 0 }, { label: 'Box of 4', price: 8 }, { label: 'Box of 6', price: 12 }] },
    { id: 'bake', label: 'Bake', choices: [{ label: 'Soft', price: 0 }, { label: 'Crisp', price: 0 }] },
  ],
}

const shortbreadCustomization: ProductCustomization = {
  groups: [
    { id: 'size', label: 'Size', choices: [{ label: '2 pieces', price: 0 }, { label: '6 pieces', price: 6 }] },
    { id: 'color', label: 'Icing', choices: icingColors },
  ],
}

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

export const products = [
  { name: 'Strawberry Cloud Cake', category: 'Cakes', price: 42, tag: 'Bestseller', description: 'Vanilla sponge, strawberry cream, and a cloud of whipped frosting.', image: photo('photo-1578985545062-69928b1d9587'), images: [photo('photo-1578985545062-69928b1d9587'), photo('photo-1565958011703-44f9829ba187'), photo('photo-1464349095431-e9a21285b5f3')], customization: cakeCustomization },
  { name: 'Chocolate Ganache Cake', category: 'Cakes', price: 38, tag: 'Rich', description: 'Dark chocolate layers finished with a glossy ganache.', image: photo('photo-1606890737304-57a1ca8a5b62'), images: [photo('photo-1606890737304-57a1ca8a5b62'), photo('photo-1578985545062-69928b1d9587'), photo('photo-1464349095431-e9a21285b5f3')], customization: cakeCustomization },
  { name: 'Lemon Olive Oil Cake', category: 'Cakes', price: 36, tag: 'Seasonal', description: 'Bright lemon crumb with olive oil and a soft citrus finish.', image: photo('photo-1519915028121-7d3463d20b13'), images: [photo('photo-1519915028121-7d3463d20b13'), photo('photo-1464349095431-e9a21285b5f3'), photo('photo-1486427944299-d1955d23e34d')], customization: cakeCustomization },
  { name: 'Vanilla Celebration Cake', category: 'Cakes', price: 48, tag: 'Party', description: 'Vanilla bean layers made for a birthday, with room for a message.', image: photo('photo-1464349095431-e9a21285b5f3'), images: [photo('photo-1464349095431-e9a21285b5f3'), photo('photo-1535141192574-5d4897c12636'), photo('photo-1578985545062-69928b1d9587')], customization: cakeCustomization },
  { name: 'Almond Croissant', category: 'Pastries', price: 5.5, tag: 'Fresh today', description: 'Twice-baked croissant filled with almond cream.', image: photo('photo-1555507036-ab1f4038808a'), images: [photo('photo-1555507036-ab1f4038808a'), photo('photo-1530610476181-d83430b64dcd'), photo('photo-1623334044303-241021148842')], customization: croissantCustomization },
  { name: 'Butter Croissant', category: 'Pastries', price: 4.5, tag: 'Classic', description: 'Laminated butter dough, baked until the edges shatter.', image: photo('photo-1530610476181-d83430b64dcd'), images: [photo('photo-1530610476181-d83430b64dcd'), photo('photo-1555507036-ab1f4038808a'), photo('photo-1509365465985-25d11c17e812')] },
  { name: 'Pain au Chocolat', category: 'Pastries', price: 5, tag: 'Warm', description: 'Flaky pastry wrapped around two sticks of dark chocolate.', image: photo('photo-1623334044303-241021148842'), images: [photo('photo-1623334044303-241021148842'), photo('photo-1530610476181-d83430b64dcd'), photo('photo-1555507036-ab1f4038808a')] },
  { name: 'Morning Bun', category: 'Pastries', price: 4.75, tag: 'Cinnamon', description: 'Orange zest and cinnamon sugar rolled into a soft bun.', image: photo('photo-1509365465985-25d11c17e812'), images: [photo('photo-1509365465985-25d11c17e812'), photo('photo-1555507036-ab1f4038808a'), photo('photo-1509440159596-0249088772ff')], customization: bunCustomization },
  { name: 'Country Sourdough', category: 'Bread', price: 8, tag: 'Small batch', description: 'A slow-fermented country loaf with a crackly crust.', image: photo('photo-1509440159596-0249088772ff'), images: [photo('photo-1509440159596-0249088772ff'), photo('photo-1549931319-a545dcf3bc73'), photo('photo-1534620808146-d33bb39128b2')], customization: loafCustomization },
  { name: 'Seeded Rye', category: 'Bread', price: 9, tag: 'Hearty', description: 'Rye flour baked with a mix of toasted seeds.', image: photo('photo-1549931319-a545dcf3bc73'), images: [photo('photo-1549931319-a545dcf3bc73'), photo('photo-1509440159596-0249088772ff'), photo('photo-1534620808146-d33bb39128b2')] },
  { name: 'Milk Bread', category: 'Bread', price: 7, tag: 'Soft', description: 'A lightly sweet loaf with a soft, tender crumb.', image: photo('photo-1586444248902-2f64eddc13df'), images: [photo('photo-1586444248902-2f64eddc13df'), photo('photo-1509440159596-0249088772ff'), photo('photo-1549931319-a545dcf3bc73')] },
  { name: 'Rosemary Focaccia', category: 'Bread', price: 10, tag: 'Savory', description: 'Olive oil focaccia with rosemary and sea salt.', image: photo('photo-1534620808146-d33bb39128b2'), images: [photo('photo-1534620808146-d33bb39128b2'), photo('photo-1509440159596-0249088772ff'), photo('photo-1549931319-a545dcf3bc73')], customization: focacciaCustomization },
  { name: 'Sea Salt Cookie', category: 'Cookies', price: 3.5, tag: 'New', description: 'A chewy cookie finished with flakes of sea salt.', image: photo('photo-1499636136210-6f4ee915583e'), images: [photo('photo-1499636136210-6f4ee915583e'), photo('photo-1558961363-fa8fdf82db35'), photo('photo-1590080875515-8a3a8dc5735e')] },
  { name: 'Chocolate Chunk Cookie', category: 'Cookies', price: 3.5, tag: 'Chewy', description: 'Brown butter dough and large pieces of chocolate.', image: photo('photo-1618923850107-d1a234d7a73a'), images: [photo('photo-1618923850107-d1a234d7a73a'), photo('photo-1499636136210-6f4ee915583e'), photo('photo-1558961363-fa8fdf82db35')], customization: cookieCustomization },
  { name: 'Oatmeal Raisin Cookie', category: 'Cookies', price: 3.25, tag: 'Toasted', description: 'Toasted oats and raisins, crisp at the edges.', image: photo('photo-1558961363-fa8fdf82db35'), images: [photo('photo-1558961363-fa8fdf82db35'), photo('photo-1499636136210-6f4ee915583e'), photo('photo-1590080875515-8a3a8dc5735e')] },
  { name: 'Brown Butter Shortbread', category: 'Cookies', price: 3, tag: 'Buttery', description: 'Sandy shortbread made with brown butter.', image: photo('photo-1590080875515-8a3a8dc5735e'), images: [photo('photo-1590080875515-8a3a8dc5735e'), photo('photo-1558961363-fa8fdf82db35'), photo('photo-1499636136210-6f4ee915583e')], customization: shortbreadCustomization },
]
