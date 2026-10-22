import type { Metadata } from 'next'
import { OrdersDesk } from '@/components/admin/orders-desk'

export const metadata: Metadata = { title: 'All orders | Kitchen desk', description: 'Every Crumb & Bloom counter and online ticket.' }

export default function AllOrdersPage() {
  return <OrdersDesk scope="all" />
}
