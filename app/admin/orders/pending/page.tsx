import type { Metadata } from 'next'
import { OrdersDesk } from '@/components/admin/orders-desk'

export const metadata: Metadata = { title: 'Pending orders | Kitchen desk', description: 'Crumb & Bloom tickets still pending, preparing, or ready for pickup.' }

export default function PendingOrdersPage() {
  return <OrdersDesk scope="pending" />
}
