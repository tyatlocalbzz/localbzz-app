-- Add auto-workflow configuration to clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS auto_workflow_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_template_id UUID REFERENCES workflow_templates(id);

-- Index for querying clients with auto-workflow enabled
CREATE INDEX IF NOT EXISTS idx_clients_auto_workflow ON clients(auto_workflow_enabled)
WHERE auto_workflow_enabled = true;
