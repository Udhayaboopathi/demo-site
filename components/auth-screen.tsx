'use client'

import { FormEvent, useState } from 'react'
import { BakeryFooter, BakeryNavigation } from '@/components/bakery-navigation'

type Mode = 'login' | 'signup'

const copy = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Sign in to',
    emphasis: 'your table.',
    lede: 'This is a preview. Signing in does not check a password or open a real account.',
    submit: 'Sign in',
    alternateLead: 'New here?',
    alternateHref: '/signup',
    alternate: 'Create an account',
    notice: 'Preview only. Nothing was checked, and no account was opened.',
  },
  signup: {
    eyebrow: 'Join the bakery',
    title: 'Create an',
    emphasis: 'account.',
    lede: 'This is a preview. Creating an account does not save your name, email, or password.',
    submit: 'Create account',
    alternateLead: 'Already browsing the preview?',
    alternateHref: '/login',
    alternate: 'Sign in',
    notice: 'Preview only. Nothing was saved, and no account was created.',
  },
} as const

function Field({
  id,
  label,
  type,
}: {
  id: string
  label: string
  type: 'text' | 'email' | 'password'
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold text-[#5a4137]">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete="off"
        required
        className="mt-2 w-full max-w-full min-h-11 rounded-2xl border border-[#eadfd5] bg-white px-4 text-base text-[#3f2c25] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c87968]"
      />
    </div>
  )
}

export function AuthScreen({ mode }: { mode: Mode }) {
  const text = copy[mode]
  const [notice, setNotice] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(text.notice)
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#fbf8f3] text-[#3f2c25]">
      <BakeryNavigation />
      <section className="mx-auto flex w-full min-w-0 max-w-[560px] flex-1 flex-col px-4 py-10 sm:px-5 sm:py-16">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1 className="mt-4 max-w-[12ch] font-serif text-5xl leading-[.95] tracking-[-.045em] text-[#402b24] sm:text-6xl">
          {text.title} <em className="font-normal text-[#c27868]">{text.emphasis}</em>
        </h1>
        <p className="mt-6 max-w-[42ch] text-base leading-7 text-[#806b60]">{text.lede}</p>
        <form onSubmit={onSubmit} autoComplete="off" className="mt-8 flex flex-col gap-4 rounded-[24px] border border-[#eadfd5] bg-[#fffaf5] p-5 sm:p-8">
          {mode === 'signup' ? <Field id="name" label="Name" type="text" /> : null}
          <Field id="email" label="Email" type="email" />
          <Field id="password" label="Password" type="password" />
          <button type="submit" className="primary-button mt-2 w-full justify-center">{text.submit}</button>
          {notice ? (
            <p role="status" className="text-sm leading-6 text-[#806b60]">
              {notice}{' '}
              <a href="/accounts" className="font-bold text-[#a95e4c] underline underline-offset-4">View the sample account</a>
            </p>
          ) : null}
        </form>
        <p className="mt-6 text-sm leading-6 text-[#806b60]">
          {text.alternateLead}{' '}
          <a href={text.alternateHref} className="text-link">{text.alternate}</a>
        </p>
        <p className="text-sm leading-6 text-[#806b60]">
          <a href="/accounts" className="text-link">Skip to the sample account</a>
        </p>
      </section>
      <BakeryFooter />
    </main>
  )
}
