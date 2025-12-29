-- LocalBzz Agency OS - Database Schema
-- Run this in Supabase SQL Editor

-- 1. CORE DIRECTORY
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'lead', 'paused', 'churned')),
    package_tier TEXT,
    default_photographer_id UUID REFERENCES auth.users(id),
    default_editor_id UUID REFERENCES auth.users(id),
    notes TEXT
);

-- 2. THE UNIFIED TASK TABLE (Source of Truth)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

    -- Identity
    title TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('shoot', 'deliverable', 'meeting', 'milestone', 'opportunity')),

    -- Progress & Health
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'scheduled', 'in_progress', 'review', 'done', 'skipped')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'critical')),

    -- Dates (The Health Drivers)
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Accountability (Mandatory in App Logic)
    assigned_to UUID REFERENCES auth.users(id),

    -- Organization
    parent_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    workflow_stage TEXT,

    -- Details
    location TEXT,
    asset_link TEXT,
    notes TEXT
);

-- 3. THE WORKFLOW ENGINE (The "Recipes")
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
    step_order INT NOT NULL,

    -- Task Generation Rules
    title_template TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('shoot', 'deliverable', 'meeting', 'milestone', 'opportunity')),
    assign_role TEXT NOT NULL CHECK (assign_role IN ('default_photographer', 'default_editor', 'admin')),

    -- Smart Scheduling
    relative_day_offset INT NOT NULL,
    date_anchor TEXT DEFAULT 'start_date' CHECK (date_anchor IN ('start_date', 'end_of_month')),

    -- Dependency
    is_dependent_on_step INT
);

-- 4. HEALTH VIEW (For Dashboard)
CREATE OR REPLACE VIEW admin_task_health AS
SELECT
    t.*,
    c.name as client_name,
    CASE
        WHEN t.status = 'done' THEN 'healthy'
        WHEN t.status = 'skipped' THEN 'healthy'
        WHEN t.assigned_to IS NULL THEN 'critical'
        WHEN t.due_date < NOW() THEN 'critical'
        WHEN t.due_date < (NOW() + interval '48 hours') THEN 'risk'
        ELSE 'healthy'
    END as health_status
FROM tasks t
JOIN clients c ON t.client_id = c.id
WHERE t.status NOT IN ('skipped');

-- 5. ROW LEVEL SECURITY (Permissive for now - no auth)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (update these when adding auth)
CREATE POLICY "Allow all on clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on workflow_templates" ON workflow_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on workflow_steps" ON workflow_steps FOR ALL USING (true) WITH CHECK (true);

-- 6. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_template_id ON workflow_steps(template_id);
