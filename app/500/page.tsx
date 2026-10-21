import type { Metadata } from 'next'
import { StatusScreen } from '@/components/status-screen'

export const metadata: Metadata = {
  title: 'Something went wrong | Crumb & Bloom',
  description: 'Crumb & Bloom could not finish loading a page. Try again, or return to the bakery home page.',
  robots: { index: false, follow: false },
}

export default function ServerErrorPage() {
  return (
    <StatusScreen
      code="500"
      eyebrow="Kitchen pause"
      title="Something did not"
      emphasis="rise."
      description="This is the Crumb & Bloom page for a server problem. If a page fails to load, try it again. Items already saved in your order bag stay in this browser."
    >
      <a href="/" className="primary-button">Back to the bakery</a>
      <a href="/menu" className="secondary-button">Browse the menu</a>
    </StatusScreen>
  )
}
