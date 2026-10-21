'use client'

import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BakeryFooter, BakeryNavigation } from '@/components/bakery-navigation'
import { formatInr } from '@/lib/money'

type OrderItem = { name: string; price: number; quantity: number; note?: string }

export default function CheckoutPage() {
  const [items, setItems] = useState<OrderItem[]>([])
  useEffect(() => { setItems(JSON.parse(localStorage.getItem('crumb-bloom-order') || '[]')) }, [])
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const lineKey = (item: OrderItem) => `${item.name}::${item.note ?? ''}`
  const update = (key: string, delta: number) => setItems((current) => { const next = current.map((item) => lineKey(item) === key ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0); localStorage.setItem('crumb-bloom-order', JSON.stringify(next)); return next })
  return <main className="min-h-screen bg-[#fbf8f3] text-[#3f2c25]"><BakeryNavigation /><section className="mx-auto max-w-[900px] px-4 pb-24 pt-10 sm:px-5 lg:px-8 lg:pt-16"><a href="/menu" className="add-link"><ArrowLeft size={14} /> Back to menu</a><h1 className="mt-5 font-serif text-5xl tracking-[-.04em] text-[#402b24] sm:text-6xl">Your order.</h1>{items.length === 0 ? <div className="mt-10 rounded-[24px] border border-[#eadfd5] bg-[#fffaf5] p-6 text-center sm:p-12"><ShoppingBag className="mx-auto text-[#c87968]" size={28} /><h2 className="mt-5 font-serif text-3xl">Your bag is waiting.</h2><p className="mt-3 text-[#806b60]">Choose something lovely from today&apos;s menu.</p><a href="/menu" className="primary-button mt-7">Browse the menu</a></div> : <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]"><div className="min-w-0 rounded-[24px] border border-[#eadfd5] bg-[#fffaf5] p-4 sm:p-6">{items.map((item) => <div key={lineKey(item)} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eadfd5] py-5 first:pt-0 last:border-0 last:pb-0"><div className="min-w-0 flex-1 basis-40"><h2 className="font-serif text-xl">{item.name}</h2>{item.note && <p className="mt-1 text-sm leading-5 text-[#806b60]">{item.note}</p>}<p className="mt-1 text-sm text-[#a08476]">{formatInr(item.price)} each</p></div><div className="flex shrink-0 items-center gap-3"><button className="icon-button" onClick={() => update(lineKey(item), -1)} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button><span className="w-6 text-center text-sm">{item.quantity}</span><button className="icon-button" onClick={() => update(lineKey(item), 1)} aria-label={`Add one ${item.name}`}><Plus size={14} /></button></div></div>)}</div><aside className="h-fit rounded-[24px] bg-[#4c3830] p-6 text-[#fff8f1]"><p className="text-xs uppercase tracking-[.18em] text-[#e9b09f]">Pickup total</p><p className="mt-3 font-serif text-4xl sm:text-5xl">{formatInr(total)}</p><p className="mt-4 text-sm leading-6 text-[#dcc7b9]">We&apos;ll have your order ready at our Willow Street counter.</p><button className="mt-7 min-h-11 w-full rounded-full bg-[#e8a390] px-5 py-3 text-sm font-bold text-[#4c3830]">Continue to pickup</button></aside></div>}</section><BakeryFooter /></main>
}
