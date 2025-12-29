import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { WorkflowTemplate, WorkflowStep } from '@/lib/database.types'

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('name')

      if (error) throw error
      return data as WorkflowTemplate[]
    },
  })
}

export function useWorkflowSteps(templateId: string | undefined) {
  return useQuery({
    queryKey: ['workflow-steps', templateId],
    queryFn: async () => {
      if (!templateId) throw new Error('No template ID provided')

      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('template_id', templateId)
        .order('step_order')

      if (error) throw error
      return data as WorkflowStep[]
    },
    enabled: !!templateId,
  })
}

export function useRunWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      clientId,
      templateId,
      startDate,
    }: {
      clientId: string
      templateId: string
      startDate: string
    }) => {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('run-workflow', {
        body: { clientId, templateId, startDate },
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-health'] })
      queryClient.invalidateQueries({ queryKey: ['ghost-clients'] })
    },
  })
}
