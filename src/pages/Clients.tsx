import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2, ChevronRight, Rocket, Repeat, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClients, useCreateClient } from '@/hooks/useClients'
import type { Client, ClientPhase } from '@/lib/database.types'

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'secondary' | 'warning' | 'danger'> = {
  active: 'success',
  lead: 'secondary',
  paused: 'warning',
  churned: 'danger',
}

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

export function Clients() {
  const { data: clients, isLoading, error } = useClients()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client directory
          </p>
        </div>
        <AddClientDialog />
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Unable to load clients. Make sure your database is connected.
            </p>
          </CardContent>
        </Card>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No clients found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Get started by adding your first client'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ClientCard({ client }: { client: Client }) {
  const phase = client.client_phase || 'monthly'
  const phaseConfig = PHASE_CONFIG[phase]
  const PhaseIcon = phaseConfig.icon

  return (
    <Link to={`/clients/${client.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold leading-none">{client.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_BADGE_VARIANT[client.status || 'active'] || 'secondary'}>
                  {client.status || 'active'}
                </Badge>
                <Badge variant="outline" className={phaseConfig.className}>
                  <PhaseIcon className="mr-1 h-3 w-3" />
                  {phaseConfig.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-muted-foreground">
            <span>View details</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function AddClientDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [status, setStatus] = useState('active')
  const [phase, setPhase] = useState<ClientPhase>('monthly')
  const createClient = useCreateClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createClient.mutateAsync({
      name,
      status,
      client_phase: phase,
    })

    setName('')
    setStatus('active')
    setPhase('monthly')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client in your directory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phase">Operational Phase</Label>
              <Select value={phase} onValueChange={(v) => setPhase(v as ClientPhase)}>
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
                      Monthly
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
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
