import type { Metadata } from 'next'
import { DashboardDesk } from '@/components/admin/dashboard-desk'

export const metadata: Metadata = {
  title: 'Kitchen desk | Crumb & Bloom',
  description: 'Overview of Crumb & Bloom products, staff, and open counter orders.',
}

export default function AdminPage() {
  return <DashboardDesk />
}
