import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'

export const metadata: Metadata = {
  title: 'Kitchen desk | Crumb & Bloom',
  description: 'Crumb & Bloom kitchen desk for products, categories, clients, staff, attendance, payslips, and counter orders.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
