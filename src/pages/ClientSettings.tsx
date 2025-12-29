import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Rocket, Repeat, Briefcase, AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import type { ClientPhase } from '@/lib/database.types'

// Template IDs from seed data
const TEMPLATE_IDS = {
  monthlyRetainer: '11111111-1111-1111-1111-111111111111',
  foundations: '22222222-2222-2222-2222-222222222222',
} as const

const PHASE_CONFIG: Record<ClientPhase, { label: string; icon: typeof Rocket; description: string; templateId: string }> = {
  foundations: {
    label: 'The Foundations',
    icon: Rocket,
    description: '90-day onboarding program with strategy sessions and initial content shoots',
    templateId: TEMPLATE_IDS.foundations,
  },
  monthly: {
    label: 'Monthly Retainer',
    icon: Repeat,
    description: 'Ongoing monthly content: Plan, Shoot, Edit, Review, Publish, Report',
    templateId: TEMPLATE_IDS.monthlyRetainer,
  },
  project: {
    label: 'Project',
    icon: Briefcase,
    description: 'One-off or custom project work (manual task scheduling)',
    templateId: TEMPLATE_IDS.monthlyRetainer, // Default fallback
  },
}

const STATUS_CONFIG: Record<string, { label: string; description: string; warning?: string }> = {
  active: {
    label: 'Active',
    description: 'Client is actively receiving services',
  },
  lead: {
    label: 'Lead',
    description: 'Potential client, not yet signed',
  },
  paused: {
    label: 'Paused',
    description: 'Temporarily on hold',
    warning: 'Auto-schedule will stop immediately when paused.',
  },
  churned: {
    label: 'Churned',
    description: 'No longer a client',
    warning: 'Auto-schedule will stop and this client will be archived.',
  },
}

export function ClientSettings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useClient(id)
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePhaseChange = (phase: ClientPhase) => {
    // Smart switch: update phase AND default template
    const templateId = PHASE_CONFIG[phase].templateId
    updateClient.mutate({
      id: id!,
      client_phase: phase,
      default_template_id: templateId,
    })
  }

  const handleStatusChange = (status: string) => {
    updateClient.mutate({ id: id!, status })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteClient.mutateAsync(id!)
      navigate('/clients')
    } catch {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
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

  const currentPhase = client.client_phase || 'monthly'
  const currentStatus = client.status || 'active'
  const currentPhaseConfig = PHASE_CONFIG[currentPhase]
  const currentStatusConfig = STATUS_CONFIG[currentStatus]
  const PhaseIcon = currentPhaseConfig.icon

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/clients/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">Client Settings</p>
        </div>
      </div>

      {/* Card 1: Operational Phase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhaseIcon className="h-5 w-5" />
            Operational Phase
          </CardTitle>
          <CardDescription>
            Determines the workflow template used for auto-scheduling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={currentPhase} onValueChange={(v) => handlePhaseChange(v as ClientPhase)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="foundations">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-purple-600" />
                  The Foundations
                </div>
              </SelectItem>
              <SelectItem value="monthly">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-blue-600" />
                  Monthly Retainer
                </div>
              </SelectItem>
              <SelectItem value="project">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-600" />
                  Project
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {currentPhaseConfig.description}
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Client Status */}
      <Card>
        <CardHeader>
          <CardTitle>Client Status</CardTitle>
          <CardDescription>
            Controls whether auto-scheduling is active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {currentStatusConfig?.description}
          </p>
          {currentStatusConfig?.warning && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {currentStatusConfig.warning}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {client.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this client and all their tasks. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
