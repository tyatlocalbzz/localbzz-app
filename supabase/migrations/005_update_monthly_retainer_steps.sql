-- Update Monthly Retainer workflow to full 6-step lifecycle
-- Plan → Shoot → Edit → Review → Publish → Report

-- Delete existing steps for Monthly Retainer
DELETE FROM workflow_steps WHERE template_id = '11111111-1111-1111-1111-111111111111';

-- Update template description
UPDATE workflow_templates
SET description = 'Standard monthly content package: Plan → Shoot → Edit → Review → Publish → Report'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Insert new 6-step workflow
INSERT INTO workflow_steps (template_id, step_order, title_template, task_type, assign_role, relative_day_offset, date_anchor, is_dependent_on_step)
VALUES
    -- Step 1: Planning & Scheduling Call (Day 1)
    ('11111111-1111-1111-1111-111111111111', 1, '{{Month}} Planning Call', 'meeting', 'admin', 1, 'start_date', NULL),

    -- Step 2: Content Shoot (Day 5, depends on Plan)
    ('11111111-1111-1111-1111-111111111111', 2, '{{Month}} Content Shoot', 'shoot', 'default_photographer', 5, 'start_date', 1),

    -- Step 3: Content Edit (Day 8, depends on Shoot)
    ('11111111-1111-1111-1111-111111111111', 3, '{{Month}} Content Edit', 'deliverable', 'default_editor', 8, 'start_date', 2),

    -- Step 4: Client Review (Day 13, depends on Edit)
    ('11111111-1111-1111-1111-111111111111', 4, '{{Month}} Client Review', 'milestone', 'admin', 13, 'start_date', 3),

    -- Step 5: Publish (End of Month, depends on Review)
    ('11111111-1111-1111-1111-111111111111', 5, '{{Month}} Content Publish', 'deliverable', 'default_editor', 0, 'end_of_month', 4),

    -- Step 6: Performance Report (Day 1 of next month, depends on Publish)
    ('11111111-1111-1111-1111-111111111111', 6, '{{Month}} Performance Report', 'deliverable', 'admin', 1, 'end_of_month', 5);
