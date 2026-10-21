import type { ReactNode } from 'react'
import { BakeryFooter, BakeryNavigation } from '@/components/bakery-navigation'

export function LegalPage({
  eyebrow,
  title,
  emphasis,
  lede,
  updated,
  current,
  children,
  jsonLd,
}: {
  eyebrow: string
  title: string
  emphasis: string
  lede: string
  updated: string
  current: string
  children: ReactNode
  jsonLd: Record<string, unknown>
}) {
  return (
    <main className="min-h-dvh bg-[#fbf8f3] text-[#3f2c25]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BakeryNavigation />
      <article className="mx-auto w-full min-w-0 max-w-[1240px] px-5 pb-24 pt-10 sm:pt-16 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#927a6d]">
          <a href="/" className="text-link">Home</a>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page">{current}</span>
        </nav>
        <p className="eyebrow mt-6">{eyebrow}</p>
        <h1 className="mt-4 max-w-[16ch] font-serif text-5xl leading-[.95] tracking-[-.045em] text-[#402b24] sm:text-7xl">
          {title} <em className="font-normal text-[#c27868]">{emphasis}</em>
        </h1>
        <p className="mt-6 max-w-[68ch] text-base leading-7 text-[#806b60]">{lede}</p>
        <p className="mt-4 text-sm text-[#927a6d]">Updated {updated}</p>
        <div className="mt-4 max-w-[68ch]">{children}</div>
      </article>
      <BakeryFooter />
    </main>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-[1.75rem] leading-tight text-[#4d332a] sm:text-3xl">{title}</h2>
      <div className="legal-copy mt-3 space-y-4 text-base leading-7 text-[#806b60]">{children}</div>
    </section>
  )
}
