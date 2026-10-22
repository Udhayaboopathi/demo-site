import type { Metadata } from 'next'
import { PosDesk } from '@/components/admin/pos-desk'

export const metadata: Metadata = { title: 'New order | Kitchen desk', description: 'Create a Crumb & Bloom counter ticket from the same case as the menu.' }

export default function PosPage() {
  return <PosDesk />
}
