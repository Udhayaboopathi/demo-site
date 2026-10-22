import type { Metadata } from 'next'
import { CrmDesk } from '@/components/admin/crm-desk'

export const metadata: Metadata = {
  title: 'Clients | Kitchen desk',
  description: 'Names from Crumb & Bloom tickets, with each client’s orders.',
}

export default function CrmPage() {
  return <CrmDesk />
}
