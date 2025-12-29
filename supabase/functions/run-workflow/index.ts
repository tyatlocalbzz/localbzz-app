// LocalBzz Agency OS - Workflow Engine Edge Function
// Deploy with: supabase functions deploy run-workflow

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkflowRequest {
  clientId: string
  templateId: string
  startDate: string // ISO date string
}

interface WorkflowStep {
  id: string
  template_id: string
  step_order: number
  title_template: string
  task_type: string
  assign_role: string
  relative_day_offset: number
  date_anchor: string
  is_dependent_on_step: number | null
}

interface Client {
  id: string
  name: string
  default_photographer_id: string | null
  default_editor_id: string | null
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { clientId, templateId, startDate }: WorkflowRequest = await req.json()

    if (!clientId || !templateId || !startDate) {
      throw new Error('Missing required fields: clientId, templateId, startDate')
    }

    // 1. Fetch the client
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      throw new Error(`Client not found: ${clientError?.message}`)
    }

    // 2. Fetch workflow steps
    const { data: steps, error: stepsError } = await supabaseClient
      .from('workflow_steps')
      .select('*')
      .eq('template_id', templateId)
      .order('step_order')

    if (stepsError || !steps || steps.length === 0) {
      throw new Error(`Workflow steps not found: ${stepsError?.message}`)
    }

    // 3. Generate tasks
    const startDateObj = new Date(startDate)
    const createdTaskIds: Map<number, string> = new Map()
    const tasksToInsert: any[] = []

    for (const step of steps as WorkflowStep[]) {
      // Calculate due date
      let dueDate: Date

      if (step.date_anchor === 'end_of_month') {
        // Last day of the month of startDate + offset
        const endOfMonth = new Date(startDateObj.getFullYear(), startDateObj.getMonth() + 1, 0)
        dueDate = new Date(endOfMonth)
        dueDate.setDate(dueDate.getDate() + step.relative_day_offset)
      } else {
        // start_date + offset
        dueDate = new Date(startDateObj)
        dueDate.setDate(dueDate.getDate() + step.relative_day_offset)
      }

      // Replace template variables
      const monthName = startDateObj.toLocaleString('default', { month: 'long' })
      const title = step.title_template.replace('{{Month}}', monthName)

      // Resolve assigned_to based on role
      let assignedTo: string | null = null
      switch (step.assign_role) {
        case 'default_photographer':
          assignedTo = client.default_photographer_id
          break
        case 'default_editor':
          assignedTo = client.default_editor_id
          break
        case 'admin':
          // Leave as null so it appears in "Red Flags" on Dashboard
          // Admin tasks require manual assignment
          assignedTo = null
          break
      }

      // Get parent_id if dependent
      let parentId: string | null = null
      if (step.is_dependent_on_step && createdTaskIds.has(step.is_dependent_on_step)) {
        parentId = createdTaskIds.get(step.is_dependent_on_step) || null
      }

      const task = {
        client_id: clientId,
        title,
        task_type: step.task_type,
        status: 'todo',
        priority: 'normal',
        due_date: dueDate.toISOString(),
        start_time: step.task_type === 'shoot' ? dueDate.toISOString() : null,
        assigned_to: assignedTo,
        parent_id: parentId,
        workflow_stage: templateId,
      }

      tasksToInsert.push({ ...task, step_order: step.step_order })
    }

    // 4. Insert tasks one by one to capture IDs for dependencies
    const createdTasks: any[] = []

    for (const taskData of tasksToInsert) {
      const stepOrder = taskData.step_order
      delete taskData.step_order

      // Update parent_id if we have the mapping now
      if (taskData.parent_id === null) {
        const parentStep = (steps as WorkflowStep[]).find(s => s.step_order === stepOrder)?.is_dependent_on_step
        if (parentStep && createdTaskIds.has(parentStep)) {
          taskData.parent_id = createdTaskIds.get(parentStep)
        }
      }

      const { data: created, error: insertError } = await supabaseClient
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to create task: ${insertError.message}`)
      }

      createdTaskIds.set(stepOrder, created.id)
      createdTasks.push(created)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdTasks.length} tasks`,
        taskIds: createdTasks.map(t => t.id),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
