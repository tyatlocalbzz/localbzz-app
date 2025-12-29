import { Link } from 'react-router-dom'
import { AlertTriangle, Ghost, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCriticalTasks, useGhostClients } from '@/hooks/useTasks'

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agency Pulse</h1>
        <p className="text-muted-foreground">
          Management by exception. Only what needs your attention.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RedFlagsWidget />
        <GhostMonitorWidget />
      </div>
    </div>
  )
}

function RedFlagsWidget() {
  const { data: criticalTasks, isLoading, error } = useCriticalTasks()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Red Flags
        </CardTitle>
        <CardDescription>
          Overdue tasks and unassigned work
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Unable to load critical tasks. Make sure your database is connected.
          </p>
        ) : criticalTasks && criticalTasks.length > 0 ? (
          <div className="space-y-3">
            {criticalTasks.map((task) => (
              <Link
                key={task.id}
                to={`/clients/${task.client_id}?task=${task.id}`}
                className="block"
              >
                <div className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.client_name}
                    </p>
                  </div>
                  <Badge variant="danger">
                    {!task.assigned_to
                      ? 'Unassigned'
                      : task.due_date && new Date(task.due_date) < new Date()
                      ? 'Overdue'
                      : 'Critical'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No critical issues. You're all caught up!
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function GhostMonitorWidget() {
  const { data: ghostClients, isLoading, error } = useGhostClients()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-yellow-500" />
          Ghost Monitor
        </CardTitle>
        <CardDescription>
          Active clients with no upcoming shoots (35 days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Unable to load ghost clients. Make sure your database is connected.
          </p>
        ) : ghostClients && ghostClients.length > 0 ? (
          <div className="space-y-3">
            {ghostClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-none">{client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.package_tier || 'No package'}
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link to={`/clients/${client.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Shoot
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            All active clients have upcoming shoots scheduled.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
