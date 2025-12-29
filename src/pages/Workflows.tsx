import { Workflow, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkflowTemplates } from '@/hooks/useWorkflow'

export function Workflows() {
  const { data: templates, isLoading, error } = useWorkflowTemplates()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflow Templates</h1>
        <p className="text-muted-foreground">
          Reusable workflows that generate tasks automatically
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Unable to load workflows. Make sure your database is connected and the workflow_templates table exists.
            </p>
          </CardContent>
        </Card>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Workflow className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription>{template.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Run this workflow for a client to automatically generate all related tasks.
                </p>
                <Button size="sm" disabled>
                  <Play className="mr-2 h-4 w-4" />
                  Run Workflow
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  (Run workflow from the Client Command Center)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Workflow className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No workflows yet</h3>
            <p className="text-muted-foreground">
              Run the seed SQL to create the initial workflow templates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
