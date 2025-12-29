import { useEffect, useRef } from 'react'
import { useClient } from './useClients'
import { useTasks } from './useTasks'
import { useRunWorkflow } from './useWorkflow'

/**
 * Auto-generates tasks for clients with rolling horizon enabled.
 * Maintains 6 months of future tasks by running the client's default workflow template.
 *
 * Safety:
 * - Only triggers once per mount (prevents infinite loops)
 * - Requires auto_workflow_enabled = true AND default_template_id set
 * - Only generates 1 month at a time
 */
export function useAutoGenerateTasks(clientId: string | undefined) {
  const hasTriggered = useRef(false)
  const { data: client } = useClient(clientId)
  const { data: tasks } = useTasks(clientId)
  const runWorkflow = useRunWorkflow()

  // Auto-schedule only runs for ACTIVE clients with workflow enabled and template set
  const isEnabled = !!(
    client?.auto_workflow_enabled &&
    client?.default_template_id &&
    client?.status === 'active'
  )

  useEffect(() => {
    // Reset trigger flag when clientId changes
    hasTriggered.current = false
  }, [clientId])

  useEffect(() => {
    // Gate checks
    if (!clientId || !client || !tasks || !isEnabled || hasTriggered.current) {
      return
    }

    // Find the furthest due date among all tasks
    const furthestDate = findFurthestDueDate(tasks)
    const sixMonthsAhead = addMonths(new Date(), 6)

    // If we have less than 6 months of tasks scheduled, generate more
    if (!furthestDate || furthestDate < sixMonthsAhead) {
      hasTriggered.current = true
      const nextMonthStart = getFirstOfNextMonth(furthestDate || new Date())

      runWorkflow.mutate({
        clientId,
        templateId: client.default_template_id!,
        startDate: nextMonthStart,
      })
    }
  }, [clientId, client, tasks, isEnabled, runWorkflow])

  return {
    isGenerating: runWorkflow.isPending,
    isEnabled
  }
}

/**
 * Find the furthest (latest) due date among all tasks
 */
function findFurthestDueDate(tasks: { due_date: string | null }[]): Date | null {
  let furthest: Date | null = null

  for (const task of tasks) {
    if (task.due_date) {
      const date = new Date(task.due_date)
      if (!furthest || date > furthest) {
        furthest = date
      }
    }
  }

  return furthest
}

/**
 * Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Get the first day of the next month after the given date
 * Returns ISO date string (YYYY-MM-DD)
 */
function getFirstOfNextMonth(date: Date): string {
  const nextMonth = new Date(date)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)

  // Format as YYYY-MM-DD
  const year = nextMonth.getFullYear()
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
  const day = '01'

  return `${year}-${month}-${day}`
}
