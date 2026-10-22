import type { Metadata } from 'next'
import { AttendanceDesk } from '@/components/admin/attendance-desk'

export const metadata: Metadata = { title: 'Attendance | Kitchen desk', description: 'Mark present, late, absent, or leave for the Crumb & Bloom crew.' }

export default function AttendancePage() {
  return <AttendanceDesk />
}
