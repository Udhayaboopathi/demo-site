'use client'

import { StatusScreen } from '@/components/status-screen'

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <StatusScreen
      code="500"
      eyebrow="Kitchen pause"
      title="Something did not"
      emphasis="rise."
      description="Crumb & Bloom could not finish loading this page. Try again in a moment. Items already saved in your order bag stay in this browser."
      note={error.digest ? `Reference ${error.digest}` : undefined}
    >
      <button type="button" className="primary-button" onClick={() => retry()}>Try again</button>
      <a href="/" className="secondary-button">Back to the bakery</a>
    </StatusScreen>
  )
}
