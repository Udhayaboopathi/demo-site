'use client'

import { useCallback, useEffect, useState } from 'react'
import { products, type ProductCustomization } from '@/components/bakery-navigation'

const KEY = 'crumb-bloom-admin'
const VERSION = 1

export type AdminCategory = { id: string; name: string; note: string; active: boolean }
export type AdminProduct = {
  id: string
  name: string
  categoryId: string
  price: number
  tag: string
  description: string
  image: string
  images: string[]
  available: boolean
  customization?: ProductCustomization
}
export type Employee = { id: string; name: string; role: string; phone: string; status: 'active' | 'on-leave'; pay: number; started: string }
export type AttendanceMark = 'present' | 'late' | 'absent' | 'leave'
export type AttendanceDay = { date: string; marks: Record<string, AttendanceMark> }
export type Payslip = {
  id: string
  employeeId: string
  month: string
  base: number
  daysPresent: number
  daysLate: number
  daysAbsent: number
  deduction: number
  net: number
  status: 'draft' | 'paid'
}
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed'
export type AdminOrderItem = { name: string; price: number; quantity: number; note?: string }
export type AdminOrder = {
  id: string
  number: string
  createdAt: string
  customer: string
  channel: 'counter' | 'online'
  status: OrderStatus
  items: AdminOrderItem[]
}
export type AdminState = {
  version: number
  categories: AdminCategory[]
  products: AdminProduct[]
  employees: Employee[]
  attendance: AttendanceDay[]
  payslips: Payslip[]
  orders: AdminOrder[]
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
}

export const nextOrderStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
}

