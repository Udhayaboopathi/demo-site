'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export const controlClass = 'mt-2 w-full max-w-full min-h-11 rounded-2xl border border-[#eadfd5] bg-white px-4 text-base text-[#3f2c25] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c87968]'

export function DeskHeader({ eyebrow, title, lede, action }: { eyebrow: string; title: string; lede: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 max-w-[16ch] font-serif text-4xl tracking-[-.04em] text-[#402b24] sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#806b60] sm:text-base">{lede}</p>
      </div>
      {action}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-[#5a4137]">{label}</span>
      {children}
    </label>
  )
}

export function AdminDialog({ title, description, onClose, wide = false, children }: { title: string; description?: string; onClose: () => void; wide?: boolean; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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
      <button type="button" className="absolute inset-0" aria-label="Close dialog" onClick={onClose} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" className={`relative z-10 flex max-h-[min(92dvh,820px)] w-full min-w-0 flex-col overflow-hidden rounded-t-[28px] bg-[#fffaf5] shadow-[0_-12px_40px_#50372d24] sm:rounded-[28px] ${wide ? 'sm:max-w-[640px]' : 'sm:max-w-[520px]'}`}>
        <div className="shrink-0 px-5 pt-5">
          <h2 id="admin-dialog-title" className="font-serif text-3xl leading-tight text-[#402b24]">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-[#806b60]">{description}</p> : null}
        </div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
