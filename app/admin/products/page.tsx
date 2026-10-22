import type { Metadata } from 'next'
import { ProductsDesk } from '@/components/admin/products-desk'

export const metadata: Metadata = { title: 'Products | Kitchen desk', description: 'Add, edit, and hide Crumb & Bloom products for the counter.' }

export default function ProductsPage() {
  return <ProductsDesk />
}
