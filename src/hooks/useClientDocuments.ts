import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/lib/database.types'

export interface DocumentTask extends Task {
  transcript_path: string // Non-null guaranteed
}

interface UseClientDocumentsOptions {
  clientId: string | undefined
  startDate?: Date | null
  endDate?: Date | null
}

export function useClientDocuments({ clientId, startDate, endDate }: UseClientDocumentsOptions) {
  return useQuery({
    queryKey: ['client-documents', clientId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!clientId) return []

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('client_id', clientId)
        .not('transcript_path', 'is', null)
        .order('due_date', { ascending: false })

      // Apply date range filters if provided
      if (startDate) {
        query = query.gte('due_date', startDate.toISOString().split('T')[0])
      }
      if (endDate) {
        query = query.lte('due_date', endDate.toISOString().split('T')[0])
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as DocumentTask[]
    },
    enabled: !!clientId,
  })
}

// Helper to get download URL for a transcript
export function getTranscriptDownloadUrl(transcriptPath: string): string {
  const { data } = supabase.storage
    .from('task-attachments')
    .getPublicUrl(transcriptPath)
  return data.publicUrl
}
