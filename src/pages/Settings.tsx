import { Database, Users, Key } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your LocalBzz Agency OS
        </p>
      </div>

      <div className="grid gap-6">
        {/* Database Connection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5" />
              <div>
                <CardTitle>Database Connection</CardTitle>
                <CardDescription>
                  Supabase project configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">Supabase URL</Label>
              <Input
                id="supabase-url"
                value={import.meta.env.VITE_SUPABASE_URL || ''}
                disabled
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabase-key">Anon Key</Label>
              <Input
                id="supabase-key"
                type="password"
                value={import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••' : ''}
                disabled
                className="font-mono text-sm"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Update these values in your .env file
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Users who can be assigned to tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Team members are managed through Supabase Authentication.
              Go to your Supabase Dashboard → Authentication to add or manage users.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Instructions:</p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                <li>Go to Supabase Dashboard → Authentication</li>
                <li>Click "Add User" to create team members</li>
                <li>Copy user UUIDs to assign them as default photographers/editors on clients</li>
                <li>Use those UUIDs when creating tasks</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5" />
              <div>
                <CardTitle>Edge Functions</CardTitle>
                <CardDescription>
                  Workflow engine configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The workflow engine runs as a Supabase Edge Function.
              Deploy it using the Supabase CLI:
            </p>
            <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
              supabase functions deploy run-workflow
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
