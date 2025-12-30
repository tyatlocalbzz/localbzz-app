import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar, Settings, Rocket, Repeat, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClient } from '@/hooks/useClients'
import { useTasks } from '@/hooks/useTasks'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAutoGenerateTasks } from '@/hooks/useAutoGenerateTasks'
import { TaskTimeline } from '@/components/tasks/TaskTimeline'
import { TaskWorkspace } from '@/components/tasks/TaskWorkspace'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'
import { ClientDocumentsView } from '@/components/clients/ClientDocumentsView'
import type { ClientPhase } from '@/lib/database.types'

const PHASE_CONFIG: Record<ClientPhase, { label: string; icon: typeof Rocket; className: string }> = {
  foundations: {
    label: 'The Foundations',
    icon: Rocket,
    className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  },
  monthly: {
    label: 'Monthly',
    icon: Repeat,
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  project: {
    label: 'Project',
    icon: Briefcase,
    className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  },
}

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const taskIdFromUrl = searchParams.get('task')
  const isMobile = useIsMobile()

  const { data: client, isLoading: clientLoading } = useClient(id)
  const { data: tasks, isLoading: tasksLoading } = useTasks(id)
  const { isGenerating, isEnabled } = useAutoGenerateTasks(id)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  // Mobile: track whether we're viewing the list or detail
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')
  // Tab state for desktop view
  const [activeTab, setActiveTab] = useState<'tasks' | 'documents'>('tasks')

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
    const mobilePhase = client.client_phase || 'monthly'
    const mobilePhaseConfig = PHASE_CONFIG[mobilePhase]
    const MobilePhaseIcon = mobilePhaseConfig.icon

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
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>
                  {client.status}
                </Badge>
                <Badge variant="outline" className={mobilePhaseConfig.className}>
                  <MobilePhaseIcon className="mr-1 h-3 w-3" />
                  {mobilePhaseConfig.label}
                </Badge>
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
            {!isEnabled && client.status !== 'active' && (
              <Badge variant="outline" className="text-yellow-600">
                {client.status === 'paused' ? 'Paused' : 'Inactive'}
              </Badge>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/clients/${id}/settings`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
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
                clientPhase={client.client_phase}
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
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>
                {client.status}
              </Badge>
              {(() => {
                const desktopPhase = client.client_phase || 'monthly'
                const desktopPhaseConfig = PHASE_CONFIG[desktopPhase]
                const DesktopPhaseIcon = desktopPhaseConfig.icon
                return (
                  <Badge variant="outline" className={desktopPhaseConfig.className}>
                    <DesktopPhaseIcon className="mr-1 h-3 w-3" />
                    {desktopPhaseConfig.label}
                  </Badge>
                )
              })()}
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
          {!isEnabled && client.status !== 'active' && (
            <Badge variant="outline" className="text-yellow-600">
              {client.status === 'paused' ? 'Paused' : 'Inactive'}
            </Badge>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/clients/${id}/settings`}>
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <AddTaskDialog clientId={id!} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tasks' | 'documents')}>
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Tasks Tab - Split View Layout */}
        <TabsContent value="tasks" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Timeline */}
            <div className="lg:col-span-2">
              <Card className="h-[calc(100vh-280px)]">
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
                      clientPhase={client.client_phase}
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
              <Card className="h-[calc(100vh-280px)] overflow-hidden">
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
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientDocumentsView clientId={id!} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
