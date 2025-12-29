import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateTask } from '@/hooks/useTasks'

// Form data type
interface TaskFormData {
  title: string
  task_type: 'shoot' | 'deliverable' | 'meeting' | 'milestone' | 'opportunity'
  status: 'todo' | 'scheduled' | 'in_progress' | 'review' | 'done' | 'skipped'
  priority: 'normal' | 'high' | 'critical'
  assigned_to: string
  due_date?: string
  start_time?: string
  location?: string
  notes?: string
}

// Zod schema enforces assigned_to as required per spec
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  task_type: z.enum(['shoot', 'deliverable', 'meeting', 'milestone', 'opportunity']),
  status: z.enum(['todo', 'scheduled', 'in_progress', 'review', 'done', 'skipped']),
  priority: z.enum(['normal', 'high', 'critical']),
  assigned_to: z.string().min(1, 'Assigned to is required'), // REQUIRED per spec
  due_date: z.string().optional(),
  start_time: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

interface AddTaskDialogProps {
  clientId: string
}

export function AddTaskDialog({ clientId }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const createTask = useCreateTask()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'todo',
      priority: 'normal',
      task_type: 'deliverable',
    },
  })

  const taskType = watch('task_type')

  const onSubmit = async (data: TaskFormData) => {
    await createTask.mutateAsync({
      client_id: clientId,
      title: data.title,
      task_type: data.task_type,
      status: data.status,
      priority: data.priority,
      assigned_to: data.assigned_to,
      due_date: data.due_date || null,
      start_time: data.start_time || null,
      location: data.location || null,
      notes: data.notes || null,
    })

    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for this client
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., January Content Shoot"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label>
                Task Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={taskType}
                onValueChange={(v) => setValue('task_type', v as TaskFormData['task_type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shoot">Shoot</SelectItem>
                  <SelectItem value="deliverable">Deliverable</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To - REQUIRED */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to">
                Assigned To <span className="text-red-500">*</span>
              </Label>
              <Input
                id="assigned_to"
                {...register('assigned_to')}
                placeholder="User UUID (from Supabase Auth)"
              />
              {errors.assigned_to && (
                <p className="text-sm text-red-500">{errors.assigned_to.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the UUID of the user from Supabase Authentication
              </p>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
              />
            </div>

            {/* Start Time (for shoots) */}
            {taskType === 'shoot' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    {...register('start_time')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="Shoot location"
                  />
                </div>
              </>
            )}

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                defaultValue="normal"
                onValueChange={(v) => setValue('priority', v as TaskFormData['priority'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Optional notes..."
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
