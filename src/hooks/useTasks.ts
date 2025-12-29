import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Task, TaskInsert, TaskUpdate, TaskHealth, Client } from '@/lib/database.types'

export function useTasks(clientId?: string) {
  return useQuery({
    queryKey: ['tasks', { clientId }],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false })

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Task[]
    },
  })
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      if (!id) throw new Error('No task ID provided')

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Task
    },
    enabled: !!id,
  })
}

export function useTaskHealth() {
  return useQuery({
    queryKey: ['task-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_task_health')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false })

      if (error) throw error
      return data as TaskHealth[]
    },
  })
}

export function useCriticalTasks() {
  return useQuery({
    queryKey: ['critical-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_task_health')
        .select('*')
        .eq('health_status', 'critical')
        .order('due_date', { ascending: true, nullsFirst: false })

      if (error) throw error
      return data as TaskHealth[]
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task as Record<string, unknown>)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-health'] })
      queryClient.invalidateQueries({ queryKey: ['critical-tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      // If completing a task, set completed_at
      if (updates.status === 'done' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Task
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', data.id] })
      queryClient.invalidateQueries({ queryKey: ['task-health'] })
      queryClient.invalidateQueries({ queryKey: ['critical-tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-health'] })
      queryClient.invalidateQueries({ queryKey: ['critical-tasks'] })
    },
  })
}

// Ghost clients - active clients with no upcoming shoots
export function useGhostClients() {
  return useQuery({
    queryKey: ['ghost-clients'],
    queryFn: async () => {
      // Get all active clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')

      if (clientsError) throw clientsError

      // Get upcoming shoots (next 35 days)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 35)

      const { data: upcomingShoots, error: shootsError } = await supabase
        .from('tasks')
        .select('client_id')
        .eq('task_type', 'shoot')
        .gte('start_time', new Date().toISOString())
        .lte('start_time', futureDate.toISOString())

      if (shootsError) throw shootsError

      const clientsWithShoots = new Set(
        (upcomingShoots as { client_id: string }[])?.map(s => s.client_id)
      )

      return ((clients as Client[]) || []).filter(c => !clientsWithShoots.has(c.id))
    },
  })
}