export function todayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function monthKey(date = new Date()) {
  return todayKey(date).slice(0, 7)
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function orderTotal(order: { items: AdminOrderItem[] }) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const hours = date.getHours()
  const hour = hours % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${months[date.getMonth()]} ${date.getDate()}, ${hour}:${minutes} ${hours < 12 ? 'am' : 'pm'}`
}

const categoryIds: Record<string, string> = { Cakes: 'cakes', Pastries: 'pastries', Bread: 'bread', Cookies: 'cookies' }

const employees: Employee[] = [
  { id: 'emp-lila', name: 'Lila Ortiz', role: 'Head baker', phone: '(718) 555-0162', status: 'active', pay: 48000, started: '2022-04-11' },
  { id: 'emp-owen', name: 'Owen Blake', role: 'Pastry cook', phone: '(718) 555-0174', status: 'active', pay: 36000, started: '2023-09-02' },
  { id: 'emp-noor', name: 'Noor Shah', role: 'Counter', phone: '(718) 555-0188', status: 'active', pay: 28000, started: '2024-01-15' },
  { id: 'emp-sam', name: 'Sam Iyer', role: 'Baker', phone: '(718) 555-0190', status: 'on-leave', pay: 32000, started: '2021-11-08' },
]

function marks(lila: AttendanceMark, owen: AttendanceMark, noor: AttendanceMark, sam: AttendanceMark) {
  return { 'emp-lila': lila, 'emp-owen': owen, 'emp-noor': noor, 'emp-sam': sam }
}

export function seedAdmin(): AdminState {
  const categories: AdminCategory[] = [
    { id: 'cakes', name: 'Cakes', note: 'Celebration layers and loaf cakes.', active: true },
    { id: 'pastries', name: 'Pastries', note: 'Morning buns and laminated dough.', active: true },
    { id: 'bread', name: 'Bread', note: 'Slow loaves and focaccia.', active: true },
    { id: 'cookies', name: 'Cookies', note: 'Counter cookies and shortbread.', active: true },
  ]
  const catalog: AdminProduct[] = products.map((product) => ({
    id: slug(product.name),
    name: product.name,
    categoryId: categoryIds[product.category] ?? slug(product.category),
    price: product.price,
    tag: product.tag,
    description: product.description,
    image: product.image,
    images: product.images,
    available: true,
    ...(product.customization ? { customization: product.customization } : {}),
  }))
  const attendance: AttendanceDay[] = [
    { date: '2026-10-20', marks: marks('present', 'present', 'present', 'leave') },
    { date: '2026-10-21', marks: marks('present', 'late', 'present', 'leave') },
    { date: '2026-10-22', marks: marks('present', 'present', 'late', 'leave') },
  ]
  const today = todayKey()
  if (!attendance.some((day) => day.date === today)) attendance.push({ date: today, marks: marks('present', 'present', 'late', 'leave') })
  const orders: AdminOrder[] = [
    { id: 'ord-1048', number: 'CB-1048', createdAt: '2026-10-22T08:15:00', customer: 'Walk-in', channel: 'counter', status: 'pending', items: [{ name: 'Almond Croissant', price: 5.5, quantity: 2 }, { name: 'Sea Salt Cookie', price: 3.5, quantity: 1 }] },
    { id: 'ord-1047', number: 'CB-1047', createdAt: '2026-10-22T07:40:00', customer: 'Table 2', channel: 'counter', status: 'preparing', items: [{ name: 'Country Sourdough', price: 8, quantity: 1, note: 'Sliced' }] },
    { id: 'ord-1046', number: 'CB-1046', createdAt: '2026-10-21T16:05:00', customer: 'Priya N.', channel: 'online', status: 'ready', items: [{ name: 'Strawberry Cloud Cake', price: 42, quantity: 1, note: '8 inch · Berry · “Happy day”' }] },
    { id: 'ord-1045', number: 'CB-1045', createdAt: '2026-10-21T11:20:00', customer: 'Walk-in', channel: 'counter', status: 'completed', items: [{ name: 'Chocolate Chunk Cookie', price: 3.5, quantity: 4 }] },
  ]
  const base: AdminState = { version: VERSION, categories, products: catalog, employees, attendance, payslips: [], orders }
  const withSlips = rebuildPayslips(base, '2026-10')
  return { ...withSlips, payslips: withSlips.payslips.map((slip) => slip.employeeId === 'emp-lila' && slip.month === '2026-10' ? { ...slip, status: 'paid' } : slip) }
}

export function rebuildPayslips(state: AdminState, month: string): AdminState {
  const days = state.attendance.filter((day) => day.date.startsWith(month))
  const paid = state.payslips.filter((slip) => slip.month === month && slip.status === 'paid')
  const paidIds = new Set(paid.map((slip) => slip.employeeId))
  const drafts = state.employees.filter((employee) => !paidIds.has(employee.id)).map((employee) => {
    let daysPresent = 0
    let daysLate = 0
    let daysAbsent = 0
    days.forEach((day) => {
      const mark = day.marks[employee.id]
      if (mark === 'present') daysPresent += 1
      else if (mark === 'late') daysLate += 1
      else if (mark === 'absent') daysAbsent += 1
    })
    const daily = employee.pay / 26
    const deduction = Math.round((daysAbsent * daily + daysLate * daily * 0.5) * 100) / 100
    const net = Math.max(0, Math.round((employee.pay - deduction) * 100) / 100)
    return { id: `pay-${month}-${employee.id}`, employeeId: employee.id, month, base: employee.pay, daysPresent, daysLate, daysAbsent, deduction, net, status: 'draft' as const }
  })
  const rest = state.payslips.filter((slip) => slip.month !== month)
  return { ...state, payslips: [...drafts, ...paid, ...rest] }
}

export function nextOrderNumber(state: AdminState) {
  const max = state.orders.reduce((highest, order) => {
    const value = Number(order.number.replace(/\D/g, ''))
    return Number.isFinite(value) ? Math.max(highest, value) : highest
  }, 1000)
  return `CB-${max + 1}`
}

function isState(value: unknown): value is AdminState {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<AdminState>
  return record.version === VERSION && Array.isArray(record.products) && Array.isArray(record.categories) && Array.isArray(record.employees) && Array.isArray(record.attendance) && Array.isArray(record.payslips) && Array.isArray(record.orders)
}

export function readAdmin() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (isState(parsed)) return parsed
  } catch {
    /* use the sample desk */
  }
  return seedAdmin()
}

export function writeAdmin(state: AdminState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function useAdminState() {
  const [state, setState] = useState<AdminState | null>(null)
  useEffect(() => { setState(readAdmin()) }, [])
  const commit = useCallback((next: AdminState) => {
    const stamped = { ...next, version: VERSION }
    writeAdmin(stamped)
    setState(stamped)
  }, [])
  return { state, commit, ready: state !== null }
}
