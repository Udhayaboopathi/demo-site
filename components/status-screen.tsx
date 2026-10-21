import type { ReactNode } from 'react'
import { BakeryFooter, BakeryNavigation } from '@/components/bakery-navigation'

export function StatusScreen({
  code,
  eyebrow,
  title,
  emphasis,
  description,
  note,
  children,
}: {
  code: string
  eyebrow: string
  title: string
  emphasis: string
  description: string
  note?: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-[#fbf8f3] text-[#3f2c25]">
      <BakeryNavigation />
      <section className="mx-auto flex w-full min-w-0 max-w-[1240px] flex-1 flex-col px-5 py-12 sm:py-16 lg:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <p className="mt-4 font-serif text-6xl leading-none tracking-[-.04em] text-[#c87968] sm:text-7xl">
          <span className="sr-only">Error </span>
          {code}
        </p>
        <h1 className="mt-4 max-w-[14ch] font-serif text-5xl leading-[.95] tracking-[-.045em] text-[#402b24] sm:text-7xl">
          {title} <em className="font-normal text-[#c27868]">{emphasis}</em>
        </h1>
        <p className="mt-6 max-w-[46ch] text-base leading-7 text-[#806b60]">{description}</p>
        {note ? <p className="mt-4 max-w-[46ch] break-all text-sm leading-6 text-[#927a6d]">{note}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">{children}</div>
      </section>
      <BakeryFooter />
    </main>
  )
}
