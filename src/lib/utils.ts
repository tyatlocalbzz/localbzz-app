import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return ''
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return ''
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatRelativeDate(date: string | Date | null | undefined) {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getMonthYear(date: string | Date) {
  return format(new Date(date), 'MMMM yyyy')
}

export function isOverdue(dueDate: string | Date | null | undefined) {
  if (!dueDate) return false
  return isBefore(new Date(dueDate), new Date())
}

export function isAtRisk(dueDate: string | Date | null | undefined, hours = 48) {
  if (!dueDate) return false
  const deadline = new Date(dueDate)
  const now = new Date()
  const riskThreshold = addDays(now, hours / 24)
  return isAfter(deadline, now) && isBefore(deadline, riskThreshold)
}

export function getHealthStatus(
  status: string,
  dueDate: string | Date | null | undefined,
  assignedTo: string | null | undefined
): 'healthy' | 'risk' | 'critical' {
  if (status === 'done' || status === 'skipped') return 'healthy'
  if (!assignedTo) return 'critical'
  if (isOverdue(dueDate)) return 'critical'
  if (isAtRisk(dueDate)) return 'risk'
  return 'healthy'
}

export const STATUS_COLORS = {
  todo: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  review: 'bg-purple-500',
  done: 'bg-green-500',
  skipped: 'bg-gray-400',
} as const

export const HEALTH_COLORS = {
  healthy: 'text-green-500',
  risk: 'text-yellow-500',
  critical: 'text-red-500',
} as const

export const TASK_TYPE_LABELS = {
  shoot: 'Shoot',
  deliverable: 'Deliverable',
  meeting: 'Meeting',
  milestone: 'Milestone',
  opportunity: 'Opportunity',
} as const
