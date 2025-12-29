-- LocalBzz Agency OS - Seed Workflow Templates
-- Run this AFTER the initial schema

-- Monthly Retainer Template
INSERT INTO workflow_templates (id, name, description)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Monthly Retainer',
    'Standard monthly content package: Plan → Shoot → Edit → Review → Publish → Report'
);

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


-- 90-Day Foundations Template
INSERT INTO workflow_templates (id, name, description)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '90-Day Foundations',
    'Onboarding program: Strategy → 3 shoots with edits → Final review'
);

INSERT INTO workflow_steps (template_id, step_order, title_template, task_type, assign_role, relative_day_offset, date_anchor, is_dependent_on_step)
VALUES
    -- Step 1: Strategy session (day 0)
    ('22222222-2222-2222-2222-222222222222', 1, 'Strategy & Brand Discovery', 'meeting', 'admin', 0, 'start_date', NULL),

    -- Step 2: First shoot (day 14)
    ('22222222-2222-2222-2222-222222222222', 2, 'Foundation Shoot 1', 'shoot', 'default_photographer', 14, 'start_date', 1),

    -- Step 3: First edit (day 21)
    ('22222222-2222-2222-2222-222222222222', 3, 'Foundation Edit 1', 'deliverable', 'default_editor', 21, 'start_date', 2),

    -- Step 4: Second shoot (day 45)
    ('22222222-2222-2222-2222-222222222222', 4, 'Foundation Shoot 2', 'shoot', 'default_photographer', 45, 'start_date', 3),

    -- Step 5: Second edit (day 52)
    ('22222222-2222-2222-2222-222222222222', 5, 'Foundation Edit 2', 'deliverable', 'default_editor', 52, 'start_date', 4),

    -- Step 6: Final review (day 85)
    ('22222222-2222-2222-2222-222222222222', 6, '90-Day Review & Handoff', 'milestone', 'admin', 85, 'start_date', 5);
