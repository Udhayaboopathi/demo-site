'use client'

import './globals.css'

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="flex min-h-dvh flex-col bg-[#fbf8f3] px-5 py-12 text-[#3f2c25]">
          <div className="mx-auto flex w-full min-w-0 max-w-[1240px] flex-1 flex-col">
            <p className="eyebrow">Kitchen pause</p>
            <p className="mt-4 font-serif text-6xl leading-none tracking-[-.04em] text-[#c87968] sm:text-7xl">
              <span className="sr-only">Error </span>
              500
            </p>
            <h1 className="mt-4 max-w-[14ch] font-serif text-5xl leading-[.95] tracking-[-.045em] text-[#402b24] sm:text-7xl">
              Something did not <em className="font-normal text-[#c27868]">rise.</em>
            </h1>
            <p className="mt-6 max-w-[46ch] text-base leading-7 text-[#806b60]">
              Crumb & Bloom could not finish loading the site. Try again in a moment. If you were building an order, the bag saved in this browser is still on this device.
            </p>
            {error.digest ? <p className="mt-4 max-w-[46ch] break-all text-sm leading-6 text-[#927a6d]">Reference {error.digest}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="primary-button" onClick={() => retry()}>Try again</button>
              <a href="/" className="secondary-button">Back to the bakery</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
