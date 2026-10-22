import type { Metadata } from 'next'
import { ClientPage } from '@/components/admin/crm-desk'

export const metadata: Metadata = {
  title: 'Client | Kitchen desk',
  description: 'Orders placed under one name at Crumb & Bloom.',
}

export default async function Page({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  return <ClientPage id={clientId} />
}
