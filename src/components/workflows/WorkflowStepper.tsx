import { useMemo } from 'react'
import { Camera, FileText, Flag, Phone, BarChart3, CheckCircle2, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/database.types'

interface WorkflowStepperProps {
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
}

// Order tasks by workflow stage
const WORKFLOW_ORDER: Record<string, number> = {
  meeting: 1,      // Planning Call
  shoot: 2,        // Content Shoot
  deliverable: 3,  // Edit / Publish / Report
  milestone: 4,    // Client Review
}

// Get sub-order for deliverables based on title keywords
function getDeliverableOrder(title: string): number {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('edit')) return 3.1
  if (lowerTitle.includes('review')) return 3.5
  if (lowerTitle.includes('publish')) return 3.8
  if (lowerTitle.includes('report')) return 3.9
  return 3.5
}

const TASK_TYPE_ICONS: Record<string, LucideIcon> = {
  meeting: Phone,
  shoot: Camera,
  deliverable: FileText,
  milestone: Flag,
  report: BarChart3,
}

type HealthStatus = 'on_track' | 'at_risk' | 'behind' | 'completed'

function getTaskHealth(task: Task): HealthStatus {
  if (task.status === 'done' || task.status === 'skipped') {
    return 'completed'
  }

  if (!task.due_date) return 'on_track'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.due_date)
  dueDate.setHours(0, 0, 0, 0)

  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilDue < 0) return 'behind'
  if (daysUntilDue <= 3) return 'at_risk'
  return 'on_track'
}

const HEALTH_COLORS: Record<HealthStatus, { ring: string; bg: string; text: string }> = {
  completed: {
    ring: 'ring-green-500',
    bg: 'bg-green-500',
    text: 'text-green-500',
  },
  on_track: {
    ring: 'ring-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-500',
  },
  at_risk: {
    ring: 'ring-yellow-500',
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
  },
  behind: {
    ring: 'ring-red-500',
    bg: 'bg-red-500',
    text: 'text-red-500',
  },
}

export function WorkflowStepper({ tasks, selectedTaskId, onSelectTask }: WorkflowStepperProps) {
  // Sort tasks by workflow order
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const orderA = a.task_type === 'deliverable'
        ? getDeliverableOrder(a.title)
        : (WORKFLOW_ORDER[a.task_type] || 99)
      const orderB = b.task_type === 'deliverable'
        ? getDeliverableOrder(b.title)
        : (WORKFLOW_ORDER[b.task_type] || 99)
      return orderA - orderB
    })
  }, [tasks])

  // Find current active step (first non-completed task)
  const currentStepIndex = useMemo(() => {
    return sortedTasks.findIndex(t => t.status !== 'done' && t.status !== 'skipped')
  }, [sortedTasks])

  // Calculate overall month health
  const monthHealth = useMemo(() => {
    const activeTask = sortedTasks[currentStepIndex]
    if (!activeTask) return 'completed'
    return getTaskHealth(activeTask)
  }, [sortedTasks, currentStepIndex])

  if (sortedTasks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No workflow tasks
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Progress Bar */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />

        {/* Completed portion of line */}
        {currentStepIndex > 0 && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-green-500 z-0"
            style={{
              width: `${(currentStepIndex / (sortedTasks.length - 1)) * 100}%`
            }}
          />
        )}

        {/* Step nodes */}
        {sortedTasks.map((task, index) => {
          const isCompleted = task.status === 'done' || task.status === 'skipped'
          const isCurrent = index === currentStepIndex
          const isFuture = index > currentStepIndex
          const health = getTaskHealth(task)
          const colors = HEALTH_COLORS[health]
          const isSelected = task.id === selectedTaskId

          // Get icon based on task type or title
          let Icon = TASK_TYPE_ICONS[task.task_type] || FileText
          if (task.title.toLowerCase().includes('report')) {
            Icon = BarChart3
          }

          return (
            <button
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={cn(
                'relative z-10 flex items-center justify-center transition-all',
                isSelected && 'scale-110'
              )}
              title={task.title}
            >
              {/* Completed step */}
              {isCompleted && (
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              )}

              {/* Current active step - pulsing ring */}
              {isCurrent && (
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center shadow-md',
                  colors.bg,
                  'ring-4 ring-offset-2 ring-offset-background animate-pulse',
                  colors.ring
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              )}

              {/* Future step */}
              {isFuture && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Labels row */}
      <div className="flex items-start justify-between mt-2">
        {sortedTasks.map((task, index) => {
          const isCompleted = task.status === 'done' || task.status === 'skipped'
          const isCurrent = index === currentStepIndex
          const health = getTaskHealth(task)
          const colors = HEALTH_COLORS[health]

          // Short label from title
          const shortLabel = task.title
            .replace(/\{\{Month\}\}/g, '')
            .replace(/January|February|March|April|May|June|July|August|September|October|November|December/gi, '')
            .trim()
            .split(' ')
            .slice(0, 2)
            .join(' ')

          return (
            <div
              key={task.id}
              className={cn(
                'text-center flex-1 min-w-0 px-1',
                isCompleted && 'text-green-600',
                isCurrent && colors.text,
                !isCompleted && !isCurrent && 'text-muted-foreground'
              )}
            >
              <p className={cn(
                'text-xs truncate',
                isCurrent && 'font-semibold'
              )}>
                {shortLabel}
              </p>
            </div>
          )
        })}
      </div>

      {/* Month status indicator */}
      <div className={cn(
        'mt-3 text-center text-xs font-medium',
        monthHealth === 'completed' && 'text-green-600',
        monthHealth === 'on_track' && 'text-blue-600',
        monthHealth === 'at_risk' && 'text-yellow-600',
        monthHealth === 'behind' && 'text-red-600'
      )}>
        {monthHealth === 'completed' && 'All tasks complete'}
        {monthHealth === 'on_track' && 'On track'}
        {monthHealth === 'at_risk' && 'Due soon'}
        {monthHealth === 'behind' && 'Behind schedule'}
      </div>
    </div>
  )
}
