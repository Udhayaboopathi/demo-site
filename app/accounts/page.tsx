import type { Metadata } from 'next'
import { BakeryFooter, BakeryNavigation } from '@/components/bakery-navigation'
import { formatInr } from '@/lib/money'

export const metadata: Metadata = {
  title: 'Account | Crumb & Bloom',
  description: 'Sample Crumb & Bloom account. This preview is not signed in and does not store a profile.',
}

const orders = [
  { name: 'Almond Croissant', detail: '2 pastries · pickup today', status: 'Ready for pickup', tone: 'status-ready-for-pickup', total: 11 },
  { name: 'Country Sourdough', detail: '1 loaf · pickup tomorrow', status: 'Preparing', tone: 'status-preparing', total: 8 },
  { name: 'Strawberry Cloud Cake', detail: '8 inch · berry frosting · last Sunday', status: 'Completed', tone: 'status-completed', total: 42 },
]

export default function AccountsPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#fbf8f3] text-[#3f2c25]">
      <BakeryNavigation />
      <section className="mx-auto w-full min-w-0 max-w-[1100px] flex-1 px-4 py-10 sm:px-5 sm:py-16 lg:px-8">
        <p className="eyebrow">Sample account</p>
        <h1 className="mt-4 max-w-[14ch] font-serif text-5xl leading-[.95] tracking-[-.045em] text-[#402b24] sm:text-7xl">
          Your table, <em className="font-normal text-[#c27868]">for practice.</em>
        </h1>
        <p className="mt-6 max-w-[52ch] text-base leading-7 text-[#806b60]">
          This page shows what an account could look like. It is not signed in, and it does not store a name, email, or order history.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/login" className="primary-button">Sign in</a>
          <a href="/signup" className="secondary-button">Create an account</a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <article className="stat-card min-w-0">
            <p className="stat-label">Open orders</p>
            <p className="mt-3 font-serif text-4xl text-[#4b332b]">2</p>
          </article>
          <article className="stat-card min-w-0">
            <p className="stat-label">Favorite</p>
            <p className="mt-3 font-serif text-2xl leading-tight text-[#4b332b]">Almond croissant</p>
          </article>
          <article className="stat-card min-w-0 sm:col-span-2 lg:col-span-1">
            <p className="stat-label">Usual pickup</p>
            <p className="mt-3 font-serif text-2xl leading-tight text-[#4b332b]">Willow Street</p>
          </article>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.8fr)]">
          <section className="dashboard-card min-w-0" aria-labelledby="sample-orders">
            <h2 id="sample-orders" className="card-title">Recent orders</h2>
            <p className="card-subtitle">Sample pickup notes. These are not real orders.</p>
            <ul className="mt-4 flex flex-col">
              {orders.map((order) => (
                <li key={order.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfd5] py-4 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="font-serif text-xl text-[#4b332b]">{order.name}</p>
                    <p className="mt-1 text-sm leading-6 text-[#806b60]">{order.detail}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`status ${order.tone}`}>{order.status}</span>
                    <span className="text-sm font-semibold text-[#5a4137]">{formatInr(order.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <aside className="dashboard-card h-fit min-w-0">
            <div className="flex items-center gap-3">
              <span className="avatar" aria-hidden="true">SG</span>
              <div className="min-w-0">
                <h2 className="card-title">Sample guest</h2>
                <p className="card-subtitle break-all">guest@example.com</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[#806b60]">Pickup at the Willow Street counter. No saved card, and no password on file.</p>
            <a href="/menu" className="primary-button mt-6 w-full justify-center">Browse the menu</a>
          </aside>
        </div>
      </section>
      <BakeryFooter />
    </main>
  )
}
