import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useClient, useUpdateClient } from '@/hooks/useClients'
import { useTasks } from '@/hooks/useTasks'
import { useIsMobile } from '@/hooks/use-mobile'
import { useWorkflowTemplates } from '@/hooks/useWorkflow'
import { useAutoGenerateTasks } from '@/hooks/useAutoGenerateTasks'
import { TaskTimeline } from '@/components/tasks/TaskTimeline'
import { TaskWorkspace } from '@/components/tasks/TaskWorkspace'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const taskIdFromUrl = searchParams.get('task')
  const isMobile = useIsMobile()

  const { data: client, isLoading: clientLoading } = useClient(id)
  const { data: tasks, isLoading: tasksLoading } = useTasks(id)
  const { data: templates } = useWorkflowTemplates()
  const updateClient = useUpdateClient()
  const { isGenerating, isEnabled } = useAutoGenerateTasks(id)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  // Mobile: track whether we're viewing the list or detail
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

  // Set initial selected task from URL or first task
  useEffect(() => {
    if (taskIdFromUrl) {
      setSelectedTaskId(taskIdFromUrl)
      if (isMobile) setMobileView('detail')
    } else if (tasks && tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id)
    }
  }, [tasks, taskIdFromUrl, selectedTaskId, isMobile])

  // Handle task selection on mobile - switch to detail view
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId)
    if (isMobile) {
      setMobileView('detail')
    }
  }

  // Handle back button on mobile - return to list view
  const handleBackToList = () => {
    setMobileView('list')
  }

  const selectedTask = tasks?.find((t) => t.id === selectedTaskId)

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px]" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Client not found</h2>
          <p className="text-muted-foreground mt-2">
            The client you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-4">
            <Link to="/clients">Back to Clients</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Mobile: Master-Detail Navigation
  if (isMobile) {
    // Detail View
    if (mobileView === 'detail' && selectedTask) {
      return (
        <div className="space-y-4">
          {/* Header with Back Button */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{client.name}</h1>
              <p className="text-sm text-muted-foreground truncate">{selectedTask.title}</p>
            </div>
          </div>

          {/* Task Workspace */}
          <Card className="h-[calc(100vh-140px)] overflow-hidden">
            <CardContent className="p-0 h-full">
              <TaskWorkspace task={selectedTask} />
            </CardContent>
          </Card>
        </div>
      )
    }

    // List View (Timeline)
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/clients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{client.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>
                  {client.status}
                </Badge>
                {client.package_tier && (
                  <span>{client.package_tier}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <Badge variant="outline" className="animate-pulse">
                Syncing...
              </Badge>
            )}
            {isEnabled && !isGenerating && (
              <Badge variant="outline" className="text-green-600">
                Auto
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Auto-Schedule</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={client.auto_workflow_enabled ?? false}
                  onCheckedChange={(checked) =>
                    updateClient.mutate({ id: id!, auto_workflow_enabled: checked })
                  }
                >
                  Enable monthly auto-generation
                </DropdownMenuCheckboxItem>
                {client.auto_workflow_enabled && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs">Template</DropdownMenuLabel>
                    {templates?.map((t) => (
                      <DropdownMenuCheckboxItem
                        key={t.id}
                        checked={client.default_template_id === t.id}
                        onCheckedChange={() =>
                          updateClient.mutate({ id: id!, default_template_id: t.id })
                        }
                      >
                        {t.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <AddTaskDialog clientId={id!} />
          </div>
        </div>

        {/* Timeline */}
        <Card className="h-[calc(100vh-180px)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-60px)] overflow-hidden">
            {tasksLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : tasks && tasks.length > 0 ? (
              <TaskTimeline
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={handleSelectTask}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4">No tasks yet</p>
                <p className="text-sm">Add a task to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Desktop: Split View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>
                {client.status}
              </Badge>
              {client.package_tier && (
                <span>{client.package_tier}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <Badge variant="outline" className="animate-pulse">
              Syncing schedule...
            </Badge>
          )}
          {isEnabled && !isGenerating && (
            <Badge variant="outline" className="text-green-600">
              Auto-schedule on
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Auto-Schedule</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={client.auto_workflow_enabled ?? false}
                onCheckedChange={(checked) =>
                  updateClient.mutate({ id: id!, auto_workflow_enabled: checked })
                }
              >
                Enable monthly auto-generation
              </DropdownMenuCheckboxItem>
              {client.auto_workflow_enabled && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Template</DropdownMenuLabel>
                  {templates?.map((t) => (
                    <DropdownMenuCheckboxItem
                      key={t.id}
                      checked={client.default_template_id === t.id}
                      onCheckedChange={() =>
                        updateClient.mutate({ id: id!, default_template_id: t.id })
                      }
                    >
                      {t.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddTaskDialog clientId={id!} />
        </div>
      </div>

      {/* Split View Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Timeline */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-220px)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)] overflow-hidden">
              {tasksLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : tasks && tasks.length > 0 ? (
                <TaskTimeline
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-4">No tasks yet</p>
                  <p className="text-sm">Add a task to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Workspace */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-220px)] overflow-hidden">
            <CardContent className="p-0 h-full">
              {selectedTask ? (
                <TaskWorkspace task={selectedTask} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4">Select a task to view details</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
