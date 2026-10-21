import type { Metadata } from 'next'
import { StatusScreen } from '@/components/status-screen'

export const metadata: Metadata = {
  title: 'Page not found | Crumb & Bloom',
  description: 'This Crumb & Bloom address is not on the site. Return home or browse the bakery menu.',
}

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      eyebrow="Page not found"
      title="This page is not"
      emphasis="on the menu."
      description="Crumb & Bloom does not have a page at this address. The link may be out of date, or the page may have moved. The menu and the Willow Street shop are still open."
    >
      <a href="/" className="primary-button">Back to the bakery</a>
      <a href="/menu" className="secondary-button">Browse the menu</a>
    </StatusScreen>
  )
}
