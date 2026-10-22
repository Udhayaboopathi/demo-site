import type { Metadata } from 'next'
import { PayslipsDesk } from '@/components/admin/payslips-desk'

export const metadata: Metadata = { title: 'Payslips | Kitchen desk', description: 'Build monthly payslips from attendance and mark them paid.' }

export default function PayslipsPage() {
  return <PayslipsDesk />
}
