import type { Metadata } from 'next'
import { CategoriesDesk } from '@/components/admin/categories-desk'

export const metadata: Metadata = { title: 'Categories | Kitchen desk', description: 'Manage Crumb & Bloom menu categories for the counter.' }

export default function CategoriesPage() {
  return <CategoriesDesk />
}
