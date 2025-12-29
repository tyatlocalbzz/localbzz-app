import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useClient } from '@/hooks/useClients'
import { useTasks } from '@/hooks/useTasks'
import { TaskTimeline } from '@/components/tasks/TaskTimeline'
import { TaskWorkspace } from '@/components/tasks/TaskWorkspace'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const taskIdFromUrl = searchParams.get('task')

  const { data: client, isLoading: clientLoading } = useClient(id)
  const { data: tasks, isLoading: tasksLoading } = useTasks(id)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Set initial selected task from URL or first task
  useEffect(() => {
    if (taskIdFromUrl) {
      setSelectedTaskId(taskIdFromUrl)
    } else if (tasks && tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id)
    }
  }, [tasks, taskIdFromUrl, selectedTaskId])

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
        <AddTaskDialog clientId={id!} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Timeline */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-220px)] overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
