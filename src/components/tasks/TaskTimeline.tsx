import { useMemo } from 'react'
import { format } from 'date-fns'
import { Camera, FileText, Users, Flag, Zap, Circle, CheckCircle2, Clock, AlertCircle, LucideIcon } from 'lucide-react'
import { cn, getHealthStatus, getMonthYear } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Task } from '@/lib/database.types'

interface TaskTimelineProps {
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
}

const TASK_TYPE_ICONS: Record<string, LucideIcon> = {
  shoot: Camera,
  deliverable: FileText,
  meeting: Users,
  milestone: Flag,
  opportunity: Zap,
}

const STATUS_ICONS: Record<string, LucideIcon> = {
  todo: Circle,
  scheduled: Clock,
  in_progress: Clock,
  review: AlertCircle,
  done: CheckCircle2,
  skipped: Circle,
}

const STATUS_COLORS: Record<string, string> = {
  todo: 'text-gray-400',
  scheduled: 'text-blue-500',
  in_progress: 'text-yellow-500',
  review: 'text-purple-500',
  done: 'text-green-500',
  skipped: 'text-gray-300',
}

export function TaskTimeline({ tasks, selectedTaskId, onSelectTask }: TaskTimelineProps) {
  // Group tasks by month
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, Task[]>()

    tasks.forEach((task) => {
      const dateToUse = task.due_date || task.start_time || task.created_at || new Date().toISOString()
      const monthKey = getMonthYear(dateToUse)

      if (!groups.has(monthKey)) {
        groups.set(monthKey, [])
      }
      groups.get(monthKey)!.push(task)
    })

    // Sort by date descending (newest first)
    return Array.from(groups.entries()).sort((a, b) => {
      const dateA = new Date(a[1][0].due_date || a[1][0].start_time || a[1][0].created_at || 0)
      const dateB = new Date(b[1][0].due_date || b[1][0].start_time || b[1][0].created_at || 0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [tasks])

  return (
    <div className="h-full overflow-y-auto">
      {groupedTasks.map(([month, monthTasks]) => (
        <div key={month}>
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 border-b">
            <h3 className="text-sm font-semibold text-muted-foreground">{month}</h3>
          </div>
          <div className="divide-y">
            {monthTasks.map((task) => (
              <TaskTimelineItem
                key={task.id}
                task={task}
                isSelected={task.id === selectedTaskId}
                onClick={() => onSelectTask(task.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface TaskTimelineItemProps {
  task: Task
  isSelected: boolean
  onClick: () => void
}

function TaskTimelineItem({ task, isSelected, onClick }: TaskTimelineItemProps) {
  const TypeIcon = TASK_TYPE_ICONS[task.task_type] || FileText
  const StatusIcon = STATUS_ICONS[task.status || 'todo'] || Circle
  const healthStatus = getHealthStatus(task.status || 'todo', task.due_date, task.assigned_to)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
        isSelected
          ? 'bg-secondary'
          : 'hover:bg-muted/50'
      )}
    >
      {/* Status indicator */}
      <div className="mt-0.5">
        <StatusIcon
          className={cn('h-5 w-5', STATUS_COLORS[task.status || 'todo'] || 'text-gray-400')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{task.title}</span>
        </div>
        {task.due_date && (
          <p className={cn(
            'text-xs mt-1',
            healthStatus === 'critical' && 'text-red-500',
            healthStatus === 'risk' && 'text-yellow-500',
            healthStatus === 'healthy' && 'text-muted-foreground'
          )}>
            {format(new Date(task.due_date), 'MMM d, yyyy')}
            {healthStatus === 'critical' && task.status !== 'done' && ' • Overdue'}
            {healthStatus === 'risk' && task.status !== 'done' && ' • Due soon'}
          </p>
        )}
      </div>

      {/* Avatar */}
      {task.assigned_to ? (
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">
            {task.assigned_to.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-6 w-6 rounded-full border-2 border-dashed border-red-300 flex items-center justify-center">
          <span className="text-[10px] text-red-400">?</span>
        </div>
      )}
    </button>
  )
}
