import { useState, useEffect, useCallback, useRef } from 'react'
import { Camera, FileText, Users, Flag, Zap, MapPin, Link as LinkIcon, Save, CheckCircle, SkipForward, User, LucideIcon, Upload, File, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateTask } from '@/hooks/useTasks'
import { supabase } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { TEAM_MEMBERS, getTeamMember } from '@/config/team'
import type { Task, TaskUpdate } from '@/lib/database.types'

interface TaskWorkspaceProps {
  task: Task
}

const TASK_TYPE_ICONS: Record<string, LucideIcon> = {
  shoot: Camera,
  deliverable: FileText,
  meeting: Users,
  milestone: Flag,
  opportunity: Zap,
}

const TASK_TYPE_LABELS: Record<string, string> = {
  shoot: 'Shoot',
  deliverable: 'Deliverable',
  meeting: 'Meeting',
  milestone: 'Milestone',
  opportunity: 'Opportunity',
}

export function TaskWorkspace({ task }: TaskWorkspaceProps) {
  const updateTask = useUpdateTask()
  const TypeIcon = TASK_TYPE_ICONS[task.task_type] || FileText
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [localTask, setLocalTask] = useState(task)
  const [isDirty, setIsDirty] = useState(false)
  const [internalNotes, setInternalNotes] = useState(task.internal_notes || '')
  const [internalNotesDirty, setInternalNotesDirty] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Reset local state when task changes
  useEffect(() => {
    setLocalTask(task)
    setInternalNotes(task.internal_notes || '')
    setIsDirty(false)
    setInternalNotesDirty(false)
  }, [task.id])

  const handleFieldChange = useCallback((field: keyof TaskUpdate, value: string | null) => {
    setLocalTask((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }, [])

  // Auto-save on blur
  const handleBlur = useCallback(async () => {
    if (!isDirty) return

    await updateTask.mutateAsync({
      id: task.id,
      title: localTask.title,
      status: localTask.status,
      priority: localTask.priority,
      notes: localTask.notes,
      location: localTask.location,
      asset_link: localTask.asset_link,
    })
    setIsDirty(false)
  }, [isDirty, localTask, task.id, updateTask])

  const handleStatusChange = async (newStatus: string) => {
    setLocalTask((prev) => ({ ...prev, status: newStatus }))
    await updateTask.mutateAsync({
      id: task.id,
      status: newStatus,
    })
    setIsDirty(false)
  }

  const handleMarkComplete = () => handleStatusChange('done')
  const handleSkip = () => handleStatusChange('skipped')

  // Save internal notes
  const handleSaveInternalNotes = async () => {
    if (!internalNotesDirty) return
    await updateTask.mutateAsync({
      id: task.id,
      internal_notes: internalNotes || null,
    })
    setInternalNotesDirty(false)
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const clientId = task.client_id || 'unknown'
      const filePath = `${clientId}/${task.id}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Save the path to the task
      await updateTask.mutateAsync({
        id: task.id,
        transcript_path: filePath,
      })
      setLocalTask((prev) => ({ ...prev, transcript_path: filePath }))
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Get public URL for transcript
  const getTranscriptUrl = () => {
    if (!localTask.transcript_path) return null
    const { data } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(localTask.transcript_path)
    return data.publicUrl
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1">
                {TASK_TYPE_LABELS[task.task_type] || task.task_type}
              </Badge>
              <Input
                value={localTask.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                onBlur={handleBlur}
                className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {task.status !== 'done' && task.status !== 'skipped' && (
              <>
                <Button variant="outline" size="sm" onClick={handleSkip}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip
                </Button>
                <Button size="sm" onClick={handleMarkComplete}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              </>
            )}
            {isDirty && (
              <Badge variant="secondary">
                <Save className="mr-1 h-3 w-3" />
                Unsaved
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status, Priority, and Assignment */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localTask.status || 'todo'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={localTask.priority || 'normal'}
              onValueChange={(v) => {
                handleFieldChange('priority', v)
                handleBlur()
              }}
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
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assigned To
            </Label>
            <Select
              value={localTask.assigned_to || ''}
              onValueChange={async (v) => {
                setLocalTask((prev) => ({ ...prev, assigned_to: v || null }))
                await updateTask.mutateAsync({
                  id: task.id,
                  assigned_to: v || null,
                })
              }}
            >
              <SelectTrigger className={!localTask.assigned_to ? 'border-red-300 text-red-500' : ''}>
                <SelectValue placeholder="Unassigned">
                  {localTask.assigned_to
                    ? getTeamMember(localTask.assigned_to)?.name || 'Unknown'
                    : 'Unassigned'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBERS.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          {task.start_time && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Start</Label>
              <p className="text-sm">{formatDate(task.start_time)}</p>
            </div>
          )}
          {task.due_date && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Due Date</Label>
              <p className={cn(
                'text-sm',
                new Date(task.due_date) < new Date() && task.status !== 'done' && 'text-red-500 font-medium'
              )}>
                {formatDate(task.due_date)}
              </p>
            </div>
          )}
          {task.completed_at && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Completed</Label>
              <p className="text-sm text-green-600">{formatDate(task.completed_at)}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Task Type Specific Fields */}
        {task.task_type === 'shoot' && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              value={localTask.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value || null)}
              onBlur={handleBlur}
              placeholder="Enter shoot location..."
            />
          </div>
        )}

        {task.task_type === 'deliverable' && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Final Asset Link
            </Label>
            <Input
              value={localTask.asset_link || ''}
              onChange={(e) => handleFieldChange('asset_link', e.target.value || null)}
              onBlur={handleBlur}
              placeholder="Paste Google Drive / Frame.io link..."
              className="font-mono text-sm"
            />
            {localTask.asset_link && (
              <a
                href={localTask.asset_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Open link
              </a>
            )}
          </div>
        )}

        {/* Asset Link for other types too */}
        {task.task_type !== 'deliverable' && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Asset Link
            </Label>
            <Input
              value={localTask.asset_link || ''}
              onChange={(e) => handleFieldChange('asset_link', e.target.value || null)}
              onBlur={handleBlur}
              placeholder="Optional: Add a link to related assets..."
              className="font-mono text-sm"
            />
          </div>
        )}

        <Separator />

        {/* Notes - Auto-saving textarea */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={localTask.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value || null)}
            onBlur={handleBlur}
            placeholder="Add notes, feedback, or communication here..."
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Notes auto-save when you click outside the field
          </p>
        </div>

        <Separator />

        {/* Internal Notes - Team Only */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <File className="h-4 w-4" />
            Internal Notes
            <Badge variant="secondary" className="text-xs">Team Only</Badge>
          </Label>
          <Textarea
            value={internalNotes}
            onChange={(e) => {
              setInternalNotes(e.target.value)
              setInternalNotesDirty(true)
            }}
            placeholder="Private team notes, reminders, or context..."
            className="min-h-[100px] resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              These notes are not visible to clients
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveInternalNotes}
              disabled={!internalNotesDirty || updateTask.isPending}
            >
              <Save className="mr-2 h-3 w-3" />
              {updateTask.isPending ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Transcript Upload */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Transcript / Document
          </Label>

          {/* Show existing transcript */}
          {localTask.transcript_path && (
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-md">
              <File className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">
                {localTask.transcript_path.split('/').pop()}
              </span>
              <a
                href={getTranscriptUrl() || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View
              </a>
            </div>
          )}

          {/* Upload input */}
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="flex-1"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Upload meeting transcripts, briefs, or reference documents (PDF, TXT, DOC)
          </p>
        </div>
      </div>
    </div>
  )
}
