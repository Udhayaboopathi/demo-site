import type { Metadata } from 'next'
import { EmployeesDesk } from '@/components/admin/employees-desk'

export const metadata: Metadata = { title: 'Employees | Kitchen desk', description: 'Crew list, roles, and monthly pay for Crumb & Bloom.' }

export default function EmployeesPage() {
  return <EmployeesDesk />
}
