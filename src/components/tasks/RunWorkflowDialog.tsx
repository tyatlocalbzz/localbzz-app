import { useState } from 'react'
import { Play, Calendar, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import { useWorkflowTemplates, useRunWorkflow } from '@/hooks/useWorkflow'

interface RunWorkflowDialogProps {
  clientId: string
  clientName: string
}

export function RunWorkflowDialog({ clientId, clientName }: RunWorkflowDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [startDate, setStartDate] = useState(() => {
    // Default to today
    return new Date().toISOString().split('T')[0]
  })

  const { data: templates, isLoading: templatesLoading } = useWorkflowTemplates()
  const runWorkflow = useRunWorkflow()

  const handleRun = async () => {
    if (!selectedTemplateId || !startDate) return

    await runWorkflow.mutateAsync({
      clientId,
      templateId: selectedTemplateId,
      startDate,
    })

    setOpen(false)
    setSelectedTemplateId('')
  }

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Play className="mr-2 h-4 w-4" />
          Run Workflow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Run Workflow
          </DialogTitle>
          <DialogDescription>
            Generate tasks for <strong>{clientName}</strong> using a workflow template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Workflow Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={templatesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={templatesLoading ? 'Loading...' : 'Select a workflow...'} />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate?.description && (
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Tasks will be scheduled relative to this date
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRun}
            disabled={!selectedTemplateId || !startDate || runWorkflow.isPending}
          >
            {runWorkflow.isPending ? (
              <>Generating Tasks...</>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
